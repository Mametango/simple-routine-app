# シンプルルーティン管理アプリ

Firebaseを使用したクラウドベースのルーティン管理アプリです。

## セットアップ手順

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：simple-routine-app）
4. Google Analyticsの設定は任意
5. 「プロジェクトを作成」をクリック

### 2. Authentication設定

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を有効化
5. 「保存」をクリック

### 3. Firestore Database設定

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番環境で開始」または「テストモードで開始」を選択
4. ロケーションを選択（例：asia-northeast1）
5. 「完了」をクリック

### 4. Webアプリの追加

1. プロジェクト設定（歯車アイコン）をクリック
2. 「全般」タブで「アプリを追加」をクリック
3. Webアイコン（</>）を選択
4. アプリのニックネームを入力（例：simple-routine-web）
5. 「アプリを登録」をクリック
6. 表示される設定をコピー

### 5. 設定の適用

1. `firebase-config.js`ファイルを開く
2. コピーした設定を`firebaseConfig`オブジェクトに貼り付け
3. `simple-routine-app.html`の`firebaseConfig`を更新

### 6. セキュリティルール（本番環境用）

Firestore Database > ルールで以下のルールを設定：

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

## 機能

- ✅ ユーザー認証（メール/パスワード）
- ✅ ルーティンの作成・編集・削除
- ✅ 頻度設定（毎日・毎週・毎月・毎年・カスタム）
- ✅ 完了状況の管理
- ✅ リアルタイム同期
- ✅ セキュリティ対策

## セキュリティ機能

- 🔒 パスワードハッシュ化
- 🔒 入力検証（XSS対策）
- 🔒 データ暗号化
- 🔒 セッション管理
- 🔒 Firebase認証

## デプロイ

### GitHub Pages

1. リポジトリをGitHubにプッシュ
2. Settings > Pages
3. Source: Deploy from a branch
4. Branch: main
5. 保存

### カスタムドメイン

1. ドメインを購入
2. Firebase Hostingを使用
3. カスタムドメインを設定

## トラブルシューティング

### 認証エラー
- Firebase設定が正しく設定されているか確認
- Authentication > Sign-in methodでメール/パスワードが有効化されているか確認

### データが保存されない
- Firestore Databaseが作成されているか確認
- セキュリティルールが適切に設定されているか確認

### 表示エラー
- ブラウザのキャッシュをクリア
- 開発者ツールでエラーを確認

## ライセンス

MIT License 