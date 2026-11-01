import SwiftUI
import WebKit

/// Draws a math visual with the same SVG and CSS as the web app.
/// `show` and `done` are drawing specs that `applyVisual` in math-lab.js understands.
struct MathVisual: View {
    let html: String
    let show: String?
    let done: String?
    let finished: Bool

    @State private var height: CGFloat = 120

    var body: some View {
        MathWebView(html: html, show: show, done: finished ? done : nil, height: $height)
            .frame(height: height)
    }
}

private struct MathWebView: UIViewRepresentable {
    let html: String
    let show: String?
    let done: String?
    @Binding var height: CGFloat

    final class Coordinator: NSObject, WKNavigationDelegate {
        var parent: MathWebView
        var loaded: String?
        var appliedDone: String?

        init(_ parent: MathWebView) {
            self.parent = parent
        }

        func measure(_ web: WKWebView) {
            web.evaluateJavaScript("document.getElementById('v').scrollHeight") { value, _ in
                if let height = value as? CGFloat, height > 0 { self.parent.height = height + 8 }
            }
        }

        func webView(_ web: WKWebView, didFinish navigation: WKNavigation!) {
            measure(web)
        }

        // The drawing only ever comes from the app's own engine, so nothing may navigate away.
        func webView(
            _ web: WKWebView, decidePolicyFor action: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            decisionHandler(action.navigationType == .other ? .allow : .cancel)
        }
    }

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let web = WKWebView()
        web.isOpaque = false
        web.backgroundColor = .clear
        web.scrollView.backgroundColor = .clear
        web.scrollView.isScrollEnabled = false
        web.navigationDelegate = context.coordinator
        return web
    }

    func updateUIView(_ web: WKWebView, context: Context) {
        context.coordinator.parent = self
        if context.coordinator.loaded != html {
            context.coordinator.loaded = html
            context.coordinator.appliedDone = nil
            web.loadHTMLString(page, baseURL: Bundle.main.bundleURL)
        }
        if let done, context.coordinator.appliedDone != done {
            context.coordinator.appliedDone = done
            web.evaluateJavaScript("applyVisual(document,\(done))") { _, _ in
                context.coordinator.measure(web)
            }
        }
    }

    private var page: String {
        """
        <!doctype html><html><head><meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="styles.css">
        <style>html,body{background:transparent!important;background-image:none!important;height:auto;margin:0}</style>
        </head><body><div class="visual" id="v">\(html)</div>
        <script src="util.js"></script><script src="math-lab.js"></script>
        <script>applyVisual(document,\(show ?? "null"))</script>
        </body></html>
        """
    }
}
