import SwiftUI
import UIKit

// iOS has no chip control. This is the system capsule button, in glass from iOS 26.
@available(iOS 17.0, *)
struct FerruleChipContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    let button = Button {
      host.send("press", nil)
    } label: {
      HStack(spacing: 4) {
        if let icon = host.string("icon") { Image(systemName: icon) }
        Text(host.string("label") ?? "").font(host.customFont(.subheadline, weight: "medium"))
      }
    }
    .buttonBorderShape(.capsule)
    .controlSize(.small)
    .disabled(host.bool("disabled"))
    .accessibilityAddTraits(host.bool("selected") ? .isSelected : [])
    if #available(iOS 26.0, *) {
      if host.bool("selected") { button.buttonStyle(.glassProminent) } else { button.buttonStyle(.glass) }
    } else {
      if host.bool("selected") { button.buttonStyle(.borderedProminent) } else { button.buttonStyle(.bordered) }
    }
  }
}
