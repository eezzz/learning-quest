# Native iOS app

`apple/` is a SwiftUI app that reads the same content pack as the web app. The web app stays as it is.

- `apple/LearningCore`: a Swift package with no UI. It decodes packs, updates them, parses pack text, and builds the daily plan. Its tests run against the real `content/bundle.json`, so a pack that would break the app fails CI.
- `apple/App`: the SwiftUI screens.
- `js/subjects/*.js`: math rules, shared with the web. The app runs them in JavaScriptCore through `MathEngine`, and `js/subjects/engine.js` turns each question into plain data. Multi-step questions become scripts of screens, so one SwiftUI view plays all of them. The code ships in the app; packs only carry data.
- Math drawings use the web app's SVG and CSS in a small web view (`MathVisual`), so a new drawing only has to be written once.
- `apple/project.yml`: the XcodeGen project. Generate the `.xcodeproj` with `xcodegen generate`.

## What is ported

| Feature | Native |
| --- | --- |
| Content pack loading and updates | Yes |
| Word Lab language questions | Yes |
| People Lab situations | Yes |
| Right-green, wrong-red, two-try hint ladder | Yes |
| Read-aloud button | Yes |
| Discovery cards and expert word display | Yes |
| Math: every generator, K–5, word problems and the balance scale | Yes |
| Vocabulary days and Word Lab grammar | Not yet |
| Brain Skills | Not yet |
| Several children, grown-up gate, voice mode | Not yet |
| Mastery, spaced review, Feedback report | Not yet |
| Expert checks, stamps, gold cards | Not yet |
| Calm Corner, feelings check-in, themes | Not yet |

Saved keys use the web format (`lg:<id>`, `so:<position>`), so a backup could move between platforms once the native app reads backup codes.
