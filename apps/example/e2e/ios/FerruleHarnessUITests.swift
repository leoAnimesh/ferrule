import XCTest

/// Drives the running harness with real taps and swipes, and reads the real accessibility tree.
/// Run with e2e/ios/run.sh. Screenshots go to TEST_RUNNER_FERRULE_SHOTS.
final class FerruleHarnessUITests: XCTestCase {
  let app = XCUIApplication()

  override func setUp() {
    continueAfterFailure = true
    app.launch()
    XCTAssertTrue(any("catalog-search").waitForExistence(timeout: 60), "catalog did not render")
  }

  func any(_ label: String) -> XCUIElement { app.descendants(matching: .any)[label].firstMatch }
  func link(_ query: String) { app.open(URL(string: "dev.ferrule.harness://?\(query)")!) }
  /// Opens a component's detail screen by deep link. Native settings stay as they were left, so tests that care pass `native=`.
  func open(_ component: String, _ extra: String = "") {
    link("component=\(component)\(extra)")
    XCTAssertTrue(any("detail-\(component)").waitForExistence(timeout: 30), "component \(component)")
  }
  /// One native section on its own, so nothing has to be scrolled to.
  func native(_ component: String, only: String? = nil) {
    open(component, "&native=1" + (only.map { "&only=\($0)" } ?? ""))
    sleep(1)
  }
  func shot(_ name: String) {
    guard let dir = ProcessInfo.processInfo.environment["FERRULE_SHOTS"] else { return }
    try? XCUIScreen.main.screenshot().pngRepresentation.write(to: URL(fileURLWithPath: "\(dir)/ios-\(name).png"))
  }
  func gone(_ element: XCUIElement, _ message: String) {
    let predicate = NSPredicate(format: "exists == false")
    let wait = XCTNSPredicateExpectation(predicate: predicate, object: element)
    XCTAssertEqual(XCTWaiter().wait(for: [wait], timeout: 5), .completed, message)
  }
  /// A tap in the backdrop, well above any centered dialog or bottom sheet.
  func tapBackdrop() { app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.12)).tap() }

  /// The list, its search, and the way back: everything a person does before reaching a component.
  func testCatalog() {
    shot("catalog")
    let search = any("catalog-search")
    search.tap()
    search.typeText("swipe")
    XCTAssertTrue(any("open-swipe-row").waitForExistence(timeout: 5), "search finds a match")
    gone(any("open-button"), "search hides the rest")
    search.typeText("zzz")
    XCTAssertTrue(any("Clear search").waitForExistence(timeout: 5), "search has an empty state")
    shot("catalog-empty")
    any("Clear search").tap()
    XCTAssertTrue(any("open-button").waitForExistence(timeout: 5), "clearing brings it back")
    any("open-button").tap()
    XCTAssertTrue(any("detail-button").waitForExistence(timeout: 5), "a row opens its component")
    any("detail-back").tap()
    XCTAssertTrue(any("catalog-search").waitForExistence(timeout: 5), "back returns to the list")
  }

  func testGlobalControls() {
    any("controls-open").tap()
    XCTAssertTrue(any("palette-cobalt").waitForExistence(timeout: 5), "controls sheet")
    any("palette-cobalt").tap()
    any("Dark").tap()
    any("Close").tap()
    gone(any("palette-cobalt"), "controls close")
    XCTAssertTrue(any("settings-summary").label.contains("cobalt"), "palette applies: \(any("settings-summary").label)")
    XCTAssertTrue(any("settings-summary").label.contains("dark"), "mode applies")
    link("component=button&native=0")
    XCTAssertTrue(any("status-native-button").waitForExistence(timeout: 10))
    any("status-native-button").swipeUp()
    XCTAssertTrue(any("Ferrule, native off").waitForExistence(timeout: 5), "native off is labelled")
    link("component=button&native=1&palette=verdigris&mode=light")
  }

  /// Screenshots the composite in each palette named by the matrix, for side-by-side review.
  func testPaletteGallery() {
    for palette in ["verdigris", "cobalt", "saffron", "custom"] {
      for mode in ["light", "dark"] {
        open("composite", "&palette=\(palette)&mode=\(mode)")
        sleep(1)
        shot("gallery-\(palette)-\(mode)")
      }
    }
    link("palette=verdigris&mode=light")
  }

  func testAllComponentsRender() {
    for component in ["text", "stack", "icon", "button", "chip", "segmented", "input", "switch", "checkbox", "stepper", "card", "list", "swipe-row", "carousel", "avatar", "badge", "image", "spinner", "progress", "toast", "modal", "sheet", "tabbar", "native-slider", "native-picker", "native-menu", "native-date", "native-action-sheet", "native-top-bar", "native-search", "native-fab", "native-list", "composite", "fonts", "metrics", "flatlist"] {
      open(component)
      sleep(1)
      shot("component-\(component)")
    }
  }

  func testButton() {
    open("button")
    app.buttons["Solid"].firstMatch.tap()
    XCTAssertTrue(app.staticTexts["Variants (pressed 1 times)"].waitForExistence(timeout: 3), "press registers")
    let disabled = app.buttons.matching(identifier: "Solid").element(boundBy: 1)
    XCTAssertFalse(disabled.isEnabled, "disabled button reports not enabled")
    disabled.tap()
    XCTAssertTrue(app.staticTexts["Variants (pressed 1 times)"].exists, "disabled does not press")
    XCTAssertFalse(app.buttons["Saving"].isEnabled, "loading button reports not enabled")
  }

  func testSwitchAndCheckbox() {
    open("switch")
    let toggle = app.switches["Uncontrolled"]
    XCTAssertTrue(toggle.waitForExistence(timeout: 3), "exposes a real switch")
    XCTAssertEqual(toggle.value as? String, "1")
    toggle.tap()
    XCTAssertEqual(toggle.value as? String, "0", "switch value updates")
    XCTAssertFalse(app.switches["Disabled off"].isEnabled)

    open("checkbox")
    let box = any("Uncontrolled")
    XCTAssertTrue(box.waitForExistence(timeout: 3))
    let before = box.value as? String
    box.tap()
    XCTAssertNotEqual(box.value as? String, before, "checkbox value updates")
    shot("checkbox-toggled")
  }

  func testInput() {
    open("input")
    let email = app.textFields["Email"].firstMatch
    XCTAssertTrue(email.waitForExistence(timeout: 3))
    email.tap()
    email.typeText("nope")
    XCTAssertTrue(app.staticTexts["Enter a valid email address."].waitForExistence(timeout: 3), "validation appears")
    shot("input-error")
    email.typeText("@x.com")
    gone(app.staticTexts["Enter a valid email address."], "validation clears")
    XCTAssertFalse(app.textFields["Disabled"].isEnabled, "disabled field reports not enabled")
  }

  func testModal() {
    open("modal")
    app.buttons["Basic"].tap()
    XCTAssertTrue(app.staticTexts["Delete this item?"].waitForExistence(timeout: 3))
    sleep(1)
    shot("modal-basic")
    XCTAssertFalse(app.buttons["Non-dismissible"].isHittable, "content behind the modal cannot be reached")
    app.buttons["Close"].tap()
    gone(app.staticTexts["Delete this item?"], "close button closes")
    XCTAssertTrue(app.buttons["Non-dismissible"].waitForExistence(timeout: 3), "content behind returns")

    app.buttons["Basic"].tap()
    XCTAssertTrue(app.staticTexts["Delete this item?"].waitForExistence(timeout: 3))
    sleep(1)
    tapBackdrop()
    gone(app.staticTexts["Delete this item?"], "backdrop closes")

    app.buttons["Non-dismissible"].tap()
    XCTAssertTrue(app.staticTexts["You have to choose"].waitForExistence(timeout: 3))
    sleep(1)
    tapBackdrop()
    sleep(1)
    XCTAssertTrue(app.staticTexts["You have to choose"].exists, "backdrop does not close a non-dismissible modal")
    XCTAssertFalse(app.buttons["Close"].exists)
    app.buttons["I choose"].tap()
    gone(app.staticTexts["You have to choose"], "footer closes it")

    app.buttons["Long, scrolling content"].tap()
    XCTAssertTrue(app.buttons["Done"].waitForExistence(timeout: 3))
    sleep(1)
    XCTAssertTrue(app.buttons["Done"].isHittable, "footer stays on screen with long content")
    shot("modal-long")
    app.buttons["Done"].tap()
  }

  func testStacking() {
    open("modal")
    app.buttons["Sheet and toast above a modal"].tap()
    XCTAssertTrue(app.staticTexts["Stacking"].waitForExistence(timeout: 3))
    sleep(1)
    app.buttons["Show toast"].tap()
    XCTAssertTrue(app.staticTexts["Toast above the modal"].waitForExistence(timeout: 3), "toast shows above a modal")
    sleep(1)
    shot("toast-above-modal")
    app.buttons["Open sheet"].tap()
    XCTAssertTrue(app.staticTexts["Sheet above the modal"].waitForExistence(timeout: 3), "sheet opens above a modal")
    sleep(1)
    shot("sheet-above-modal")
    // A toast sits above a bottom sheet and can cover its controls, so clear the first one. The modal's button stays in the tree too, so take the sheet's.
    app.buttons["Dismiss notification"].firstMatch.tap()
    sleep(1)
    let inSheet = app.buttons.matching(identifier: "Show toast").allElementsBoundByIndex.last { $0.isHittable }
    XCTAssertNotNil(inSheet, "the sheet's button can be reached")
    inSheet?.tap()
    XCTAssertTrue(app.staticTexts["Toast above the sheet"].waitForExistence(timeout: 3), "toast shows above a sheet")
    sleep(1)
    shot("toast-above-sheet")
  }

  func testSheet() {
    open("sheet")
    app.buttons["Basic"].tap()
    XCTAssertTrue(app.staticTexts["Options"].firstMatch.waitForExistence(timeout: 3))
    sleep(1)
    shot("sheet-basic")
    // Drag from the handle, just above the title, down off the sheet.
    let title = app.staticTexts.matching(identifier: "Options").allElementsBoundByIndex.last!.frame
    let window = app.windows.firstMatch.frame
    let handle = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: (title.minY - 16) / window.height))
    handle.press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.98)))
    gone(app.buttons["Close"].firstMatch, "dragging the handle dismisses")

    app.buttons["With input and keyboard"].tap()
    let field = app.textFields["New name"]
    XCTAssertTrue(field.waitForExistence(timeout: 3))
    sleep(1)
    if !app.keyboards.element.exists { field.tap() }
    XCTAssertTrue(app.keyboards.element.waitForExistence(timeout: 5))
    sleep(1)
    XCTAssertTrue(field.isHittable, "field stays above the keyboard")
    XCTAssertTrue(app.buttons["Save"].isHittable, "footer stays above the keyboard")
    shot("sheet-keyboard")
  }

  func testToast() {
    open("toast")
    app.buttons["Neutral"].tap()
    XCTAssertTrue(app.staticTexts["Neutral toast"].waitForExistence(timeout: 3))
    sleep(6) // The default duration is 5s.
    XCTAssertFalse(app.staticTexts["Neutral toast"].exists, "auto-dismisses")
  }

  func testToastActions() {
    open("toast")
    app.buttons["With action"].tap()
    XCTAssertTrue(app.staticTexts["Deleted"].waitForExistence(timeout: 3))
    sleep(1)
    shot("toast-action")
    app.buttons["Undo"].tap()
    XCTAssertTrue(app.staticTexts["Restored"].waitForExistence(timeout: 3), "action fires")
    app.buttons["Persistent"].tap()
    XCTAssertTrue(app.staticTexts["Stays until dismissed"].waitForExistence(timeout: 3))
    app.buttons.matching(identifier: "Dismiss notification").firstMatch.tap()
  }

  /// RTL reloads the app, so link to it, wait for the new tree, capture, and put it back.
  func testRtl() {
    link("dir=rtl")
    sleep(4)
    XCTAssertTrue(any("catalog-search").waitForExistence(timeout: 30))
    let start = any("controls-open").frame
    XCTAssertGreaterThan(start.midX, app.windows.firstMatch.frame.midX, "the start side moves to the right")
    open("input")
    sleep(1)
    shot("rtl-input")
    open("checkbox")
    sleep(1)
    shot("rtl-checkbox")
    link("dir=ltr")
    sleep(4)
    XCTAssertTrue(any("catalog-search").waitForExistence(timeout: 30))
  }

  func testAccessibilityTree() {
    open("avatar")
    XCTAssertTrue(app.images["Ada Lovelace"].waitForExistence(timeout: 3), "avatar is one named image")
    open("image")
    XCTAssertTrue(app.images["Failed to load"].waitForExistence(timeout: 8), "broken image keeps its alt")
    open("text")
    XCTAssertTrue(app.staticTexts["Heading 1"].waitForExistence(timeout: 3))
    let heading = app.descendants(matching: .any).matching(NSPredicate(format: "label == 'Heading 1'")).firstMatch
    XCTAssertTrue(heading.exists)
    print(app.debugDescription)
  }

  // MARK: native variants

  func nativeLog(_ text: String) {
    let log = any("native-log").firstMatch
    for _ in 0..<10 where !log.label.contains(text) { sleep(1) }
    XCTAssertTrue(log.label.contains(text), "expected \(text), log says: \(log.label)")
  }

  func testNativeVariants() {
    native("card", only: "native-glass")
    XCTAssertTrue(app.staticTexts["Liquid Glass API: available"].waitForExistence(timeout: 5), "iOS 26 path")
    XCTAssertTrue(any("Native view").exists, "says a native view is drawing")
    shot("native-glass")
    open("card", "&native=0&only=native-glass")
    sleep(1)
    shot("native-glass-ferrule")

    native("button", only: "native-button")
    shot("native-button")
    app.buttons["Solid"].firstMatch.tap()
    nativeLog("button pressed")
    open("button", "&native=0&only=native-button")
    sleep(1)
    XCTAssertTrue(any("Ferrule, native off").exists, "native off is labelled")
    shot("native-button-ferrule")

    native("button", only: "native-icon-button")
    shot("native-icon-button")
    native("button", only: "native-button-loading")
    shot("native-button-loading")

    native("switch", only: "native-switch")
    let wifi = app.switches.matching(NSPredicate(format: "label CONTAINS 'Wi-Fi'")).firstMatch
    XCTAssertTrue(wifi.waitForExistence(timeout: 5), "switch")
    wifi.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
    nativeLog("switch false")
    shot("native-switch")

    native("input", only: "native-input")
    let email = app.textFields.matching(NSPredicate(format: "placeholderValue == 'you@example.com'")).firstMatch
    XCTAssertTrue(email.waitForExistence(timeout: 5), "input")
    email.tap()
    email.typeText("hi")
    nativeLog("typed hi")
    shot("native-input")
    email.typeText("\n")
    gone(app.keyboards.firstMatch, "keyboard closed")

    native("spinner", only: "native-progress")
    XCTAssertTrue(any("n-progress").waitForExistence(timeout: 5), "progress")
    shot("native-progress")

    native("modal", only: "native-alert")
    any("open-modal").tap()
    let delete = app.alerts.buttons["Delete"]
    XCTAssertTrue(delete.waitForExistence(timeout: 5), "system alert")
    shot("native-alert")
    delete.tap()
    gone(delete, "alert closed")
    nativeLog("alert delete")

    native("sheet", only: "native-sheet")
    any("open-sheet").tap()
    let copy = app.buttons["Copy link"]
    XCTAssertTrue(copy.waitForExistence(timeout: 5), "system sheet")
    sleep(1)
    shot("native-sheet")
    copy.tap()
    gone(copy, "sheet closed")
    nativeLog("sheet copy")

    native("native-slider")
    let slider = app.sliders.firstMatch
    XCTAssertTrue(slider.waitForExistence(timeout: 5), "slider")
    slider.adjust(toNormalizedSliderPosition: 0.8)
    nativeLog("slider")
    shot("native-slider")

    native("segmented", only: "native-segmented")
    let large = app.segmentedControls.buttons["Large"].exists ? app.segmentedControls.buttons["Large"] : app.buttons["Large"].firstMatch
    large.tap()
    nativeLog("segment l")
    shot("native-segmented")

    native("native-menu")
    let actions = app.buttons["Actions"]
    XCTAssertTrue(actions.waitForExistence(timeout: 5), "menu")
    actions.tap()
    let share = app.descendants(matching: .any).matching(NSPredicate(format: "label == 'Share' AND elementType != %d", XCUIElement.ElementType.staticText.rawValue)).firstMatch
    XCTAssertTrue(share.waitForExistence(timeout: 5), "menu open")
    sleep(1)
    shot("native-menu")
    share.tap()
    nativeLog("menu share")

    native("native-picker")
    shot("native-picker")
    native("native-date")
    XCTAssertTrue(any("demo-native-date").exists, "date")
    shot("native-date")

    native("native-action-sheet")
    any("open-action").tap()
    let photo = app.buttons["Take photo"]
    XCTAssertTrue(photo.waitForExistence(timeout: 5), "action sheet")
    sleep(1)
    shot("native-actionsheet")
    photo.tap()
    gone(photo, "action sheet closed")

    native("tabbar", only: "native-tabbar")
    let profile = app.tabBars.buttons["Profile"]
    XCTAssertTrue(profile.waitForExistence(timeout: 5), "tab bar")
    profile.tap()
    nativeLog("tab me")
    shot("native-tabbar")

    native("native-top-bar")
    let more = app.navigationBars.buttons["More"]
    XCTAssertTrue(more.waitForExistence(timeout: 5), "top bar")
    more.tap()
    nativeLog("bar more")
    shot("native-topbar")

    native("native-search")
    XCTAssertTrue(app.searchFields.firstMatch.waitForExistence(timeout: 5), "search")
    shot("native-search")

    native("chip", only: "native-chip")
    XCTAssertTrue(app.buttons["Star"].waitForExistence(timeout: 5), "chip")
    shot("native-chip")

    native("native-fab")
    XCTAssertTrue(app.buttons["Compose"].waitForExistence(timeout: 5), "fab")
    shot("native-fab")
    app.buttons["Add"].firstMatch.tap()
    nativeLog("fab")

    native("native-list")
    let row = app.buttons["Second row"].exists ? app.buttons["Second row"] : app.staticTexts["Second row"]
    XCTAssertTrue(row.waitForExistence(timeout: 5), "list")
    shot("native-list")
    row.tap()
    nativeLog("row b")
  }

  // MARK: FlatList

  func testFlatList() {
    open("flatlist")
    sleep(2)
    XCTAssertTrue(any("row-0").exists, "first row")
    shot("flatlist-top")
    let at = { (y: CGFloat) in self.app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: y)) }
    at(0.8).press(forDuration: 0.01, thenDragTo: at(0.4), withVelocity: .fast, thenHoldForDuration: 0)
    sleep(2)
    XCTAssertFalse(any("row-0").isHittable, "a swipe scrolls the list")
    shot("flatlist-scrolled")
    any("to-index").tap()
    sleep(2)
    XCTAssertTrue(any("row-150").exists, "scrollToIndex")
    any("to-end").tap()
    sleep(2)
    XCTAssertTrue(any("list-footer").exists, "scrollToEnd")
    any("to-top").tap()
    sleep(2)
    XCTAssertTrue(any("row-0").exists, "scrollToOffset")
  }

  /// Saves frames while the body runs, because a gesture blocks until it ends and the simulator can't be recorded during a test.
  func frames(_ name: String, during body: () -> Void) {
    guard let dir = ProcessInfo.processInfo.environment["FERRULE_SHOTS"] else { return body() }
    let done = DispatchSemaphore(value: 0)
    DispatchQueue.global().async {
      var n = 0
      while done.wait(timeout: .now() + 0.25) == .timedOut {
        try? XCUIScreen.main.screenshot().image.jpegData(compressionQuality: 0.5)?.write(to: URL(fileURLWithPath: "\(dir)/ios-\(name)-\(1000 + n).jpg"))
        n += 1
      }
    }
    body()
    done.signal()
  }

  /// Bounces past both ends and flings. Nothing can assert on the pixels mid-gesture, so look at the saved frames.
  func testScrollGestures() {
    for mode in ["light", "dark"] {
      for (component, scroller, marker) in [("text", "detail-scroll", "detail-text"), ("button", "detail-scroll", "detail-button")] {
        open(component, "&mode=\(mode)")
        sleep(2)
        frames("scroll-\(component)-\(mode)") {
          let upper = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.35))
          let lower = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.7))
          upper.press(forDuration: 0.05, thenDragTo: lower, withVelocity: .slow, thenHoldForDuration: 1.5)
          sleep(1)
          let scroll = any(scroller)
          for _ in 0..<5 { scroll.swipeUp(velocity: .fast) }
          sleep(1)
          lower.press(forDuration: 0.05, thenDragTo: upper, withVelocity: .slow, thenHoldForDuration: 1.5)
          sleep(1)
          for _ in 0..<6 { scroll.swipeDown(velocity: .fast) }
          sleep(1)
        }
        XCTAssertTrue(any(marker).isHittable, "\(component) keeps its header")
      }
    }
    link("mode=light")
  }
}
