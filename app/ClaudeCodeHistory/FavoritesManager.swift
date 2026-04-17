import Foundation

class FavoritesManager: ObservableObject {
    static let shared = FavoritesManager()
    @Published var favoriteIds: Set<String> = []
    private let dirPath: String
    private let filePath: String

    private init() {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        dirPath = "\(home)/.claudehistory"
        filePath = "\(home)/.claudehistory/favorites.json"
        load()
    }

    func isFavorite(_ id: String) -> Bool { favoriteIds.contains(id) }
    func toggle(_ id: String) {
        if favoriteIds.contains(id) { favoriteIds.remove(id) } else { favoriteIds.insert(id) }
        save()
    }

    private func load() {
        guard FileManager.default.fileExists(atPath: filePath),
              let data = FileManager.default.contents(atPath: filePath),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let ids = json["favorites"] as? [String] else { return }
        favoriteIds = Set(ids)
    }

    private func save() {
        let fm = FileManager.default
        if !fm.fileExists(atPath: dirPath) { try? fm.createDirectory(atPath: dirPath, withIntermediateDirectories: true) }
        let json: [String: Any] = ["favorites": Array(favoriteIds), "updatedAt": ISO8601DateFormatter().string(from: Date())]
        if let data = try? JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted, .sortedKeys]) {
            fm.createFile(atPath: filePath, contents: data)
        }
    }
}
