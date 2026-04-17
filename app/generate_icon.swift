#!/usr/bin/env swift
// generate_icon.swift — EP Code icon
// Usage: cd ~/ClaudeCodeHistory && swift generate_icon.swift

import Cocoa

func generateIcon(size: Int, outputPath: String) {
    let sz = CGFloat(size)
    let img = NSImage(size: NSSize(width: sz, height: sz))
    img.lockFocus()
    let ctx = NSGraphicsContext.current!.cgContext

    // 白色圆角背景
    let r = sz * 0.22
    let bg = NSBezierPath(roundedRect: CGRect(x: 0, y: 0, width: sz, height: sz), xRadius: r, yRadius: r)
    NSColor.white.setFill(); bg.fill()

    // 蓝色
    let blue = NSColor(red: 0.24, green: 0.47, blue: 0.85, alpha: 1.0)

    // EP 文字
    let fs = sz * 0.38
    let font = NSFont.systemFont(ofSize: fs, weight: .bold)
    let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: blue]
    let text = "EP" as NSString
    let ts = text.size(withAttributes: attrs)
    let tx = (sz - ts.width) / 2, ty = (sz - ts.height) / 2 + sz * 0.04
    text.draw(at: NSPoint(x: tx, y: ty), withAttributes: attrs)

    // 底部 code 装饰线
    let ly = ty - sz * 0.06, lw = sz * 0.35, lx = (sz - lw) / 2
    ctx.setStrokeColor(blue.withAlphaComponent(0.3).cgColor)
    ctx.setLineWidth(sz * 0.02); ctx.setLineCap(.round)
    ctx.move(to: CGPoint(x: lx, y: ly)); ctx.addLine(to: CGPoint(x: lx + lw * 0.25, y: ly)); ctx.strokePath()
    ctx.move(to: CGPoint(x: lx + lw * 0.32, y: ly)); ctx.addLine(to: CGPoint(x: lx + lw * 0.72, y: ly)); ctx.strokePath()
    ctx.move(to: CGPoint(x: lx + lw * 0.79, y: ly)); ctx.addLine(to: CGPoint(x: lx + lw, y: ly)); ctx.strokePath()

    img.unlockFocus()
    guard let tiff = img.tiffRepresentation, let bmp = NSBitmapImageRep(data: tiff),
          let png = bmp.representation(using: .png, properties: [:]) else { return }
    try? png.write(to: URL(fileURLWithPath: outputPath))
    print("✅ \(size)x\(size) → \(outputPath)")
}

let base = "ClaudeCodeHistory/Assets.xcassets/AppIcon.appiconset"
for s in [16, 32, 64, 128, 256, 512, 1024] { generateIcon(size: s, outputPath: "\(base)/icon_\(s)x\(s).png") }
print("✨ EP Code 图标生成完成")
