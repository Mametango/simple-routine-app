# Firebase設定ガイド

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を「my-routine-app」として作成
4. Google Analyticsは無効でOK

## 2. Authenticationの設定

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」を有効化
4. 「保存」をクリック

## 3. Firestore Databaseの設定

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番環境で開始」を選択
4. リージョンは「asia-northeast1 (Tokyo)」を選択
5. 「完了」をクリック

## 4. セキュリティルールの設定

Firestore Database → ルール で以下のルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // ユーザーのルーティン
      match /routines/{routineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 5. Webアプリの設定

1. プロジェクトの設定（⚙️）をクリック
2. 「全般」タブで「Webアプリを追加」をクリック
3. アプリ名を「My Routine Web App」として登録
4. 設定オブジェクトをコピー

## 6. firebase-config.jsの更新

コピーした設定オブジェクトで`firebase-config.js`を更新：

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

## 7. デプロイ

設定完了後、GitHubにプッシュしてデプロイ：

```bash
git add .
git commit -m "Add Firebase integration"
git push origin main
```

## 注意事項

- Firebaseの無料枠で十分な容量があります
- データはリアルタイムで同期されます
- 複数ブラウザ・デバイス間でデータが共有されます
- セキュリティルールにより、ユーザーは自分のデータのみアクセス可能です 