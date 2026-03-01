import 'package:flutter_test/flutter_test.dart';
import 'package:game_flutter/main.dart';

void main() {
  testWidgets('App loads successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const BlockQuestApp());
    // Verify the app renders
    expect(find.text('⚔️ BlockQuest'), findsOneWidget);
  });
}
