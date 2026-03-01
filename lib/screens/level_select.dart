import 'package:flutter/material.dart';
import '../models/game_state.dart';
import '../models/level_data.dart';
import '../models/story_data.dart';
import '../utils/constants.dart';
import 'story_screen.dart';
import 'game_screen.dart';

class LevelSelect extends StatefulWidget {
  final GameState gameState;
  const LevelSelect({super.key, required this.gameState});

  @override
  State<LevelSelect> createState() => _LevelSelectState();
}

class _LevelSelectState extends State<LevelSelect> {
  int selectedWorld = 0;
  late List<LevelData> allLevels;

  @override
  void initState() {
    super.initState();
    allLevels = LevelData.getAllLevels();
    // Sync unlock state from game state
    for (int i = 0; i < allLevels.length; i++) {
      allLevels[i].isUnlocked = widget.gameState.isLevelUnlocked(i + 1);
      allLevels[i].stars = widget.gameState.getStars(i + 1);
    }
  }

  @override
  Widget build(BuildContext context) {
    final worldLevels = allLevels.where((l) {
      int worldIdx = ((l.id - 1) / 5).floor();
      return worldIdx == selectedWorld;
    }).toList();

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0a0a1a), Color(0xFF1a1a2e)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Top bar
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(
                        Icons.arrow_back_rounded,
                        color: Colors.white,
                      ),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const Expanded(
                      child: Text(
                        'Select Level',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFFFD700),
                        ),
                      ),
                    ),
                    Text(
                      '⭐ ${widget.gameState.getTotalStars()}/60',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFFFFD700),
                      ),
                    ),
                  ],
                ),
              ),

              // World tabs
              SizedBox(
                height: 45,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  itemCount: 4,
                  itemBuilder: (context, index) {
                    final isSelected = selectedWorld == index;
                    final color = AppConstants.worldColors[index];
                    return GestureDetector(
                      onTap: () => setState(() => selectedWorld = index),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? color.withValues(alpha: 0.3)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? color : Colors.white24,
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Text(
                          AppConstants.worldNames[index],
                          style: TextStyle(
                            color: isSelected ? color : Colors.white54,
                            fontWeight: isSelected
                                ? FontWeight.bold
                                : FontWeight.normal,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),

              // Level grid
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 5,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.0,
                  ),
                  itemCount: worldLevels.length,
                  itemBuilder: (context, index) {
                    final level = worldLevels[index];
                    return _buildLevelCard(level);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLevelCard(LevelData level) {
    final isUnlocked = level.isUnlocked;
    final color = level.worldColor;
    final isBoss = level.id % 5 == 0;

    return GestureDetector(
      onTap: isUnlocked ? () => _onLevelTap(level) : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          gradient: isUnlocked
              ? LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    color.withValues(alpha: 0.3),
                    color.withValues(alpha: 0.1),
                  ],
                )
              : null,
          color: isUnlocked ? null : Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isUnlocked
                ? (isBoss
                      ? const Color(0xFFFFD700)
                      : color.withValues(alpha: 0.5))
                : Colors.white12,
            width: isBoss ? 2 : 1,
          ),
          boxShadow: isBoss && isUnlocked
              ? [
                  BoxShadow(
                    color: const Color(0xFFFFD700).withValues(alpha: 0.2),
                    blurRadius: 8,
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!isUnlocked)
              Icon(Icons.lock_rounded, color: Colors.white24, size: 28)
            else ...[
              Text(
                '${level.id}',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: isBoss ? const Color(0xFFFFD700) : Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                level.name,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 9,
                  color: Colors.white.withValues(alpha: 0.7),
                ),
              ),
              const SizedBox(height: 4),
              // Stars
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (i) {
                  return Icon(
                    i < level.stars
                        ? Icons.star_rounded
                        : Icons.star_border_rounded,
                    color: i < level.stars
                        ? const Color(0xFFFFD700)
                        : Colors.white24,
                    size: 14,
                  );
                }),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _onLevelTap(LevelData level) {
    final preStory = StoryData.getPreLevelStory()[level.id];
    if (preStory != null && preStory.isNotEmpty) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => StoryScreen(
            dialogues: preStory,
            levelNumber: level.id,
            gameState: widget.gameState,
          ),
        ),
      );
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) =>
              GameScreen(levelNumber: level.id, gameState: widget.gameState),
        ),
      );
    }
  }
}
