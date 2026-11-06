import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleTopBarContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    FerruleNavigationBar(
      title: host.string("title") ?? "",
      back: host.string("back"),
      actions: host.list("actions").map(FerruleOption.init),
      tint: host.tint,
      titleFont: host.fontName("semibold").flatMap { UIFont(name: $0, size: 17) }.map { UIFontMetrics(forTextStyle: .headline).scaledFont(for: $0) },
      send: host.send)
  }
}

@available(iOS 17.0, *)
private struct FerruleNavigationBar: UIViewRepresentable {
  let title: String
  let back: String?
  let actions: [FerruleOption]
  let tint: Color?
  let titleFont: UIFont?
  let send: (String, Any?) -> Void

  func makeUIView(context: Context) -> UINavigationBar { UINavigationBar() }

  func updateUIView(_ bar: UINavigationBar, context: Context) {
    let item = UINavigationItem(title: title)
    if let back {
      item.leftBarButtonItem = UIBarButtonItem(title: back, image: UIImage(systemName: "chevron.backward"), primaryAction: UIAction { _ in send("back", nil) })
      item.leftBarButtonItem?.accessibilityLabel = back
    }
    item.rightBarButtonItems = actions.reversed().map { action in
      let button = UIBarButtonItem(title: action.label, image: action.icon.flatMap { UIImage(systemName: $0) }, primaryAction: UIAction { _ in send("action", action.id) })
      button.accessibilityLabel = action.label
      return button
    }
    bar.setItems([item], animated: false)
    if let tint { bar.tintColor = UIColor(tint) }
    if let titleFont { bar.titleTextAttributes = [.font: titleFont] }
  }

  func sizeThatFits(_ proposal: ProposedViewSize, uiView: UINavigationBar, context: Context) -> CGSize? {
    let width = proposal.width ?? UIView.layoutFittingExpandedSize.width
    return CGSize(width: width, height: uiView.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude)).height)
  }
}
