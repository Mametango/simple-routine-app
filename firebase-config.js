// Firebase設定ファイル
// Firebaseプロジェクトの実際の設定

const firebaseConfig = {
    apiKey: "AIzaSyBmkRs7f2a6ejf-qXJZ2F-jMWGnAGdvY0Q",
    authDomain: "simple-routine-app-33cfc.firebaseapp.com",
    projectId: "simple-routine-app-33cfc",
    storageBucket: "simple-routine-app-33cfc.firebasestorage.app",
    messagingSenderId: "124814607687",
    appId: "1:124814607687:web:d1b703506cad3ecbaa7862",
    measurementId: "G-57M4VBMXZM"
};

// 設定をグローバルに公開
window.firebaseConfig = firebaseConfig;

// 設定完了メッセージ
console.log(`
✅ Firebase設定完了！

プロジェクト: simple-routine-app-33cfc
認証ドメイン: simple-routine-app-33cfc.firebaseapp.com

クラウド機能が有効になりました：
- 🔐 ユーザー認証
- ☁️ データベース同期
- 🔒 セキュリティ保護
- 📱 マルチデバイス対応

アプリを再読み込みして、新しいアカウントでログインしてください。
`); 