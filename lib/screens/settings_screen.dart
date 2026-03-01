import 'package:flutter/material.dart';
import '../models/game_state.dart';

class SettingsScreen extends StatefulWidget {
  final GameState gameState;
  const SettingsScreen({super.key, required this.gameState});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _soundEnabled = true;
  bool _musicEnabled = true;
  double _sensitivity = 0.5;

  @override
  Widget build(BuildContext context) {
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
                        '⚙️ Settings',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFFFD700),
                        ),
                      ),
                    ),
                    const SizedBox(width: 48),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Settings items
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  children: [
                    _buildSettingsCard(
                      'Sound Effects',
                      Icons.volume_up_rounded,
                      Switch(
                        value: _soundEnabled,
                        onChanged: (v) => setState(() => _soundEnabled = v),
                        activeColor: const Color(0xFFFFD700),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildSettingsCard(
                      'Music',
                      Icons.music_note_rounded,
                      Switch(
                        value: _musicEnabled,
                        onChanged: (v) => setState(() => _musicEnabled = v),
                        activeColor: const Color(0xFFFFD700),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildSettingsCard(
                      'Look Sensitivity',
                      Icons.touch_app_rounded,
                      SizedBox(
                        width: 150,
                        child: Slider(
                          value: _sensitivity,
                          onChanged: (v) => setState(() => _sensitivity = v),
                          activeColor: const Color(0xFFFFD700),
                          inactiveColor: Colors.white12,
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),

                    // Game info
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '📊 Game Progress',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white.withValues(alpha: 0.8),
                            ),
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            'Total Stars',
                            '⭐ ${widget.gameState.getTotalStars()} / 60',
                          ),
                          _buildInfoRow(
                            'Crystal Shards',
                            '💎 ${widget.gameState.shardsCollected} / 5',
                          ),
                          _buildInfoRow(
                            'Levels Completed',
                            '${widget.gameState.unlockedLevels.where((u) => u).length - 1} / 20',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Reset button
                    Center(
                      child: ElevatedButton.icon(
                        onPressed: () => _showResetDialog(),
                        icon: const Icon(Icons.delete_forever_rounded),
                        label: const Text('Reset All Progress'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red.withValues(alpha: 0.2),
                          foregroundColor: Colors.red,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: Colors.red.withValues(alpha: 0.5),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsCard(String title, IconData icon, Widget trailing) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFFFFD700), size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(color: Colors.white, fontSize: 15),
            ),
          ),
          trailing,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: 13,
            ),
          ),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 13),
          ),
        ],
      ),
    );
  }

  void _showResetDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a2e),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          '⚠️ Reset Progress?',
          style: TextStyle(color: Color(0xFFFFD700)),
        ),
        content: const Text(
          'This will delete all your progress, stars, and unlocked levels. This cannot be undone!',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Cancel',
              style: TextStyle(color: Colors.white54),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              await widget.gameState.reset();
              if (mounted) {
                Navigator.pop(context);
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
  }
}
