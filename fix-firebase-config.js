// Firebase設定修正スクリプト
class FirebaseConfigFixer {
    constructor() {
        this.configTemplate = `// Firebase設定
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// FirestoreとAuthの初期化
const db = firebase.firestore();
const auth = firebase.auth();`;
    }

    // 設定修正モーダルを表示
    showConfigFixModal() {
        const modal = document.createElement('div');
        modal.className = 'firebase-config-fix-modal';

        // 現在の設定を取得
        let currentConfig = window.firebaseConfig || {};
        let configDisplay = `API Key: ${currentConfig.apiKey || ''}\nAuth Domain: ${currentConfig.authDomain || ''}\nProject ID: ${currentConfig.projectId || ''}\nStorage Bucket: ${currentConfig.storageBucket || ''}\nMessaging Sender ID: ${currentConfig.messagingSenderId || ''}\nApp ID: ${currentConfig.appId || ''}`;

        modal.innerHTML = `
            <div class="firebase-config-fix-content">
                <div class="firebase-config-fix-header">
                    <h3>Firebase設定の修正</h3>
                    <span class="fix-indicator">ログイン問題の修正</span>
                </div>
                <div class="firebase-config-fix-body">
                    <h4>現在の設定</h4>
                    <pre>${configDisplay}</pre>
                    <p><strong>問題:</strong> 現在のFirebase設定がデフォルトのままのため、ログインできません。</p>
                    <h4>📋 修正手順:</h4>
                    <ol>
                        <li>Firebase Consoleにアクセス: <a href="https://console.firebase.google.com/" target="_blank">https://console.firebase.google.com/</a></li>
                        <li>プロジェクトを選択（または新規作成）</li>
                        <li>⚙️ プロジェクト設定 → 「全般」タブ</li>
                        <li>「Webアプリ」セクションで設定オブジェクトをコピー</li>
                        <li>下記の入力欄に貼り付けてください</li>
                    </ol>
                    <div class="config-input-section">
                        <label for="firebaseConfigInput">Firebase設定オブジェクト:</label>
                        <textarea id="firebaseConfigInput" class="firebase-config-textarea" 
                            placeholder="const firebaseConfig = {\n    apiKey: &quot;AIzaSyB...&quot;,\n    authDomain: &quot;your-project.firebaseapp.com&quot;,\n    projectId: &quot;your-project&quot;,\n    storageBucket: &quot;your-project.appspot.com&quot;,\n    messagingSenderId: &quot;123456789012&quot;,\n    appId: &quot;1:123456789012:web:abcdefghijklmnop&quot;\n};"></textarea>
                    </div>
                    <div class="config-status">
                        <span id="configStatus" class="status-waiting">設定を入力してください</span>
                    </div>
                </div>
                <div class="firebase-config-fix-actions">
                    <button onclick="firebaseConfigFixer.processConfig()" class="btn-primary">設定を適用</button>
                    <button onclick="firebaseConfigFixer.closeModal()" class="btn-cancel">キャンセル</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // 入力フィールドのイベントリスナーを追加
        const textarea = document.getElementById('firebaseConfigInput');
        textarea.addEventListener('input', () => this.validateConfig());
    }

    // 設定の検証
    validateConfig() {
        const textarea = document.getElementById('firebaseConfigInput');
        const status = document.getElementById('configStatus');
        const configText = textarea.value.trim();
        
        if (!configText) {
            status.textContent = '設定を入力してください';
            status.className = 'status-waiting';
            return false;
        }
        
        // 設定オブジェクトの形式をチェック
        try {
            const configMatch = configText.match(/const firebaseConfig = ({[\s\S]*?});/);
            if (!configMatch) {
                status.textContent = '❌ 設定オブジェクトの形式が正しくありません';
                status.className = 'status-error';
                return false;
            }
            
            const configObject = configMatch[1];
            const config = eval('(' + configObject + ')');
            
            // 必要なプロパティをチェック
            const requiredProps = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
            const missingProps = requiredProps.filter(prop => !config[prop]);
            
            if (missingProps.length > 0) {
                status.textContent = `❌ 不足しているプロパティ: ${missingProps.join(', ')}`;
                status.className = 'status-error';
                return false;
            }
            
            // デフォルト値でないことをチェック
            if (config.apiKey === 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' || 
                config.projectId === 'my-routine-app-xxxxx') {
                status.textContent = '❌ デフォルト設定のままです。実際のFirebase設定を入力してください';
                status.className = 'status-error';
                return false;
            }
            
            status.textContent = '✅ 設定が有効です';
            status.className = 'status-success';
            return true;
            
        } catch (error) {
            status.textContent = '❌ 設定の解析に失敗しました';
            status.className = 'status-error';
            return false;
        }
    }

    // 設定を処理
    processConfig() {
        const textarea = document.getElementById('firebaseConfigInput');
        const configText = textarea.value.trim();
        
        if (!this.validateConfig()) {
            return;
        }
        
        try {
            // 設定オブジェクトを解析
            const configMatch = configText.match(/const firebaseConfig = ({[\s\S]*?});/);
            const configObject = configMatch[1];
            
            // 新しい設定ファイルの内容を作成
            const newConfigContent = `// Firebase設定
const firebaseConfig = ${configObject};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// FirestoreとAuthの初期化
const db = firebase.firestore();
const auth = firebase.auth();`;
            
            // 設定をローカルストレージに保存（一時的）
            localStorage.setItem('pendingFirebaseConfig', newConfigContent);
            
            // 成功メッセージを表示
            this.showSuccessMessage(newConfigContent);
            
        } catch (error) {
            console.error('設定処理エラー:', error);
            this.showErrorMessage('設定の処理に失敗しました: ' + error.message);
        }
    }

    // 成功メッセージを表示
    showSuccessMessage(configContent) {
        const modal = document.querySelector('.firebase-config-fix-modal');
        modal.innerHTML = `
            <div class="firebase-config-fix-content">
                <div class="firebase-config-fix-header">
                    <h3>✅ 設定修正完了</h3>
                    <span class="fix-indicator">設定が正常に処理されました</span>
                </div>
                <div class="firebase-config-fix-body">
                    <p><strong>Firebase設定が正常に処理されました！</strong></p>
                    
                    <div class="config-preview">
                        <h4>適用される設定:</h4>
                        <pre><code>${configContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                    </div>
                    
                    <div class="next-steps">
                        <h4>次のステップ:</h4>
                        <ol>
                            <li>この設定でGitHubにアップロードします</li>
                            <li>ページを再読み込みして新しい設定を適用</li>
                            <li>ログインを試してください</li>
                        </ol>
                    </div>
                </div>
                <div class="firebase-config-fix-actions">
                    <button onclick="firebaseConfigFixer.uploadToGitHub()" class="btn-primary">GitHubにアップロード</button>
                    <button onclick="firebaseConfigFixer.closeModal()" class="btn-secondary">後で</button>
                </div>
            </div>
        `;
    }

    // GitHubにアップロード
    uploadToGitHub() {
        const configContent = localStorage.getItem('pendingFirebaseConfig');
        if (!configContent) {
            this.showErrorMessage('設定が見つかりません');
            return;
        }
        
        // GitHub APIを使用してファイルを更新
        this.updateGitHubFile('firebase-config.js', configContent, 'Fix Firebase configuration for login')
            .then(() => {
                this.showUploadSuccess();
            })
            .catch((error) => {
                console.error('GitHub upload error:', error);
                this.showErrorMessage('GitHubへのアップロードに失敗しました: ' + error.message);
            });
    }

    // GitHubファイル更新
    async updateGitHubFile(filename, content, message) {
        const username = 'Mametango';
        const repoName = 'my-routine-app';
        const token = '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';
        
        // まず現在のファイルのSHAを取得
        const getUrl = `https://api.github.com/repos/${username}/${repoName}/contents/${filename}`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'My-Routine-App-Updater'
            }
        });
        
        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
        
        // ファイルを更新
        const updateUrl = `https://api.github.com/repos/${username}/${repoName}/contents/${filename}`;
        const body = {
            message: message,
            content: btoa(unescape(encodeURIComponent(content)))
        };
        
        if (sha) {
            body.sha = sha;
        }
        
        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'My-Routine-App-Updater',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!updateResponse.ok) {
            throw new Error(`HTTP ${updateResponse.status}: ${updateResponse.statusText}`);
        }
        
        return await updateResponse.json();
    }

    // アップロード成功メッセージ
    showUploadSuccess() {
        const modal = document.querySelector('.firebase-config-fix-modal');
        modal.innerHTML = `
            <div class="firebase-config-fix-content">
                <div class="firebase-config-fix-header">
                    <h3>🎉 完了！</h3>
                    <span class="fix-indicator">設定が更新されました</span>
                </div>
                <div class="firebase-config-fix-body">
                    <p><strong>Firebase設定がGitHubに正常にアップロードされました！</strong></p>
                    
                    <div class="success-steps">
                        <h4>次の手順:</h4>
                        <ol>
                            <li>ページを再読み込みしてください（F5キー）</li>
                            <li>新しい設定が適用されます</li>
                            <li>ログインを試してください</li>
                        </ol>
                    </div>
                    
                    <div class="app-url">
                        <p><strong>アプリURL:</strong> <a href="https://Mametango.github.io/my-routine-app" target="_blank">https://Mametango.github.io/my-routine-app</a></p>
                    </div>
                </div>
                <div class="firebase-config-fix-actions">
                    <button onclick="location.reload()" class="btn-primary">ページを再読み込み</button>
                    <button onclick="firebaseConfigFixer.closeModal()" class="btn-secondary">閉じる</button>
                </div>
            </div>
        `;
    }

    // エラーメッセージを表示
    showErrorMessage(message) {
        const status = document.getElementById('configStatus');
        if (status) {
            status.textContent = '❌ ' + message;
            status.className = 'status-error';
        }
    }

    // モーダルを閉じる
    closeModal() {
        const modal = document.querySelector('.firebase-config-fix-modal');
        if (modal) {
            modal.remove();
        }
        localStorage.removeItem('pendingFirebaseConfig');
    }
}

// グローバルインスタンス
const firebaseConfigFixer = new FirebaseConfigFixer();

// 設定修正を開始
function fixFirebaseConfig() {
    firebaseConfigFixer.showConfigFixModal();
} 