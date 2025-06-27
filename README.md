# シンプルルーティン管理アプリ

Firebaseを使用したクラウドベースのルーティン管理アプリです。

## 🚀 デモ

**ライブデモ**: https://mametango.github.io/simple-routine-app/

## ✅ セットアップ完了

Firebase設定が完了しました：
- **プロジェクト**: simple-routine-app-33cfc
- **認証ドメイン**: simple-routine-app-33cfc.firebaseapp.com
- **データベース**: Firestore Database
- **認証**: Email/Password

## 🔧 セットアップ手順（完了済み）

### 1. ✅ Firebaseプロジェクトの作成
- プロジェクト名: simple-routine-app-33cfc
- 作成完了

### 2. ✅ Authentication設定
- メール/パスワード認証を有効化
- 設定完了

### 3. ✅ Firestore Database設定
- データベース作成完了
- テストモードで開始

### 4. ✅ Webアプリの追加
- アプリ登録完了
- 設定適用済み

### 5. ✅ セキュリティルール設定
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🌟 機能

- ✅ ユーザー認証（メール/パスワード）
- ✅ ルーティンの作成・編集・削除
- ✅ 頻度設定（毎日・毎週・毎月・毎年・カスタム）
- ✅ 完了状況の管理
- ✅ リアルタイム同期
- ✅ セキュリティ対策
- ✅ マルチデバイス対応

## 🔐 セキュリティ機能

- 🔒 Firebase認証
- 🔒 パスワード強度チェック
- 🔒 入力検証（XSS対策）
- 🔒 データ暗号化
- 🔒 セッション管理
- 🔒 ユーザー分離

## 📱 使用方法

1. **新規登録**: メールアドレスとパスワードでアカウント作成
2. **ログイン**: 作成したアカウントでログイン
3. **ルーティン追加**: 「+」ボタンで新しいルーティンを追加
4. **頻度設定**: 毎日・毎週・毎月・毎年・カスタムから選択
5. **完了管理**: 完了ボタンで進捗を記録

## 🎯 頻度設定例

- **毎日**: 朝の運動、歯磨き
- **毎週**: 月・水・金のジム通い
- **毎月**: 15日の家計簿整理
- **毎年**: 12月25日のクリスマス準備
- **カスタム**: 3日おきの薬の補充

## 🔧 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **バックエンド**: Firebase
- **認証**: Firebase Authentication
- **データベース**: Firestore Database
- **ホスティング**: GitHub Pages

## 📊 データ構造

### ユーザーコレクション
```javascript
users/{userId} {
  email: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  routines: array,
  completions: array
}
```

### ルーティンデータ
```javascript
{
  id: string,
  title: string,
  description: string,
  frequency: string,
  frequencyDetails: object,
  createdAt: timestamp,
  userId: string
}
```

## 🚀 デプロイ

### GitHub Pages（現在のホスト）
- URL: https://mametango.github.io/simple-routine-app/
- 自動デプロイ: mainブランチにプッシュで自動更新

### Firebase Hosting（オプション）
1. Firebase CLIをインストール
2. `firebase init hosting`
3. `firebase deploy`

## 🔍 トラブルシューティング

### 認証エラー
- メールアドレスの形式を確認
- パスワードは6文字以上で英数字を含む必要があります

### データが保存されない
- インターネット接続を確認
- ブラウザのキャッシュをクリア

### 表示エラー
- ブラウザを最新版に更新
- 開発者ツールでエラーを確認

## 📈 今後の改善予定

- [ ] プッシュ通知機能
- [ ] データエクスポート機能
- [ ] 統計・分析機能
- [ ] テーマカスタマイズ
- [ ] オフライン機能強化

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！

---

**開発者**: AI Assistant  
**最終更新**: 2024年1月 