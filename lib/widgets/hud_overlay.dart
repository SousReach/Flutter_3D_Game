import 'package:flutter/material.dart';

class HudOverlay extends StatelessWidget {
  final int health;
  final int maxHealth;
  final int gemsCollected;
  final int totalGems;
  final String levelName;

  const HudOverlay({
    super.key,
    this.health = 3,
    this.maxHealth = 3,
    this.gemsCollected = 0,
    this.totalGems = 0,
    this.levelName = '',
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Health hearts
            Row(
              children: List.generate(maxHealth, (i) {
                return Text(
                  i < health ? '❤️' : '🖤',
                  style: const TextStyle(fontSize: 20),
                );
              }),
            ),
            const Spacer(),
            // Items
            Text(
              '💎 $gemsCollected / $totalGems',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
                shadows: [Shadow(color: Colors.black, blurRadius: 4)],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
