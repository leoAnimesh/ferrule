import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleDatePickerContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    let date = Binding<Date>(
      get: { Date(timeIntervalSince1970: (host.double("millis") ?? 0) / 1000) },
      set: { value in
        let millis = value.timeIntervalSince1970 * 1000
        host.config["millis"] = millis
        host.send("change", millis)
      })
    DatePicker(host.string("label") ?? "", selection: date, displayedComponents: host.string("mode") == "time" ? .hourAndMinute : .date)
      .datePickerStyle(.compact)
      .labelsHidden(host.string("label") == nil)
      .disabled(host.bool("disabled"))
  }
}
