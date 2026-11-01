# Native iOS app

`apple/` is a SwiftUI app that reads the same content pack as the web app. The web app stays as it is.

- `apple/LearningCore`: a Swift package with no UI. It decodes packs, updates them, parses pack text, and builds the daily plan. Its tests run against the real `content/bundle.json`, so a pack that would break the app fails CI.
- `apple/App`: the SwiftUI screens.
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
| Math | Not yet |
| Vocabulary days and Word Lab grammar | Not yet |
| Brain Skills | Not yet |
| Several children, grown-up gate, voice mode | Not yet |
| Mastery, spaced review, Feedback report | Not yet |
| Expert checks, stamps, gold cards | Not yet |
| Calm Corner, feelings check-in, themes | Not yet |

Saved keys use the web format (`lg:<id>`, `so:<position>`), so a backup could move between platforms once the native app reads backup codes.
