# Firebase設定完全ガイド

## 🚀 手順1: Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. Googleアカウントでログイン
3. 「プロジェクトを追加」をクリック
4. プロジェクト名: `my-routine-app`
5. Google Analytics: 無効（チェックを外す）
6. 「プロジェクトを作成」をクリック

## 🔐 手順2: Authentication設定

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」の「編集」をクリック
4. 「有効にする」にチェック
5. 「保存」をクリック

## 🗄️ 手順3: Firestore Database設定

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番環境で開始」を選択
4. リージョン: `asia-northeast1 (Tokyo)`
5. 「完了」をクリック

## 🔒 手順4: セキュリティルール設定

1. Firestore Database → 「ルール」タブをクリック
2. 以下のルールに置き換え:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /routines/{routineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. 「公開」をクリック

## 🌐 手順5: Webアプリ設定

1. プロジェクトの設定（⚙️）をクリック
2. 「全般」タブで「Webアプリを追加」をクリック
3. アプリ名: `My Routine Web App`
4. 「アプリを登録」をクリック
5. 設定オブジェクトをコピー

## ⚙️ 手順6: 設定ファイルの更新

1. コピーした設定で`firebase-config.js`を更新:

```javascript
const firebaseConfig = {
    apiKey: "あなたのAPIキー",
    authDomain: "あなたのプロジェクトID.firebaseapp.com",
    projectId: "あなたのプロジェクトID",
    storageBucket: "あなたのプロジェクトID.appspot.com",
    messagingSenderId: "あなたのメッセージングID",
    appId: "あなたのアプリID"
};
```

## 📤 手順7: GitHubに更新

設定完了後、GitHubにプッシュ:

```bash
git add firebase-config.js
git commit -m "Update Firebase configuration"
git push origin main
```

## ✅ 確認方法

1. アプリにアクセス: https://Mametango.github.io/my-routine-app
2. 新規登録でメールアドレスとパスワードを入力
3. ログインが成功すれば設定完了

## 🆘 トラブルシューティング

### エラー: "Firebase: Error (auth/invalid-api-key)"
- APIキーが正しく設定されているか確認
- firebase-config.jsの設定を再確認

### エラー: "Firebase: Error (auth/operation-not-allowed)"
- Authenticationでメール/パスワードが有効になっているか確認

### エラー: "Firebase: Error (permission-denied)"
- Firestoreのセキュリティルールを確認
- ルールが正しく公開されているか確認

## 📞 サポート

設定で問題が発生した場合は、以下を確認してください：
1. ブラウザの開発者ツール（F12）でエラーメッセージを確認
2. Firebase Consoleで設定が正しく保存されているか確認
3. セキュリティルールが正しく公開されているか確認 