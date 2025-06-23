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