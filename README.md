# Simple Routine App

シンプルなルーティン管理アプリです。Firebaseを使用してクラウド同期とセキュリティを提供します。

## 🚀 アプリへのアクセス

- **メインアプリ**: https://mametango.github.io/simple-routine-app/
- **デバッグツール**: https://mametango.github.io/simple-routine-app/debug-firebase.html

## 🔧 機能

- ✅ メール/パスワード認証
- ✅ ルーティンの追加・編集・削除
- ✅ 頻度設定（毎日、週次、月次、年次、カスタム）
- ✅ 完了記録と進捗管理
- ✅ クラウド同期（Firebase）
- ✅ セキュリティ機能

## 🛠️ トラブルシューティング

### 認証エラーが発生する場合

1. **デバッグツールを使用**
   - https://mametango.github.io/simple-routine-app/debug-firebase.html
   - 各テストを実行して問題を特定

2. **Firebase Console設定確認**
   - https://console.firebase.google.com/project/simple-routine-app-33cfc
   - Authentication → Sign-in method → メール/パスワード → 有効にする

3. **詳細ガイド**
   - [Firebase設定ガイド](firebase-setup-guide.md)
   - [クイック修正手順](quick-fix.md)

## 📱 使用方法

1. アプリにアクセス
2. メールアドレスとパスワードで新規登録
3. ルーティンを追加
4. 完了時にチェックボックスをクリック
5. 進捗を確認

## 🔒 セキュリティ

- パスワードハッシュ化
- XSS対策
- 入力検証
- セッション管理
- データ暗号化

## 🌐 技術仕様

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **バックエンド**: Firebase Authentication, Firestore
- **ホスティング**: GitHub Pages
- **セキュリティ**: Firebase Security Rules

## 📞 サポート

問題が発生した場合は：
1. デバッグツールで確認
2. ブラウザキャッシュをクリア（Ctrl+Shift+R）
3. 別のブラウザで試行
4. 詳細ガイドを参照

---

**最終更新**: 2024年1月  
**バージョン**: 2.0.0 