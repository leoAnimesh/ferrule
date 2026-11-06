import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleToggleContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    Toggle(isOn: host.binding("value", default: false)) {
      VStack(alignment: .leading, spacing: 2) {
        Text(host.string("label") ?? "")
        if let description = host.string("description") {
          Text(description).font(host.font(.footnote, system: .footnote)).foregroundStyle(.secondary)
        }
      }
    }
    .labelsHidden(host.string("label") == nil)
    .disabled(host.bool("disabled"))
  }
}

extension View {
  @ViewBuilder func labelsHidden(_ hidden: Bool) -> some View {
    if hidden { labelsHidden() } else { self }
  }
}
