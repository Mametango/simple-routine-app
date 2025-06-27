// Firebase設定ファイル
// このファイルを実際のFirebaseプロジェクトの設定に置き換えてください

const firebaseConfig = {
    // Firebase Console (https://console.firebase.google.com/) で取得してください
    
    // 1. Firebase Consoleでプロジェクトを作成
    // 2. Authentication > Sign-in method > Email/Password を有効化
    // 3. Firestore Database > Create database > Start in test mode
    // 4. Project settings > General > Your apps > Add app > Web app
    
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 設定をグローバルに公開
window.firebaseConfig = firebaseConfig;

// 設定の説明
console.log(`
Firebase設定について：

1. Firebase Console (https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Authentication > Sign-in method > Email/Password を有効化
4. Firestore Database > Create database > Start in test mode
5. Project settings > General > Your apps > Add app > Web app
6. 取得した設定を上記のfirebaseConfigに記入

注意: 本番環境では、適切なセキュリティルールを設定してください。

現在の設定状態:
- API Key: ${firebaseConfig.apiKey === 'YOUR_API_KEY' ? '未設定' : '設定済み'}
- Project ID: ${firebaseConfig.projectId === 'YOUR_PROJECT_ID' ? '未設定' : '設定済み'}

設定が未設定の場合、クラウド機能は動作しません。
`); 