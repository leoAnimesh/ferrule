@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package dev.ferrule.nativeui.views

import android.text.format.DateFormat
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import dev.ferrule.nativeui.FerruleHost
import org.json.JSONObject
import java.util.Calendar
import java.util.Date
import java.util.TimeZone

// shortcut: only the common material-icons-core names, add more here when an app needs them.
private fun ferruleIcon(name: String?): ImageVector? = when (name) {
  "Add" -> Icons.Filled.Add
  "ArrowBack" -> Icons.AutoMirrored.Filled.ArrowBack
  "Check" -> Icons.Filled.Check
  "Close" -> Icons.Filled.Close
  "Delete" -> Icons.Filled.Delete
  "Edit" -> Icons.Filled.Edit
  "Email" -> Icons.Filled.Email
  "Favorite" -> Icons.Filled.Favorite
  "Home" -> Icons.Filled.Home
  "Info" -> Icons.Filled.Info
  "List" -> Icons.AutoMirrored.Filled.List
  "Menu" -> Icons.Filled.Menu
  "MoreVert" -> Icons.Filled.MoreVert
  "Notifications" -> Icons.Filled.Notifications
  "Person" -> Icons.Filled.Person
  "Phone" -> Icons.Filled.Phone
  "Refresh" -> Icons.Filled.Refresh
  "Search" -> Icons.Filled.Search
  "Send" -> Icons.AutoMirrored.Filled.Send
  "Settings" -> Icons.Filled.Settings
  "Share" -> Icons.Filled.Share
  "Star" -> Icons.Filled.Star
  else -> null
}

@Composable
private fun Glyph(name: String?, description: String? = null) {
  ferruleIcon(name)?.let { Icon(it, contentDescription = description, modifier = Modifier.size(18.dp)) }
}

private fun FerruleHost.a11y(): Modifier = string("a11yLabel")?.let { label -> Modifier.semantics { contentDescription = label } } ?: Modifier

@Composable
fun FerruleButtonContent(host: FerruleHost) {
  val disabled = host.bool("disabled") || host.bool("loading")
  val fill = if (host.bool("fill")) Modifier.fillMaxWidth() else Modifier
  val modifier = fill.then(host.a11y())
  val body: @Composable () -> Unit = {
    if (host.bool("loading")) {
      CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp, color = LocalContentColor.current)
      Spacer(Modifier.width(8.dp))
    } else if (host.string("icon") != null) {
      Glyph(host.string("icon"))
      Spacer(Modifier.width(8.dp))
    }
    Text(host.string("label").orEmpty(), style = if (host.string("size") == "sm") MaterialTheme.typography.labelMedium else MaterialTheme.typography.labelLarge)
  }
  val press = { host.send("press") }
  when (host.string("variant")) {
    "soft" -> FilledTonalButton(press, modifier, enabled = !disabled) { body() }
    "outline" -> OutlinedButton(press, modifier, enabled = !disabled) { body() }
    "ghost" -> TextButton(press, modifier, enabled = !disabled) { body() }
    "danger" -> Button(press, modifier, enabled = !disabled, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error, contentColor = MaterialTheme.colorScheme.onError)) { body() }
    else -> Button(press, modifier, enabled = !disabled) { body() }
  }
}

@Composable
private fun LabelledControl(host: FerruleHost, role: Role, control: @Composable () -> Unit) {
  val value = host.bool("value")
  // The whole row is one control to TalkBack, with the row as the touch target.
  Row(
    Modifier.fillMaxWidth().toggleable(value = value, enabled = !host.bool("disabled"), role = role) { host.change("value", it) }.then(host.a11y()).padding(vertical = 4.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(12.dp),
  ) {
    Column(Modifier.weight(1f)) {
      host.string("label")?.let { Text(it, style = MaterialTheme.typography.bodyLarge) }
      host.string("description")?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
    }
    control()
  }
}

@Composable
fun FerruleToggleContent(host: FerruleHost) = LabelledControl(host, Role.Switch) {
  Switch(checked = host.bool("value"), onCheckedChange = null, enabled = !host.bool("disabled"))
}

@Composable
fun FerruleCheckboxContent(host: FerruleHost) = LabelledControl(host, Role.Checkbox) {
  Checkbox(checked = host.bool("value"), onCheckedChange = null, enabled = !host.bool("disabled"))
}

@Composable
fun FerruleSliderContent(host: FerruleHost) {
  val min = (host.double("min") ?: 0.0).toFloat()
  val max = (host.double("max") ?: 1.0).toFloat()
  val step = host.double("step")?.toFloat()
  Slider(
    value = (host.double("value") ?: 0.0).toFloat(),
    onValueChange = { host.change("value", it.toDouble()) },
    onValueChangeFinished = { host.send("end", host.double("value")) },
    valueRange = min..max,
    steps = if (step != null && step > 0) ((max - min) / step).toInt() - 1 else 0,
    enabled = !host.bool("disabled"),
    modifier = Modifier.fillMaxWidth().then(host.a11y()),
  )
}

@Composable
fun FerruleSegmentedContent(host: FerruleHost) {
  val options = host.list("options")
  SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth().then(host.a11y())) {
    options.forEachIndexed { index, option ->
      val value = option.optString("value")
      SegmentedButton(
        selected = host.string("value") == value,
        onClick = { host.change("value", value) },
        enabled = !host.bool("disabled"),
        shape = SegmentedButtonDefaults.itemShape(index, options.size),
      ) { Text(option.optString("label")) }
    }
  }
}

@Composable
fun FerrulePickerContent(host: FerruleHost) {
  var open by remember { mutableStateOf(false) }
  val options = host.list("options")
  val current = options.firstOrNull { it.optString("value") == host.string("value") }?.optString("label").orEmpty()
  ExposedDropdownMenuBox(expanded = open, onExpandedChange = { if (!host.bool("disabled")) open = it }) {
    OutlinedTextField(
      value = current,
      onValueChange = {},
      readOnly = true,
      enabled = !host.bool("disabled"),
      singleLine = true,
      label = host.string("label")?.let { { Text(it) } },
      trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(open) },
      modifier = Modifier.fillMaxWidth().menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable),
    )
    ExposedDropdownMenu(open, { open = false }) {
      options.forEach { option ->
        DropdownMenuItem(text = { Text(option.optString("label")) }, onClick = {
          open = false
          host.change("value", option.optString("value"))
        })
      }
    }
  }
}

@Composable
fun FerruleMenuContent(host: FerruleHost) {
  var open by remember { mutableStateOf(false) }
  Box {
    OutlinedButton({ open = true }, host.a11y()) { Text(host.string("label").orEmpty()) }
    DropdownMenu(open, { open = false }) {
      host.list("items").forEach { item ->
        val destructive = item.optBoolean("destructive")
        DropdownMenuItem(
          text = { Text(item.optString("label"), color = if (destructive) MaterialTheme.colorScheme.error else androidx.compose.ui.graphics.Color.Unspecified) },
          enabled = !item.optBoolean("disabled"),
          leadingIcon = if (item.isNull("icon")) null else ({ Glyph(item.optString("icon")) }),
          onClick = {
            open = false
            host.send("select", item.optString("value"))
          },
        )
      }
    }
  }
}

@Composable
fun FerruleDatePickerContent(host: FerruleHost) {
  var open by remember { mutableStateOf(false) }
  val context = LocalContext.current
  val millis = (host.double("millis") ?: 0.0).toLong()
  val isTime = host.string("mode") == "time"
  val text = if (isTime) DateFormat.getTimeFormat(context).format(Date(millis)) else DateFormat.getMediumDateFormat(context).format(Date(millis))
  Column {
    host.string("label")?.let { Text(it, style = MaterialTheme.typography.labelLarge) }
    OutlinedButton({ open = true }, host.a11y(), enabled = !host.bool("disabled")) { Text(text) }
  }
  if (!open) return
  if (isTime) {
    val calendar = Calendar.getInstance().apply { timeInMillis = millis }
    val state = rememberTimePickerState(calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), DateFormat.is24HourFormat(context))
    AlertDialog(
      onDismissRequest = { open = false },
      confirmButton = {
        TextButton({
          open = false
          calendar.set(Calendar.HOUR_OF_DAY, state.hour)
          calendar.set(Calendar.MINUTE, state.minute)
          host.change("millis", calendar.timeInMillis.toDouble())
        }) { Text(context.getString(android.R.string.ok)) }
      },
      dismissButton = { TextButton({ open = false }) { Text(context.getString(android.R.string.cancel)) } },
      text = { TimePicker(state) },
    )
  } else {
    // DatePicker works in UTC days, so convert from and to the local day.
    val local = Calendar.getInstance().apply { timeInMillis = millis }
    val utc = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply { clear(); set(local.get(Calendar.YEAR), local.get(Calendar.MONTH), local.get(Calendar.DAY_OF_MONTH)) }
    val state = rememberDatePickerState(initialSelectedDateMillis = utc.timeInMillis)
    DatePickerDialog(
      onDismissRequest = { open = false },
      confirmButton = {
        TextButton({
          open = false
          state.selectedDateMillis?.let { picked ->
            val day = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply { timeInMillis = picked }
            local.set(day.get(Calendar.YEAR), day.get(Calendar.MONTH), day.get(Calendar.DAY_OF_MONTH))
            host.change("millis", local.timeInMillis.toDouble())
          }
        }) { Text(context.getString(android.R.string.ok)) }
      },
      dismissButton = { TextButton({ open = false }) { Text(context.getString(android.R.string.cancel)) } },
    ) { DatePicker(state) }
  }
}

@Composable
fun FerruleProgressContent(host: FerruleHost) {
  val value = host.double("value")?.toFloat()
  if (host.string("kind") == "circular") {
    val size = when (host.string("size")) { "sm" -> 20.dp; "lg" -> 48.dp; else -> 32.dp }
    if (value != null) CircularProgressIndicator(progress = { value }, modifier = host.a11y().size(size)) else CircularProgressIndicator(host.a11y().size(size))
  } else {
    val modifier = host.a11y().fillMaxWidth()
    if (value != null) LinearProgressIndicator(progress = { value }, modifier = modifier) else LinearProgressIndicator(modifier)
  }
}

@Composable
fun FerruleTextFieldContent(host: FerruleHost) {
  val incoming = host.string("value").orEmpty()
  var text by remember { mutableStateOf(incoming) }
  // Values sent to JS and not yet echoed back, so a late echo cannot overwrite newer typing.
  val pending = remember { mutableStateListOf<String>() }
  LaunchedEffect(incoming) {
    val index = pending.indexOf(incoming)
    if (index >= 0) {
      repeat(index + 1) { pending.removeAt(0) }
    } else if (incoming != text) {
      pending.clear()
      text = incoming
    }
  }
  val error = host.string("error")
  val secure = host.bool("secure")
  val keyboard = when (host.string("keyboard")) {
    "email-address" -> KeyboardType.Email
    "numeric", "number-pad" -> KeyboardType.Number
    "decimal-pad" -> KeyboardType.Decimal
    "phone-pad" -> KeyboardType.Phone
    "url" -> KeyboardType.Uri
    else -> if (secure) KeyboardType.Password else KeyboardType.Text
  }
  OutlinedTextField(
    value = text,
    onValueChange = {
      text = it
      pending.add(it)
      host.send("change", it)
    },
    enabled = !host.bool("disabled"),
    singleLine = true,
    isError = error != null,
    label = host.string("label")?.let { { Text(it) } },
    placeholder = host.string("placeholder")?.let { { Text(it) } },
    supportingText = (error ?: host.string("helperText"))?.let { { Text(it) } },
    visualTransformation = if (secure) PasswordVisualTransformation() else VisualTransformation.None,
    keyboardOptions = KeyboardOptions(keyboardType = keyboard),
    modifier = Modifier.fillMaxWidth().then(host.a11y()),
  )
}

@Composable
fun FerruleAlertContent(host: FerruleHost) {
  if (!host.bool("open")) return
  val actions = host.list("actions")
  val confirm = actions.indexOfLast { it.optString("role") != "cancel" }
  val cancel = actions.indexOfFirst { it.optString("role") == "cancel" }
  AlertDialog(
    onDismissRequest = { host.send("dismiss") },
    title = { Text(host.string("title").orEmpty()) },
    text = host.string("message")?.let { { Text(it) } },
    confirmButton = {
      Row {
        actions.forEachIndexed { index, action ->
          if (index != cancel && index <= confirm) {
            TextButton({ host.send("action", index) }) {
              Text(action.optString("label"), color = if (action.optString("role") == "destructive") MaterialTheme.colorScheme.error else androidx.compose.ui.graphics.Color.Unspecified)
            }
          }
        }
      }
    },
    dismissButton = if (cancel >= 0) ({ TextButton({ host.send("action", cancel) }) { Text(actions[cancel].optString("label")) } }) else null,
  )
}

@Composable
fun FerruleActionSheetContent(host: FerruleHost) {
  if (!host.bool("open")) return
  ModalBottomSheet(onDismissRequest = { host.send("dismiss") }) {
    Column(Modifier.padding(bottom = 16.dp)) {
      Text(host.string("title").orEmpty(), style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
      host.string("message")?.let { Text(it, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) }
      host.list("actions").forEachIndexed { index, action ->
        ListItem(
          headlineContent = { Text(action.optString("label"), color = if (action.optString("role") == "destructive") MaterialTheme.colorScheme.error else androidx.compose.ui.graphics.Color.Unspecified) },
          modifier = Modifier.clickable(role = Role.Button) { host.send("action", index) },
        )
      }
    }
  }
}

@Composable
fun FerruleTabBarContent(host: FerruleHost) {
  NavigationBar(windowInsets = WindowInsets(0), modifier = host.a11y()) {
    host.list("options").forEach { option ->
      val value = option.optString("value")
      NavigationBarItem(
        selected = host.string("value") == value,
        onClick = { host.change("value", value) },
        icon = { Glyph(if (option.isNull("icon")) null else option.optString("icon")) },
        label = { Text(option.optString("label")) },
      )
    }
  }
}

@Composable
fun FerruleTopBarContent(host: FerruleHost) {
  TopAppBar(
    title = { Text(host.string("title").orEmpty()) },
    windowInsets = WindowInsets(0),
    navigationIcon = {
      host.string("back")?.let { back ->
        IconButton({ host.send("back") }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = back) }
      }
    },
    actions = {
      host.list("actions").forEach { action ->
        IconButton({ host.send("action", action.optString("value")) }) {
          val icon = ferruleIcon(if (action.isNull("icon")) null else action.optString("icon")) ?: Icons.Filled.MoreVert
          Icon(icon, contentDescription = action.optString("label"))
        }
      }
    },
  )
}

@Composable
fun FerruleSearchBarContent(host: FerruleHost) {
  val text = host.string("value").orEmpty()
  SearchBar(
    inputField = {
      SearchBarDefaults.InputField(
        query = text,
        onQueryChange = { host.change("value", it) },
        onSearch = { host.send("submit", it) },
        expanded = false,
        onExpandedChange = {},
        placeholder = host.string("placeholder")?.let { { Text(it) } },
        leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
      )
    },
    expanded = false,
    onExpandedChange = {},
    windowInsets = WindowInsets(0),
    modifier = Modifier.fillMaxWidth(),
  ) {}
}

@Composable
fun FerruleListContent(host: FerruleHost) {
  LazyColumn(Modifier.fillMaxWidth().then(host.a11y())) {
    items(host.list("rows"), key = { row: JSONObject -> row.optString("id") }) { row ->
      ListItem(
        headlineContent = { Text(row.optString("title")) },
        supportingContent = if (row.isNull("subtitle")) null else ({ Text(row.optString("subtitle")) }),
        modifier = Modifier.clickable(role = Role.Button) { host.send("press", row.optString("id")) },
      )
      HorizontalDivider()
    }
  }
}

@Composable
fun FerruleChipContent(host: FerruleHost) {
  FilterChip(
    selected = host.bool("selected"),
    onClick = { host.send("press") },
    enabled = !host.bool("disabled"),
    label = { Text(host.string("label").orEmpty()) },
    leadingIcon = if (host.string("icon") != null) ({ Glyph(host.string("icon")) }) else null,
    modifier = host.a11y(),
  )
}

@Composable
fun FerruleFabContent(host: FerruleHost) {
  val label = host.string("label")
  val description = host.string("a11yLabel") ?: label
  val icon = ferruleIcon(host.string("icon")) ?: Icons.Filled.Add
  if (label != null) {
    ExtendedFloatingActionButton(onClick = { host.send("press") }, icon = { Icon(icon, contentDescription = null) }, text = { Text(label) })
  } else {
    FloatingActionButton({ host.send("press") }) { Icon(icon, contentDescription = description) }
  }
}
