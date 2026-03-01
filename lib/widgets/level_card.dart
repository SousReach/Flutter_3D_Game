import 'package:flutter/material.dart';
import '../models/level_data.dart';

class LevelCard extends StatelessWidget {
  final LevelData level;
  final VoidCallback? onTap;

  const LevelCard({super.key, required this.level, this.onTap});

  @override
  Widget build(BuildContext context) {
    final isUnlocked = level.isUnlocked;
    final isBoss = level.id % 5 == 0;

    return GestureDetector(
      onTap: isUnlocked ? onTap : null,
      child: Container(
        decoration: BoxDecoration(
          gradient: isUnlocked
              ? LinearGradient(
                  colors: [
                    level.worldColor.withValues(alpha: 0.3),
                    level.worldColor.withValues(alpha: 0.1),
                  ],
                )
              : null,
          color: isUnlocked ? null : Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isUnlocked
                ? (isBoss
                      ? const Color(0xFFFFD700)
                      : level.worldColor.withValues(alpha: 0.5))
                : Colors.white12,
            width: isBoss ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!isUnlocked)
              const Icon(Icons.lock_rounded, color: Colors.white24, size: 28)
            else ...[
              Text(
                '${level.id}',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isBoss ? const Color(0xFFFFD700) : Colors.white,
                ),
              ),
              const SizedBox(height: 2),
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
}
