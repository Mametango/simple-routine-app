# 🔥 Firestoreセキュリティルール設定ガイド

## 問題の概要
現在、Firestoreで「Missing or insufficient permissions」エラーが発生しています。これは、セキュリティルールが適切に設定されていないことが原因です。

## 🔧 解決方法

### 1. Firebase Consoleでの設定

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/
   - プロジェクト「simple-routine-app-33cfc」を選択

2. **Firestore Databaseに移動**
   - 左メニューから「Firestore Database」をクリック
   - 「ルール」タブをクリック

3. **セキュリティルールを更新**
   以下のルールをコピーして貼り付けてください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // テスト用のコレクション（必要に応じて）
    match /test/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **ルールを公開**
   - 「公開」ボタンをクリック
   - 変更が反映されるまで数分待機

### 2. ルールの説明

#### 認証済みユーザーのみアクセス可能
```javascript
allow read, write: if request.auth != null && request.auth.uid == userId;
```

- `request.auth != null`: ユーザーがログインしている必要がある
- `request.auth.uid == userId`: 自分のデータのみアクセス可能

#### データ構造
```
users/
  {userId}/
    routines: []
    completions: []
    updatedAt: timestamp
    lastSyncDevice: string
    lastSyncTimestamp: string
```

### 3. テスト用ルール（開発時のみ）

開発中は一時的に以下のルールを使用することも可能です：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // 注意: 本番環境では使用しない
    }
  }
}
```

**⚠️ 注意**: このルールはすべてのユーザーがすべてのデータにアクセスできるため、本番環境では絶対に使用しないでください。

## 🔍 トラブルシューティング

### 1. ルールが反映されない場合
- ルールの公開後、数分待機
- ブラウザキャッシュをクリア
- アプリを再読み込み

### 2. 権限エラーが続く場合
- Firebase Consoleでルールが正しく保存されているか確認
- ユーザーが正しく認証されているか確認
- データベースのパスが正しいか確認

### 3. データベースが存在しない場合
- Firestore Databaseが作成されているか確認
- データベースの場所が設定されているか確認

## 📋 確認手順

1. **Firebase Consoleでルールを確認**
   - Firestore Database > ルール
   - 上記のルールが設定されているか確認

2. **アプリでテスト**
   - ルーティンを追加してみる
   - コンソールでエラーが解消されているか確認

3. **権限の確認**
   - ログイン状態を確認
   - ユーザーIDが正しく設定されているか確認

## 🚨 セキュリティのベストプラクティス

### 本番環境での推奨ルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 必要に応じて他のコレクションを追加
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### データ検証ルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId
        && validateUserData(resource.data);
    }
  }
}

function validateUserData(data) {
  return data.keys().hasAll(['routines', 'completions', 'updatedAt'])
    && data.routines is list
    && data.completions is list;
}
```

---

**最終更新:** 2024年12月
**重要:** セキュリティルールの変更後は必ずテストを行ってください。 