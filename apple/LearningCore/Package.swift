// swift-tools-version:5.9
import PackageDescription

// Everything that isn't SwiftUI: reading content packs, updating them, and the daily plan.
let package = Package(
    name: "LearningCore",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "LearningCore", targets: ["LearningCore"])],
    targets: [
        .target(name: "LearningCore"),
        .testTarget(name: "LearningCoreTests", dependencies: ["LearningCore"]),
    ]
)
