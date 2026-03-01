class StoryDialogue {
  final String speaker;
  final String text;
  final String? emotion; // 'normal', 'happy', 'angry', 'sad', 'surprised'

  StoryDialogue({required this.speaker, required this.text, this.emotion});
}

class StoryData {
  static Map<int, List<StoryDialogue>> getPreLevelStory() {
    return {
      // ===== WORLD 1: ENCHANTED FOREST =====
      1: [
        StoryDialogue(
          speaker: '???',
          text: 'Wake up... You must wake up, young one.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'Wh-where am I? What happened?',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Elder Aldric',
          text: 'You are in the village of Oakhaven. I am Elder Aldric.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Elder Aldric',
          text:
              'A great darkness has fallen upon our world. The Crystal of Light has been SHATTERED.',
          emotion: 'sad',
        ),
        StoryDialogue(
          speaker: 'Elder Aldric',
          text:
              'Its five shards have been scattered across the land. Without them, darkness will consume everything.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'What can I do to help?',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Elder Aldric',
          text:
              'You must find the shards, Alex. You are the only one who can. Start by walking to the portal ahead.',
          emotion: 'normal',
        ),
      ],
      2: [
        StoryDialogue(
          speaker: 'Elder Aldric',
          text:
              'Beyond this forest path lies the old bridge. Be careful — the forest has changed since the crystal broke.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'Changed how?',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Elder Aldric',
          text:
              'Trees have fallen, blocking the way. You will need to find a path around them.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Elder Aldric',
          text: 'Take this sword. It is old, but it will protect you.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'Thank you, Elder. I won\'t let you down.',
          emotion: 'normal',
        ),
      ],
      3: [
        StoryDialogue(
          speaker: 'Alex',
          text: 'The elder mentioned a hollow tree somewhere in this forest...',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'He said there\'s a key hidden inside it. I need to find it.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'The forest is getting denser. I should look carefully.',
          emotion: 'normal',
        ),
      ],
      4: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'A river! The bridge looks unstable... I\'ll have to jump across the stones.',
          emotion: 'surprised',
        ),
        StoryDialogue(speaker: '???', text: '*howl*', emotion: 'normal'),
        StoryDialogue(
          speaker: 'Alex',
          text: 'What was that?! A wolf? Wait... it doesn\'t seem aggressive.',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Hey there, buddy. You want to come with me? Alright then, let\'s cross together.',
          emotion: 'happy',
        ),
      ],
      5: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'This clearing... something feels wrong. The air is thick with dark energy.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*growls and backs away*',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Easy, boy. I see it too — that massive creature made of wood and vines.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Tree Golem',
          text: 'WHO ENTERS MY DOMAIN?! LEAVE NOW OR FACE MY WRATH!',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'I can see a crystal shard glowing inside it! I have to fight!',
          emotion: 'normal',
        ),
      ],

      // ===== WORLD 2: FROZEN MOUNTAINS =====
      6: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'According to the map, the next shard is in the Frozen Mountains.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'It\'s getting colder... much colder. I can see my breath.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*whimpers but stays close*',
          emotion: 'sad',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Don\'t worry, buddy. We\'ll find shelter up there. Let\'s keep climbing.',
          emotion: 'normal',
        ),
      ],
      7: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'A cave entrance! Maybe we can get through the mountain this way.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'It\'s so dark in here... and the walls are pure ice. Beautiful, but dangerous.',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*sniffs the air and growls*',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'What is it, boy? Something\'s in here with us, isn\'t it?',
          emotion: 'normal',
        ),
      ],
      8: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'We made it through the caves, but... a blizzard! I can barely see!',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'There might be shelters along the path. We need to move fast between them.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*barks and runs ahead, showing the way*',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'Good boy! Lead the way!',
          emotion: 'happy',
        ),
      ],
      9: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'A frozen lake stretches before us. It looks solid, but I\'m not so sure...',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'I can see patches where the ice is thicker. I\'ll stick to those.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Frozen Traveler',
          text: '...h-help... trapped... under the ice...',
          emotion: 'sad',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'Someone\'s trapped! Hold on, I\'ll find a way to free you!',
          emotion: 'surprised',
        ),
      ],
      10: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'The mountain peak... and there it is. A massive dragon made of ice.',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Ice Wyrm',
          text: '*ROOOAAAAARRR*',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'I can see the crystal shard frozen in the ice behind it!',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*howls defiantly at the dragon*',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'Together, boy. Let\'s take this thing down!',
          emotion: 'normal',
        ),
      ],

      // ===== WORLD 3: VOLCANIC DEPTHS =====
      11: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'The map says the third shard is... underground? Deep beneath these mountains.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'There\'s an entrance to a cave system here. The air is warm... too warm.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*pants heavily from the heat*',
          emotion: 'sad',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'I know, buddy. Stay close. Let\'s find that shard and get out.',
          emotion: 'normal',
        ),
      ],
      12: [
        StoryDialogue(
          speaker: 'Alex',
          text: 'Lava! Actual rivers of lava flowing through these tunnels!',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'There are stone bridges crossing over them. I need to be careful.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'One wrong step and... I don\'t want to think about it.',
          emotion: 'normal',
        ),
      ],
      13: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Wait — these walls are covered in crystals! This must be an ancient mine.',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'I can see carvings on the walls... "The Crystal of Light was forged within these depths."',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'So this is where it all began. The crystal was originally created here.',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'I should collect some of these crystals. They might be useful.',
          emotion: 'normal',
        ),
      ],
      14: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'An ancient forge! The carvings say this is where the Crystal of Light was first crafted.',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Maybe I can use it to upgrade my sword. The blade is getting dull.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'I need to activate the forge somehow... there must be switches or mechanisms.',
          emotion: 'normal',
        ),
      ],
      15: [
        StoryDialogue(
          speaker: 'Alex',
          text: 'The ground is shaking... something enormous is moving ahead.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Lava Golem',
          text: '*emerges from the magma with a thunderous roar*',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'A creature made of living lava! The shard must be inside it!',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'My new iron sword should be strong enough. Let\'s go!',
          emotion: 'normal',
        ),
      ],

      // ===== WORLD 4: SHADOW FORTRESS =====
      16: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'There it is... the Shadow Fortress. The last two shards are inside.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'The walls are massive. How do we get in?',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*whimpers and paws at a weak point in the wall*',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Good eye, boy! That section looks crumbled. We can break through!',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'Wait — guards! Skeleton warriors. This is going to be tough.',
          emotion: 'normal',
        ),
      ],
      17: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'We\'re inside, but... this is a maze. The dungeon stretches in every direction.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*sniffs the air and whimpers*',
          emotion: 'sad',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'What is it? Do you smell something? Lead the way, boy!',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'I hear ghostly whispers echoing through these halls... Stay focused.',
          emotion: 'normal',
        ),
      ],
      18: [
        StoryDialogue(
          speaker: 'Alex',
          text: 'The throne room! This place is enormous.',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'I can see the Dark Lord\'s throne at the far end. But where is he?',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Dark Lord',
          text:
              'So... the little hero has come at last. I\'ve been expecting you.',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Give back the crystal shards! The world is dying without them!',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Dark Lord',
          text:
              'HA! The world will be REBORN — under MY rule. Come, face my elite guard first.',
          emotion: 'angry',
        ),
      ],
      19: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'It\'s just you and me now, Dark Lord. No more guards. No more tricks.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Dark Lord',
          text: 'You are brave, child. But bravery will not save you.',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Dark Lord',
          text:
              'I shattered the crystal because its light was a PRISON! Darkness is freedom!',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'You\'re wrong. Light isn\'t a prison — it\'s hope. And I\'m taking that shard back!',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*howls with determination*',
          emotion: 'happy',
        ),
      ],
      20: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'I have four shards now. The fifth must be somewhere in this chamber.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Dark Lord',
          text: '...You... think you\'ve won? FOOL!',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Dark Lord',
          text: '*transforms into a massive shadow creature*',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Shadow Form',
          text: 'I AM THE DARKNESS ITSELF! YOU CANNOT DESTROY ME!',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'The shards are glowing! I can feel their power!',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Elder Aldric',
          text:
              '(voice in your mind) Unite the shards, Alex! The Crystal of Light will give you strength!',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'This ends NOW! For Oakhaven! For everyone!',
          emotion: 'angry',
        ),
      ],
    };
  }

  static Map<int, List<StoryDialogue>> getPostLevelStory() {
    return {
      1: [
        StoryDialogue(
          speaker: 'Elder Aldric',
          text:
              'Well done! You made it through. The journey ahead will be much harder.',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'I\'m ready. Where do I go next?',
          emotion: 'normal',
        ),
      ],
      5: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'The first Crystal Shard! It\'s warm to the touch... I can feel its power.',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*barks happily*',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'One down, four to go. The map shows the next shard is in the Frozen Mountains.',
          emotion: 'normal',
        ),
      ],
      10: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'The second shard! Two down! The ice is already starting to melt around us.',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Frozen Traveler',
          text:
              'Thank you for freeing me! I am Sir Brennan, a knight of the old kingdom.',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Sir Brennan',
          text:
              'The third shard is deep underground, in the volcanic depths. Be careful, young hero.',
          emotion: 'normal',
        ),
      ],
      15: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Three shards collected! The sword feels stronger after the forge upgrade.',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Only two more shards remain... and they\'re both in the Shadow Fortress.',
          emotion: 'normal',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'This is it. The final battle awaits.',
          emotion: 'normal',
        ),
      ],
      19: [
        StoryDialogue(
          speaker: 'Alex',
          text:
              'Four shards! But the Dark Lord... he\'s not defeated. He\'s transforming!',
          emotion: 'surprised',
        ),
        StoryDialogue(
          speaker: 'Dark Lord',
          text: 'You think a mere sword can stop TRUE DARKNESS?!',
          emotion: 'angry',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'Where\'s the fifth shard?! I need to find it — NOW!',
          emotion: 'normal',
        ),
      ],
      20: [
        StoryDialogue(
          speaker: 'Alex',
          text: 'It\'s... over. The Crystal of Light is restored!',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: '*holds up the restored crystal as light floods the chamber*',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Wolf',
          text: '*howls triumphantly*',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Elder Aldric',
          text:
              '(voice) You did it, Alex. The darkness is gone. The world is saved.',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: 'Alex',
          text: 'We did it together — all of us. Let\'s go home, buddy.',
          emotion: 'happy',
        ),
        StoryDialogue(
          speaker: '',
          text:
              '✨ THE END ✨\n\nThank you for playing BlockQuest: The Crystal Saga!',
          emotion: 'normal',
        ),
      ],
    };
  }
}
