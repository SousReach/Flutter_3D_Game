class PlayerData {
  int health;
  int maxHealth;
  List<String> inventory;
  String currentWeapon;

  PlayerData({
    this.health = 3,
    this.maxHealth = 3,
    List<String>? inventory,
    this.currentWeapon = 'Wooden Sword',
  }) : inventory = inventory ?? [];

  void addItem(String item) {
    inventory.add(item);
  }

  bool hasItem(String item) {
    return inventory.contains(item);
  }

  void removeItem(String item) {
    inventory.remove(item);
  }
}
