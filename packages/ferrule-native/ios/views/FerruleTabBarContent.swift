import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleTabBarContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    FerruleTabBar(options: host.list("options").map(FerruleOption.init), selected: host.string("value"), tint: host.tint) { value in
      host.config["value"] = value
      host.send("change", value)
    }
  }
}

@available(iOS 17.0, *)
private struct FerruleTabBar: UIViewRepresentable {
  let options: [FerruleOption]
  let selected: String?
  let tint: Color?
  let onSelect: (String) -> Void

  func makeUIView(context: Context) -> UITabBar {
    let bar = UITabBar()
    bar.delegate = context.coordinator
    return bar
  }

  func updateUIView(_ bar: UITabBar, context: Context) {
    context.coordinator.parent = self
    if (bar.items ?? []).map({ $0.title ?? "" }) != options.map(\.label) {
      bar.items = options.enumerated().map { index, option in
        UITabBarItem(title: option.label, image: option.icon.flatMap { UIImage(systemName: $0) }, tag: index)
      }
    }
    bar.selectedItem = bar.items?.first { options[$0.tag].id == selected }
    if let tint { bar.tintColor = UIColor(tint) }
  }

  func sizeThatFits(_ proposal: ProposedViewSize, uiView: UITabBar, context: Context) -> CGSize? {
    let width = proposal.width ?? UIView.layoutFittingExpandedSize.width
    return CGSize(width: width, height: uiView.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude)).height)
  }

  func makeCoordinator() -> Coordinator { Coordinator(self) }

  final class Coordinator: NSObject, UITabBarDelegate {
    var parent: FerruleTabBar
    init(_ parent: FerruleTabBar) { self.parent = parent }
    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) { parent.onSelect(parent.options[item.tag].id) }
  }
}
