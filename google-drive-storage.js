// Google Drive Storage Implementation
class GoogleDriveStorage {
    constructor() {
        this.initialized = false;
        this.authenticated = false;
        
        // 設定ファイルから読み込み
        if (window.GOOGLE_DRIVE_CONFIG) {
            this.clientId = window.GOOGLE_DRIVE_CONFIG.clientId;
            this.apiKey = window.GOOGLE_DRIVE_CONFIG.apiKey;
            this.scopes = window.GOOGLE_DRIVE_CONFIG.scopes;
        } else {
            // フォールバック設定
            this.clientId = 'YOUR_GOOGLE_CLIENT_ID';
            this.apiKey = 'YOUR_GOOGLE_API_KEY';
            this.scopes = 'https://www.googleapis.com/auth/drive.file';
        }
        
        this.fileName = 'my-routine-data.json';
    }

    // Google Drive API初期化
    async initialize() {
        if (this.initialized) return true;

        try {
            await new Promise((resolve, reject) => {
                gapi.load('client:auth2', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: this.apiKey,
                            clientId: this.clientId,
                            scope: this.scopes,
                            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
                        });
                        
                        this.initialized = true;
                        console.log('Google Drive API初期化完了');
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            // 認証状態をチェック
            this.authenticated = gapi.auth2.getAuthInstance().isSignedIn.get();
            return true;
        } catch (error) {
            console.error('Google Drive初期化エラー:', error);
            return false;
        }
    }

    // Google Drive認証
    async authenticate() {
        if (!this.initialized) {
            const initialized = await this.initialize();
            if (!initialized) return false;
        }

        try {
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            this.authenticated = true;
            console.log('Google Drive認証成功:', user.getBasicProfile().getName());
            return true;
        } catch (error) {
            console.error('Google Drive認証エラー:', error);
            return false;
        }
    }

    // データを読み込み
    async loadData() {
        if (!this.authenticated) {
            const authenticated = await this.authenticate();
            if (!authenticated) return null;
        }

        try {
            const response = await gapi.client.drive.files.list({
                q: `name='${this.fileName}' and trashed=false`,
                spaces: 'drive',
                fields: 'files(id, name, modifiedTime)'
            });

            if (response.result.files.length > 0) {
                const file = response.result.files[0];
                const content = await gapi.client.drive.files.get({
                    fileId: file.id,
                    alt: 'media'
                });

                const data = JSON.parse(content.body);
                console.log('Google Driveからデータを読み込み:', data);
                return data;
            } else {
                console.log('Google Driveにデータファイルが見つかりません');
                return null;
            }
        } catch (error) {
            console.error('Google Drive読み込みエラー:', error);
            return null;
        }
    }

    // データを保存
    async saveData(data) {
        if (!this.authenticated) {
            const authenticated = await this.authenticate();
            if (!authenticated) return false;
        }

        try {
            const fileData = {
                ...data,
                lastUpdated: new Date().toISOString()
            };

            const fileMetadata = {
                name: this.fileName,
                mimeType: 'application/json'
            };

            const media = {
                mimeType: 'application/json',
                body: JSON.stringify(fileData)
            };

            // 既存ファイルを検索
            const response = await gapi.client.drive.files.list({
                q: `name='${this.fileName}' and trashed=false`,
                spaces: 'drive',
                fields: 'files(id)'
            });

            let fileId;
            if (response.result.files.length > 0) {
                // 既存ファイルを更新
                fileId = response.result.files[0].id;
                await gapi.client.drive.files.update({
                    fileId: fileId,
                    media: media
                });
            } else {
                // 新規ファイルを作成
                const file = await gapi.client.drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                });
                fileId = file.result.id;
            }

            console.log('Google Driveにデータを保存:', fileId);
            return true;
        } catch (error) {
            console.error('Google Drive保存エラー:', error);
            return false;
        }
    }

    // 認証状態をチェック
    isAuthenticated() {
        return this.authenticated;
    }

    // 初期化状態をチェック
    isInitialized() {
        return this.initialized;
    }
}

// グローバルインスタンス
window.googleDriveStorage = new GoogleDriveStorage(); 