import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleButtonContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    let variant = host.string("variant") ?? "solid"
    let tint = variant == "danger" ? host.color("danger") : host.tint
    styled(button, variant: variant)
      .buttonBorderShape(iconOnly ? .circle : .automatic)
      .tint(tint)
      .controlSize(iconOnly ? .regular : host.string("size") == "sm" ? .small : host.string("size") == "lg" ? .large : .regular)
      .disabled(host.bool("disabled") || host.bool("loading"))
  }

  private var iconOnly: Bool { host.string("label") == nil && host.string("icon") != nil }

  private var button: some View {
    Button(role: host.string("variant") == "danger" ? .destructive : nil) {
      host.send("press", nil)
    } label: {
      if iconOnly { iconLabel } else {
        themedLabel(HStack(spacing: 6) {
          if host.bool("loading") { ProgressView().controlSize(.small) }
          if let icon = host.string("icon") { Image(systemName: icon) }
          Text(host.string("label") ?? "").font(host.customFont(.body, weight: "medium"))
        })
        .frame(maxWidth: host.bool("fill") ? .infinity : nil)
      }
    }
    // Small buttons keep a full-size touch target.
    .frame(minWidth: 44, minHeight: 44)
  }

  // The system's white label fails contrast on the light primary of a dark palette. Disabled and loading keep the system's dimmed color.
  @ViewBuilder private func themedLabel(_ view: some View) -> some View {
    let variant = host.string("variant") ?? "solid"
    let color = variant == "solid" ? host.color("onPrimary") : variant == "danger" ? host.color("onDanger") : nil
    if let color, !host.bool("disabled"), !host.bool("loading") { view.foregroundStyle(color) } else { view }
  }

  // Theme colors rather than the tint, so it holds its contrast over whatever is behind the glass.
  private var iconLabel: some View {
    let variant = host.string("variant")
    let color = variant == "solid" ? host.color("onPrimary") : variant == "danger" ? host.color("onDanger") : host.color("text")
    let side = host.double("side") ?? 44
    return Image(systemName: host.string("icon") ?? "")
      .font(.body.weight(.medium))
      .dynamicTypeSize(...DynamicTypeSize.accessibility1)
      .foregroundStyle(color ?? .primary)
      // The regular control size pads each side by 7, which brings the circle to the requested size.
      .frame(width: side - 14, height: side - 14)
      .opacity(host.bool("disabled") ? 0.5 : 1)
  }

  // Liquid Glass from iOS 26. Below that, the same control in its system style.
  @ViewBuilder private func styled(_ view: some View, variant: String) -> some View {
    if #available(iOS 26.0, *) {
      switch variant {
      case "solid", "danger": view.buttonStyle(.glassProminent)
      case "ghost": view.buttonStyle(.borderless)
      default: view.buttonStyle(.glass)
      }
    } else {
      switch variant {
      case "solid", "danger": view.buttonStyle(.borderedProminent)
      case "ghost": view.buttonStyle(.borderless)
      default: view.buttonStyle(.bordered)
      }
    }
  }
}
