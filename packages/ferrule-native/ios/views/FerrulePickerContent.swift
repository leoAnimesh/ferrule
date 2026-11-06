import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerrulePickerContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    HStack {
      if let label = host.string("label") { Text(label) }
      Spacer(minLength: 8)
      Picker(host.string("label") ?? "", selection: host.binding("value", default: "")) {
        ForEach(host.list("options").map(FerruleOption.init)) { option in
          Text(option.label).tag(option.id)
        }
      }
      .pickerStyle(.menu)
      .labelsHidden()
    }
    .disabled(host.bool("disabled"))
  }
}
