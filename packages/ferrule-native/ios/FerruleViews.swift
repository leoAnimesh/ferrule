import SwiftUI

/// Maps each Fabric view to its SwiftUI content.
enum FerruleViews {
  static func make(_ name: String, host: FerruleHost) -> AnyView {
    // JS only renders hosted views from iOS 17, the first with every API these use.
    guard #available(iOS 17.0, *) else { return AnyView(EmptyView()) }
    switch name {
    case "FerruleButtonView": return AnyView(FerruleButtonContent(host: host))
    case "FerruleToggleView": return AnyView(FerruleToggleContent(host: host))
    case "FerruleSliderView": return AnyView(FerruleSliderContent(host: host))
    case "FerruleSegmentedView": return AnyView(FerruleSegmentedContent(host: host))
    case "FerrulePickerView": return AnyView(FerrulePickerContent(host: host))
    case "FerruleMenuView": return AnyView(FerruleMenuContent(host: host))
    case "FerruleDatePickerView": return AnyView(FerruleDatePickerContent(host: host))
    case "FerruleProgressView": return AnyView(FerruleProgressContent(host: host))
    case "FerruleTextFieldView": return AnyView(FerruleTextFieldContent(host: host))
    case "FerruleAlertView": return AnyView(FerruleAlertContent(host: host))
    case "FerruleActionSheetView": return AnyView(FerruleActionSheetContent(host: host))
    case "FerruleTabBarView": return AnyView(FerruleTabBarContent(host: host))
    case "FerruleTopBarView": return AnyView(FerruleTopBarContent(host: host))
    case "FerruleSearchBarView": return AnyView(FerruleSearchBarContent(host: host))
    case "FerruleListView": return AnyView(FerruleListContent(host: host))
    case "FerruleChipView": return AnyView(FerruleChipContent(host: host))
    case "FerruleFabView": return AnyView(FerruleFabContent(host: host))
    default: return AnyView(EmptyView())
    }
  }
}
