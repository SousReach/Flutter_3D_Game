import 'package:shared_preferences/shared_preferences.dart';

class GameState {
  int currentLevel;
  List<bool> unlockedLevels;
  List<int> levelStars;
  int shardsCollected;

  GameState({
    this.currentLevel = 1,
    List<bool>? unlockedLevels,
    List<int>? levelStars,
    this.shardsCollected = 0,
  }) : unlockedLevels = unlockedLevels ?? List.generate(20, (i) => i == 0),
       levelStars = levelStars ?? List.generate(20, (_) => 0);

  bool isLevelUnlocked(int level) {
    if (level < 1 || level > 20) return false;
    return unlockedLevels[level - 1];
  }

  void unlockLevel(int level) {
    if (level >= 1 && level <= 20) {
      unlockedLevels[level - 1] = true;
    }
  }

  void setStars(int level, int stars) {
    if (level >= 1 && level <= 20) {
      if (stars > levelStars[level - 1]) {
        levelStars[level - 1] = stars;
      }
    }
  }

  int getStars(int level) {
    if (level < 1 || level > 20) return 0;
    return levelStars[level - 1];
  }

  int getTotalStars() {
    return levelStars.fold(0, (sum, s) => sum + s);
  }

  void completeLevel(int level, int gems, int totalGems) {
    // Calculate stars
    int stars = 1; // Completed = 1 star
    if (totalGems > 0) {
      double ratio = gems / totalGems;
      if (ratio >= 0.5) stars = 2;
      if (ratio >= 1.0) stars = 3;
    }

    setStars(level, stars);

    // Unlock next level
    if (level < 20) {
      unlockLevel(level + 1);
    }

    // Track crystal shards (boss levels)
    if (level == 5 ||
        level == 10 ||
        level == 15 ||
        level == 19 ||
        level == 20) {
      shardsCollected++;
    }
  }

  // Save to SharedPreferences
  Future<void> save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('currentLevel', currentLevel);
    await prefs.setInt('shardsCollected', shardsCollected);
    await prefs.setStringList(
      'unlockedLevels',
      unlockedLevels.map((b) => b.toString()).toList(),
    );
    await prefs.setStringList(
      'levelStars',
      levelStars.map((s) => s.toString()).toList(),
    );
  }

  // Load from SharedPreferences
  static Future<GameState> load() async {
    final prefs = await SharedPreferences.getInstance();
    final unlocked = prefs.getStringList('unlockedLevels');
    final stars = prefs.getStringList('levelStars');

    return GameState(
      currentLevel: prefs.getInt('currentLevel') ?? 1,
      shardsCollected: prefs.getInt('shardsCollected') ?? 0,
      unlockedLevels: unlocked?.map((s) => s == 'true').toList(),
      levelStars: stars?.map((s) => int.tryParse(s) ?? 0).toList(),
    );
  }

  // Reset all progress
  Future<void> reset() async {
    currentLevel = 1;
    shardsCollected = 0;
    unlockedLevels = List.generate(20, (i) => i == 0);
    levelStars = List.generate(20, (_) => 0);
    await save();
  }
}
