import Foundation
import XCTest
@testable import LearningCore

/// These run against the real pack in content/, so a pack that breaks the native app fails here.
final class LearningCoreTests: XCTestCase {
    private var repo: URL {
        URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
    }
    private var packURL: URL { repo.appendingPathComponent("content/bundle.json") }
    private func pack() throws -> Content { try Content(data: Data(contentsOf: packURL)) }

    private func temporaryDirectory() -> URL {
        FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    }

    func testRealPackDecodes() throws {
        let c = try pack()
        XCTAssertEqual(c.meta.schema, ContentStore.supportedSchema)
        XCTAssertGreaterThanOrEqual(c.language.items.count, 840)
        XCTAssertGreaterThanOrEqual(c.people.situations.count, 232)
        XCTAssertGreaterThanOrEqual(c.vocabulary.words.count, 150)
        XCTAssertEqual(c.discovery.count, 17)
        XCTAssertEqual(c.expert["space"]?.words.count, c.discovery["space"]?.count)
    }

    func testManifestMatchesPack() throws {
        let raw = try Data(contentsOf: repo.appendingPathComponent("content/manifest.json"))
        let manifest = try JSONDecoder().decode(PackManifest.self, from: raw)
        let data = try Data(contentsOf: packURL)
        XCTAssertEqual(manifest.bytes, data.count)
        XCTAssertEqual(manifest.sha256, ContentStore.sha256(data))
    }

    func testEveryQuestionHasOneRightAnswer() throws {
        let c = try pack()
        for item in c.language.items {
            XCTAssertEqual(item.choices.filter(\.isRight).count, 1, item.id)
        }
        for (index, situation) in c.people.situations.enumerated() {
            let question = Planner.question(key: "so:\(index)", situation: situation)
            XCTAssertEqual(question.choices.filter(\.isRight).count, 1, question.key)
        }
    }

    func testRichTextCoversAllPackMarkup() throws {
        for item in try pack().language.items {
            for text in [item.prompt, item.visual ?? ""] + item.choices.map(\.t) {
                XCTAssertFalse(RichText.plain(text).contains("<"), text)
            }
        }
    }

    func testRichTextStyles() {
        let blocks = RichText.parse("<div class=\"wsent\">The <b>big</b> <span class=\"blank\">?</span> rock.</div>")
        XCTAssertEqual(blocks.count, 1)
        XCTAssertEqual(blocks[0].style, .sentence)
        XCTAssertEqual(blocks[0].plainText, "The big ? rock.")
        XCTAssertTrue(blocks[0].runs.contains { $0.bold && $0.text == "big" })
        XCTAssertTrue(blocks[0].runs.contains { $0.blank && $0.text == "?" })
    }

    func testEveryGradeGetsAFullDay() throws {
        let planner = Planner(content: try pack())
        for grade in 0...5 {
            var progress = ChildProgress(profile: Profile(name: "T", grade: grade, interests: ["space"]))
            for day in 1...12 {
                planner.startDay(&progress, on: "day-\(day)")
                let words = planner.questions(for: .words, progress: progress)
                XCTAssertEqual(words.count, Planner.questionCount(grade: grade), "grade \(grade)")
                for question in words + planner.questions(for: .people, progress: progress) {
                    planner.record(question, firstTry: true, progress: &progress)
                }
            }
        }
    }

    func testFinishingTheDayEarnsOneCard() throws {
        let planner = Planner(content: try pack())
        var progress = ChildProgress(profile: Profile(name: "T", grade: 3, interests: ["space", "bugs"]))
        planner.startDay(&progress, on: "d1")
        XCTAssertNil(planner.finish(.words, progress: &progress))
        XCTAssertNil(planner.finish(.math, progress: &progress))
        XCTAssertNotNil(planner.finish(.people, progress: &progress))
        XCTAssertNil(planner.finish(.people, progress: &progress))
        XCTAssertEqual(progress.cards.count, 1)
    }

    // MARK: Math engine

    private func engine() throws -> MathEngine {
        let scripts = MathEngine.scriptNames.map { repo.appendingPathComponent("js/subjects/\($0).js") }
        return try MathEngine(scripts: scripts, pack: Data(contentsOf: packURL))
    }

    func testMathDaysForEveryGrade() throws {
        let content = try pack()
        let planner = Planner(content: content)
        let math = try engine()
        for grade in 0...5 {
            var progress = ChildProgress(profile: Profile(name: "T", grade: grade, interests: ["space", "cars"]))
            for day in 1...30 {
                progress.dayCount = day
                let result = try planner.mathDay(engine: math, progress: progress)
                XCTAssertFalse(result.questions.isEmpty, "grade \(grade)")
                for question in result.questions.map(Question.init) {
                    XCTAssertFalse(question.screens.isEmpty, question.key)
                    for screen in question.screens where screen.tapNumbers == nil {
                        XCTAssertEqual(screen.choices.filter(\.isRight).count, 1, question.key)
                    }
                }
                progress.doneTopics.append(result.topic.id)
            }
        }
    }

    func testEngineThemesFollowInterests() throws {
        let planner = Planner(content: try pack())
        let progress = ChildProgress(profile: Profile(name: "T", grade: 3, interests: ["space"]))
        XCTAssertNoThrow(try planner.mathDay(engine: engine(), progress: progress))
    }

    func testFinishingATopicNeedsSeventyPercent() throws {
        let planner = Planner(content: try pack())
        var progress = ChildProgress(profile: Profile(name: "T", grade: 3, interests: []))
        planner.finishTopic("m1", right: 2, total: 6, progress: &progress)
        XCTAssertTrue(progress.doneTopics.isEmpty)
        planner.finishTopic("m1", right: 5, total: 6, progress: &progress)
        XCTAssertEqual(progress.doneTopics, ["m1"])
    }

    // MARK: Pack updates

    private func manifest(_ data: Data, version: Int, schema: Int = 1, sha: String? = nil) throws -> Data {
        try JSONEncoder().encode(PackManifest(
            schema: schema, version: version, bundle: "bundle.json", bytes: data.count,
            sha256: sha ?? ContentStore.sha256(data)
        ))
    }

    /// The real pack with its version raised.
    private func newerPack(version: Int) throws -> Data {
        var object = try XCTUnwrap(JSONSerialization.jsonObject(with: Data(contentsOf: packURL)) as? [String: Any])
        var meta = try XCTUnwrap(object["meta"] as? [String: Any])
        meta["version"] = version
        object["meta"] = meta
        return try JSONSerialization.data(withJSONObject: object)
    }

    private func store(_ directory: URL, manifest: Data, pack: Data) -> ContentStore {
        ContentStore(bundled: packURL, directory: directory) { url in
            url.lastPathComponent == "manifest.json" ? manifest : pack
        }
    }

    func testNewPackIsUsedNextLaunch() async throws {
        let dir = temporaryDirectory()
        let version = try pack().meta.version + 1
        let data = try newerPack(version: version)
        let s = store(dir, manifest: try manifest(data, version: version), pack: data)
        let updated = try await s.update()
        XCTAssertEqual(updated, version)
        XCTAssertEqual(try s.load().meta.version, version)
    }

    func testDamagedDownloadIsRejected() async throws {
        let dir = temporaryDirectory()
        let version = try pack().meta.version + 1
        let data = try newerPack(version: version)
        let s = store(dir, manifest: try manifest(data, version: version, sha: "bad"), pack: data)
        do {
            try await s.update()
            XCTFail("should have thrown")
        } catch {}
        XCTAssertEqual(try s.load().meta.version, version - 1)
    }

    func testNewerSchemaIsIgnored() async throws {
        let dir = temporaryDirectory()
        let version = try pack().meta.version + 1
        let data = try newerPack(version: version)
        let s = store(dir, manifest: try manifest(data, version: version, schema: 99), pack: data)
        let updated = try await s.update()
        XCTAssertNil(updated)
    }

    func testCorruptedStoredPackFallsBackToShipped() async throws {
        let dir = temporaryDirectory()
        let version = try pack().meta.version + 1
        let data = try newerPack(version: version)
        let s = store(dir, manifest: try manifest(data, version: version), pack: data)
        try await s.update()
        try Data("{}".utf8).write(to: dir.appendingPathComponent("bundle.json"))
        XCTAssertEqual(try s.load().meta.version, version - 1)
    }
}
