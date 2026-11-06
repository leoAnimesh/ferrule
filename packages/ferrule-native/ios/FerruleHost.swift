import SwiftUI
import UIKit

/// The config a hosted SwiftUI view reads, and the way it talks back to JS.
public final class FerruleHost: ObservableObject {
  @Published var config: [String: Any] = [:]
  var send: (String, Any?) -> Void = { _, _ in }
  var presenter: (() -> UIViewController?)?

  func string(_ key: String) -> String? { config[key] as? String }
  func bool(_ key: String) -> Bool { config[key] as? Bool ?? false }
  func double(_ key: String) -> Double? { (config[key] as? NSNumber)?.doubleValue }
  func list(_ key: String) -> [[String: Any]] { config[key] as? [[String: Any]] ?? [] }

  /// A binding on one config value. Writes show at once and go to JS as `event`.
  func binding<T>(_ key: String, default fallback: T, event: String = "change") -> Binding<T> {
    Binding(
      get: { self.config[key] as? T ?? fallback },
      set: { value in
        self.config[key] = value
        self.send(event, value)
      })
  }

  var tint: Color? { color("primary") }

  /// The theme's family at a weight, as a name UIKit can load. Nil with no custom font, or one that failed to load, which leaves the system font.
  func fontName(_ weight: String) -> String? {
    guard let family = (config["fonts"] as? [String: Any])?[weight] as? String else { return nil }
    if UIFont(name: family, size: 17) != nil { return family }
    // A font loaded at runtime is registered under its own PostScript name. expo-font answers this with its alias's real name.
    return UIFont.fontNames(forFamilyName: family).first
  }

  /// The theme's font for a text style, still scaled by Dynamic Type. Nil with no custom font.
  func customFont(_ style: Font.TextStyle = .body, weight: String = "regular") -> Font? {
    let sizes: [Font.TextStyle: CGFloat] = [.body: 17, .subheadline: 15, .footnote: 13, .caption2: 11, .headline: 17]
    return fontName(weight).map { .custom($0, size: sizes[style] ?? 17, relativeTo: style) }
  }

  /// The theme's font when it has one, otherwise the system font the view already used.
  func font(_ style: Font.TextStyle, weight: String = "regular", system: Font) -> Font {
    customFont(style, weight: weight) ?? system
  }

  func color(_ token: String) -> Color? {
    guard let hex = (config["theme"] as? [String: Any])?[token] as? String else { return nil }
    return FerruleColor.parse(hex).map(Color.init(uiColor:))
  }
}

enum FerruleColor {
  static func parse(_ hex: String) -> UIColor? {
    guard hex.hasPrefix("#"), hex.count == 7, let value = Int(hex.dropFirst(), radix: 16) else { return nil }
    return UIColor(red: CGFloat((value >> 16) & 255) / 255, green: CGFloat((value >> 8) & 255) / 255, blue: CGFloat(value & 255) / 255, alpha: 1)
  }
}

struct FerruleOption: Identifiable {
  let id: String
  let label: String
  let icon: String?
  let raw: [String: Any]
  init(_ raw: [String: Any]) {
    id = raw["value"] as? String ?? raw["label"] as? String ?? ""
    label = raw["label"] as? String ?? ""
    icon = raw["icon"] as? String
    self.raw = raw
  }
}

private struct FerruleRoot: View {
  @ObservedObject var host: FerruleHost
  let content: AnyView

  var body: some View {
    let label = host.string("a11yLabel")
    content
      .tint(host.tint)
      .font(host.customFont())
      .environment(\.layoutDirection, host.bool("rtl") ? .rightToLeft : .leftToRight)
      .accessibilityLabelIfPresent(label)
  }
}

extension View {
  @ViewBuilder func accessibilityLabelIfPresent(_ label: String?) -> some View {
    if let label { accessibilityLabel(label) } else { self }
  }
}

/// Hosts one SwiftUI view inside a Fabric view, and reports the size it wants.
@objc public final class FerruleHostingView: UIView {
  private let host = FerruleHost()
  private let hosting: UIHostingController<AnyView>
  private var fill = false
  private var lastSize = CGSize.zero
  private var lastWidth: CGFloat = -1

  @objc public var onEvent: ((String, String) -> Void)?
  @objc public var onSize: ((CGFloat, CGFloat) -> Void)?

  @objc public init(viewName: String) {
    let content = FerruleViews.make(viewName, host: host)
    hosting = UIHostingController(rootView: AnyView(FerruleRoot(host: host, content: content)))
    if #available(iOS 16.4, *) { hosting.safeAreaRegions = [] }
    hosting.view.backgroundColor = .clear
    super.init(frame: .zero)
    clipsToBounds = false
    hosting.view.clipsToBounds = false
    addSubview(hosting.view)
    host.send = { [weak self] name, value in self?.emit(name, value) }
    host.presenter = { [weak self] in self?.hosting }
  }

  required init?(coder: NSCoder) { fatalError("Not used from a coder") }

  @objc public func setConfig(_ json: String) {
    guard let data = json.data(using: .utf8), let config = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
    host.config = config
    fill = config["fill"] as? Bool ?? false
    hosting.overrideUserInterfaceStyle = (config["dark"] as? Bool ?? false) ? .dark : .light
    // SwiftUI applies the change on the next pass, so measure after it.
    DispatchQueue.main.async { [weak self] in self?.measure() }
  }

  private func emit(_ name: String, _ value: Any?) {
    var payload = ""
    if let value {
      // JSONSerialization needs a container, so wrap and unwrap.
      if let data = try? JSONSerialization.data(withJSONObject: [value]), let text = String(data: data, encoding: .utf8) {
        payload = String(text.dropFirst().dropLast())
      }
    }
    onEvent?(name, payload)
    DispatchQueue.main.async { [weak self] in self?.measure() }
  }

  private func measure() {
    let width = fill ? (bounds.width > 1 ? bounds.width : window?.bounds.width ?? UIScreen.main.bounds.width) : CGFloat.greatestFiniteMagnitude
    let size = hosting.sizeThatFits(in: CGSize(width: width, height: .greatestFiniteMagnitude))
    guard size.width.isFinite, size.height.isFinite, size != lastSize else { return }
    lastSize = size
    onSize?(ceil(size.width), ceil(size.height))
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    hosting.view.frame = bounds
    if bounds.width != lastWidth {
      lastWidth = bounds.width
      measure()
    }
  }

  // Presentation (alerts, menus, sheets) needs the hosting controller in the view controller tree.
  public override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      var responder: UIResponder? = self
      while let next = responder?.next {
        if let parent = next as? UIViewController {
          parent.addChild(hosting)
          hosting.didMove(toParent: parent)
          break
        }
        responder = next
      }
      measure()
    } else {
      hosting.willMove(toParent: nil)
      hosting.removeFromParent()
    }
  }
}

@objc(FerruleColorBridge) public final class FerruleColorBridge: NSObject {
  @objc public static func parse(_ hex: String) -> UIColor? { FerruleColor.parse(hex) }
}
