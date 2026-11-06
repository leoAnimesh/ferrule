package dev.ferrule.nativeui

import androidx.compose.runtime.Composable
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

/** Base of every hosted view. A component adds a thin manager, because codegen generates one interface per view. */
abstract class FerruleHostManager(private val viewName: String, private val content: @Composable (FerruleHost) -> Unit) : SimpleViewManager<FerruleHostView>() {
  override fun getName() = viewName
  override fun createViewInstance(context: ThemedReactContext) = FerruleHostView(context, content)
  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> = mutableMapOf(
    "topFerruleEvent" to mapOf("registrationName" to "onFerruleEvent"),
    "topFerruleSize" to mapOf("registrationName" to "onFerruleSize"),
  )
}
