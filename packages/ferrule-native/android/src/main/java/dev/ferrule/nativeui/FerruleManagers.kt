package dev.ferrule.nativeui

import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.*
import dev.ferrule.nativeui.views.*

// One block per component. See docs/adding-a-component.md.
class FerruleButtonViewManager : FerruleHostManager("FerruleButtonView", { FerruleButtonContent(it) }), FerruleButtonViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleButtonViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleToggleViewManager : FerruleHostManager("FerruleToggleView", { FerruleToggleContent(it) }), FerruleToggleViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleToggleViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleSliderViewManager : FerruleHostManager("FerruleSliderView", { FerruleSliderContent(it) }), FerruleSliderViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleSliderViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleSegmentedViewManager : FerruleHostManager("FerruleSegmentedView", { FerruleSegmentedContent(it) }), FerruleSegmentedViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleSegmentedViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerrulePickerViewManager : FerruleHostManager("FerrulePickerView", { FerrulePickerContent(it) }), FerrulePickerViewManagerInterface<FerruleHostView> {
  private val delegate = FerrulePickerViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleMenuViewManager : FerruleHostManager("FerruleMenuView", { FerruleMenuContent(it) }), FerruleMenuViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleMenuViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleDatePickerViewManager : FerruleHostManager("FerruleDatePickerView", { FerruleDatePickerContent(it) }), FerruleDatePickerViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleDatePickerViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleProgressViewManager : FerruleHostManager("FerruleProgressView", { FerruleProgressContent(it) }), FerruleProgressViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleProgressViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleTextFieldViewManager : FerruleHostManager("FerruleTextFieldView", { FerruleTextFieldContent(it) }), FerruleTextFieldViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleTextFieldViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleAlertViewManager : FerruleHostManager("FerruleAlertView", { FerruleAlertContent(it) }), FerruleAlertViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleAlertViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleActionSheetViewManager : FerruleHostManager("FerruleActionSheetView", { FerruleActionSheetContent(it) }), FerruleActionSheetViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleActionSheetViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleTabBarViewManager : FerruleHostManager("FerruleTabBarView", { FerruleTabBarContent(it) }), FerruleTabBarViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleTabBarViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleTopBarViewManager : FerruleHostManager("FerruleTopBarView", { FerruleTopBarContent(it) }), FerruleTopBarViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleTopBarViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleSearchBarViewManager : FerruleHostManager("FerruleSearchBarView", { FerruleSearchBarContent(it) }), FerruleSearchBarViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleSearchBarViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleListViewManager : FerruleHostManager("FerruleListView", { FerruleListContent(it) }), FerruleListViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleListViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleChipViewManager : FerruleHostManager("FerruleChipView", { FerruleChipContent(it) }), FerruleChipViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleChipViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleFabViewManager : FerruleHostManager("FerruleFabView", { FerruleFabContent(it) }), FerruleFabViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleFabViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

class FerruleCheckboxViewManager : FerruleHostManager("FerruleCheckboxView", { FerruleCheckboxContent(it) }), FerruleCheckboxViewManagerInterface<FerruleHostView> {
  private val delegate = FerruleCheckboxViewManagerDelegate(this)
  override fun getDelegate(): ViewManagerDelegate<FerruleHostView> = delegate
  override fun setConfig(view: FerruleHostView, value: String?) = view.setConfig(value)
}

