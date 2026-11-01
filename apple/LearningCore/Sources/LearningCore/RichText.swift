import Foundation

/// Pack text uses a small markup (see docs/CONTENT.md) that every platform draws its own way.
public struct RichBlock: Equatable {
    public enum Style: Equatable {
        case plain, bigLetter, bigEmoji, passage, sentence
    }

    public struct Run: Equatable {
        public let text: String
        public let bold: Bool
        public let blank: Bool
    }

    public let style: Style
    public let runs: [Run]

    public var plainText: String { runs.map(\.text).joined() }
}

public enum RichText {
    private static let styles: [String: RichBlock.Style] = [
        "bigletter": .bigLetter, "wx big": .bigEmoji, "passage": .passage, "wsent": .sentence,
    ]

    public static func parse(_ source: String) -> [RichBlock] {
        var blocks: [RichBlock] = []
        var runs: [RichBlock.Run] = []
        var style = RichBlock.Style.plain
        var bold = false
        var blank = false

        func flush() {
            let hasText = runs.contains { !$0.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
            if hasText { blocks.append(RichBlock(style: style, runs: runs)) }
            runs = []
        }
        func add(_ text: String) {
            if !text.isEmpty {
                runs.append(.init(text: decode(text), bold: bold, blank: blank))
            }
        }

        var rest = Substring(source)
        while let open = rest.firstIndex(of: "<"), let close = rest[open...].firstIndex(of: ">") {
            add(String(rest[..<open]))
            let tag = rest[rest.index(after: open)..<close]
            rest = rest[rest.index(after: close)...]

            switch tag {
            case "b": bold = true
            case "/b": bold = false
            case "br": add("\n")
            case "/span": blank = false
            case "/div":
                flush()
                style = .plain
            default:
                if tag.hasPrefix("span") {
                    blank = true
                } else if tag.hasPrefix("div"), let name = tag.split(separator: "\"").dropFirst().first {
                    flush()
                    style = styles[String(name)] ?? .plain
                }
            }
        }
        add(String(rest))
        flush()
        return blocks
    }

    /// Text for reading aloud or for places that can't show styles.
    public static func plain(_ source: String) -> String {
        parse(source).map(\.plainText).joined(separator: " ")
    }

    private static func decode(_ text: String) -> String {
        text.replacingOccurrences(of: "&nbsp;", with: " ")
    }
}
