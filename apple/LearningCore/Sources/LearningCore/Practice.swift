import Foundation

/// One step of a question. Most questions have one screen; word problems and the balance scale have several.
public struct Screen {
    public let prompt: String
    public let say: String
    public let visual: String?
    /// True when `visual` is a math drawing (HTML and SVG) rather than pack text.
    public let isDrawing: Bool
    public let show: String?
    public let done: String?
    public let choices: [Choice]
    /// A story whose numbers the child taps, instead of choices.
    public let tapNumbers: String?
    public let log: String?
    public let note: String?

    public init(
        prompt: String, say: String, visual: String? = nil, isDrawing: Bool = false,
        show: String? = nil, done: String? = nil, choices: [Choice] = [],
        tapNumbers: String? = nil, log: String? = nil, note: String? = nil
    ) {
        self.prompt = prompt
        self.say = say
        self.visual = visual
        self.isDrawing = isDrawing
        self.show = show
        self.done = done
        self.choices = choices
        self.tapNumbers = tapNumbers
        self.log = log
        self.note = note
    }
}

/// One question, whatever bank it came from.
/// `key` uses the same saved-key format as the web app (`lg:<id>`, `so:<position>`, `mt:<generator>`).
public struct Question: Identifiable {
    public let key: String
    public let screens: [Screen]
    public let hint: String?
    public let explain: String?

    public init(key: String, screens: [Screen], hint: String? = nil, explain: String? = nil) {
        self.key = key
        self.screens = screens
        self.hint = hint
        self.explain = explain
    }

    public var id: String { key }
    public var choices: [Choice] { screens.first?.choices ?? [] }

    public init(_ math: MathQuestion) {
        let screens: [Screen]
        if let steps = math.steps {
            screens = steps.map { step in
                Screen(
                    prompt: step.prompt, say: step.say ?? RichText.plain(step.prompt), visual: step.visual,
                    isDrawing: true, show: step.show, choices: step.opts ?? [],
                    tapNumbers: step.tapNumbers, log: step.log, note: step.note
                )
            }
        } else {
            let prompt = math.prompt ?? ""
            screens = [Screen(
                prompt: prompt, say: math.say ?? RichText.plain(prompt),
                visual: (math.visual ?? "").isEmpty ? nil : math.visual, isDrawing: true,
                show: math.show, done: math.done, choices: math.opts ?? []
            )]
        }
        self.init(key: math.key, screens: screens, hint: math.hint, explain: math.explain)
    }
}

public enum Part: String, Codable, CaseIterable {
    case words, math, people
}

public struct Profile: Codable, Equatable {
    public var name: String
    public var grade: Int
    public var interests: [String]

    public init(name: String, grade: Int, interests: [String]) {
        self.name = name
        self.grade = grade
        self.interests = interests
    }
}

public struct EarnedCard: Codable, Equatable {
    public let day: String
    public let interest: String
    public let index: Int
}

/// Everything saved for one child.
public struct ChildProgress: Codable, Equatable {
    public var profile: Profile
    public var stars = 0
    public var dayCount = 0
    public var today = ""
    public var doneToday: [Part] = []
    public var mistakes: [String: Int] = [:]
    public var seen: [String] = []
    public var cards: [EarnedCard] = []
    public var doneTopics: [String] = []

    public init(profile: Profile) {
        self.profile = profile
    }
}

/// Builds each day's practice from the content pack: one small step, the same order every day.
public struct Planner {
    public let content: Content

    public init(content: Content) {
        self.content = content
    }

    public static func questionCount(grade: Int) -> Int {
        let counts = [5, 5, 6, 6, 7, 7]
        return counts[min(max(grade, 0), counts.count - 1)]
    }

    public func startDay(_ progress: inout ChildProgress, on day: String) {
        guard progress.today != day else { return }
        progress.today = day
        progress.dayCount += 1
        progress.doneToday = []
    }

    public func questions(for part: Part, progress: ChildProgress) -> [Question] {
        let count = Planner.questionCount(grade: progress.profile.grade)
        switch part {
        case .words: return wordQuestions(progress: progress, count: count)
        case .people: return peopleQuestions(progress: progress, count: count)
        case .math: return []
        }
    }

    /// The math part comes from the engine, with the same review rule as the web: missed generators first.
    public func mathDay(engine: MathEngine, progress: ChildProgress) throws -> MathDay {
        let due = progress.mistakes.keys.filter { $0.hasPrefix("mt:") }.sorted().map { String($0.dropFirst(3)) }
        return try engine.day(MathRequest(
            math: progress.profile.grade,
            interests: progress.profile.interests,
            done: progress.doneTopics,
            due: due,
            mistakes: progress.mistakes,
            count: Planner.questionCount(grade: progress.profile.grade),
            day: progress.dayCount
        ))
    }

    /// Missed items first, then items not seen yet, in pack order, so new packs simply flow in.
    private func pick<T>(_ pool: [(key: String, item: T)], progress: ChildProgress, count: Int) -> [(key: String, item: T)] {
        let seen = Set(progress.seen)
        let missed = pool.filter { progress.mistakes[$0.key] != nil }
        let fresh = pool.filter { !seen.contains($0.key) && progress.mistakes[$0.key] == nil }
        let again = pool.filter { seen.contains($0.key) && progress.mistakes[$0.key] == nil }
        return Array((missed.prefix(2) + fresh + again).prefix(count))
    }

    private func wordQuestions(progress: ChildProgress, count: Int) -> [Question] {
        let grade = progress.profile.grade
        let skills = content.language.skills.filter { $0.grade == grade }
        guard !skills.isEmpty else { return [] }
        let skill = skills[progress.dayCount % skills.count].key
        let pool = content.language.items.filter { $0.skill == skill }.map { (key: "lg:\($0.id)", item: $0) }
        return pick(pool, progress: progress, count: count).map { key, item in
            let screen = Screen(
                prompt: item.prompt, say: item.say ?? RichText.plain(item.prompt),
                visual: item.visual, choices: item.choices
            )
            return Question(key: key, screens: [screen], hint: item.hint, explain: item.explain)
        }
    }

    private func peopleQuestions(progress: ChildProgress, count: Int) -> [Question] {
        let grade = progress.profile.grade
        let mission = progress.dayCount % 8 + 1
        let pool = content.people.situations.enumerated()
            .filter { $0.element.m == mission && $0.element.fits(grade: grade) }
            .map { (key: "so:\($0.offset)", item: $0.element) }
        return pick(pool, progress: progress, count: count).map { key, item in
            Planner.question(key: key, situation: item)
        }
    }

    static func question(key: String, situation s: Situation) -> Question {
        let visual = "<div class=\"wx big\">\(s.e)</div>\(s.s)"
        if let size = s.sz {
            let other = "Ask yourself: Can I fix it myself? Do I need a grown-up? Is someone hurt or in danger?"
            let names = ["🐜 Small problem", "🐕 Medium problem", "🐘 Big problem"]
            let choices = names.enumerated().map { index, name in
                Choice(t: name, ok: index == size ? true : nil, why: index == size ? s.why : other)
            }
            let prompt = "How big is this problem?"
            return Question(key: key, screens: [
                Screen(prompt: prompt, say: "\(s.s) \(prompt)", visual: visual, choices: choices),
            ])
        }
        // The first option in the pack is the best one. Options are shuffled on screen.
        let choices = (s.o ?? []).enumerated().map { index, option in
            Choice(t: option[0], ok: index == 0 ? true : nil, why: option.count > 1 ? option[1] : nil)
        }
        let prompt = s.q ?? ""
        return Question(key: key, screens: [
            Screen(prompt: prompt, say: "\(s.s) \(prompt)", visual: visual, choices: choices.shuffled()),
        ])
    }

    /// Records one answered question: `firstTry` means no mistake anywhere in it.
    public func record(_ question: Question, firstTry: Bool, progress: inout ChildProgress) {
        if !progress.seen.contains(question.key) { progress.seen.append(question.key) }
        if firstTry {
            progress.stars += 1
            progress.mistakes[question.key] = nil
        } else {
            progress.mistakes[question.key, default: 0] += 1
        }
    }

    /// A math topic counts as learned with about 70% right the first time, as on the web.
    public func finishTopic(_ id: String, right: Int, total: Int, progress: inout ChildProgress) {
        if total > 0, Double(right) / Double(total) >= 0.7, !progress.doneTopics.contains(id) {
            progress.doneTopics.append(id)
            progress.stars += 5
        }
    }

    /// Marks a part done. When the whole day is done, earns the next Discovery card.
    @discardableResult
    public func finish(_ part: Part, progress: inout ChildProgress) -> EarnedCard? {
        guard !progress.doneToday.contains(part) else { return nil }
        progress.doneToday.append(part)
        guard Part.allCases.allSatisfy(progress.doneToday.contains) else { return nil }
        progress.stars += 10
        guard let card = nextCard(progress: progress) else { return nil }
        progress.cards.append(card)
        return card
    }

    private func nextCard(progress: ChildProgress) -> EarnedCard? {
        let chosen = progress.profile.interests.filter { content.discovery[$0] != nil }
        let interests = chosen.isEmpty ? content.discovery.keys.sorted() : chosen
        guard !interests.isEmpty else { return nil }
        let first = (progress.dayCount - 1 + interests.count) % interests.count
        for offset in interests.indices {
            let key = interests[(first + offset) % interests.count]
            let owned = progress.cards.filter { $0.interest == key }.count
            if owned < (content.discovery[key]?.count ?? 0) {
                return EarnedCard(day: progress.today, interest: key, index: owned)
            }
        }
        return nil
    }
}
