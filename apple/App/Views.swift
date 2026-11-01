import LearningCore
import SwiftUI

struct RootView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        ZStack {
            Palette.sky.ignoresSafeArea()
            if model.loadFailed {
                Text("The questions could not be loaded.").padding()
            } else if model.progress == nil {
                SetupView()
            } else {
                NavigationStack { HomeView() }
            }
        }
        .foregroundStyle(.white)
    }
}

struct SetupView: View {
    @EnvironmentObject private var model: AppModel
    @State private var name = ""
    @State private var grade = 2
    @State private var picked: Set<String> = []

    private let grades = ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"]

    var body: some View {
        Form {
            Section("Grown-ups: set up a child") {
                TextField("Name or nickname", text: $name)
                Picker("Grade", selection: $grade) {
                    ForEach(grades.indices, id: \.self) { Text(grades[$0]).tag($0) }
                }
            }
            Section("Interests") {
                ForEach(interestKeys, id: \.self) { key in
                    Toggle(interestName(key), isOn: Binding(
                        get: { picked.contains(key) },
                        set: { isOn in
                            if isOn { picked.insert(key) } else { picked.remove(key) }
                        }
                    ))
                }
            }
            Button("Start") {
                model.create(Profile(name: name, grade: grade, interests: picked.sorted()))
            }
            .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .scrollContentBackground(.hidden)
    }

    private var interestKeys: [String] { model.content?.interests.names.keys.sorted() ?? [] }

    private func interestName(_ key: String) -> String {
        model.content?.interests.names[key]?.joined(separator: " ") ?? key
    }
}

struct HomeView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Hello, \(model.progress?.profile.name ?? "")!").font(.largeTitle.bold())
                Text("⭐ \(model.progress?.stars ?? 0) · Day \(model.progress?.dayCount ?? 0)")
                    .foregroundStyle(Palette.muted)

                if let next {
                    NavigationLink {
                        PracticeView(part: next)
                    } label: {
                        Label("Start \(title(next))", systemImage: "play.fill")
                            .font(.title2.bold())
                            .frame(maxWidth: .infinity, minHeight: 72)
                            .background(Palette.gold)
                            .foregroundStyle(Palette.sky)
                            .clipShape(RoundedRectangle(cornerRadius: 20))
                    }
                } else {
                    Text("✓ Today's parts are done. Great work!")
                        .font(.title3.bold())
                        .frame(maxWidth: .infinity, minHeight: 72)
                        .background(Palette.right.opacity(0.3))
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                }

                ForEach(Part.allCases, id: \.self) { part in
                    HStack {
                        Text(title(part)).font(.headline)
                        Spacer()
                        Text(status(part)).foregroundStyle(Palette.muted)
                    }
                    .padding()
                    .background(Palette.panel)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }

                ForEach(Array((model.progress?.cards ?? []).reversed().enumerated()), id: \.offset) { _, card in
                    CardView(card: card)
                }
            }
            .padding()
            .frame(maxWidth: 720)
            .frame(maxWidth: .infinity)
        }
        .background(Palette.sky)
    }

    private var next: Part? {
        Part.allCases.first { !(model.progress?.doneToday.contains($0) ?? false) }
    }

    private func title(_ part: Part) -> String {
        switch part {
        case .words: return "📚 Word Lab"
        case .math: return "🔢 Number Lab"
        case .people: return "🤝 People Lab"
        }
    }

    private func status(_ part: Part) -> String {
        if model.progress?.doneToday.contains(part) == true { return "✓ Done" }
        return part == next ? "Now" : "Later"
    }
}

struct CardView: View {
    @EnvironmentObject private var model: AppModel
    let card: EarnedCard

    var body: some View {
        if let found = model.content?.discovery[card.interest]?[card.index] {
            VStack(alignment: .leading, spacing: 6) {
                Text("\(found.emoji) \(found.title)").font(.headline)
                Text(found.fact)
                if let word = model.content?.expert[card.interest]?.words[card.index] {
                    Text("🎓 \(word.word): \(word.meaning)")
                        .font(.subheadline)
                        .foregroundStyle(Palette.gold)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(Palette.deep)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
}

struct RichTextView: View {
    let source: String

    var body: some View {
        VStack(spacing: 8) {
            ForEach(Array(RichText.parse(source).enumerated()), id: \.offset) { _, block in
                styled(block)
            }
        }
    }

    @ViewBuilder
    private func styled(_ block: RichBlock) -> some View {
        switch block.style {
        case .bigLetter:
            line(block).font(.system(size: 72, weight: .bold))
        case .bigEmoji:
            line(block).font(.system(size: 64))
        case .passage, .sentence:
            line(block)
                .font(.title3)
                .padding()
                .frame(maxWidth: .infinity, alignment: block.style == .passage ? .leading : .center)
                .background(Palette.deep)
                .clipShape(RoundedRectangle(cornerRadius: 14))
        case .plain:
            line(block).font(.title3)
        }
    }

    private func line(_ block: RichBlock) -> Text {
        block.runs.reduce(Text("")) { result, run in
            var piece = Text(run.blank ? " ____ " : run.text)
            if run.bold { piece = piece.bold() }
            if run.blank { piece = piece.foregroundColor(Palette.gold).bold() }
            return result + piece
        }
    }
}

struct PracticeView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dismiss) private var dismiss
    let part: Part

    @State private var questions: [Question] = []
    @State private var topic: MathTopic?
    @State private var index = 0
    @State private var screenIndex = 0
    @State private var wrongPicks: Set<String> = []
    @State private var rightPick = false
    @State private var missed = false
    @State private var tapped: Set<Int> = []
    @State private var log: [String] = []
    @State private var note: String?
    @State private var firstTryRight = 0
    @State private var earned: EarnedCard?
    @State private var finished = false
    @State private var failed = false

    private var question: Question? { questions.indices.contains(index) ? questions[index] : nil }
    private var screen: Screen? { question.flatMap { $0.screens.indices.contains(screenIndex) ? $0.screens[screenIndex] : nil } }
    private var lastScreen: Bool { question.map { screenIndex + 1 == $0.screens.count } ?? true }
    private var over: Bool { rightPick || wrongPicks.count >= 2 }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if failed {
                    Text("This part could not be loaded.")
                    Button("Home") { dismiss() }.buttonStyle(.borderedProminent)
                } else if finished {
                    Text("Part done!").font(.largeTitle.bold())
                    if let earned { CardView(card: earned) }
                    Button("Home") { dismiss() }.buttonStyle(.borderedProminent)
                } else if let question, let screen {
                    ProgressView(value: Double(index), total: Double(questions.count))
                    if index == 0, let topic { Text("\(topic.icon) \(topic.name)").font(.headline) }
                    HStack(alignment: .top) {
                        RichTextView(source: screen.prompt).font(.title2.bold())
                        Spacer()
                        Button { model.speak(screen.say) } label: {
                            Image(systemName: "speaker.wave.2.fill")
                        }
                        .accessibilityLabel("Read aloud")
                    }
                    if let visual = screen.visual {
                        if screen.isDrawing {
                            MathVisual(html: visual, show: screen.show, done: screen.done, finished: over)
                        } else {
                            RichTextView(source: visual)
                        }
                    }
                    if let story = screen.tapNumbers { numbersView(story) }
                    ForEach(screen.choices, id: \.self) { choice in
                        Button { pick(choice, on: screen, in: question) } label: {
                            RichTextView(source: choice.t)
                                .frame(maxWidth: .infinity, minHeight: 56)
                                .padding(.horizontal, 8)
                                .background(color(choice))
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                        }
                        .buttonStyle(.plain)
                        .disabled(over || wrongPicks.contains(choice.t))
                    }
                    ForEach(log, id: \.self) { line in
                        Text(RichText.plain(line)).font(.footnote).foregroundStyle(Palette.muted)
                    }
                    if let note { Text(RichText.plain(note)).foregroundStyle(Palette.muted) }
                    if over {
                        Button(nextTitle, action: advance)
                            .buttonStyle(.borderedProminent)
                            .controlSize(.large)
                    }
                }
            }
            .padding()
            .frame(maxWidth: 720)
            .frame(maxWidth: .infinity)
        }
        .background(Palette.sky)
        .onAppear(perform: begin)
    }

    private var nextTitle: String {
        lastScreen && index + 1 == questions.count ? "Finish" : "Next"
    }

    /// The story with its numbers as buttons. Tapping them all moves on.
    @ViewBuilder
    private func numbersView(_ story: String) -> some View {
        let numbers = story.split(whereSeparator: { !$0.isNumber }).map(String.init)
        Text(story).font(.title3).frame(maxWidth: .infinity, alignment: .leading)
        HStack {
            ForEach(numbers.indices, id: \.self) { position in
                Button(numbers[position]) {
                    tapped.insert(position)
                    if tapped.count == numbers.count { rightPick = true }
                }
                .buttonStyle(.bordered)
                .tint(tapped.contains(position) ? Palette.right : Palette.gold)
            }
        }
    }

    private func begin() {
        guard questions.isEmpty, let progress = model.progress, let planner = model.planner else { return }
        if part == .math {
            guard let engine = model.engine, let day = try? planner.mathDay(engine: engine, progress: progress) else {
                failed = true
                return
            }
            topic = day.topic
            questions = day.questions.map(Question.init)
        } else {
            questions = planner.questions(for: part, progress: progress)
        }
        failed = questions.isEmpty
    }

    /// Right is always green and wrong is always red, as on the web.
    private func color(_ choice: Choice) -> Color {
        if wrongPicks.contains(choice.t) { return Palette.wrong }
        if over && choice.isRight { return Palette.right }
        return Palette.panel
    }

    private func pick(_ choice: Choice, on screen: Screen, in question: Question) {
        if choice.isRight {
            rightPick = true
            note = choice.why ?? (lastScreen ? question.explain : nil)
            return
        }
        missed = true
        wrongPicks.insert(choice.t)
        note = choice.why ?? question.hint
    }

    private func advance() {
        if let line = screen?.log { log.append(line) }
        wrongPicks = []
        rightPick = false
        tapped = []
        note = nil
        if !lastScreen {
            screenIndex += 1
            return
        }
        guard let planner = model.planner, var progress = model.progress, let question else { return }
        planner.record(question, firstTry: !missed, progress: &progress)
        if !missed { firstTryRight += 1 }
        missed = false
        screenIndex = 0
        log = []
        if index + 1 < questions.count {
            index += 1
        } else {
            if let topic {
                planner.finishTopic(topic.id, right: firstTryRight, total: questions.count, progress: &progress)
            }
            earned = planner.finish(part, progress: &progress)
            finished = true
        }
        model.progress = progress
        model.save()
    }
}
