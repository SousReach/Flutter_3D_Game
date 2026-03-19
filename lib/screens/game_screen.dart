import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../models/game_state.dart';
import '../models/story_data.dart';
import 'story_screen.dart';

class GameScreen extends StatefulWidget {
  final int levelNumber;
  final GameState gameState;

  const GameScreen({
    super.key,
    required this.levelNumber,
    required this.gameState,
  });

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  late WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    final htmlContent = await _buildGameHtml();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..addJavaScriptChannel(
        'FlutterChannel',
        onMessageReceived: (message) {
          _handleGameMessage(message.message);
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            setState(() => _isLoading = false);
          },
        ),
      )
      ..loadHtmlString(htmlContent);
  }

  Future<String> _buildGameHtml() async {
    // Load all JS files
    final threeJs = await rootBundle.loadString('assets/web/js/three.min.js');
    final controlsJs = await rootBundle.loadString('assets/web/js/controls.js');
    final worldJs = await rootBundle.loadString('assets/web/js/world.js');
    final enemyJs = await rootBundle.loadString('assets/web/js/enemy.js');
    final playerJs = await rootBundle.loadString('assets/web/js/player.js');
    final gameJsRaw = await rootBundle.loadString('assets/web/js/game.js');

    // Patch game.js to use our level number instead of URL params
    final gameJs = gameJsRaw.replaceAll(
      "const level = parseInt(params.get('level')) || 1;",
      "const level = ${widget.levelNumber};",
    );

    // Build HTML directly (avoids Windows \r\n replacement issues)
    return '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>BlockQuest</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
        canvas { display: block; width: 100%; height: 100%; touch-action: none; }

        /* D-Pad */
        #dpad {
            position: fixed; left: 20px; bottom: 20px; z-index: 20;
            width: 140px; height: 140px;
        }
        .dpad-btn {
            position: absolute; width: 44px; height: 44px; border-radius: 8px;
            background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4);
            color: white; font-size: 18px; font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            user-select: none; -webkit-user-select: none; cursor: pointer;
            touch-action: none;
        }
        .dpad-btn:active { background: rgba(255,215,0,0.5); }
        #dpad-up    { top: 0; left: 48px; }
        #dpad-down  { bottom: 0; left: 48px; }
        #dpad-left  { top: 48px; left: 0; }
        #dpad-right { top: 48px; right: 0; }

        #action-buttons {
            position: fixed; right: 20px; bottom: 30px; z-index: 20; display: flex; gap: 15px;
        }
        .action-btn {
            width: 60px; height: 60px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.2);
            color: white; font-size: 12px; font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            user-select: none; -webkit-user-select: none; cursor: pointer;
            touch-action: none;
        }
        .action-btn:active { background: rgba(255,215,0,0.5); }

        #crosshair {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 20px; height: 20px; z-index: 5; pointer-events: none;
        }
        #crosshair::before, #crosshair::after {
            content: ''; position: absolute; background: rgba(255,255,255,0.6);
        }
        #crosshair::before { width: 2px; height: 100%; left: 50%; transform: translateX(-50%); }
        #crosshair::after { width: 100%; height: 2px; top: 50%; transform: translateY(-50%); }

        #hud {
            position: fixed; top: 15px; left: 15px; z-index: 10;
            color: white; font-family: 'Courier New', monospace; font-size: 14px;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        }
        #health-bar { display: flex; gap: 4px; margin-top: 5px; }
        .heart { font-size: 20px; }
        #level-info {
            position: fixed; top: 15px; right: 15px; z-index: 10;
            color: white; font-family: 'Courier New', monospace; font-size: 14px;
            text-align: right; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        }
        #objective {
            position: fixed; top: 50px; left: 50%; transform: translateX(-50%); z-index: 10;
            color: #FFD700; font-family: 'Courier New', monospace; font-size: 13px;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
            opacity: 0; transition: opacity 0.5s;
        }
        #debug {
            position: fixed; bottom: 5px; left: 50%; transform: translateX(-50%); z-index: 15;
            color: #0f0; font-family: monospace; font-size: 10px;
            text-shadow: 1px 1px 2px black; pointer-events: none;
        }

        #loading {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #1a1a2e; display: flex; flex-direction: column;
            align-items: center; justify-content: center; z-index: 100;
            color: white; font-family: 'Courier New', monospace;
        }
        #loading h1 { font-size: 28px; color: #FFD700; margin-bottom: 20px; }
        #loading-bar {
            width: 200px; height: 6px; background: rgba(255,255,255,0.2);
            border-radius: 3px; overflow: hidden;
        }
        #loading-fill { width: 0%; height: 100%; background: #FFD700; transition: width 0.3s; }
    </style>
</head>
<body>
    <div id="loading">
        <h1>⚔️ BlockQuest</h1>
        <p>Loading level...</p>
        <div id="loading-bar"><div id="loading-fill"></div></div>
    </div>

    <div id="hud">
        <div id="health-bar">
            <span class="heart">❤️</span>
            <span class="heart">❤️</span>
            <span class="heart">❤️</span>
        </div>
        <div id="items-collected" style="margin-top:5px;">💎 0 / 0</div>
    </div>
    <div id="level-info">
        <div id="level-name">Level ${widget.levelNumber}</div>
        <div id="world-name"></div>
    </div>
    <div id="objective"></div>
    <div id="crosshair"></div>
    <div id="debug"></div>

    <div id="dpad">
        <div class="dpad-btn" id="dpad-up">▲</div>
        <div class="dpad-btn" id="dpad-down">▼</div>
        <div class="dpad-btn" id="dpad-left">◄</div>
        <div class="dpad-btn" id="dpad-right">►</div>
    </div>
    <div id="action-buttons">
        <div class="action-btn" id="btn-jump">JUMP</div>
        <div class="action-btn" id="btn-action">⚔️</div>
    </div>

    <script>$threeJs</script>
    <script>$controlsJs</script>
    <script>$worldJs</script>
    <script>$enemyJs</script>
    <script>$playerJs</script>
    <script>$gameJs</script>
</body>
</html>
''';
  }

  void _handleGameMessage(String message) {
    try {
      final data = jsonDecode(message);
      if (data['type'] == 'level_complete') {
        final level = data['level'] as int;
        final gems = data['gems'] as int;
        final totalGems = data['totalGems'] as int;

        widget.gameState.completeLevel(level, gems, totalGems);
        widget.gameState.currentLevel = level + 1;
        widget.gameState.save();

        _onLevelComplete(level, gems, totalGems);
      }
    } catch (e) {
      debugPrint('Error handling game message: \$e');
    }
  }

  void _onLevelComplete(int level, int gems, int totalGems) {
    int stars = 1;
    if (totalGems > 0) {
      double ratio = gems / totalGems;
      if (ratio >= 0.5) stars = 2;
      if (ratio >= 1.0) stars = 3;
    }

    final postStory = StoryData.getPostLevelStory()[level];

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: const Color(0xFF1a1a2e),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFFFD700), width: 2),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                '🎉 Level Complete!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFFD700),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (i) {
                  return Icon(
                    i < stars ? Icons.star_rounded : Icons.star_border_rounded,
                    color: i < stars ? const Color(0xFFFFD700) : Colors.white24,
                    size: 36,
                  );
                }),
              ),
              const SizedBox(height: 12),
              Text(
                '💎 Gems: \$gems / \$totalGems',
                style: const TextStyle(color: Colors.white, fontSize: 16),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.pop(context);
                    },
                    child: const Text(
                      'Back',
                      style: TextStyle(color: Colors.white54),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      if (postStory != null && postStory.isNotEmpty) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => StoryScreen(
                              dialogues: postStory,
                              levelNumber: level,
                              gameState: widget.gameState,
                              isPostLevel: true,
                            ),
                          ),
                        );
                      } else if (level < 20) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => GameScreen(
                              levelNumber: level + 1,
                              gameState: widget.gameState,
                            ),
                          ),
                        );
                      } else {
                        Navigator.pop(context);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFD700),
                      foregroundColor: Colors.black,
                    ),
                    child: Text(
                      postStory != null
                          ? 'Continue Story'
                          : (level < 20 ? 'Next Level' : 'Finish'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            Container(
              color: const Color(0xFF1a1a2e),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '⚔️ Loading...',
                      style: TextStyle(
                        fontSize: 24,
                        color: Color(0xFFFFD700),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 16),
                    CircularProgressIndicator(color: Color(0xFFFFD700)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
