import 'package:flutter/material.dart';
import '../models/game_state.dart';
import 'level_select.dart';
import 'settings_screen.dart';
import 'story_screen.dart';
import '../models/story_data.dart';

class MainMenu extends StatefulWidget {
  final GameState gameState;
  const MainMenu({super.key, required this.gameState});

  @override
  State<MainMenu> createState() => _MainMenuState();
}

class _MainMenuState extends State<MainMenu> with TickerProviderStateMixin {
  late AnimationController _titleController;
  late AnimationController _glowController;
  late Animation<double> _titleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _titleController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _titleAnimation = CurvedAnimation(
      parent: _titleController,
      curve: Curves.elasticOut,
    );
    _titleController.forward();

    _glowController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _glowAnimation = Tween<double>(begin: 0.3, end: 1.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0a0a1a), Color(0xFF1a1a2e), Color(0xFF16213e)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Title
                ScaleTransition(
                  scale: _titleAnimation,
                  child: Column(
                    children: [
                      AnimatedBuilder(
                        animation: _glowAnimation,
                        builder: (context, child) {
                          return Text(
                            '⚔️ BlockQuest',
                            style: TextStyle(
                              fontSize: 42,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFFFFD700),
                              shadows: [
                                Shadow(
                                  color: Color(
                                    0xFFFFD700,
                                  ).withValues(alpha: _glowAnimation.value),
                                  blurRadius: 20,
                                ),
                                Shadow(
                                  color: Colors.orange.withValues(
                                    alpha: _glowAnimation.value * 0.5,
                                  ),
                                  blurRadius: 40,
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'The Crystal Saga',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.white.withValues(alpha: 0.7),
                          letterSpacing: 4,
                          fontWeight: FontWeight.w300,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                // Shard progress
                Text(
                  '💎 Crystal Shards: ${widget.gameState.shardsCollected} / 5',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.5),
                  ),
                ),
                const SizedBox(height: 40),
                // Buttons
                _buildMenuButton(
                  'New Game',
                  Icons.play_arrow_rounded,
                  const Color(0xFF4CAF50),
                  () {
                    widget.gameState.reset().then((_) {
                      _startGame(1);
                    });
                  },
                ),
                const SizedBox(height: 12),
                _buildMenuButton(
                  'Continue',
                  Icons.fast_forward_rounded,
                  const Color(0xFF42A5F5),
                  widget.gameState.currentLevel > 1
                      ? () => _startGame(widget.gameState.currentLevel)
                      : null,
                ),
                const SizedBox(height: 12),
                _buildMenuButton(
                  'Select Level',
                  Icons.grid_view_rounded,
                  const Color(0xFFFF7043),
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            LevelSelect(gameState: widget.gameState),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                _buildMenuButton(
                  'Settings',
                  Icons.settings_rounded,
                  const Color(0xFF7E57C2),
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            SettingsScreen(gameState: widget.gameState),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuButton(
    String text,
    IconData icon,
    Color color,
    VoidCallback? onPressed,
  ) {
    return SizedBox(
      width: 260,
      height: 50,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: onPressed != null
              ? color.withValues(alpha: 0.2)
              : Colors.grey.withValues(alpha: 0.1),
          foregroundColor: onPressed != null ? color : Colors.grey,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
              color: onPressed != null
                  ? color.withValues(alpha: 0.5)
                  : Colors.grey.withValues(alpha: 0.2),
              width: 1.5,
            ),
          ),
          elevation: 0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 22),
            const SizedBox(width: 10),
            Text(
              text,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _startGame(int level) {
    final preStory = StoryData.getPreLevelStory()[level];
    if (preStory != null && preStory.isNotEmpty) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => StoryScreen(
            dialogues: preStory,
            levelNumber: level,
            gameState: widget.gameState,
          ),
        ),
      );
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => LevelSelect(gameState: widget.gameState),
        ),
      );
    }
  }
}
