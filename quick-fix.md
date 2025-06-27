# 🚨 緊急修正: auth/configuration-not-found エラー

## ⚡ 5分で解決する手順

### 1. Firebase Consoleにアクセス
**URL**: https://console.firebase.google.com/project/simple-routine-app-33cfc

### 2. Authentication設定を有効化
1. 左メニューから「**Authentication**」をクリック
2. 「**始める**」または「**Get started**」をクリック
3. 「**Sign-in method**」タブをクリック
4. 「**メール/パスワード**」をクリック
5. 「**有効にする**」をクリック
6. 「**保存**」をクリック

### 3. ブラウザキャッシュをクリア
- **Windows**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 4. アプリを再読み込み
- https://mametango.github.io/simple-routine-app/

## ✅ 確認ポイント

設定完了後、以下を確認してください：

1. **Firebase Console**で「Authentication」→「Sign-in method」で「メール/パスワード」が有効になっている
2. **ブラウザコンソール**で「Firebase初期化成功」が表示される
3. **新規登録**でエラーが発生しない

## 🔧 代替手順（上記で解決しない場合）

### Firestore Databaseの設定も確認
1. Firebase Consoleで「**Firestore Database**」をクリック
2. 「**データベースを作成**」をクリック
3. 「**テストモードで開始**」を選択
4. ロケーションを選択（例：asia-northeast1）
5. 「**完了**」をクリック

### セキュリティルールの設定
Firestore Database → ルールで以下を設定：
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

## 📞 サポート

問題が解決しない場合は：
1. ブラウザをChromeに変更
2. シークレットモードで試行
3. 別のデバイスで試行

---

**作成日**: 2024年1月  
**対象エラー**: auth/configuration-not-found 