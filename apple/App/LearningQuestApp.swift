import AVFoundation
import LearningCore
import SwiftUI

@main
struct LearningQuestApp: App {
    @StateObject private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(model)
                .preferredColorScheme(.dark)
                .tint(Palette.gold)
        }
    }
}

enum Palette {
    static let sky = Color(red: 0.05, green: 0.12, blue: 0.18)
    static let panel = Color(red: 0.11, green: 0.26, blue: 0.33)
    static let deep = Color(red: 0.07, green: 0.19, blue: 0.24)
    static let line = Color(red: 0.23, green: 0.45, blue: 0.54)
    static let gold = Color(red: 1.0, green: 0.79, blue: 0.30)
    static let right = Color(red: 0.20, green: 0.77, blue: 0.43)
    static let wrong = Color(red: 1.0, green: 0.36, blue: 0.36)
    static let muted = Color(red: 0.71, green: 0.83, blue: 0.86)
}

@MainActor
final class AppModel: ObservableObject {
    @Published private(set) var content: Content?
    @Published var progress: ChildProgress?
    @Published private(set) var loadFailed = false

    private let store: ContentStore
    private let saveURL: URL
    private let speaker = AVSpeechSynthesizer()

    var planner: Planner? { content.map(Planner.init(content:)) }

    init() {
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        saveURL = support.appendingPathComponent("progress.json")
        store = ContentStore(
            bundled: Bundle.main.url(forResource: "bundle", withExtension: "json")!,
            directory: support.appendingPathComponent("content")
        )
        do {
            content = try store.load()
        } catch {
            loadFailed = true
        }
        if let data = try? Data(contentsOf: saveURL) {
            progress = try? JSONDecoder().decode(ChildProgress.self, from: data)
        }
        startDay()
        // A new pack is stored now and used from the next launch.
        let store = self.store
        Task.detached { try? await store.update() }
    }

    func create(_ profile: Profile) {
        progress = ChildProgress(profile: profile)
        startDay()
    }

    func startDay() {
        guard var current = progress, let planner else { return }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        planner.startDay(&current, on: formatter.string(from: Date()))
        progress = current
        save()
    }

    func save() {
        guard let progress, let data = try? JSONEncoder().encode(progress) else { return }
        try? FileManager.default.createDirectory(
            at: saveURL.deletingLastPathComponent(), withIntermediateDirectories: true
        )
        try? data.write(to: saveURL, options: .atomic)
    }

    func speak(_ text: String) {
        speaker.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.45
        speaker.speak(utterance)
    }
}
