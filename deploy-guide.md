# My Routine - デプロイガイド

インターネット上にMy Routineアプリを公開する方法を説明します。

## 🚀 スタンドアロン版の公開

### 1. GitHub Pages（推奨・無料）

#### 手順
1. **GitHubリポジトリを作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **GitHubでリポジトリを作成**
   - GitHub.comにアクセス
   - "New repository"をクリック
   - リポジトリ名を入力（例：`my-routine-app`）
   - "Create repository"をクリック

3. **ローカルリポジトリをGitHubにプッシュ**
   ```bash
   git remote add origin https://github.com/yourusername/my-routine-app.git
   git branch -M main
   git push -u origin main
   ```

4. **GitHub Pagesを有効化**
   - リポジトリページで"Settings"タブをクリック
   - 左サイドバーで"Pages"をクリック
   - "Source"で"Deploy from a branch"を選択
   - "Branch"で"main"を選択
   - "Save"をクリック

5. **公開完了**
   - 数分後に `https://yourusername.github.io/my-routine-app` でアクセス可能

### 2. Netlify（無料・簡単）

#### 手順
1. **Netlifyにサインアップ**
   - [netlify.com](https://netlify.com)にアクセス
   - GitHubアカウントでサインアップ

2. **サイトをデプロイ**
   - "New site from Git"をクリック
   - GitHubリポジトリを選択
   - デプロイ設定：
     - Build command: 空欄
     - Publish directory: `.`（ルートディレクトリ）
   - "Deploy site"をクリック

3. **カスタムドメイン設定（オプション）**
   - "Domain settings"でカスタムドメインを設定可能

### 3. Vercel（無料・高速）

#### 手順
1. **Vercelにサインアップ**
   - [vercel.com](https://vercel.com)にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトをインポート**
   - "New Project"をクリック
   - GitHubリポジトリを選択
   - フレームワークプリセットで"Other"を選択
   - "Deploy"をクリック

## 🚀 Next.js版の公開

### 1. Vercel（推奨・無料）

#### 手順
1. **Vercelにサインアップ**
   - [vercel.com](https://vercel.com)にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトをインポート**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **デプロイ設定**
   - プロジェクト名を入力
   - フレームワークプリセットで"Next.js"を選択
   - "Deploy"をクリック

4. **自動デプロイ設定**
   - GitHubリポジトリと連携
   - mainブランチにプッシュすると自動デプロイ

### 2. Netlify（無料）

#### 手順
1. **Netlifyにサインアップ**
   - [netlify.com](https://netlify.com)にアクセス

2. **ビルド設定**
   ```bash
   npm run build
   npm run export
   ```

3. **netlify.tomlファイルを作成**
   ```toml
   [build]
     publish = "out"
     command = "npm run build && npm run export"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **デプロイ**
   - NetlifyでGitHubリポジトリを選択
   - 上記の設定でデプロイ

### 3. Railway（無料枠あり）

#### 手順
1. **Railwayにサインアップ**
   - [railway.app](https://railway.app)にアクセス

2. **プロジェクトを作成**
   - "New Project"をクリック
   - "Deploy from GitHub repo"を選択
   - リポジトリを選択

3. **環境変数設定**
   - 必要に応じて環境変数を設定

## 🔧 デプロイ前の準備

### スタンドアロン版
```bash
# ファイルの確認
ls -la
# index.html, styles.css, script.js が存在することを確認
```

### Next.js版
```bash
# 依存関係のインストール
npm install

# ビルドテスト
npm run build

# ローカルテスト
npm run start
```

## 📝 デプロイ後の確認事項

### 共通
- [ ] アプリが正常に表示される
- [ ] ルーティンの追加・編集・削除が動作する
- [ ] データが保存される（スタンドアロン版はローカルストレージ）
- [ ] モバイル表示が正常

### Next.js版特有
- [ ] APIエンドポイントが動作する
- [ ] データが永続化される
- [ ] 環境変数が正しく設定されている

## 🌐 カスタムドメイン設定

### ドメイン購入
- [Google Domains](https://domains.google)
- [Namecheap](https://namecheap.com)
- [GoDaddy](https://godaddy.com)

### DNS設定
1. **Aレコード設定**
   - Vercel: `76.76.19.67`
   - Netlify: `75.2.60.5`

2. **CNAMEレコード設定**
   - 各プラットフォームの指示に従う

## 🔒 セキュリティ考慮事項

### スタンドアロン版
- ローカルストレージはブラウザに保存
- データはユーザーのデバイスにのみ保存
- サーバーサイドのセキュリティリスクなし

### Next.js版
- APIエンドポイントの保護
- 環境変数の適切な管理
- データベースのセキュリティ設定

## 📊 パフォーマンス最適化

### スタンドアロン版
- ファイルサイズの最適化
- 画像の圧縮
- CDNの活用

### Next.js版
- 画像の最適化
- コード分割
- キャッシュ戦略

## 🆘 トラブルシューティング

### よくある問題
1. **404エラー**
   - ファイルパスの確認
   - ビルド設定の確認

2. **APIエラー**
   - 環境変数の設定確認
   - データベース接続の確認

3. **スタイルが適用されない**
   - CSSファイルのパス確認
   - キャッシュのクリア

## 📞 サポート

デプロイで問題が発生した場合は：
1. 各プラットフォームのドキュメントを確認
2. エラーログを確認
3. コミュニティフォーラムで質問

---

**推奨プラットフォーム**
- **スタンドアロン版**: GitHub Pages または Netlify
- **Next.js版**: Vercel

どちらも無料で利用でき、簡単にデプロイできます！ 