// Firebase自動設定スクリプト
class FirebaseAutoSetup {
    constructor() {
        this.setupSteps = [
            {
                step: 1,
                title: "Firebaseプロジェクトの作成",
                description: "Firebase Consoleでプロジェクトを作成します",
                url: "https://console.firebase.google.com/",
                instructions: [
                    "Firebase Consoleにアクセス",
                    "「プロジェクトを追加」をクリック",
                    "プロジェクト名: my-routine-app",
                    "Google Analytics: 無効",
                    "「プロジェクトを作成」をクリック"
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

    // 設定ガイドを開始
    startSetup() {
        this.showSetupGuide();
    }

    // 設定ガイドを表示
    showSetupGuide() {
        const step = this.setupSteps[this.currentStep];
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

        if (step.url) {
            message += `\n🔗 リンク: ${step.url}`;
        }

        message += `\n\n✅ 完了したら「次へ」をクリックしてください。`;

        this.showSetupModal(message, step);
    }

    // 設定モーダルを表示
    showSetupModal(message, step) {
        const modal = document.createElement('div');
        modal.className = 'firebase-setup-modal';
        modal.innerHTML = `
            <div class="firebase-setup-content">
                <div class="firebase-setup-header">
                    <h3>🤖 Firebase自動設定</h3>
                    <span class="step-indicator">ステップ ${step.step}/${this.setupSteps.length}</span>
                </div>
                <div class="firebase-setup-body">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                <div class="firebase-setup-actions">
                    ${this.currentStep > 0 ? '<button onclick="firebaseSetup.previousStep()" class="btn-secondary">前へ</button>' : ''}
                    <button onclick="firebaseSetup.nextStep()" class="btn-primary">次へ</button>
                    <button onclick="firebaseSetup.closeSetup()" class="btn-cancel">キャンセル</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // 次のステップ
    nextStep() {
        this.currentStep++;
        this.closeSetupModal();
        
        if (this.currentStep < this.setupSteps.length) {
            setTimeout(() => this.showSetupGuide(), 500);
        } else {
            this.showCompletionMessage();
        }
    }

    // 前のステップ
    previousStep() {
        this.currentStep--;
        this.closeSetupModal();
        setTimeout(() => this.showSetupGuide(), 500);
    }

    // 設定モーダルを閉じる
    closeSetupModal() {
        const modal = document.querySelector('.firebase-setup-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 設定を閉じる
    closeSetup() {
        this.closeSetupModal();
        this.currentStep = 0;
    }

    // 完了メッセージを表示
    showCompletionMessage() {
        const message = `
🎉 Firebase設定が完了しました！

次のステップ:
1. コピーした設定オブジェクトを教えてください
2. AIが自動で設定ファイルを更新します
3. GitHubにアップロードして完了です

設定オブジェクトの例:
\`\`\`javascript
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "my-routine-app-xxxxx.firebaseapp.com",
    projectId: "my-routine-app-xxxxx",
    storageBucket: "my-routine-app-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};
\`\`\`

設定オブジェクトをコピーして教えてください！
        `;

        this.showSetupModal(message, { step: '完了' });
    }

    // 設定オブジェクトを処理
    processConfig(configText) {
        try {
            // 設定オブジェクトを解析
            const configMatch = configText.match(/const firebaseConfig = ({[\s\S]*?});/);
            if (!configMatch) {
                throw new Error('設定オブジェクトが見つかりません');
            }

            const configObject = configMatch[1];
            
            // 設定ファイルを更新
            this.updateFirebaseConfig(configObject);
            
            return true;
        } catch (error) {
            console.error('設定オブジェクトの処理エラー:', error);
            return false;
        }
    }

    // Firebase設定ファイルを更新
    updateFirebaseConfig(configObject) {
        const configContent = `// Firebase設定
const firebaseConfig = ${configObject};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// FirestoreとAuthの初期化
const db = firebase.firestore();
const auth = firebase.auth();`;

        // 設定ファイルを更新（実際のファイルシステムでは実行できないため、内容を表示）
        console.log('更新された設定ファイル:', configContent);
        
        // ユーザーに設定内容を表示
        this.showConfigUpdateMessage(configContent);
    }

    // 設定更新メッセージを表示
    showConfigUpdateMessage(configContent) {
        const message = `
✅ Firebase設定が正常に処理されました！

設定ファイルの内容:
\`\`\`javascript
${configContent}
\`\`\`

この設定でGitHubにアップロードしますか？
        `;

        this.showSetupModal(message, { step: '設定完了' });
    }
}

// グローバルインスタンス
const firebaseSetup = new FirebaseAutoSetup();

// 自動設定を開始
function startFirebaseAutoSetup() {
    firebaseSetup.startSetup();
}

// 設定オブジェクトを処理
function processFirebaseConfig() {
    const configInput = document.getElementById('firebaseConfigInput');
    if (configInput) {
        const configText = configInput.value;
        const success = firebaseSetup.processConfig(configText);
        
        if (success) {
            showAINotification('Firebase設定が正常に処理されました！', 'success');
        } else {
            showAINotification('設定オブジェクトの処理に失敗しました。形式を確認してください。', 'error');
        }
    }
} 