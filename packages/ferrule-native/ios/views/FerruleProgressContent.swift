import SwiftUI
import UIKit

@available(iOS 17.0, *)
struct FerruleProgressContent: View {
  @ObservedObject var host: FerruleHost

  var body: some View {
    let size: ControlSize = host.string("size") == "sm" ? .small : host.string("size") == "lg" ? .large : .regular
    Group {
      if host.string("kind") == "circular" {
        if let value = host.double("value") { ProgressView(value: value).progressViewStyle(.circular) } else { ProgressView() }
      } else if let value = host.double("value") {
        ProgressView(value: value)
      } else {
        ProgressView().progressViewStyle(.linear)
      }
    }
    .controlSize(size)
  }
}
