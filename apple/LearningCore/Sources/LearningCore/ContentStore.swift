import CryptoKit
import Foundation

/// `content/manifest.json`: what apps check to find a new pack.
public struct PackManifest: Codable, Equatable {
    public let schema: Int
    public let version: Int
    public let bundle: String
    public let bytes: Int
    public let sha256: String
}

/// Loads the newest usable pack and fetches new ones.
///
/// A new pack is checked, stored, and used from the next launch, so questions never change in the
/// middle of a day's practice. The pack shipped with the app is always the fallback.
public final class ContentStore {
    /// The newest pack format this version of the app understands.
    public static let supportedSchema = 1
    public static let remoteBase = URL(string: "https://eezzz.github.io/learning-quest/content/")!

    public typealias Fetch = (URL) async throws -> Data

    private let bundled: URL
    private let directory: URL
    private let remoteBase: URL
    private let supportedSchema: Int
    private let fetch: Fetch

    private var packURL: URL { directory.appendingPathComponent("bundle.json") }
    private var manifestURL: URL { directory.appendingPathComponent("manifest.json") }

    public init(
        bundled: URL,
        directory: URL,
        remoteBase: URL = ContentStore.remoteBase,
        supportedSchema: Int = ContentStore.supportedSchema,
        fetch: Fetch? = nil
    ) {
        self.bundled = bundled
        self.directory = directory
        self.remoteBase = remoteBase
        self.supportedSchema = supportedSchema
        self.fetch = fetch ?? { url in
            var request = URLRequest(url: url)
            request.cachePolicy = .reloadIgnoringLocalCacheData
            return try await URLSession.shared.data(for: request).0
        }
    }

    /// The stored pack if it is intact, readable and newer than the shipped one; otherwise the shipped one.
    public func load() throws -> Content {
        let shipped = try Content(data: Data(contentsOf: bundled))
        guard let stored = storedPack(), stored.meta.version > shipped.meta.version else { return shipped }
        return stored
    }

    private func storedPack() -> Content? {
        guard
            let raw = try? Data(contentsOf: manifestURL),
            let manifest = try? JSONDecoder().decode(PackManifest.self, from: raw),
            manifest.schema <= supportedSchema,
            let data = try? Data(contentsOf: packURL),
            ContentStore.sha256(data) == manifest.sha256
        else { return nil }
        return try? Content(data: data)
    }

    /// Downloads a newer pack if there is one. Returns its version, or nil if there was nothing to do.
    @discardableResult
    public func update() async throws -> Int? {
        let current = try load().meta.version
        let raw = try await fetch(remoteBase.appendingPathComponent("manifest.json"))
        let manifest = try JSONDecoder().decode(PackManifest.self, from: raw)
        guard manifest.schema <= supportedSchema, manifest.version > current else { return nil }

        let data = try await fetch(remoteBase.appendingPathComponent(manifest.bundle))
        guard data.count == manifest.bytes, ContentStore.sha256(data) == manifest.sha256 else {
            throw UpdateError.damaged
        }
        _ = try Content(data: data)

        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        // Pack first: a stored manifest always describes a complete pack, or fails its checksum.
        try data.write(to: packURL, options: .atomic)
        try raw.write(to: manifestURL, options: .atomic)
        return manifest.version
    }

    public enum UpdateError: Error { case damaged }

    static func sha256(_ data: Data) -> String {
        SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }
}
