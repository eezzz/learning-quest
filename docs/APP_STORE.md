# App Store release

No Mac is needed: the `iOS release to TestFlight` workflow builds, signs and uploads on a macOS runner.

## One-time setup

1. **Bundle ID:** in the Apple Developer portal, register `com.eezzz.learningquest` under Identifiers.
2. **App record:** in App Store Connect → Apps → New App, choose iOS, the name, primary language English (U.S.), and that bundle ID.
3. **API key:** in App Store Connect → Users and Access → Integrations → App Store Connect API, create a Team key with the **Admin** role, which automatic signing needs for its certificates. Download the `.p8` file. It can only be downloaded once.
4. **GitHub secrets:** in the repository's Settings → Secrets and variables → Actions, add:
   - `ASC_KEY_ID`: the key ID
   - `ASC_ISSUER_ID`: the issuer ID
   - `ASC_KEY_P8`: the full text of the `.p8` file
   - `APPLE_TEAM_ID`: the 10-character Team ID from the Membership page

## Each release

1. If the version changes, raise `MARKETING_VERSION` in `ios/App/App.xcodeproj/project.pbxproj`. The build number comes from the workflow run number.
2. In GitHub: Actions → iOS release to TestFlight → Run workflow.
3. Wait for Apple's processing, then install from TestFlight and test on a real iPad.
4. In App Store Connect, attach the build to the version and submit it for review.

## Check on a real iPad before submitting

- Read-aloud and voice mode (first tap reads, second tap chooses)
- Rotation, and layout around the rounded corners and home indicator
- Force-quit and reopen: progress is still there
- Airplane mode: the whole daily flow works
- Parent → Backup → Privacy policy opens and has a way back

## Listing text

- **Name:** Learning Quest
- **Subtitle:** One small step every day
- **Primary category:** Education
- **Secondary category:** Games (Educational)
- **Keywords:** kids,learning,math,reading,vocabulary,social skills,kindergarten,elementary,homework,calm,routine
- **Privacy policy URL:** https://eezzz.github.io/learning-quest/privacy.html
- **Support URL:** https://github.com/eezzz/learning-quest/issues
- **Copyright:** the year and the name of the developer account holder
- **Promotional text:** A calm daily learning game for K–5. Three short parts a day, then a new Discovery card from the topic your child loves most.

**Description:**

> Learning Quest is a calm daily learning game for kids in Kindergarten through Grade 5.
>
> Every day has the same three short parts: words, math and people skills. When they're done, the day is done. No endless levels, no timers and no ads. Just one small step, every day.
>
> MADE AROUND WHAT YOUR CHILD LOVES
> Pick from 17 interests, from dinosaurs and space to trains and music. Questions and rewards follow those interests. Each finished day unlocks a true Discovery card and a real expert word, and stamps earn job titles like Junior Paleontologist.
>
> LEARNING THAT FITS
> • Math built on Singapore Math and RSM ideas, with pictures first
> • Language from phonics to reading, Kindergarten to Grade 5
> • People skills and Brain Skills that explain the "why"
> • Hints and another try after a mistake, and mistakes come back for review
>
> COMFORTABLE BY DESIGN
> • Read-aloud on every screen, and full voice mode for early readers
> • Calm Corner with breathing and break ideas
> • Calm mode, larger text, and light or dark themes
> • A predictable routine that shows what's next
>
> FOR PARENTS
> • Set up a profile for each child
> • See a Feedback report on what needs support, with ideas for home
> • Practice adjusts to weak spots automatically
>
> PRIVATE BY DESIGN
> No accounts, ads, tracking or in-app purchases. Everything stays on your device.

## App Store Connect answers

- **App Privacy:** Data Not Collected.
- **Age rating:** answer No to the content questions. Expect the lowest rating.
- **Kids Category:** the recommendation is to leave it off for the first release. Apple's rules for that category are stricter, and check whether it can be removed later before selecting it.
- **Content rights:** the only third-party content is the fonts (SIL Open Font License).
- **Encryption:** already declared as none in `Info.plist`.

## Review notes (paste into App Review Information)

> No account or login is needed. On first launch, add a child from the Parent area. The Parent area is behind a simple adult check: a multiplication question shown on screen. Each child gets one daily plan of three parts. By design, finished parts can't be repeated that day. To see more of the app in one sitting, open Parent → Children → Edit and turn on "Allow extra practice". All content is bundled and works offline. No data leaves the device.
