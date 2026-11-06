import SwiftUI
import UIKit

// iOS has no floating action button. This is the closest system form: a large circular prominent button.
@available(iOS 17.0, *)
struct FerruleFabContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    let label = host.string("label")
    let button = Button {
      host.send("press", nil)
    } label: {
      HStack(spacing: 6) {
        Image(systemName: host.string("icon") ?? "plus")
        if let label { Text(label) }
      }
      .frame(minWidth: 28, minHeight: 28)
    }
    .buttonBorderShape(label == nil ? .circle : .capsule)
    .controlSize(.large)
    if #available(iOS 26.0, *) { button.buttonStyle(.glassProminent) } else { button.buttonStyle(.borderedProminent) }
  }
}
