# Firestoreセキュリティルール デバッグ・修正ガイド

## 🔍 現在の問題
```
❌ Firestore接続エラー: Missing or insufficient permissions.
エラー詳細: {"code":"permission-denied","name":"FirebaseError"}
```

## 🛠️ 解決手順

### 1. Firebase Consoleでセキュリティルールを確認

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `simple-routine-app-33cfc` を選択
3. 左メニューから「Firestore Database」をクリック
4. 「ルール」タブをクリック

### 2. 現在のルールを確認

現在のルールが以下のようになっている可能性があります：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // すべてのアクセスを拒否
    }
  }
}
```

### 3. 修正されたルール

以下のルールに変更してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // テストコレクション（デバッグ用）
    match /test/{document=**} {
      allow read, write: if true;
    }
    
    // ユーザーデータ
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // ユーザーのサブコレクション
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // その他のコレクション（必要に応じて）
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. ルールの説明

- **`/test/{document=**}`**: デバッグ用のテストコレクション（すべてのアクセスを許可）
- **`/users/{userId}`**: ユーザー固有のデータ（認証済みユーザーのみアクセス可能）
- **`/{document=**}`**: その他のコレクション（認証済みユーザーのみアクセス可能）

### 5. ルールの適用

1. ルールを編集
2. 「公開」ボタンをクリック
3. 数分待ってからデバッグツールで再テスト

### 6. 段階的なテスト

1. **テストコレクション**: `/test` への読み書きテスト
2. **ユーザー認証**: 匿名認証の実行
3. **ユーザーデータ**: `/users/{userId}` へのアクセステスト
4. **実際のデータ保存**: ルーティンデータの保存テスト

## 🔧 トラブルシューティング

### 権限エラーが続く場合

1. **認証状態の確認**
   ```javascript
   // デバッグツールで確認
   firebase.auth().currentUser
   ```

2. **ルールの構文チェック**
   - Firebase Consoleでルールの構文エラーがないか確認

3. **キャッシュのクリア**
   - ブラウザのキャッシュをクリア
   - ページを再読み込み

### セキュリティ上の注意

- 本番環境では `allow read, write: if true;` は使用しない
- 適切な認証と認可のルールを設定する
- 必要最小限の権限のみを付与する

## 📋 デバッグ手順

1. **Firebase初期化確認** ✅
2. **認証テスト** (匿名認証を実行)
3. **Firestore接続テスト** (ルール修正後)
4. **セキュリティルールテスト**
5. **データ保存テスト**
6. **データ読み込み・表示**

## 🎯 期待される結果

ルール修正後、以下のような結果が期待されます：

```
✅ Firebase初期化成功
✅ 匿名認証成功
✅ Firestore接続正常
✅ セキュリティルールテスト成功
✅ データ保存テスト成功
✅ データ読み込み・表示成功
``` 