# iOS and iPadOS app

The app in `ios/` is a thin native shell, built with [Capacitor](https://capacitorjs.com), around the same web app that runs in the browser. `www/` and `ios/App/App/public/` are generated copies; don't edit them.

- Bundle ID: `com.eezzz.learningquest`. Change it in `capacitor.config.json` and in Xcode before the first upload; it can't change afterwards.
- Progress is saved in `localStorage` and mirrored to native storage (`js/app/native.js`), because iOS may clear a web view's data when space runs low. The app restores from the mirror if that happens.
- Fonts ship in `assets/fonts`, so the app works offline and makes no third-party requests.
- `.github/workflows/ios-build.yml` builds for the simulator on a macOS runner for every pull request. It doesn't sign anything.

## Update the app after changing the web code

```
npm install
npm run sync:ios
```

## Run on a device (needs a Mac with Xcode)

```
npx cap open ios
```

In Xcode: select the App target → Signing & Capabilities → choose your team, pick the iPad or iPhone, and press Run. A free Apple ID works, but the app stops opening after 7 days until it is installed again.

## Release

See [APP_STORE.md](APP_STORE.md). No Mac is needed.
