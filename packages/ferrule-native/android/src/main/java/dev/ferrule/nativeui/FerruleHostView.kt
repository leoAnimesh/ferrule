package dev.ferrule.nativeui

import android.view.View
import android.widget.FrameLayout
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.unit.LayoutDirection
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import android.content.Context
import android.graphics.Typeface as AndroidTypeface
import androidx.compose.material3.Typography
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontSynthesis
import androidx.compose.ui.text.font.Typeface as ComposeTypeface
import com.facebook.react.common.assets.ReactFontManager
import androidx.compose.runtime.remember
import org.json.JSONArray
import org.json.JSONObject

/** The config a hosted composable reads, and the way it talks back to JS. */
class FerruleHost(private val emit: (String, Any?) -> Unit) {
  var config by mutableStateOf(JSONObject())

  fun string(key: String): String? = if (config.isNull(key)) null else config.optString(key)
  fun bool(key: String): Boolean = config.optBoolean(key, false)
  fun double(key: String): Double? = if (config.isNull(key)) null else config.optDouble(key)
  fun list(key: String): List<JSONObject> {
    val array = config.optJSONArray(key) ?: return emptyList()
    return List(array.length()) { array.getJSONObject(it) }
  }

  fun send(name: String, value: Any? = null) = emit(name, value)

  /** Shows a new value at once and sends it to JS. */
  fun change(key: String, value: Any, event: String = "change") {
    config = JSONObject(config.toString()).put(key, value)
    send(event, value)
  }

  /** The theme's family at a weight, or null with no custom font. A family that failed to load gives the system font, not a crash. */
  fun fontFamily(context: Context, weight: String): FontFamily? {
    val name = config.optJSONObject("fonts")?.optString(weight).orEmpty()
    if (name.isEmpty()) return null
    return FontFamily(ComposeTypeface(ReactFontManager.getInstance().getTypeface(name, AndroidTypeface.NORMAL, context.assets)))
  }

  fun color(token: String): Color? {
    val hex = config.optJSONObject("theme")?.optString(token).orEmpty()
    return if (hex.length == 7 && hex[0] == '#') Color(android.graphics.Color.parseColor(hex)) else null
  }
}

/** Material's type scale in the theme's fonts, by each style's own weight. Sizes stay in sp, so Android font scaling still applies. */
private fun FerruleHost.typography(context: Context): Typography {
  fun TextStyle.themed(): TextStyle {
    val weight = when {
      (fontWeight?.weight ?: 400) >= 700 -> "bold"
      (fontWeight?.weight ?: 400) >= 600 -> "semibold"
      (fontWeight?.weight ?: 400) >= 500 -> "medium"
      else -> "regular"
    }
    // Each family is already one weight, and Compose would thicken it again.
    return fontFamily(context, weight)?.let { copy(fontFamily = it, fontSynthesis = FontSynthesis.None) } ?: this
  }
  val base = Typography()
  return base.copy(
    displayLarge = base.displayLarge.themed(), displayMedium = base.displayMedium.themed(), displaySmall = base.displaySmall.themed(),
    headlineLarge = base.headlineLarge.themed(), headlineMedium = base.headlineMedium.themed(), headlineSmall = base.headlineSmall.themed(),
    titleLarge = base.titleLarge.themed(), titleMedium = base.titleMedium.themed(), titleSmall = base.titleSmall.themed(),
    bodyLarge = base.bodyLarge.themed(), bodyMedium = base.bodyMedium.themed(), bodySmall = base.bodySmall.themed(),
    labelLarge = base.labelLarge.themed(), labelMedium = base.labelMedium.themed(), labelSmall = base.labelSmall.themed(),
  )
}

@Composable
private fun FerruleTheme(host: FerruleHost, content: @Composable () -> Unit) {
  val dark = host.bool("dark")
  val base = if (dark) darkColorScheme() else lightColorScheme()
  val scheme = base.copy(
    primary = host.color("primary") ?: base.primary,
    onPrimary = host.color("onPrimary") ?: base.onPrimary,
    primaryContainer = host.color("primarySoft") ?: base.primaryContainer,
    onPrimaryContainer = host.color("onPrimarySoft") ?: base.onPrimaryContainer,
    secondaryContainer = host.color("primarySoft") ?: base.secondaryContainer,
    onSecondaryContainer = host.color("onPrimarySoft") ?: base.onSecondaryContainer,
    error = host.color("danger") ?: base.error,
    onError = host.color("onDanger") ?: base.onError,
    background = host.color("background") ?: base.background,
    surface = host.color("surface") ?: base.surface,
    // Material's default containers are lavender, which dialogs and sheets would show over a brand palette.
    surfaceContainerLowest = host.color("surface") ?: base.surfaceContainerLowest,
    surfaceContainerLow = host.color("surface") ?: base.surfaceContainerLow,
    surfaceContainer = host.color("surface") ?: base.surfaceContainer,
    surfaceContainerHigh = host.color("surface") ?: base.surfaceContainerHigh,
    surfaceContainerHighest = host.color("surfaceMuted") ?: base.surfaceContainerHighest,
    surfaceVariant = host.color("surfaceMuted") ?: base.surfaceVariant,
    onSurface = host.color("text") ?: base.onSurface,
    onSurfaceVariant = host.color("textMuted") ?: base.onSurfaceVariant,
    outline = host.color("controlBorder") ?: base.outline,
    outlineVariant = host.color("border") ?: base.outlineVariant,
  )
  val context = LocalContext.current
  val fonts = host.config.optJSONObject("fonts")?.toString()
  val typography = remember(fonts) { host.typography(context) }
  MaterialTheme(colorScheme = scheme, typography = typography) {
    // Compose's default content color is black, which hides labels drawn outside a Surface in dark mode.
    CompositionLocalProvider(LocalContentColor provides scheme.onSurface, LocalLayoutDirection provides if (host.bool("rtl")) LayoutDirection.Rtl else LayoutDirection.Ltr, content = content)
  }
}

private class FerruleEvent(surface: Int, tag: Int, private val event: String, private val data: WritableMap) : Event<FerruleEvent>(surface, tag) {
  override fun getEventName() = event
  override fun getEventData() = data
  override fun canCoalesce() = false
}

/** Hosts one composable inside a Fabric view, and reports the size it wants. */
class FerruleHostView(private val reactContext: ThemedReactContext, content: @Composable (FerruleHost) -> Unit) : FrameLayout(reactContext) {
  private val host = FerruleHost { name, value -> emit(name, value) }
  private var lastWidth = -1
  private var lastHeight = -1
  private var pending = false
  private val composeView = ComposeView(reactContext)

  init {
    // Inside an RN Modal the view tree has no owners, and Compose needs them.
    (reactContext.currentActivity as? LifecycleOwner)?.let { setViewTreeLifecycleOwner(it) }
    (reactContext.currentActivity as? SavedStateRegistryOwner)?.let { setViewTreeSavedStateRegistryOwner(it) }
    composeView.setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindow)
    composeView.setContent { FerruleTheme(host) { content(host) } }
    addView(composeView)
    // A view is measured to the control, so its shadow falls outside. Clipping it left square corners on the FAB.
    clipChildren = false
    composeView.clipChildren = false
  }

  fun setConfig(json: String?) {
    host.config = runCatching { JSONObject(json ?: "{}") }.getOrDefault(JSONObject())
    requestLayout()
  }

  private fun emit(name: String, value: Any?) {
    val data = Arguments.createMap()
    data.putString("name", name)
    data.putString("value", if (value == null) "" else JSONArray().put(value).toString().removeSurrounding("[", "]"))
    dispatch("topFerruleEvent", data)
  }

  private fun dispatch(event: String, data: WritableMap) {
    UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(FerruleEvent(UIManagerHelper.getSurfaceId(this), id, event, data))
  }

  // Fabric never lays out what it did not create, so Compose's layout requests are honoured here.
  override fun requestLayout() {
    super.requestLayout()
    if (pending) return
    pending = true
    post {
      pending = false
      measureAndReport()
    }
  }

  // React Native can measure a view before its screen attaches it, and measuring a detached ComposeView throws
  // "Cannot locate windowRecomposer". Until it is attached, take the size Fabric asks for (falling back to the last
  // reported size) without measuring Compose; onAttachedToWindow measures and reports for real.
  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    if (composeView.isAttachedToWindow) return super.onMeasure(widthMeasureSpec, heightMeasureSpec)
    setMeasuredDimension(resolveSize(maxOf(lastWidth, 0), widthMeasureSpec), resolveSize(maxOf(lastHeight, 0), heightMeasureSpec))
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    if (changed) measureAndReport()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    // Children attach after this returns.
    post { measureAndReport() }
  }

  private fun measureAndReport() {
    // Compose throws if measured off-window, and a queued request can outlive a detach when Fabric removes the view.
    if (!composeView.isAttachedToWindow) return
    val metrics = resources.displayMetrics
    val fill = host.bool("fill")
    val fixed = host.double("height")
    val widthSpec = if (fill && width > 1) MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY)
      else MeasureSpec.makeMeasureSpec(metrics.widthPixels, MeasureSpec.AT_MOST)
    val heightSpec = if (fixed != null) MeasureSpec.makeMeasureSpec(PixelUtil.toPixelFromDIP(fixed).toInt(), MeasureSpec.EXACTLY)
      else MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)
    composeView.measure(widthSpec, heightSpec)
    composeView.layout(0, 0, composeView.measuredWidth, composeView.measuredHeight)
    if (composeView.measuredWidth == lastWidth && composeView.measuredHeight == lastHeight) return
    lastWidth = composeView.measuredWidth
    lastHeight = composeView.measuredHeight
    val data = Arguments.createMap()
    data.putDouble("width", PixelUtil.toDIPFromPixel(lastWidth.toFloat()).toDouble())
    data.putDouble("height", PixelUtil.toDIPFromPixel(lastHeight.toFloat()).toDouble())
    dispatch("topFerruleSize", data)
  }
}
