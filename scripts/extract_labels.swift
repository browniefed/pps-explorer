import Foundation
import PDFKit
import AppKit
let root=CommandLine.arguments[1]
for level in ["elementary","middle","high"] { for scenario in ["current","a","b"] {
 let id="\(scenario)-\(level)",doc=PDFDocument(url:URL(fileURLWithPath:"\(root)/\(id).pdf"))!,page=doc.page(at:0)!
 var lines:[[String:Any]]=[]
 for sel in page.selection(for:page.bounds(for:.mediaBox))!.selectionsByLine() {
  let box=sel.bounds(for:page); var fontSize:CGFloat=0
  if let str=sel.attributedString {str.enumerateAttribute(.font,in:NSRange(location:0,length:str.length)){value,_,_ in if let font=value as? NSFont{fontSize=max(fontSize,font.pointSize)}}}
  lines.append(["text":sel.string ?? "","bbox":[box.minX,box.minY,box.maxX,box.maxY],"font_size":fontSize])
 }
 let data=try! JSONSerialization.data(withJSONObject:lines,options:[.sortedKeys]);try! data.write(to:URL(fileURLWithPath:"public/data/\(id)-labels.json"))
 print("\(id): \(lines.count) label lines")
}}
