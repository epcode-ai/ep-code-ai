# Bug 报告: [订单][P1] 跨年请假余额扣减错位

> 这是一个**典型 Bug 报告**的完整样本，展示填写深度。

## 基本信息

**标题**: `[请假][P1] 跨年请假实际扣减了全部今年余额（本应 2+3 分扣）`

### 严重级别

- [x] **P1 严重**

### 优先级

- [x] **高**（阻塞 v1.0 准出）

## 环境信息

| 项目 | 值 |
|------|-----|
| 测试环境 | https://leave-test.internal.company.com |
| 版本号 | v1.0.0-rc.1（commit abc123） |
| 发现时间 | 2026-04-16 10:45 |
| 发现人 | 陈测试 |
| 测试账号 | test.employee.5（2026 年假余额 2,2027 年假余额 5） |
| 浏览器 | Chrome 124 |
| 操作系统 | macOS 15 |

## 复现步骤

1. 在 DB 设置系统时间为 `2026-12-28`（模拟跨年节点）
2. 用 test.employee.5 登录
3. 发起请假：
   ```
   type: annual
   startDate: 2026-12-29
   endDate: 2027-01-02
   days: 5.0（其中 2026 占 2 天，2027 占 3 天）
   reason: 春节回老家休息
   ```
4. 主管登录,通过审批
5. 查询员工 2026 年假余额

**复现频率**: 100%（5 次复现 5 次）

## 预期结果

根据 BR-LEAVE-003 决策表第 2 条 + 特殊情况"跨年请假"：
- 2026 年假余额: `2 - 2 = 0`
- 2027 年假余额: `5 - 3 = 2`

## 实际结果

- 2026 年假余额: `2 - 5 = -3` ❌（应该 0）
- 2027 年假余额: `5 - 0 = 5` ❌（应该 2）

### 错误表现
- 员工 2026 余额变成负数（UI 显示 `-3.0 天`,很尴尬）
- 2027 余额没扣
- 12-31 跨年结算后可能引发更大问题

## 附件

- [x] 截图 1: UI 显示负数 `leave-bug-negative-balance.png`
- [x] 截图 2: DB 查询结果 `leave-bug-db-screenshot.png`
- [x] 日志片段（关键部分）:
  ```
  2026-04-16T10:45:23.456Z INFO leave-api [traceId=abc123]
    action=approve leave_id=L-888 user_id=U-5
    days=5.0 type=annual
    ★ BUG: updating balance year=2026, used += 5 (should split!)
  ```

## 关联信息

- 关联需求: REQ-001 + BR-LEAVE-003
- 关联用例: TC-LEAVE-009（跨年请假）
- 关联 Bug: 无

## 初步分析（测试人员）

查代码 `src/services/balance.ts::deductBalance()`:

```typescript
// 疑似问题:
async deductBalance(leaveId: string) {
  const leave = await prisma.leave.findUnique({ where: { id: leaveId } })
  const year = leave.startDate.getFullYear()  // ★ 只取了起始年!
  await prisma.leaveBalance.update({
    where: { userId_year_type: { userId: leave.userId, year, type: leave.type } },
    data: { used: { increment: leave.days } }  // ★ 全部 days 扣到一年
  })
}
```

**修复思路**（建议）:
- 判断 `startDate.year !== endDate.year`
- 分别计算每一年占用的天数（按自然日扣除周末、法定假日等需要明确）
- 分两次 update 两年的 balance

---

## 开发处理（赵工 2026-04-16 14:30）

**Bug 确认**: 真 Bug,已复现 ✅

**根本原因**: `deductBalance` 未处理跨年情况,只按 startDate 扣一年

**修复方案**:
1. 新增 `splitDaysByYear(startDate, endDate, days)` 工具函数
2. `deductBalance` 改为跨年时调用此函数,分别扣两年
3. 相应的 `revertBalance`（取消时退还）也要跨年处理

**修复 Commit**: `def456` (PR #52 "fix: cross-year leave balance deduction")

**修复分支**: `release/1.0.0`

**影响范围评估**:
- 跨年场景修复后可能影响已有单年场景（测试需全回归余额相关用例）
- 需要加单测覆盖
- 数据库已有错误记录需修复（测试环境 DELETE FROM leave_audit WHERE leave_id=L-888 + UPDATE leave_balance）

**修复版本**: v1.0.0-rc.2

---

## 测试回归（陈测试 2026-04-17 09:15）

**回归结果**:
- [x] ✅ 已验证修复

**回归步骤**:
1. 更新到 rc.2 版本
2. 重新执行 TC-LEAVE-009（原场景）
3. 验证:
   - 2026 余额: 0 ✅
   - 2027 余额: 2 ✅
4. 扩展验证:
   - TC-LEAVE-010（下年未开放）仍然拒绝 ✅
   - TC-LEAVE-011（日期冲突）正常 ✅
   - 单年场景 TC-LEAVE-001 仍正常 ✅

**回归时间**: 2026-04-17 09:15
**回归人**: 陈测试

**回归备注**: 修复正确,无回归问题。同时建议开发补充单元测试覆盖跨年的多种边界（如跨 3 年、跨年但全在 2027 年等）。

---

## 复盘（准出报告纳入此 Bug）

这个 Bug 有几个启示：

1. **提测前自测应该覆盖跨年场景**：下次 checklist 里明确列出"跨年请假"
2. **代码评审可以加强**：评审者应该问"这里 year 怎么算？”
3. **单测覆盖盲区**：`deductBalance` 单测只有单年用例
4. **业务规则文档的价值再次体现**：如果没有 BR-LEAVE-003 明确的"分年扣"规则,测试可能都意识不到这是 Bug

改进项已列入 [test-report-v1.0.md](./test-report-v1.0.md) 的"改进建议"章节。
