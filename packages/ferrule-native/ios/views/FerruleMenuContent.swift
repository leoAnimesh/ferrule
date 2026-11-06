import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleMenuContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    let menu = Menu(host.string("label") ?? "") {
      ForEach(host.list("items").map(FerruleOption.init)) { item in
        Button(role: item.raw["destructive"] as? Bool == true ? .destructive : nil) {
          host.send("select", item.id)
        } label: {
          if let icon = item.icon { Label(item.label, systemImage: icon) } else { Text(item.label) }
        }
        .disabled(item.raw["disabled"] as? Bool == true)
      }
    }
    if #available(iOS 26.0, *) { menu.buttonStyle(.glass) } else { menu.buttonStyle(.bordered) }
  }
}
