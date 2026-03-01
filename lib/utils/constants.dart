import 'package:flutter/material.dart';

class AppConstants {
  // App info
  static const String appName = 'BlockQuest: The Crystal Saga';
  static const String appVersion = '1.0.0';

  // Colors
  static const Color primaryColor = Color(0xFF1a1a2e);
  static const Color secondaryColor = Color(0xFF16213e);
  static const Color accentColor = Color(0xFFFFD700);
  static const Color accentGlow = Color(0xFFFFA000);

  // World Colors
  static const Color forestColor = Color(0xFF4CAF50);
  static const Color iceColor = Color(0xFF42A5F5);
  static const Color volcanicColor = Color(0xFFFF7043);
  static const Color fortressColor = Color(0xFF7E57C2);

  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0BEC5);
  static const Color textGold = Color(0xFFFFD700);

  // World names
  static const List<String> worldNames = [
    '🌲 Enchanted Forest',
    '❄️ Frozen Mountains',
    '🌋 Volcanic Depths',
    '🏰 Shadow Fortress',
  ];

  static const List<Color> worldColors = [
    forestColor,
    iceColor,
    volcanicColor,
    fortressColor,
  ];

  // Get world index from level number
  static int getWorldIndex(int level) {
    return ((level - 1) / 5).floor();
  }

  // Get world color from level number
  static Color getWorldColor(int level) {
    return worldColors[getWorldIndex(level)];
  }
}
