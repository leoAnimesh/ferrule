import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleTextFieldContent: View {
  @ObservedObject var host: FerruleHost
  @State private var text = ""
  // Values sent to JS and not yet echoed back, so a late echo cannot overwrite newer typing.
  @State private var pending: [String] = []

  var body: some View {
    let incoming = host.string("value") ?? ""
    let error = host.string("error")
    VStack(alignment: .leading, spacing: 4) {
      if let label = host.string("label") { Text(label).font(host.font(.subheadline, weight: "semibold", system: .subheadline.weight(.semibold))) }
      field
        .textFieldStyle(.roundedBorder)
        .keyboardType(keyboard)
        .disabled(host.bool("disabled"))
        .onChange(of: text) { _, next in
          guard next != incoming, !pending.contains(next) else { return }
          pending.append(next)
          host.send("change", next)
        }
      if let message = error ?? host.string("helperText") {
        Text(message).font(host.font(.footnote, system: .footnote)).foregroundStyle(error != nil ? (host.color("danger") ?? .red) : .secondary)
      }
    }
    .onAppear { text = incoming }
    .onChange(of: incoming) { _, next in
      if let index = pending.firstIndex(of: next) {
        pending.removeFirst(index + 1)
      } else if next != text {
        pending.removeAll()
        text = next
      }
    }
  }

  @ViewBuilder private var field: some View {
    if host.bool("secure") {
      SecureField(host.string("placeholder") ?? "", text: $text)
    } else {
      TextField(host.string("placeholder") ?? "", text: $text)
    }
  }

  private var keyboard: UIKeyboardType {
    switch host.string("keyboard") {
    case "email-address": return .emailAddress
    case "numeric", "number-pad": return .numberPad
    case "decimal-pad": return .decimalPad
    case "phone-pad": return .phonePad
    case "url": return .URL
    default: return .default
    }
  }
}
