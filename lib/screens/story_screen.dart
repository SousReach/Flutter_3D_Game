import 'package:flutter/material.dart';
import '../models/story_data.dart';
import '../models/game_state.dart';
import 'game_screen.dart';

class StoryScreen extends StatefulWidget {
  final List<StoryDialogue> dialogues;
  final int levelNumber;
  final GameState gameState;
  final bool isPostLevel;

  const StoryScreen({
    super.key,
    required this.dialogues,
    required this.levelNumber,
    required this.gameState,
    this.isPostLevel = false,
  });

  @override
  State<StoryScreen> createState() => _StoryScreenState();
}

class _StoryScreenState extends State<StoryScreen>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  String _displayedText = '';
  bool _isTyping = true;
  late AnimationController _fadeController;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    )..forward();
    _typeText();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  void _typeText() async {
    _isTyping = true;
    _displayedText = '';
    final fullText = widget.dialogues[_currentIndex].text;

    for (int i = 0; i < fullText.length; i++) {
      if (!mounted) return;
      await Future.delayed(const Duration(milliseconds: 25));
      if (!_isTyping) {
        setState(() => _displayedText = fullText);
        return;
      }
      setState(() => _displayedText = fullText.substring(0, i + 1));
    }
    setState(() => _isTyping = false);
  }

  void _onTap() {
    if (_isTyping) {
      // Skip typing animation
      _isTyping = false;
      setState(() {
        _displayedText = widget.dialogues[_currentIndex].text;
      });
    } else {
      // Advance to next dialogue
      if (_currentIndex < widget.dialogues.length - 1) {
        setState(() {
          _currentIndex++;
        });
        _typeText();
      } else {
        // Story complete
        if (widget.isPostLevel) {
          // Go back to level select
          Navigator.of(context).popUntil((route) => route.isFirst);
        } else {
          // Start the game
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => GameScreen(
                levelNumber: widget.levelNumber,
                gameState: widget.gameState,
              ),
            ),
          );
        }
      }
    }
  }

  Color _getSpeakerColor(String speaker) {
    switch (speaker) {
      case 'Alex':
        return const Color(0xFF4FC3F7);
      case 'Elder Aldric':
        return const Color(0xFF81C784);
      case 'Wolf':
        return const Color(0xFFFFB74D);
      case 'Tree Golem':
      case 'Lava Golem':
        return const Color(0xFFFF7043);
      case 'Ice Wyrm':
        return const Color(0xFF80DEEA);
      case 'Dark Lord':
      case 'Shadow Form':
        return const Color(0xFFCE93D8);
      case 'Frozen Traveler':
      case 'Sir Brennan':
        return const Color(0xFF90CAF9);
      default:
        return Colors.white70;
    }
  }

  @override
  Widget build(BuildContext context) {
    final dialogue = widget.dialogues[_currentIndex];

    return Scaffold(
      body: GestureDetector(
        onTap: _onTap,
        child: Container(
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
                // Progress indicator
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 8,
                  ),
                  child: Row(
                    children: [
                      Text(
                        'Level ${widget.levelNumber}',
                        style: const TextStyle(
                          color: Color(0xFFFFD700),
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${_currentIndex + 1} / ${widget.dialogues.length}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),

                // Spacer for visual centering
                const Spacer(),

                // Speaker emoji / character
                _buildCharacterAvatar(dialogue.speaker),
                const SizedBox(height: 20),

                // Dialogue box
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 24),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _getSpeakerColor(
                        dialogue.speaker,
                      ).withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Speaker name
                      if (dialogue.speaker.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: _getSpeakerColor(
                              dialogue.speaker,
                            ).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            dialogue.speaker,
                            style: TextStyle(
                              color: _getSpeakerColor(dialogue.speaker),
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      if (dialogue.speaker.isNotEmpty)
                        const SizedBox(height: 10),
                      // Text
                      Text(
                        _displayedText,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Tap to continue
                AnimatedOpacity(
                  opacity: _isTyping ? 0.0 : 1.0,
                  duration: const Duration(milliseconds: 300),
                  child: Text(
                    _currentIndex < widget.dialogues.length - 1
                        ? 'Tap to continue ▶'
                        : (widget.isPostLevel
                              ? 'Tap to finish ✓'
                              : 'Tap to start level ⚔️'),
                    style: TextStyle(
                      color: const Color(0xFFFFD700).withValues(alpha: 0.7),
                      fontSize: 13,
                    ),
                  ),
                ),

                const Spacer(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCharacterAvatar(String speaker) {
    String emoji;
    switch (speaker) {
      case 'Alex':
        emoji = '🧑‍⚔️';
        break;
      case 'Elder Aldric':
        emoji = '🧙';
        break;
      case 'Wolf':
        emoji = '🐺';
        break;
      case 'Tree Golem':
        emoji = '🌳';
        break;
      case 'Ice Wyrm':
        emoji = '🐉';
        break;
      case 'Lava Golem':
        emoji = '🔥';
        break;
      case 'Dark Lord':
      case 'Shadow Form':
        emoji = '👿';
        break;
      case 'Frozen Traveler':
      case 'Sir Brennan':
        emoji = '🛡️';
        break;
      default:
        emoji = '💬';
    }

    return Container(
      width: 70,
      height: 70,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: _getSpeakerColor(speaker).withValues(alpha: 0.15),
        border: Border.all(
          color: _getSpeakerColor(speaker).withValues(alpha: 0.4),
          width: 2,
        ),
      ),
      child: Center(child: Text(emoji, style: const TextStyle(fontSize: 32))),
    );
  }
}
