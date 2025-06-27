# Firebase設定トラブルシューティングガイド

## 🔧 現在の設定状況

**プロジェクト**: simple-routine-app-33cfc  
**認証ドメイン**: simple-routine-app-33cfc.firebaseapp.com  
**API Key**: AIzaSyBmkRs7f2a6ejf-qXJZ2F-jMWGnAGdvY0Q

## ❌ エラーの原因と解決方法

### 1. 400 Bad Request エラー

**原因**: Firebase Authenticationが有効になっていない可能性

**解決方法**:
1. [Firebase Console](https://console.firebase.google.com/project/simple-routine-app-33cfc) にアクセス
2. 左メニューから「Authentication」を選択
3. 「Sign-in method」タブをクリック
4. 「メール/パスワード」が有効になっているか確認
5. 無効の場合は「有効にする」をクリック

### 2. ブラウザキャッシュの問題

**解決方法**:
1. ブラウザで `Ctrl + Shift + R` (ハードリフレッシュ)
2. または `Ctrl + F5` (キャッシュクリア)
3. 開発者ツール（F12）で「Application」タブ
4. 「Storage」→「Clear storage」をクリック

### 3. Firestore Databaseの設定

**確認事項**:
1. [Firebase Console](https://console.firebase.google.com/project/simple-routine-app-33cfc) で「Firestore Database」
2. データベースが作成されているか確認
3. セキュリティルールを確認

**推奨セキュリティルール**:
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

## 🔍 デバッグ手順

### 1. ブラウザの開発者ツールで確認

1. `F12` キーで開発者ツールを開く
2. 「Console」タブを確認
3. 以下のメッセージを探す：
   - ✅ Firebase初期化成功
   - ✅ ログイン成功
   - ❌ エラーメッセージ

### 2. ネットワークタブで確認

1. 開発者ツールの「Network」タブ
2. 認証試行時のリクエストを確認
3. エラーの詳細を確認

### 3. Firebase Consoleで確認

1. [Firebase Console](https://console.firebase.google.com/project/simple-routine-app-33cfc)
2. 「Authentication」→「Users」でユーザー一覧
3. 「Firestore Database」→「Data」でデータ確認

## 🚀 動作確認手順

### 1. 基本的な動作確認

1. アプリにアクセス: https://mametango.github.io/simple-routine-app/
2. 開発者ツール（F12）でコンソールを確認
3. 「Firebase初期化成功」メッセージを確認

### 2. 認証テスト

1. 新しいメールアドレスで新規登録
2. パスワード: 6文字以上、英数字含む
3. 登録成功メッセージを確認

### 3. データ保存テスト

1. ルーティンを追加
2. Firebase Consoleでデータ確認
3. 複数デバイスで同期確認

## 📞 サポート

### よくあるエラーコード

- `auth/user-not-found`: ユーザーが存在しない（新規登録が必要）
- `auth/wrong-password`: パスワードが間違っている
- `auth/invalid-email`: メールアドレス形式が無効
- `auth/weak-password`: パスワードが弱い
- `auth/email-already-in-use`: メールアドレスが既に使用中

### 追加サポート

問題が解決しない場合は以下を確認：
1. ブラウザのバージョン（Chrome推奨）
2. インターネット接続状況
3. ファイアウォール設定
4. ブラウザ拡張機能の影響

---

**最終更新**: 2024年1月  
**Firebaseプロジェクト**: simple-routine-app-33cfc 