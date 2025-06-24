// Google Drive API設定
// Google Cloud Console (https://console.cloud.google.com/) で取得してください

// 1. Google Cloud Consoleでプロジェクトを作成
// 2. Google Drive APIを有効化
// 3. 認証情報を作成（OAuth 2.0クライアントID）
// 4. 承認済みのJavaScriptオリジンを追加（localhost:8000, あなたのドメイン）

const GOOGLE_DRIVE_CONFIG = {
    // Google Cloud Consoleで取得したクライアントID
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    
    // Google Cloud Consoleで取得したAPIキー
    apiKey: 'YOUR_GOOGLE_API_KEY',
    
    // 必要なスコープ
    scopes: 'https://www.googleapis.com/auth/drive.file',
    
    // 発見ドキュメント
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
};

// 設定をグローバルに公開
window.GOOGLE_DRIVE_CONFIG = GOOGLE_DRIVE_CONFIG;

// 設定の説明
console.log(`
Google Drive API設定について：

1. Google Cloud Console (https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Google Drive APIを有効化
4. 認証情報 > 認証情報を作成 > OAuth 2.0クライアントID
5. アプリケーションの種類: ウェブアプリケーション
6. 承認済みのJavaScriptオリジン:
   - http://localhost:8000 (開発用)
   - https://your-domain.com (本番用)
7. 取得したクライアントIDとAPIキーを上記の設定に記入

注意: 本番環境では、APIキーとクライアントIDを適切に管理してください。
`); 