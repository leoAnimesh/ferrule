import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleActionSheetContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    let open = Binding<Bool>(get: { host.bool("open") }, set: { value in
      if !value && host.bool("open") {
        host.config["open"] = false
        host.send("dismiss", nil)
      }
    })
    Color.clear.sheet(isPresented: open) {
      NavigationStack {
        List {
          if let message = host.string("message") { Text(message).foregroundStyle(.secondary) }
          ForEach(Array(host.list("actions").enumerated()), id: \.offset) { index, action in
            Button(action["label"] as? String ?? "", role: ferruleRole(action["role"] as? String)) {
              host.config["open"] = false
              host.send("action", index)
            }
          }
        }
        .scrollContentBackground(.hidden)
        .navigationTitle(host.string("title") ?? "")
        .navigationBarTitleDisplayMode(.inline)
      }
      .presentationDetents([.medium, .large])
      .tint(host.tint)
      // The sheet presents from the window, so it needs the app's choice stated again.
      .preferredColorScheme(host.bool("dark") ? .dark : .light)
    }
  }
}
