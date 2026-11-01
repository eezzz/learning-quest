import Foundation
import JavaScriptCore

/// One day's math part, as `mathDay` in js/subjects/engine.js returns it.
public struct MathDay: Decodable {
    public let topic: MathTopic
    public let questions: [MathQuestion]
}

public struct MathTopic: Decodable {
    public let id: String
    public let name: String
    public let icon: String
    public let learn: String
    public let tip: String
}

public struct MathStep: Decodable {
    public let prompt: String
    public let say: String?
    public let visual: String?
    public let show: String?
    public let tapNumbers: String?
    public let log: String?
    public let note: String?
    public let opts: [Choice]?
}

public struct MathQuestion: Decodable {
    public let kind: String
    public let key: String
    public let prompt: String?
    public let say: String?
    public let visual: String?
    public let show: String?
    public let done: String?
    public let opts: [Choice]?
    public let steps: [MathStep]?
    public let hint: String?
    public let explain: String?
}

/// What the engine needs to know about the child.
public struct MathRequest: Encodable {
    public var math: Int
    public var interests: [String]
    public var done: [String]
    public var due: [String]
    public var mistakes: [String: Int]
    public var count: Int
    public var day: Int
}

/// Runs the shared math generators in JavaScriptCore, so math rules are the same as on the web.
/// The code ships inside the app; only data comes from content packs.
public final class MathEngine {
    public enum EngineError: Error {
        case script(String)
        case noResult
    }

    /// In load order. The app and the tests pass these from different places.
    public static let scriptNames = ["util", "math-lab", "curriculum", "math-more", "engine"]

    private let context: JSContext

    public init(scripts: [URL], pack: Data) throws {
        guard let context = JSContext() else { throw EngineError.noResult }
        self.context = context
        var failure: String?
        context.exceptionHandler = { _, exception in failure = exception?.toString() }

        let packText = String(decoding: pack, as: UTF8.self)
        context.setObject(packText, forKeyedSubscript: "__pack" as NSString)
        context.evaluateScript("""
            const CONTENT=JSON.parse(__pack);
            const {INTERESTS,THEMES}=CONTENT.interests;
            const {STORIES,STORY_TYPES}=CONTENT.stories;
            """)
        for script in scripts {
            context.evaluateScript(try String(contentsOf: script, encoding: .utf8), withSourceURL: script)
            if let failure { throw EngineError.script("\(script.lastPathComponent): \(failure)") }
        }
    }

    public func day(_ request: MathRequest) throws -> MathDay {
        let json = String(decoding: try JSONEncoder().encode(request), as: UTF8.self)
        context.setObject(json, forKeyedSubscript: "__request" as NSString)
        var failure: String?
        context.exceptionHandler = { _, exception in failure = exception?.toString() }
        let value = context.evaluateScript("mathDay(JSON.parse(__request))")
        if let failure { throw EngineError.script(failure) }
        guard let text = value?.toString(), value?.isString == true else { throw EngineError.noResult }
        return try JSONDecoder().decode(MathDay.self, from: Data(text.utf8))
    }
}
