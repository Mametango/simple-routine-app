# 🔥 Firebase設定完全ガイド

## 問題の原因
現在のアプリはFirebase設定がデフォルトのままのため、ログインできません。

## 🚀 解決方法（3つの選択肢）

### 選択肢1: AI自動設定（推奨）
1. アプリの「Firebase設定」ボタンをクリック
2. AIガイドに従って自動設定
3. 完了後、設定オブジェクトをコピー

### 選択肢2: 手動設定
以下の手順でFirebaseプロジェクトを作成してください：

#### ステップ1: Firebase Consoleにアクセス
- [Firebase Console](https://console.firebase.google.com/) を開く
- Googleアカウントでログイン

#### ステップ2: プロジェクトを作成
1. 「プロジェクトを追加」をクリック
2. プロジェクト名: `my-routine-app`
3. Google Analytics: **無効**（チェックを外す）
4. 「プロジェクトを作成」をクリック

#### ステップ3: Authentication設定
1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」の「編集」をクリック
4. 「有効にする」にチェック
5. 「保存」をクリック

#### ステップ4: Firestore Database設定
1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番環境で開始」を選択
4. リージョン: `asia-northeast1 (Tokyo)`
5. 「完了」をクリック

#### ステップ5: セキュリティルール設定
1. Firestore Database → 「ルール」タブをクリック
2. 既存のルールを削除
3. 以下のルールを入力：

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

4. 「公開」をクリック

#### ステップ6: Webアプリ設定
1. プロジェクトの設定（⚙️）をクリック
2. 「全般」タブで「Webアプリを追加」をクリック
3. アプリ名: `My Routine Web App`
4. 「アプリを登録」をクリック
5. **設定オブジェクトをコピー**（重要！）

#### ステップ7: 設定をアプリに反映
1. アプリの「Firebase設定を修正」ボタンをクリック
2. コピーした設定オブジェクトを貼り付け
3. 「設定を適用」→「GitHubにアップロード」
4. ページを再読み込み

### 選択肢3: サンプル設定（テスト用）
テスト用の設定オブジェクト（実際のプロジェクトではありません）：

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "test-project-12345.firebaseapp.com",
    projectId: "test-project-12345",
    storageBucket: "test-project-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};
```

## 🔧 トラブルシューティング

### よくあるエラー

#### 「ユーザーが見つかりません」
- アカウントが存在しない場合
- 会員登録から始めてください

#### 「パスワードが正しくありません」
- パスワードを確認してください
- 6文字以上であることを確認

#### 「無効なメールアドレスです」
- メールアドレスの形式を確認
- 例: `user@example.com`

#### 「このメールアドレスは既に使用されています」
- 既存のアカウントでログインしてください
- パスワードを忘れた場合は再設定

### 設定確認方法
1. ブラウザの開発者ツール（F12）を開く
2. Consoleタブでエラーメッセージを確認
3. NetworkタブでFirebase APIの通信状況を確認

## 📱 アプリURL
- 本番環境: https://Mametango.github.io/my-routine-app
- 設定完了後、このURLでログイン可能になります

## 🆘 サポート
設定でお困りの場合は：
1. ブラウザのコンソールエラーを確認
2. 上記の手順を順番に実行
3. エラーメッセージを教えてください

## ✅ 完了確認
設定が正しく完了すると：
- ログイン画面でアカウント作成・ログインが可能
- ルーティンの追加・編集・削除が可能
- データがFirebaseに保存される
- 複数ブラウザで同じアカウントにアクセス可能 