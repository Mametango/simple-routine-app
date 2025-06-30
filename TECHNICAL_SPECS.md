# 技術仕様書

## 📊 データベース設計

### ローカルストレージスキーマ

#### 1. ユーザー管理テーブル
```javascript
// simpleAuthUsers (localStorage)
{
    "user@example.com": {
        uid: "user_1234567890_abc123",
        email: "user@example.com",
        displayName: "user",
        password: "base64_hashed_password",
        createdAt: "2025-06-27T13:52:25.386Z",
        lastLogin: "2025-06-27T13:52:25.386Z",
        isAdmin: false,
        role: "user",
        emailVerified: true,
        profile: {
            displayName: "user",
            photoURL: null
        }
    }
}
```

#### 2. 認証状態テーブル
```javascript
// simpleAuthCurrentUser (localStorage)
{
    uid: "user_1234567890_abc123",
    id: "user_1234567890_abc123",
    email: "user@example.com",
    displayName: "user",
    createdAt: "2025-06-27T13:52:25.386Z",
    isAdmin: false
}
```

#### 3. ルーティンデータテーブル
```javascript
// routines_{userId} (localStorage)
[
    {
        id: "routine_1234567890",
        title: "朝の運動",
        description: "30分のジョギング",
        frequency: "daily",
        weeklyDays: [],
        monthlyDate: null,
        createdAt: "2025-06-27T13:52:25.386Z",
        userId: "user_1234567890_abc123"
    }
]
```

#### 4. 完了データテーブル
```javascript
// completions_{userId} (localStorage)
[
    {
        routineId: "routine_1234567890",
        completedAt: "2025-06-27T13:52:25.386Z",
        userId: "user_1234567890_abc123"
    }
]
```

### Firestoreスキーマ

#### 1. ユーザー同期コレクション
```javascript
// auth_sync/users
{
    users: {
        "user@example.com": {
            // ユーザーデータ（パスワードは除外）
        }
    },
    lastUpdated: "2025-06-27T13:52:25.386Z"
}
```

#### 2. ルーティンコレクション
```javascript
// routines/{routineId}
{
    id: "routine_1234567890",
    title: "朝の運動",
    description: "30分のジョギング",
    frequency: "daily",
    weeklyDays: [],
    monthlyDate: null,
    createdAt: "2025-06-27T13:52:25.386Z",
    userId: "user_1234567890_abc123",
    updatedAt: "2025-06-27T13:52:25.386Z"
}
```

#### 3. 完了データコレクション
```javascript
// completions/{completionId}
{
    routineId: "routine_1234567890",
    completedAt: "2025-06-27T13:52:25.386Z",
    userId: "user_1234567890_abc123"
}
```

## 🔌 API仕様

### 認証API

#### 1. 初期化
```javascript
// 認証システムの初期化
initializeSimpleAuth(): SimpleAuth | null

// 戻り値
{
    success: boolean,
    auth: SimpleAuth | null,
    error?: string
}
```

#### 2. ログイン
```javascript
// ユーザーログイン
handleLogin(email: string, password: string): Promise<AuthResult>

// 戻り値
{
    success: boolean,
    user?: UserObject,
    message?: string
}
```

#### 3. 新規登録
```javascript
// ユーザー登録
handleRegister(email: string, password: string): Promise<AuthResult>

// 戻り値
{
    success: boolean,
    user?: UserObject,
    message?: string
}
```

#### 4. ログアウト
```javascript
// ユーザーログアウト
logout(): Promise<void>
```

### データ管理API

#### 1. データ読み込み
```javascript
// ローカルストレージから読み込み
loadDataFromLocalStorage(): void

// Firebaseから読み込み
loadDataFromFirebase(): Promise<void>
```

#### 2. データ保存
```javascript
// データを保存
saveData(): Promise<void>
```

#### 3. ルーティン管理
```javascript
// ルーティン追加
addRoutine(routineData: RoutineData): Promise<void>

// ルーティン完了切り替え
toggleRoutineCompletion(routineId: string): Promise<void>
```

## 🔧 コンポーネント間通信

### イベントシステム

#### 1. 認証状態変更イベント
```javascript
// 認証状態リスナー
simpleAuth.onAuthStateChanged((user) => {
    if (user) {
        // ログイン状態
        showMainApp();
    } else {
        // ログアウト状態
        showAuthScreen();
    }
});
```

#### 2. データ同期イベント
```javascript
// データ変更時の同期
window.addEventListener('storage', (e) => {
    if (e.key === 'simpleAuthCurrentUser') {
        // 認証状態の変更を検出
        checkAuthState();
    }
});
```

### 状態管理

#### 1. グローバル状態
```javascript
// アプリケーション全体の状態
window.currentUserInfo = null;      // 現在のユーザー
window.currentStorage = 'local';    // ストレージタイプ
window.routines = [];               // ルーティンリスト
window.completions = [];            // 完了データ
```

#### 2. 認証状態
```javascript
// 認証システムの状態
simpleAuth.isInitialized = false;   // 初期化状態
simpleAuth.currentUser = null;      // 現在のユーザー
```

## 🛡️ セキュリティ仕様

### パスワードセキュリティ

#### 1. ハッシュ化アルゴリズム
```javascript
// 現在の実装（開発用）
hashPassword(password) {
    return btoa(password + '_salt');
}

// 本番環境推奨
// bcrypt または Argon2 を使用
```

#### 2. パスワードポリシー
- 最小長: 6文字
- 推奨: 大文字、小文字、数字、記号を含む
- 最大長: 128文字

### データ保護

#### 1. 入力検証
```javascript
// メールアドレス検証
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// パスワード強度チェック
function validatePassword(password) {
    return password.length >= 6;
}
```

#### 2. データ所有権確認
```javascript
// ユーザーデータの所有権確認
function isMyData(data, dataType = 'routine') {
    return data.userId === currentUserInfo.id;
}
```

## 📱 UI/UX仕様

### レスポンシブデザイン

#### 1. ブレークポイント
```css
/* モバイル */
@media (max-width: 768px) {
    .card { min-width: 100%; }
}

/* タブレット */
@media (min-width: 769px) and (max-width: 1024px) {
    .card { min-width: 400px; }
}

/* デスクトップ */
@media (min-width: 1025px) {
    .card { min-width: 500px; }
}
```

#### 2. アクセシビリティ
- キーボードナビゲーション対応
- スクリーンリーダー対応
- 高コントラストモード対応

### エラー表示

#### 1. エラーメッセージ
```javascript
// エラーメッセージの表示
function showNotification(message, type = 'info') {
    // トースト通知またはアラート表示
}
```

#### 2. ローディング状態
```javascript
// ローディング状態の管理
let isLoading = false;

function setLoading(loading) {
    isLoading = loading;
    // UIの更新
}
```

## 🔄 同期仕様

### 同期戦略

#### 1. オフライン対応
```javascript
// オフライン時の動作
if (!navigator.onLine) {
    // ローカルストレージのみ使用
    currentStorage = 'local';
}
```

#### 2. 競合解決
```javascript
// データ競合の解決
function resolveConflict(localData, cloudData) {
    // タイムスタンプベースの解決
    return localData.updatedAt > cloudData.updatedAt ? localData : cloudData;
}
```

### 同期タイミング

#### 1. 自動同期
- アプリ起動時
- データ変更時
- ネットワーク復旧時

#### 2. 手動同期
- ユーザーによる同期ボタン
- 設定画面からの同期実行

## 📊 パフォーマンス仕様

### 最適化戦略

#### 1. 遅延読み込み
```javascript
// 必要時のみデータ読み込み
async function loadDataOnDemand() {
    if (!dataLoaded) {
        await loadData();
        dataLoaded = true;
    }
}
```

#### 2. キャッシュ戦略
```javascript
// メモリキャッシュ
const cache = new Map();

function getCachedData(key) {
    if (cache.has(key)) {
        return cache.get(key);
    }
    // データを読み込んでキャッシュ
}
```

### メモリ管理

#### 1. メモリリーク防止
```javascript
// イベントリスナーの適切な削除
function cleanup() {
    // イベントリスナーの削除
    // タイマーのクリア
    // キャッシュのクリア
}
```

#### 2. ガベージコレクション
- 不要なオブジェクトの削除
- 循環参照の防止
- メモリ使用量の監視

## 🧪 テスト仕様

### 単体テスト

#### 1. 認証テスト
```javascript
// ログインテスト
describe('Authentication', () => {
    test('should login with valid credentials', async () => {
        const result = await handleLogin('test@example.com', 'password123');
        expect(result.success).toBe(true);
    });
});
```

#### 2. データ管理テスト
```javascript
// データ保存テスト
describe('Data Management', () => {
    test('should save routine data', async () => {
        const routineData = { title: 'Test Routine' };
        await addRoutine(routineData);
        expect(routines).toContainEqual(expect.objectContaining(routineData));
    });
});
```

### 統合テスト

#### 1. エンドツーエンドテスト
- ユーザー登録からログインまでの流れ
- ルーティン作成から完了までの流れ
- データ同期の動作確認

#### 2. パフォーマンステスト
- 大量データでの動作確認
- ネットワーク遅延時の動作確認
- メモリ使用量の監視

## 📈 監視・ログ仕様

### ログレベル

#### 1. ログ分類
```javascript
// ログレベルの定義
const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};
```

#### 2. ログ出力
```javascript
// 構造化ログ
function log(level, message, data = {}) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        data
    }));
}
```

### エラー監視

#### 1. エラー追跡
```javascript
// エラーの自動収集
window.addEventListener('error', (event) => {
    log('error', 'Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
    });
});
```

#### 2. パフォーマンス監視
```javascript
// パフォーマンスメトリクス
function measurePerformance(operation) {
    const start = performance.now();
    return () => {
        const duration = performance.now() - start;
        log('info', `${operation} completed`, { duration });
    };
}
```

---

## 📋 実装チェックリスト

### 認証システム
- [x] SimpleAuthクラスの実装
- [x] ログイン/登録機能
- [x] パスワードハッシュ化
- [x] 認証状態管理
- [x] エラーハンドリング

### データ管理
- [x] ローカルストレージ対応
- [x] Firebase同期
- [x] データ検証
- [x] 競合解決

### UI/UX
- [x] レスポンシブデザイン
- [x] エラー表示
- [x] ローディング状態
- [x] アクセシビリティ

### セキュリティ
- [x] 入力検証
- [x] データ所有権確認
- [x] セッション管理
- [ ] 多要素認証（将来）

### パフォーマンス
- [x] 遅延読み込み
- [x] キャッシュ戦略
- [x] メモリ管理
- [ ] コード分割（将来）

### テスト
- [x] デバッグツール
- [ ] 単体テスト
- [ ] 統合テスト
- [ ] パフォーマンステスト
``` 