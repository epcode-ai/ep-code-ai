/**
 * Git 度量的共用工具
 * 只读 Git log,不依赖远程服务
 */
import { execSync } from 'node:child_process';

export function runGit(args, options = {}) {
  try {
    return execSync(`git ${args}`, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      ...options,
    });
  } catch (err) {
    if (options.allowFail) return '';
    throw err;
  }
}

/**
 * 获取 commit 列表（一行一个）
 * 返回 [{ hash, date, subject, author }]
 */
export function getCommits({ since = '1 year ago', pathspec = '' } = {}) {
  const format = '%H|%ad|%an|%s';
  const pathArg = pathspec ? `-- ${pathspec}` : '';
  const raw = runGit(
    `log --since="${since}" --pretty=format:"${format}" --date=short ${pathArg}`
  );
  if (!raw.trim()) return [];
  return raw
    .trim()
    .split('\n')
    .map(line => {
      const [hash, date, author, ...rest] = line.split('|');
      return { hash, date, author, subject: rest.join('|') };
    });
}

/**
 * 获取单个 commit 的变更行数
 */
export function getCommitStats(hash) {
  const raw = runGit(`show --stat --format="" ${hash}`, { allowFail: true });
  const match = raw.match(/(\d+) insertion[s]?\(\+\).*?(\d+) deletion[s]?\(-\)/);
  if (match) {
    return { insertions: +match[1], deletions: +match[2] };
  }
  const ins = raw.match(/(\d+) insertion/);
  const del = raw.match(/(\d+) deletion/);
  return {
    insertions: ins ? +ins[1] : 0,
    deletions: del ? +del[1] : 0,
  };
}

/**
 * 按 type 分组统计 commit（Conventional Commits）
 */
export function groupByConventionalType(commits) {
  const groups = {};
  let nonconforming = 0;
  for (const c of commits) {
    // 跳过 Merge commit
    if (c.subject.startsWith('Merge ')) continue;
    const m = /^(feat|fix|docs|refactor|perf|test|chore|revert|build|ci|style)(\([^)]*\))?!?:\s/.exec(c.subject);
    if (m) {
      const type = m[1];
      groups[type] = (groups[type] || 0) + 1;
    } else {
      nonconforming++;
    }
  }
  return { groups, nonconforming };
}

/**
 * 粗略估算 MR 评审轮次（基于 merge commit 结构）
 * 返回每个 merge commit 前的分支 commit 数分布
 */
export function estimateMRRounds() {
  const raw = runGit('log --merges --first-parent --pretty=format:"%H|%P|%s" --date=short main', { allowFail: true });
  if (!raw.trim()) return { mergeCount: 0, avgRounds: 0 };
  const merges = raw.trim().split('\n').map(l => {
    const [hash, parents, subject] = l.split('|');
    return { hash, parents: parents.split(' '), subject };
  });
  // 粗略估算:每个 merge 的第 2 个 parent 到第 1 个 parent 之间的 commit 数
  let totalRounds = 0;
  for (const m of merges) {
    if (m.parents.length < 2) continue;
    const raw = runGit(
      `log --oneline ${m.parents[0]}..${m.parents[1]}`,
      { allowFail: true }
    );
    const count = raw.trim() === '' ? 0 : raw.trim().split('\n').length;
    totalRounds += count;
  }
  return {
    mergeCount: merges.length,
    avgRounds: merges.length > 0 ? (totalRounds / merges.length).toFixed(1) : 0,
  };
}
