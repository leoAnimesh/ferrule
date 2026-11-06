import SwiftUI
import UIKit

// UIAlertController directly: SwiftUI's `.alert` presents from the window's root, so it ignores the app's light or dark choice.
@available(iOS 17.0, *)
struct FerruleAlertContent: View {
  @ObservedObject var host: FerruleHost
  @State private var presented: UIAlertController?

  var body: some View {
    Color.clear.onChange(of: host.bool("open"), initial: true) { _, open in
      if open { present() } else {
        presented?.dismiss(animated: true)
        presented = nil
      }
    }
  }

  private func present() {
    guard presented == nil, let presenter = host.presenter?() else { return }
    let alert = UIAlertController(title: host.string("title"), message: host.string("message"), preferredStyle: .alert)
    alert.overrideUserInterfaceStyle = host.bool("dark") ? .dark : .light
    if let tint = host.tint { alert.view.tintColor = UIColor(tint) }
    for (index, action) in host.list("actions").enumerated() {
      let style: UIAlertAction.Style = action["role"] as? String == "destructive" ? .destructive : action["role"] as? String == "cancel" ? .cancel : .default
      alert.addAction(UIAlertAction(title: action["label"] as? String, style: style) { _ in
        presented = nil
        host.config["open"] = false
        host.send("action", index)
      })
    }
    presented = alert
    presenter.present(alert, animated: true)
  }
}

func ferruleRole(_ role: String?) -> ButtonRole? {
  role == "destructive" ? .destructive : role == "cancel" ? .cancel : nil
}
