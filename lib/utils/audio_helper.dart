// Audio helper - placeholder for future audio implementation
// Can be expanded with audioplayers package

class AudioHelper {
  static bool soundEnabled = true;
  static bool musicEnabled = true;

  static void playSound(String soundName) {
    if (!soundEnabled) return;
    // TODO: Implement with audioplayers package
    // AudioPlayer().play(AssetSource('audio/$soundName'));
  }

  static void playMusic(String trackName) {
    if (!musicEnabled) return;
    // TODO: Implement background music
  }

  static void stopMusic() {
    // TODO: Stop background music
  }

  static void toggleSound() {
    soundEnabled = !soundEnabled;
  }

  static void toggleMusic() {
    musicEnabled = !musicEnabled;
  }
}
