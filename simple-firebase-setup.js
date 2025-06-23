// シンプルFirebase設定インターフェース
class SimpleFirebaseSetup {
    constructor() {
        this.isInitialized = false;
    }

    // シンプル設定モーダルを表示
    showSimpleSetupModal() {
        const modal = document.createElement('div');
        modal.className = 'simple-firebase-setup-modal';
        modal.innerHTML = `
            <div class="simple-firebase-setup-content">
                <div class="simple-firebase-setup-header">
                    <h3>🔥 シンプルFirebase設定</h3>
                    <span class="setup-indicator">簡単設定</span>
                </div>
                <div class="simple-firebase-setup-body">
                    <div class="setup-options">
                        <h4>📋 設定方法を選択:</h4>
                        
                        <div class="option-card" onclick="simpleFirebaseSetup.selectOption('auto')">
                            <div class="option-icon">🤖</div>
                            <div class="option-content">
                                <h5>自動設定（推奨）</h5>
                                <p>AIが自動でFirebaseプロジェクトを作成し、設定を完了します</p>
                                <span class="option-badge">簡単</span>
                            </div>
                        </div>
                        
                        <div class="option-card" onclick="simpleFirebaseSetup.selectOption('manual')">
                            <div class="option-icon">⚙️</div>
                            <div class="option-content">
                                <h5>手動設定</h5>
                                <p>既存のFirebaseプロジェクトの設定を入力します</p>
                                <span class="option-badge">上級者向け</span>
                            </div>
                        </div>
                        
                        <div class="option-card" onclick="simpleFirebaseSetup.selectOption('demo')">
                            <div class="option-icon">🧪</div>
                            <div class="option-content">
                                <h5>デモ設定</h5>
                                <p>テスト用の設定でFirebase機能を体験できます</p>
                                <span class="option-badge">テスト用</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="simple-firebase-setup-actions">
                    <button onclick="simpleFirebaseSetup.closeModal()" class="btn-cancel">キャンセル</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // オプション選択
    selectOption(option) {
        switch (option) {
            case 'auto':
                this.showAutoSetup();
                break;
            case 'manual':
                this.showManualSetup();
                break;
            case 'demo':
                this.showDemoSetup();
                break;
        }
    }

    // 自動設定画面
    showAutoSetup() {
        const modal = document.querySelector('.simple-firebase-setup-modal');
        modal.innerHTML = `
            <div class="simple-firebase-setup-content">
                <div class="simple-firebase-setup-header">
                    <h3>🤖 自動Firebase設定</h3>
                    <span class="setup-indicator">AI自動設定</span>
                </div>
                <div class="simple-firebase-setup-body">
                    <div class="auto-setup-steps">
                        <h4>🚀 自動設定の手順:</h4>
                        
                        <div class="step-item">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h5>Firebase Consoleを開く</h5>
                                <p>新しいタブでFirebase Consoleが開きます</p>
                                <button onclick="simpleFirebaseSetup.openFirebaseConsole()" class="btn-primary">
                                    🔥 Firebase Consoleを開く
                                </button>
                            </div>
                        </div>
                        
                        <div class="step-item">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h5>プロジェクトを作成</h5>
                                <p>以下の情報でプロジェクトを作成してください:</p>
                                <div class="project-info">
                                    <strong>プロジェクト名:</strong> my-routine-app-${this.generateRandomId()}<br>
                                    <strong>Google Analytics:</strong> 無効（チェックを外す）
                                </div>
                            </div>
                        </div>
                        
                        <div class="step-item">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h5>設定をコピー</h5>
                                <p>プロジェクト作成後、設定オブジェクトをコピーして下記に貼り付けてください:</p>
                                <textarea id="firebaseConfigInput" class="config-input" 
                                    placeholder="const firebaseConfig = {
    apiKey: &quot;AIzaSyB...&quot;,
    authDomain: &quot;your-project.firebaseapp.com&quot;,
    projectId: &quot;your-project&quot;,
    storageBucket: &quot;your-project.appspot.com&quot;,
    messagingSenderId: &quot;123456789012&quot;,
    appId: &quot;1:123456789012:web:abcdefghijklmnop&quot;
};"></textarea>
                            </div>
                        </div>
                        
                        <div class="step-item">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <h5>設定を適用</h5>
                                <p>設定を確認して適用します</p>
                                <button onclick="simpleFirebaseSetup.applyConfig()" class="btn-success">
                                    ✅ 設定を適用
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="simple-firebase-setup-actions">
                    <button onclick="simpleFirebaseSetup.backToOptions()" class="btn-secondary">戻る</button>
                    <button onclick="simpleFirebaseSetup.closeModal()" class="btn-cancel">キャンセル</button>
                </div>
            </div>
        `;
    }

    // 手動設定画面
    showManualSetup() {
        const modal = document.querySelector('.simple-firebase-setup-modal');
        modal.innerHTML = `
            <div class="simple-firebase-setup-content">
                <div class="simple-firebase-setup-header">
                    <h3>⚙️ 手動Firebase設定</h3>
                    <span class="setup-indicator">上級者向け</span>
                </div>
                <div class="simple-firebase-setup-body">
                    <div class="manual-setup">
                        <h4>📝 既存のFirebase設定を入力:</h4>
                        <p>Firebase Consoleで取得した設定オブジェクトを入力してください。</p>
                        
                        <div class="config-section">
                            <label for="manualConfigInput">Firebase設定オブジェクト:</label>
                            <textarea id="manualConfigInput" class="config-input" 
                                placeholder="const firebaseConfig = {
    apiKey: &quot;AIzaSyB...&quot;,
    authDomain: &quot;your-project.firebaseapp.com&quot;,
    projectId: &quot;your-project&quot;,
    storageBucket: &quot;your-project.appspot.com&quot;,
    messagingSenderId: &quot;123456789012&quot;,
    appId: &quot;1:123456789012:web:abcdefghijklmnop&quot;
};"></textarea>
                        </div>
                        
                        <div class="config-status">
                            <span id="manualConfigStatus" class="status-waiting">設定を入力してください</span>
                        </div>
                        
                        <button onclick="simpleFirebaseSetup.applyManualConfig()" class="btn-success">
                            ✅ 設定を適用
                        </button>
                    </div>
                </div>
                <div class="simple-firebase-setup-actions">
                    <button onclick="simpleFirebaseSetup.backToOptions()" class="btn-secondary">戻る</button>
                    <button onclick="simpleFirebaseSetup.closeModal()" class="btn-cancel">キャンセル</button>
                </div>
            </div>
        `;
        
        // 入力検証を追加
        const textarea = document.getElementById('manualConfigInput');
        textarea.addEventListener('input', () => this.validateManualConfig());
    }

    // デモ設定画面
    showDemoSetup() {
        const modal = document.querySelector('.simple-firebase-setup-modal');
        modal.innerHTML = `
            <div class="simple-firebase-setup-content">
                <div class="simple-firebase-setup-header">
                    <h3>🧪 デモFirebase設定</h3>
                    <span class="setup-indicator">テスト用</span>
                </div>
                <div class="simple-firebase-setup-body">
                    <div class="demo-setup">
                        <h4>⚠️ デモ設定について:</h4>
                        <p>これはテスト用の設定です。実際のFirebaseプロジェクトではありません。</p>
                        
                        <div class="demo-warning">
                            <h5>注意事項:</h5>
                            <ul>
                                <li>実際のデータは保存されません</li>
                                <li>認証機能は動作しません</li>
                                <li>テスト目的でのみ使用してください</li>
                            </ul>
                        </div>
                        
                        <div class="demo-config">
                            <h5>デモ設定:</h5>
                            <pre><code>const firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:demo"
};</code></pre>
                        </div>
                        
                        <button onclick="simpleFirebaseSetup.applyDemoConfig()" class="btn-warning">
                            🧪 デモ設定を適用
                        </button>
                    </div>
                </div>
                <div class="simple-firebase-setup-actions">
                    <button onclick="simpleFirebaseSetup.backToOptions()" class="btn-secondary">戻る</button>
                    <button onclick="simpleFirebaseSetup.closeModal()" class="btn-cancel">キャンセル</button>
                </div>
            </div>
        `;
    }

    // Firebase Consoleを開く
    openFirebaseConsole() {
        window.open('https://console.firebase.google.com/', '_blank');
        showAINotification('Firebase Consoleが新しいタブで開きました！', 'info');
    }

    // 設定を適用
    applyConfig() {
        const textarea = document.getElementById('firebaseConfigInput');
        const configText = textarea.value.trim();
        
        if (!configText) {
            showAINotification('設定を入力してください', 'error');
            return;
        }
        
        if (this.validateConfig(configText)) {
            this.updateFirebaseConfig(configText);
        }
    }

    // 手動設定を適用
    applyManualConfig() {
        const textarea = document.getElementById('manualConfigInput');
        const configText = textarea.value.trim();
        
        if (!configText) {
            showAINotification('設定を入力してください', 'error');
            return;
        }
        
        if (this.validateConfig(configText)) {
            this.updateFirebaseConfig(configText);
        }
    }

    // デモ設定を適用
    applyDemoConfig() {
        const demoConfig = `const firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:demo"
};`;
        
        this.updateFirebaseConfig(demoConfig, true);
    }

    // 設定を検証
    validateConfig(configText) {
        try {
            const configMatch = configText.match(/const firebaseConfig = ({[\s\S]*?});/);
            if (!configMatch) {
                showAINotification('設定オブジェクトの形式が正しくありません', 'error');
                return false;
            }
            
            const configObject = configMatch[1];
            const config = eval('(' + configObject + ')');
            
            const requiredProps = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
            const missingProps = requiredProps.filter(prop => !config[prop]);
            
            if (missingProps.length > 0) {
                showAINotification(`不足しているプロパティ: ${missingProps.join(', ')}`, 'error');
                return false;
            }
            
            return true;
        } catch (error) {
            showAINotification('設定の解析に失敗しました', 'error');
            return false;
        }
    }

    // 手動設定を検証
    validateManualConfig() {
        const textarea = document.getElementById('manualConfigInput');
        const status = document.getElementById('manualConfigStatus');
        const configText = textarea.value.trim();
        
        if (!configText) {
            status.textContent = '設定を入力してください';
            status.className = 'status-waiting';
            return;
        }
        
        if (this.validateConfig(configText)) {
            status.textContent = '✅ 設定が有効です';
            status.className = 'status-success';
        } else {
            status.textContent = '❌ 設定に問題があります';
            status.className = 'status-error';
        }
    }

    // Firebase設定を更新
    updateFirebaseConfig(configText, isDemo = false) {
        try {
            const configMatch = configText.match(/const firebaseConfig = ({[\s\S]*?});/);
            const configObject = configMatch[1];
            
            const newConfigContent = `// Firebase設定
const firebaseConfig = ${configObject};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// FirestoreとAuthの初期化
const db = firebase.firestore();
const auth = firebase.auth();`;
            
            // 設定をローカルストレージに保存
            localStorage.setItem('pendingFirebaseConfig', newConfigContent);
            
            // GitHubにアップロード
            this.uploadToGitHub(newConfigContent, isDemo);
            
        } catch (error) {
            console.error('設定更新エラー:', error);
            showAINotification('設定の更新に失敗しました', 'error');
        }
    }

    // GitHubにアップロード
    async uploadToGitHub(configContent, isDemo = false) {
        try {
            const message = isDemo ? 'Apply demo Firebase configuration' : 'Apply Firebase configuration via simple setup';
            
            const response = await fetch('https://api.github.com/repos/Mametango/my-routine-app/contents/firebase-config.js', {
                method: 'PUT',
                headers: {
                    'Authorization': 'token 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',
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'My-Routine-App-Updater',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    content: btoa(unescape(encodeURIComponent(configContent)))
                })
            });
            
            if (response.ok) {
                this.showSuccessMessage(isDemo);
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('GitHub upload error:', error);
            showAINotification('GitHubへのアップロードに失敗しました', 'error');
        }
    }

    // 成功メッセージを表示
    showSuccessMessage(isDemo = false) {
        const modal = document.querySelector('.simple-firebase-setup-modal');
        modal.innerHTML = `
            <div class="simple-firebase-setup-content">
                <div class="simple-firebase-setup-header">
                    <h3>✅ 設定完了！</h3>
                    <span class="setup-indicator">成功</span>
                </div>
                <div class="simple-firebase-setup-body">
                    <div class="success-message">
                        <h4>🎉 Firebase設定が完了しました！</h4>
                        <p>${isDemo ? 'デモ設定が適用されました。' : 'Firebase設定が正常に適用されました。'}</p>
                        
                        <div class="next-steps">
                            <h5>次のステップ:</h5>
                            <ol>
                                <li>ページを再読み込みしてください</li>
                                <li>新しいアカウントを作成してください</li>
                                <li>ルーティンの管理を開始してください</li>
                            </ol>
                        </div>
                        
                        <div class="app-url">
                            <p><strong>アプリURL:</strong> <a href="https://Mametango.github.io/my-routine-app" target="_blank">https://Mametango.github.io/my-routine-app</a></p>
                        </div>
                    </div>
                </div>
                <div class="simple-firebase-setup-actions">
                    <button onclick="location.reload()" class="btn-primary">ページを再読み込み</button>
                    <button onclick="simpleFirebaseSetup.closeModal()" class="btn-secondary">閉じる</button>
                </div>
            </div>
        `;
    }

    // オプション選択画面に戻る
    backToOptions() {
        this.showSimpleSetupModal();
    }

    // モーダルを閉じる
    closeModal() {
        const modal = document.querySelector('.simple-firebase-setup-modal');
        if (modal) {
            modal.remove();
        }
    }

    // ランダムID生成
    generateRandomId() {
        return Math.random().toString(36).substring(2, 8);
    }
}

// グローバルインスタンス
const simpleFirebaseSetup = new SimpleFirebaseSetup();

// シンプル設定を開始
function startSimpleFirebaseSetup() {
    simpleFirebaseSetup.showSimpleSetupModal();
} 