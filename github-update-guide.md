# GitHubリポジトリ更新ガイド
## 認証機能付きアプリの自動更新手順

### 🎯 目的
既存の `my-routine-app` リポジトリに認証機能を追加し、完全に機能するWebアプリケーションに更新します。

### 📋 準備事項

#### 1. GitHub Personal Access Tokenの取得
1. GitHub.comにログイン
2. 右上のプロフィールアイコン → Settings
3. 左サイドバーの「Developer settings」
4. 「Personal access tokens」→「Tokens (classic)」
5. 「Generate new token」→「Generate new token (classic)」
6. 以下の権限を選択：
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
7. 「Generate token」をクリック
8. **トークンをコピーして安全な場所に保存**

#### 2. 必要なファイルの確認
以下のファイルが現在のディレクトリに存在することを確認：
- ✅ `index.html` (認証機能付き)
- ✅ `styles.css` (認証UIスタイル付き)
- ✅ `script.js` (認証機能付き)
- ✅ `README-standalone.md` (更新済み)

### 🚀 自動更新の実行

#### 方法1: Node.jsスクリプト（推奨）

1. **設定ファイルの編集**
   ```bash
   # auto-update.js を開いて以下を設定
   const config = {
       username: 'あなたのGitHubユーザー名',
       repo: 'my-routine-app',
       token: 'あなたのPersonal Access Token',
       files: ['index.html', 'styles.css', 'script.js', 'README-standalone.md']
   };
   ```

2. **スクリプトの実行**
   ```bash
   node auto-update.js
   ```

#### 方法2: PowerShellスクリプト

1. **PowerShellを管理者として実行**
2. **スクリプトの実行**
   ```powershell
   .\simple-update.ps1
   ```
3. **プロンプトに従って情報を入力**
   - GitHubユーザー名
   - Personal Access Token

#### 方法3: 手動更新（Webインターフェース）

1. **GitHub.comにアクセス**
   - `my-routine-app` リポジトリを開く

2. **各ファイルを順次更新**

   **index.html の更新:**
   - ファイル一覧で `index.html` の ✏️ 鉛筆アイコンをクリック
   - 現在の内容をすべて削除
   - 認証機能付きの `index.html` の内容をコピー&ペースト
   - コミットメッセージ：「Add authentication system to HTML」
   - 「Commit changes」をクリック

   **styles.css の更新:**
   - 同様に `styles.css` の ✏️ 鉛筆アイコンをクリック
   - 内容を更新
   - コミットメッセージ：「Add authentication UI styles」

   **script.js の更新:**
   - 同様に `script.js` の ✏️ 鉛筆アイコンをクリック
   - 内容を更新
   - コミットメッセージ：「Add authentication functionality」

   **README.md の更新:**
   - 同様に `README.md` の ✏️ 鉛筆アイコンをクリック
   - 内容を更新
   - コミットメッセージ：「Update README with authentication features」

### ✅ 更新後の確認

#### 1. GitHub Pagesの確認
- リポジトリの「Settings」→「Pages」
- ソースが「Deploy from a branch」に設定されていることを確認
- ブランチが「main」に設定されていることを確認

#### 2. アプリの動作確認
- GitHub Pages URLにアクセス：`https://[ユーザー名].github.io/my-routine-app`
- 認証画面が表示されることを確認
- 会員登録機能をテスト
- ログイン機能をテスト
- ルーティン管理機能をテスト

### 🔧 トラブルシューティング

#### エラー1: 「Personal Access Token is invalid」
- トークンが正しくコピーされているか確認
- トークンの権限が適切に設定されているか確認
- トークンが有効期限内か確認

#### エラー2: 「Repository not found」
- リポジトリ名が正しいか確認
- リポジトリが公開されているか確認
- ユーザー名が正しいか確認

#### エラー3: 「File not found」
- 必要なファイルが現在のディレクトリに存在するか確認
- ファイル名の大文字小文字が正しいか確認

#### エラー4: 「Permission denied」
- Personal Access Tokenに適切な権限があるか確認
- リポジトリへの書き込み権限があるか確認

### 📱 更新後の機能

#### 新しく追加された機能
- 🔐 **ユーザー登録・ログイン・ログアウト**
- 👤 **個人別ルーティン管理**
- 🛡️ **パスワード保護とセッション管理**
- 🎨 **美しい認証UI**
- 📊 **ユーザー別統計情報**

#### 既存機能の改善
- ✅ **レスポンシブデザインの強化**
- ✅ **エラーハンドリングの改善**
- ✅ **ユーザビリティの向上**
- ✅ **セキュリティの強化**

### 🌐 公開URL

更新が完了すると、以下のURLで認証機能付きのアプリにアクセスできます：

```
https://[あなたのGitHubユーザー名].github.io/my-routine-app
```

### 📞 サポート

問題が発生した場合は、以下を確認してください：
1. エラーメッセージの詳細
2. ブラウザの開発者ツールのコンソール
3. GitHubのリポジトリ設定
4. Personal Access Tokenの権限設定

---

**🎉 認証機能付きの習慣管理アプリが完成しました！** 