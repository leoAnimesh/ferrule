import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleSearchBarContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    FerruleSearch(text: host.string("value") ?? "", placeholder: host.string("placeholder"), send: host.send)
  }
}

@available(iOS 17.0, *)
private struct FerruleSearch: UIViewRepresentable {
  let text: String
  let placeholder: String?
  let send: (String, Any?) -> Void

  func makeUIView(context: Context) -> UISearchBar {
    let bar = UISearchBar()
    bar.searchBarStyle = .minimal
    bar.delegate = context.coordinator
    return bar
  }

  func updateUIView(_ bar: UISearchBar, context: Context) {
    context.coordinator.send = send
    if bar.text != text { bar.text = text }
    bar.placeholder = placeholder
  }

  func sizeThatFits(_ proposal: ProposedViewSize, uiView: UISearchBar, context: Context) -> CGSize? {
    let width = proposal.width ?? UIView.layoutFittingExpandedSize.width
    return CGSize(width: width, height: uiView.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude)).height)
  }

  func makeCoordinator() -> Coordinator { Coordinator(send) }

  final class Coordinator: NSObject, UISearchBarDelegate {
    var send: (String, Any?) -> Void
    init(_ send: @escaping (String, Any?) -> Void) { self.send = send }
    func searchBar(_ bar: UISearchBar, textDidChange text: String) { send("change", text) }
    func searchBarSearchButtonClicked(_ bar: UISearchBar) {
      bar.resignFirstResponder()
      send("submit", bar.text ?? "")
    }
  }
}
