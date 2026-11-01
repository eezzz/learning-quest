import Foundation

/// A content pack: the same `content/bundle.json` every platform reads.
/// Unknown fields are ignored, so a newer pack with the same schema still loads.
public struct Content: Decodable {
    public let meta: Meta
    public let language: Language
    public let people: People
    public let brain: Brain
    public let vocabulary: Vocabulary
    public let discovery: [String: [DiscoveryCard]]
    public let expert: [String: ExpertSet]
    public let interests: Interests

    public init(data: Data) throws {
        self = try JSONDecoder().decode(Content.self, from: data)
    }
}

public struct Meta: Decodable {
    public let schema: Int
    public let version: Int
}

public struct Choice: Decodable, Hashable {
    public let t: String
    public let say: String?
    public let ok: Bool?
    public let why: String?

    public init(t: String, say: String? = nil, ok: Bool? = nil, why: String? = nil) {
        self.t = t
        self.say = say
        self.ok = ok
        self.why = why
    }

    public var isRight: Bool { ok == true }
}

public struct Language: Decodable {
    public let skills: [LanguageSkill]
    public let items: [LanguageItem]
}

public struct LanguageSkill: Decodable {
    public let key: String
    public let grade: Int
    public let name: String
    public let icon: String
}

public struct LanguageItem: Decodable {
    public let id: String
    public let skill: String
    public let grade: Int
    public let prompt: String
    public let say: String?
    public let visual: String?
    public let choices: [Choice]
    public let explain: String?
    public let hint: String?
}

public struct People: Decodable {
    public let situations: [Situation]
}

/// A People Lab situation. Its saved key is its position in the list, so the list only grows at the end.
/// The first option is the best one. Problem-size items use `sz` instead of `q` and `o`.
public struct Situation: Decodable {
    public let m: Int
    public let e: String
    public let s: String
    public let q: String?
    public let o: [[String]]?
    public let sz: Int?
    public let why: String?
    public let g: [Int]?

    /// Items without a grade range are for Grades 2–5.
    public func fits(grade: Int) -> Bool {
        let range = g ?? [2, 5]
        return grade >= range[0] && grade <= range[1]
    }
}

public struct Brain: Decodable {
    public let items: [BrainItem]
}

public struct BrainItem: Decodable {
    public let id: String
    public let skill: String
    public let g: [Int]
    public let kind: String
    public let prompt: String
    public let visual: String?
    public let choices: [Choice]?
    public let explain: String?
    public let hint: String?
}

public struct Vocabulary: Decodable {
    public let words: [VocabularyWord]
}

/// `[word, meaning, example with ___, synonym, antonym, emoji, grade?]`
public struct VocabularyWord: Decodable {
    public let word: String
    public let meaning: String
    public let example: String
    public let synonym: String?
    public let antonym: String?
    public let emoji: String
    public let grade: Int

    public init(from decoder: Decoder) throws {
        var c = try decoder.unkeyedContainer()
        word = try c.decode(String.self)
        meaning = try c.decode(String.self)
        example = try c.decode(String.self)
        synonym = try c.decodeIfPresent(String.self)
        antonym = try c.decodeIfPresent(String.self)
        emoji = try c.decode(String.self)
        grade = c.isAtEnd ? 3 : try c.decode(Int.self)
    }
}

/// `[emoji, title, fact]`
public struct DiscoveryCard: Decodable {
    public let emoji: String
    public let title: String
    public let fact: String

    public init(from decoder: Decoder) throws {
        var c = try decoder.unkeyedContainer()
        emoji = try c.decode(String.self)
        title = try c.decode(String.self)
        fact = try c.decode(String.self)
    }
}

public struct ExpertSet: Decodable {
    public let jobs: [String]
    public let words: [ExpertWord]
}

/// `[word, how to say it, meaning, band, question, [3 choices], answer index]`
public struct ExpertWord: Decodable {
    public let word: String
    public let sayIt: String
    public let meaning: String
    public let band: String
    public let question: String
    public let choices: [String]
    public let answer: Int

    public init(from decoder: Decoder) throws {
        var c = try decoder.unkeyedContainer()
        word = try c.decode(String.self)
        sayIt = try c.decode(String.self)
        meaning = try c.decode(String.self)
        band = try c.decode(String.self)
        question = try c.decode(String.self)
        choices = try c.decode([String].self)
        answer = try c.decode(Int.self)
    }
}

public struct Interests: Decodable {
    /// key → `[emoji, name]`
    public let names: [String: [String]]

    enum CodingKeys: String, CodingKey { case names = "INTERESTS" }
}
