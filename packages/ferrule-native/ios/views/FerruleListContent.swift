import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleListContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    List(host.list("rows").map { FerruleOption(["value": $0["id"] ?? "", "label": $0["title"] ?? "", "subtitle": $0["subtitle"] ?? ""]) }) { row in
      Button {
        host.send("press", row.id)
      } label: {
        VStack(alignment: .leading, spacing: 2) {
          Text(row.label).foregroundStyle(.primary)
          if let subtitle = row.raw["subtitle"] as? String, !subtitle.isEmpty {
            Text(subtitle).font(host.font(.footnote, system: .footnote)).foregroundStyle(.secondary)
          }
        }
      }
    }
    .listStyle(.insetGrouped)
    .scrollContentBackground(.hidden)
    .frame(height: host.double("height").map { CGFloat($0) })
  }
}
