import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleSliderContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    let range = (host.double("min") ?? 0)...(host.double("max") ?? 1)
    let value = host.binding("value", default: 0.0)
    Group {
      if let step = host.double("step") {
        Slider(value: value, in: range, step: step) { editing in if !editing { host.send("end", value.wrappedValue) } }
      } else {
        Slider(value: value, in: range) { editing in if !editing { host.send("end", value.wrappedValue) } }
      }
    }
    .disabled(host.bool("disabled"))
  }
}
