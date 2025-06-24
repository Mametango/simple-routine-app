# My Routine - フルスタックルーティン管理アプリ

Next.jsで構築された美しいUIと優れたUXを持つ、毎日の習慣を管理するためのフルスタックWebアプリケーションです。Next.js 14とApp Routerを使用して構築されています。

## 🚀 機能

- ✨ **ルーティンの追加・編集・削除**
- ✅ **完了状態の管理**
- 📊 **統計情報の表示**（総ルーティン数、完了数、達成率）
- 🕐 **時間設定機能**
- 💾 **サーバーサイドでのデータ保存**
- 📱 **レスポンシブデザイン**
- 🎨 **モダンなグラスモーフィズムUI**
- 🔄 **リアルタイムデータ同期**
- 🔄 **頻度管理**: 毎日、毎週、毎月のルーティンを管理
- 🔄 **フィルタリング**: 頻度別にルーティンを絞り込み
- 🔐 **認証システム**: Firebase認証とシンプル認証の両方をサポート
- ☁️ **複数ストレージ対応**: Firebase、Google Drive、ローカルストレージから選択可能
- 📊 **進捗管理**: ルーティンの完了状況を追跡
- 🎯 **柔軟な頻度設定**: 毎日、毎週、毎月のルーティンに対応

## 🛠 技術スタック

### **フロントエンド**
- **Next.js 14** - Reactベースのフルスタックフレームワーク
- **TypeScript** - 型安全性
- **App Router** - 最新のルーティングシステム
- **Lucide React** - 美しいアイコン
- **CSS3** - モダンなスタイリング

### **バックエンド**
- **Next.js API Routes** - サーバーサイドAPI
- **ファイルシステム** - データ永続化
- **RESTful API** - 標準的なAPI設計

## 📦 セットアップ

### 前提条件

- Node.js (v18以上)
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd my-routine
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで `http://localhost:3000` を開く

## 🔧 使用方法

### ルーティンの追加
1. 「新しいルーティンを追加」ボタンをクリック
2. タイトル、説明（オプション）、時間、頻度を入力
3. 「保存」ボタンをクリック

### ルーティンの編集
1. ルーティンカードの編集アイコンをクリック
2. モーダルで内容を編集
3. 「保存」ボタンをクリック

### ルーティンの完了
- ルーティンカードの「完了にする」ボタンをクリック
- 完了済みのルーティンは緑色で表示されます

### ルーティンの削除
- ルーティンカードの削除アイコンをクリック

## 🏗 プロジェクト構造

```
my-routine/
├── app/
│   ├── api/
│   │   └── routines/
│   │       ├── route.ts              # GET/POST /api/routines
│   │       └── [id]/
│   │           ├── route.ts           # PUT/DELETE /api/routines/[id]
│   │           └── toggle/
│   │               └── route.ts       # PATCH /api/routines/[id]/toggle
│   ├── globals.css                    # グローバルスタイル
│   ├── layout.tsx                     # ルートレイアウト
│   ├── page.tsx                       # メインページ
│   └── page.css                       # ページスタイル
├── data/                              # データ保存ディレクトリ
│   └── routines.json                  # ルーティンデータ
├── package.json                       # 依存関係とスクリプト
├── next.config.js                     # Next.js設定
├── tsconfig.json                      # TypeScript設定
└── README.md                         # このファイル
```

## 🔌 API エンドポイント

### **GET /api/routines**
- 全てのルーティンを取得

### **POST /api/routines**
- 新しいルーティンを作成
- Body: `{ title: string, description?: string, time?: string, frequency: 'daily' | 'weekly' | 'monthly' }`

### **PUT /api/routines/[id]**
- 既存のルーティンを更新
- Body: `{ title: string, description?: string, time?: string, frequency: 'daily' | 'weekly' | 'monthly' }`

### **DELETE /api/routines/[id]**
- ルーティンを削除

### **PATCH /api/routines/[id]/toggle**
- ルーティンの完了状態を切り替え

## 🏗 デプロイ

### Vercel（推奨）
```bash
npm run build
# Vercelにデプロイ
```

### その他のプラットフォーム
```bash
npm run build
npm start
```

## 🎨 特徴

### デザイン
- **グラスモーフィズム**: 半透明の背景とブラー効果
- **グラデーション**: 美しい背景グラデーション
- **アニメーション**: スムーズなホバー効果とトランジション
- **レスポンシブ**: モバイルデバイスにも対応

### 機能
- **サーバーサイド**: Next.js API Routes
- **データ永続化**: ファイルシステムでの保存
- **統計表示**: 進捗の可視化
- **時間管理**: ルーティンの時間設定
- **編集機能**: 既存ルーティンの修正
- **頻度管理**: 毎日、毎週、毎月のルーティンを管理
- **フィルタリング**: 頻度別にルーティンを絞り込み

## 🔄 開発

### 開発サーバー
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### 本番サーバー
```bash
npm start
```

### リント
```bash
npm run lint
```

## 📝 ライセンス

MIT License

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します！

## 📈 更新履歴

### v2.0.0
- Next.js 14への移行
- フルスタックアプリケーション化
- API Routesの実装
- サーバーサイドデータ保存
- 頻度管理機能の追加

### v1.0.0
- 初回リリース
- 基本的なルーティン管理機能
- モダンなUI/UX
- レスポンシブデザイン 

## 📦 ストレージオプション

### 1. Firebase（推奨）
- リアルタイム同期
- 複数デバイス対応
- 無料プランで十分な機能

### 2. Google Drive
- Googleアカウントで同期
- プライバシー重視
- 既存のGoogleアカウントで利用可能

### 3. ローカル保存
- このデバイスのみ
- オフライン対応
- プライバシー重視

## 🔧 セットアップ

### 1. Firebase設定（推奨）

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authenticationを有効化（メール/パスワード）
3. Firestore Databaseを作成
4. `firebase-config.js`に設定を記入

### 2. Google Drive設定（オプション）

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Drive APIを有効化
3. 認証情報 > OAuth 2.0クライアントIDを作成
4. 承認済みのJavaScriptオリジンを追加：
   - `http://localhost:8000` (開発用)
   - `https://your-domain.com` (本番用)
5. `google-drive-config.js`にクライアントIDとAPIキーを記入

### 3. ローカル開発

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
python -m http.server 8000
# または
npx http-server

# ブラウザで http://localhost:8000 にアクセス
```

## 🔧 使用方法

1. **ログイン**: メールアドレスとパスワードでログイン
2. **ストレージ選択**: 設定ボタン（⚙️）から保存方法を選択
3. **ルーティン追加**: 「追加」ボタンから新しいルーティンを作成
4. **完了記録**: ルーティンの横のチェックボタンで完了を記録
5. **同期**: 同期ボタンで手動同期、またはプルツーリフレッシュ（モバイル）

## 🔧 ファイル構成

```
My routine/
├── index.html              # メインHTMLファイル
├── styles.css              # スタイルシート
├── script.js               # メインJavaScript
├── firebase-config.js      # Firebase設定
├── google-drive-config.js  # Google Drive設定
├── google-drive-storage.js # Google Drive実装
├── auto-firebase-setup.js  # Firebase自動設定
└── README.md              # このファイル
```

## 🎨 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **認証**: Firebase Authentication, カスタム認証
- **データベース**: Firebase Firestore, Google Drive API, LocalStorage
- **アイコン**: Lucide Icons
- **デプロイ**: GitHub Pages

## 🎨 ライセンス

MIT License

## 🤝 サポート

問題や質問がある場合は、GitHubのIssuesでお知らせください。

## 🔐 認証機能

### 1. メール/パスワード認証
- 従来のメールアドレスとパスワードでのログイン
- 新規登録機能付き

### 2. Googleログイン（新機能）
- Googleアカウントでのワンクリックログイン
- アカウント作成とログインの両方に対応
- プロフィール画像とユーザー名を自動取得

### Googleログイン設定

Firebase ConsoleでGoogle認証を有効化してください：

1. **Firebase Console**でプロジェクトを開く
2. **Authentication** > **Sign-in method**に移動
3. **Google**プロバイダーを有効化
4. **承認済みドメイン**に以下を追加：
   - `localhost` (開発用)
   - `your-domain.com` (本番用)

## 使用方法

1. **ログイン**: メールアドレスとパスワード、またはGoogleアカウントでログイン
2. **ストレージ選択**: 設定ボタン（⚙️）から保存方法を選択
3. **ルーティン追加**: 「追加」ボタンから新しいルーティンを作成
4. **完了記録**: ルーティンの横のチェックボタンで完了を記録
5. **同期**: 同期ボタンで手動同期、またはプルツーリフレッシュ（モバイル） 