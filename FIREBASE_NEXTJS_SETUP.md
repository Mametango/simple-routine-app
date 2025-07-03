# Firebase Next.js セットアップガイド

## 概要
このNext.jsアプリはFirebase認証とFirestoreデータベースを使用しています。

## 必要な設定

### 1. Firebase Admin SDK の設定

`.env.local` ファイルをプロジェクトルートに作成し、以下の環境変数を設定してください：

```env
FIREBASE_PROJECT_ID=my-routine-app-a0708
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@my-routine-app-a0708.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### 2. Firebase Console での設定

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `my-routine-app-a0708` を選択
3. 左メニューから「プロジェクトの設定」をクリック
4. 「サービスアカウント」タブを選択
5. 「新しい秘密鍵を生成」をクリック
6. ダウンロードしたJSONファイルから以下の値を取得：
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### 3. Authentication の設定

1. Firebase Console で「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」を有効化
4. 「Google」プロバイダーを有効化（オプション）

### 4. Firestore Database の設定

1. Firebase Console で「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番環境で開始」を選択
4. リージョン: `asia-northeast1 (Tokyo)`
5. 「完了」をクリック

### 5. セキュリティルールの設定

Firestore Database → 「ルール」タブで以下のルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /routines/{routineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /todos/{todoId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 機能

### 認証機能
- メール/パスワード認証
- Google認証（ポップアップ）
- 自動ログイン状態の保持

### データ同期
- ルーティンとTodoの作成・編集・削除
- リアルタイムデータ同期
- オフライン対応（ローカルストレージフォールバック）

### セキュリティ
- Firebase ID Token による認証
- ユーザー固有のデータアクセス制御
- サーバーサイドでのトークン検証

## トラブルシューティング

### よくあるエラー

#### 「Firebase Admin SDK の初期化に失敗しました」
- `.env.local` ファイルが正しく設定されているか確認
- Firebase Console でサービスアカウントキーが正しく生成されているか確認

#### 「認証に失敗しました」
- Firebase Console でAuthenticationが有効化されているか確認
- メール/パスワード認証が有効になっているか確認

#### 「データベースアクセスエラー」
- Firestore Database が作成されているか確認
- セキュリティルールが正しく設定されているか確認

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 注意事項

- `.env.local` ファイルは `.gitignore` に含まれており、Gitにコミットされません
- 本番環境では適切な環境変数管理を行ってください
- Firebase Admin SDK の秘密鍵は絶対に公開しないでください 