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
    @State private var index = 0
    @State private var wrongPicks: Set<String> = []
    @State private var rightPick = false
    @State private var note: String?
    @State private var earned: EarnedCard?
    @State private var finished = false

    private var question: Question? { questions.indices.contains(index) ? questions[index] : nil }
    private var over: Bool { rightPick || wrongPicks.count >= 2 }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if finished {
                    Text("Part done!").font(.largeTitle.bold())
                    if let earned { CardView(card: earned) }
                    Button("Home") { dismiss() }.buttonStyle(.borderedProminent)
                } else if let question {
                    ProgressView(value: Double(index), total: Double(questions.count))
                    HStack(alignment: .top) {
                        RichTextView(source: question.prompt).font(.title2.bold())
                        Spacer()
                        Button { model.speak(question.say) } label: {
                            Image(systemName: "speaker.wave.2.fill")
                        }
                        .accessibilityLabel("Read aloud")
                    }
                    if let visual = question.visual { RichTextView(source: visual) }
                    ForEach(question.choices, id: \.self) { choice in
                        Button { pick(choice, in: question) } label: {
                            RichTextView(source: choice.t)
                                .frame(maxWidth: .infinity, minHeight: 56)
                                .padding(.horizontal, 8)
                                .background(color(choice))
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                        }
                        .buttonStyle(.plain)
                        .disabled(over || wrongPicks.contains(choice.t))
                    }
                    if let note { Text(RichText.plain(note)).foregroundStyle(Palette.muted) }
                    if over {
                        Button(index + 1 == questions.count ? "Finish" : "Next", action: advance)
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

    private func begin() {
        guard questions.isEmpty, let progress = model.progress, let planner = model.planner else { return }
        questions = planner.questions(for: part, progress: progress)
    }

    /// Right is always green and wrong is always red, as on the web.
    private func color(_ choice: Choice) -> Color {
        if wrongPicks.contains(choice.t) { return Palette.wrong }
        if over && choice.isRight { return Palette.right }
        return Palette.panel
    }

    private func pick(_ choice: Choice, in question: Question) {
        guard let planner = model.planner, var progress = model.progress else { return }
        if choice.isRight {
            rightPick = true
            note = choice.why ?? question.explain
            planner.record(question, firstTry: wrongPicks.isEmpty, progress: &progress)
        } else {
            wrongPicks.insert(choice.t)
            note = choice.why
            if wrongPicks.count >= 2 {
                planner.record(question, firstTry: false, progress: &progress)
            }
        }
        model.progress = progress
        model.save()
    }

    private func advance() {
        wrongPicks = []
        rightPick = false
        note = nil
        if index + 1 < questions.count {
            index += 1
        } else if let planner = model.planner, var progress = model.progress {
            earned = planner.finish(part, progress: &progress)
            model.progress = progress
            model.save()
            finished = true
        }
    }
}
