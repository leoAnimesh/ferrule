import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleSegmentedContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    Picker(host.string("label") ?? "", selection: host.binding("value", default: "")) {
      ForEach(host.list("options").map(FerruleOption.init)) { option in
        Group {
          if let icon = option.icon { Label(option.label, systemImage: icon) } else { Text(option.label) }
        }.tag(option.id)
      }
    }
    .pickerStyle(.segmented)
    .disabled(host.bool("disabled"))
  }
}
