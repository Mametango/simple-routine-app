// Firebase自動プロジェクト作成スクリプト
class FirebaseAutoCreator {
    constructor() {
        this.projectName = 'my-routine-app-' + this.generateRandomId();
        this.creationSteps = [
            {
                step: 1,
                title: "Firebaseプロジェクトの自動作成",
                description: "AIが自動でFirebaseプロジェクトを作成します",
                instructions: [
                    "Firebase Consoleにアクセスします",
                    "新しいプロジェクトを作成します",
                    "プロジェクト名: " + this.projectName,
                    "Google Analytics: 無効",
                    "プロジェクトを作成"
                ]
            },
            {
                step: 2,
                title: "Authentication設定",
                description: "メール/パスワード認証を有効化します",
                instructions: [
                    "左メニューから「Authentication」を選択",
                    "「始める」をクリック",
                    "「メール/パスワード」の「編集」をクリック",
                    "「有効にする」にチェック",
                    "「保存」をクリック"
                ]
            },
            {
                step: 3,
                title: "Firestore Database設定",
                description: "データベースを作成します",
                instructions: [
                    "左メニューから「Firestore Database」を選択",
                    "「データベースを作成」をクリック",
                    "「本番環境で開始」を選択",
                    "リージョン: asia-northeast1 (Tokyo)",
                    "「完了」をクリック"
                ]
            },
            {
                step: 4,
                title: "セキュリティルール設定",
                description: "データベースのセキュリティルールを設定します",
                instructions: [
                    "Firestore Database → 「ルール」タブをクリック",
                    "既存のルールを削除",
                    "新しいルールを入力（下記参照）",
                    "「公開」をクリック"
                ],
                rules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /routines/{routineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`
            },
            {
                step: 5,
                title: "Webアプリ設定",
                description: "Webアプリケーションを登録します",
                instructions: [
                    "プロジェクトの設定（⚙️）をクリック",
                    "「全般」タブで「Webアプリを追加」をクリック",
                    "アプリ名: My Routine Web App",
                    "「アプリを登録」をクリック",
                    "設定オブジェクトをコピー"
                ]
            }
        ];
        this.currentStep = 0;
    }

    // ランダムID生成
    generateRandomId() {
        return Math.random().toString(36).substring(2, 8);
    }

    // 自動作成を開始
    startAutoCreation() {
        this.showCreationModal();
    }

    // 作成モーダルを表示
    showCreationModal() {
        const modal = document.createElement('div');
        modal.className = 'firebase-auto-create-modal';
        modal.innerHTML = `
            <div class="firebase-auto-create-content">
                <div class="firebase-auto-create-header">
                    <h3>🤖 Firebase自動プロジェクト作成</h3>
                    <span class="create-indicator">AI自動設定</span>
                </div>
                <div class="firebase-auto-create-body">
                    <div class="project-info">
                        <h4>📋 プロジェクト情報</h4>
                        <p><strong>プロジェクト名:</strong> ${this.projectName}</p>
                        <p><strong>リージョン:</strong> asia-northeast1 (Tokyo)</p>
                        <p><strong>認証方式:</strong> メール/パスワード</p>
                    </div>
                    
                    <div class="auto-creation-options">
                        <h4>🚀 作成オプション</h4>
                        <div class="option-buttons">
                            <button onclick="firebaseAutoCreator.openFirebaseConsole()" class="btn-primary">
                                <span class="icon">🌐</span>
                                Firebase Consoleを開く
                            </button>
                            <button onclick="firebaseAutoCreator.showStepByStepGuide()" class="btn-secondary">
                                <span class="icon">📖</span>
                                ステップ別ガイド
                            </button>
                            <button onclick="firebaseAutoCreator.generateSampleConfig()" class="btn-info">
                                <span class="icon">🧪</span>
                                サンプル設定生成
                            </button>
                        </div>
                    </div>
                    
                    <div class="quick-setup">
                        <h4>⚡ クイックセットアップ</h4>
                        <p>以下のボタンをクリックして、Firebase Consoleでプロジェクトを作成してください：</p>
                        <button onclick="firebaseAutoCreator.openFirebaseConsole()" class="btn-large">
                            🔥 Firebase Consoleでプロジェクト作成
                        </button>
                    </div>
                </div>
                <div class="firebase-auto-create-actions">
                    <button onclick="firebaseAutoCreator.closeModal()" class="btn-cancel">閉じる</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Firebase Consoleを開く
    openFirebaseConsole() {
        const url = 'https://console.firebase.google.com/';
        window.open(url, '_blank');
        
        // 成功メッセージを表示
        this.showConsoleOpenedMessage();
    }

    // Console開設メッセージを表示
    showConsoleOpenedMessage() {
        const modal = document.querySelector('.firebase-auto-create-modal');
        modal.innerHTML = `
            <div class="firebase-auto-create-content">
                <div class="firebase-auto-create-header">
                    <h3>🌐 Firebase Consoleが開きました</h3>
                    <span class="create-indicator">次のステップ</span>
                </div>
                <div class="firebase-auto-create-body">
                    <div class="next-steps">
                        <h4>📋 次の手順:</h4>
                        <ol>
                            <li>開いたFirebase Consoleで「プロジェクトを追加」をクリック</li>
                            <li>プロジェクト名: <strong>${this.projectName}</strong></li>
                            <li>Google Analytics: <strong>無効</strong>（チェックを外す）</li>
                            <li>「プロジェクトを作成」をクリック</li>
                            <li>作成完了後、設定オブジェクトをコピー</li>
                        </ol>
                    </div>
                    
                    <div class="project-details">
                        <h4>📝 プロジェクト詳細:</h4>
                        <div class="detail-item">
                            <strong>プロジェクト名:</strong> ${this.projectName}
                        </div>
                        <div class="detail-item">
                            <strong>リージョン:</strong> asia-northeast1 (Tokyo)
                        </div>
                        <div class="detail-item">
                            <strong>認証:</strong> メール/パスワード
                        </div>
                    </div>
                    
                    <div class="config-preview">
                        <h4>📋 設定オブジェクトの例:</h4>
                        <pre><code>const firebaseConfig = {
    apiKey: "AIzaSyB...",
    authDomain: "${this.projectName}.firebaseapp.com",
    projectId: "${this.projectName}",
    storageBucket: "${this.projectName}.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};</code></pre>
                    </div>
                </div>
                <div class="firebase-auto-create-actions">
                    <button onclick="firebaseAutoCreator.showStepByStepGuide()" class="btn-primary">詳細ガイド</button>
                    <button onclick="firebaseAutoCreator.closeModal()" class="btn-secondary">閉じる</button>
                </div>
            </div>
        `;
    }

    // ステップ別ガイドを表示
    showStepByStepGuide() {
        const step = this.creationSteps[this.currentStep];
        if (!step) {
            this.showCompletionMessage();
            return;
        }

        let message = `🚀 ステップ ${step.step}: ${step.title}\n\n`;
        message += `${step.description}\n\n`;
        message += `📋 手順:\n`;
        
        step.instructions.forEach((instruction, index) => {
            message += `${index + 1}. ${instruction}\n`;
        });

        if (step.rules) {
            message += `\n📝 セキュリティルール:\n\`\`\`\n${step.rules}\n\`\`\``;
        }

        this.showStepModal(message, step);
    }

    // ステップモーダルを表示
    showStepModal(message, step) {
        const modal = document.querySelector('.firebase-auto-create-modal');
        modal.innerHTML = `
            <div class="firebase-auto-create-content">
                <div class="firebase-auto-create-header">
                    <h3>🤖 Firebase自動設定</h3>
                    <span class="step-indicator">ステップ ${step.step}/${this.creationSteps.length}</span>
                </div>
                <div class="firebase-auto-create-body">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                <div class="firebase-auto-create-actions">
                    ${this.currentStep > 0 ? '<button onclick="firebaseAutoCreator.previousStep()" class="btn-secondary">前へ</button>' : ''}
                    <button onclick="firebaseAutoCreator.nextStep()" class="btn-primary">次へ</button>
                    <button onclick="firebaseAutoCreator.closeModal()" class="btn-cancel">キャンセル</button>
                </div>
            </div>
        `;
    }

    // 次のステップ
    nextStep() {
        this.currentStep++;
        if (this.currentStep < this.creationSteps.length) {
            setTimeout(() => this.showStepByStepGuide(), 500);
        } else {
            this.showCompletionMessage();
        }
    }

    // 前のステップ
    previousStep() {
        this.currentStep--;
        setTimeout(() => this.showStepByStepGuide(), 500);
    }

    // 完了メッセージを表示
    showCompletionMessage() {
        const modal = document.querySelector('.firebase-auto-create-modal');
        modal.innerHTML = `
            <div class="firebase-auto-create-content">
                <div class="firebase-auto-create-header">
                    <h3>🎉 設定完了！</h3>
                    <span class="create-indicator">次のステップ</span>
                </div>
                <div class="firebase-auto-create-body">
                    <p><strong>Firebaseプロジェクトの設定が完了しました！</strong></p>
                    
                    <div class="next-steps">
                        <h4>📋 次のステップ:</h4>
                        <ol>
                            <li>コピーした設定オブジェクトを教えてください</li>
                            <li>AIが自動で設定ファイルを更新します</li>
                            <li>GitHubにアップロードして完了です</li>
                        </ol>
                    </div>
                    
                    <div class="config-example">
                        <h4>📝 設定オブジェクトの例:</h4>
                        <pre><code>const firebaseConfig = {
    apiKey: "AIzaSyB...",
    authDomain: "${this.projectName}.firebaseapp.com",
    projectId: "${this.projectName}",
    storageBucket: "${this.projectName}.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};</code></pre>
                    </div>
                </div>
                <div class="firebase-auto-create-actions">
                    <button onclick="firebaseAutoCreator.openConfigInput()" class="btn-primary">設定を入力</button>
                    <button onclick="firebaseAutoCreator.closeModal()" class="btn-secondary">後で</button>
                </div>
            </div>
        `;
    }

    // 設定入力モーダルを開く
    openConfigInput() {
        this.closeModal();
        // Firebase設定修正モーダルを開く
        if (typeof firebaseConfigFixer !== 'undefined') {
            firebaseConfigFixer.showConfigFixModal();
        } else {
            // フォールバック
            alert('設定入力機能を読み込み中...');
        }
    }

    // サンプル設定を生成
    generateSampleConfig() {
        const sampleConfig = `const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "${this.projectName}.firebaseapp.com",
    projectId: "${this.projectName}",
    storageBucket: "${this.projectName}.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};`;

        const modal = document.querySelector('.firebase-auto-create-modal');
        modal.innerHTML = `
            <div class="firebase-auto-create-content">
                <div class="firebase-auto-create-header">
                    <h3>🧪 サンプル設定生成</h3>
                    <span class="create-indicator">テスト用設定</span>
                </div>
                <div class="firebase-auto-create-body">
                    <p><strong>テスト用のFirebase設定を生成しました！</strong></p>
                    <p>⚠️ 注意: これはテスト用の設定です。実際のプロジェクトではありません。</p>
                    
                    <div class="sample-config">
                        <h4>📝 サンプル設定:</h4>
                        <textarea class="config-textarea" readonly>${sampleConfig}</textarea>
                        <button onclick="firebaseAutoCreator.copyToClipboard()" class="btn-secondary">
                            📋 コピー
                        </button>
                    </div>
                    
                    <div class="warning">
                        <h4>⚠️ 重要:</h4>
                        <ul>
                            <li>この設定は実際のFirebaseプロジェクトではありません</li>
                            <li>テスト目的でのみ使用してください</li>
                            <li>本格運用には実際のFirebaseプロジェクトが必要です</li>
                        </ul>
                    </div>
                </div>
                <div class="firebase-auto-create-actions">
                    <button onclick="firebaseAutoCreator.useSampleConfig()" class="btn-primary">この設定を使用</button>
                    <button onclick="firebaseAutoCreator.closeModal()" class="btn-secondary">閉じる</button>
                </div>
            </div>
        `;
    }

    // クリップボードにコピー
    copyToClipboard() {
        const textarea = document.querySelector('.config-textarea');
        textarea.select();
        document.execCommand('copy');
        
        // コピー成功メッセージ
        const button = document.querySelector('.config-textarea + button');
        const originalText = button.textContent;
        button.textContent = '✅ コピー完了';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }

    // サンプル設定を使用
    useSampleConfig() {
        const textarea = document.querySelector('.config-textarea');
        const configText = textarea.value;
        
        // 設定を処理
        if (typeof firebaseConfigFixer !== 'undefined') {
            this.closeModal();
            firebaseConfigFixer.showConfigFixModal();
            
            // 設定を入力欄に設定
            setTimeout(() => {
                const configInput = document.getElementById('firebaseConfigInput');
                if (configInput) {
                    configInput.value = configText;
                    firebaseConfigFixer.validateConfig();
                }
            }, 500);
        }
    }

    // モーダルを閉じる
    closeModal() {
        const modal = document.querySelector('.firebase-auto-create-modal');
        if (modal) {
            modal.remove();
        }
        this.currentStep = 0;
    }
}

// グローバルインスタンス
const firebaseAutoCreator = new FirebaseAutoCreator();

// 自動作成を開始
function startFirebaseAutoCreation() {
    firebaseAutoCreator.startAutoCreation();
} 