import 'package:flutter/material.dart';

class LevelData {
  final int id;
  final String name;
  final String world;
  final String worldEmoji;
  final String objective;
  final Color worldColor;
  bool isUnlocked;
  int stars; // 0-3

  LevelData({
    required this.id,
    required this.name,
    required this.world,
    required this.worldEmoji,
    required this.objective,
    required this.worldColor,
    this.isUnlocked = false,
    this.stars = 0,
  });

  static List<LevelData> getAllLevels() {
    return [
      // World 1: Enchanted Forest
      LevelData(
        id: 1,
        name: 'The Awakening',
        world: 'Enchanted Forest',
        worldEmoji: '🌲',
        objective: 'Walk to the portal.',
        worldColor: const Color(0xFF4CAF50),
        isUnlocked: true,
      ),
      LevelData(
        id: 2,
        name: 'Forest Path',
        world: 'Enchanted Forest',
        worldEmoji: '🌲',
        objective: 'Cross the old bridge.',
        worldColor: const Color(0xFF4CAF50),
      ),
      LevelData(
        id: 3,
        name: 'The Hollow Tree',
        world: 'Enchanted Forest',
        worldEmoji: '🌲',
        objective: 'Find the hidden key.',
        worldColor: const Color(0xFF4CAF50),
      ),
      LevelData(
        id: 4,
        name: 'River Crossing',
        world: 'Enchanted Forest',
        worldEmoji: '🌲',
        objective: 'Jump across the river stones.',
        worldColor: const Color(0xFF4CAF50),
      ),
      LevelData(
        id: 5,
        name: 'Forest Guardian',
        world: 'Enchanted Forest',
        worldEmoji: '🌲',
        objective: 'Defeat the Tree Golem!',
        worldColor: const Color(0xFF4CAF50),
      ),

      // World 2: Frozen Mountains
      LevelData(
        id: 6,
        name: 'The Ascent',
        world: 'Frozen Mountains',
        worldEmoji: '❄️',
        objective: 'Climb the mountain path.',
        worldColor: const Color(0xFF42A5F5),
      ),
      LevelData(
        id: 7,
        name: 'Ice Caverns',
        world: 'Frozen Mountains',
        worldEmoji: '❄️',
        objective: 'Navigate the frozen caves.',
        worldColor: const Color(0xFF42A5F5),
      ),
      LevelData(
        id: 8,
        name: 'The Blizzard',
        world: 'Frozen Mountains',
        worldEmoji: '❄️',
        objective: 'Survive the storm!',
        worldColor: const Color(0xFF42A5F5),
      ),
      LevelData(
        id: 9,
        name: 'Frozen Lake',
        world: 'Frozen Mountains',
        worldEmoji: '❄️',
        objective: 'Cross the frozen lake.',
        worldColor: const Color(0xFF42A5F5),
      ),
      LevelData(
        id: 10,
        name: 'Frost Dragon',
        world: 'Frozen Mountains',
        worldEmoji: '❄️',
        objective: 'Defeat the Ice Wyrm!',
        worldColor: const Color(0xFF42A5F5),
      ),

      // World 3: Volcanic Depths
      LevelData(
        id: 11,
        name: 'Into the Earth',
        world: 'Volcanic Depths',
        worldEmoji: '🌋',
        objective: 'Descend underground.',
        worldColor: const Color(0xFFFF7043),
      ),
      LevelData(
        id: 12,
        name: 'Lava Tunnels',
        world: 'Volcanic Depths',
        worldEmoji: '🌋',
        objective: 'Navigate around lava!',
        worldColor: const Color(0xFFFF7043),
      ),
      LevelData(
        id: 13,
        name: 'Crystal Mine',
        world: 'Volcanic Depths',
        worldEmoji: '🌋',
        objective: 'Collect 5 crystals.',
        worldColor: const Color(0xFFFF7043),
      ),
      LevelData(
        id: 14,
        name: 'The Forge',
        world: 'Volcanic Depths',
        worldEmoji: '🌋',
        objective: 'Activate the forge.',
        worldColor: const Color(0xFFFF7043),
      ),
      LevelData(
        id: 15,
        name: 'Magma Beast',
        world: 'Volcanic Depths',
        worldEmoji: '🌋',
        objective: 'Defeat the Lava Golem!',
        worldColor: const Color(0xFFFF7043),
      ),

      // World 4: Shadow Fortress
      LevelData(
        id: 16,
        name: 'The Dark Gate',
        world: 'Shadow Fortress',
        worldEmoji: '🏰',
        objective: 'Breach the fortress!',
        worldColor: const Color(0xFF7E57C2),
      ),
      LevelData(
        id: 17,
        name: 'Dungeon Maze',
        world: 'Shadow Fortress',
        worldEmoji: '🏰',
        objective: 'Find the exit.',
        worldColor: const Color(0xFF7E57C2),
      ),
      LevelData(
        id: 18,
        name: 'Throne Room',
        world: 'Shadow Fortress',
        worldEmoji: '🏰',
        objective: 'Cross the throne room.',
        worldColor: const Color(0xFF7E57C2),
      ),
      LevelData(
        id: 19,
        name: 'The Dark Lord',
        world: 'Shadow Fortress',
        worldEmoji: '🏰',
        objective: 'Defeat the Dark Lord!',
        worldColor: const Color(0xFF7E57C2),
      ),
      LevelData(
        id: 20,
        name: 'Light Restored',
        world: 'Shadow Fortress',
        worldEmoji: '🏰',
        objective: 'Unite the shards!',
        worldColor: const Color(0xFF7E57C2),
      ),
    ];
  }
}
