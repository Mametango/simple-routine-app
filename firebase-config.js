// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyBYBNysq-wY0LMsrvAgjnail9md2NJdYUo",
    authDomain: "my-routine-app-a0708.firebaseapp.com",
    projectId: "my-routine-app-a0708",
    storageBucket: "my-routine-app-a0708.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:47e91a320afba0459e558d"
};

// Firebase初期化
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // FirestoreとAuthの初期化
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // モバイル認証の設定
    auth.useDeviceLanguage();
    auth.settings.appVerificationDisabledForTesting = false;
    
    // 永続化設定（デバイス間で認証状態を保持）
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    
    // Google認証プロバイダーの設定
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    // カスタムパラメータ（オプション）
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });
    
    // グローバルに公開
    window.googleAuthProvider = googleProvider;
    
    console.log('Firebase設定完了:', firebaseConfig.projectId);
    console.log('Google認証プロバイダー設定完了');
} else {
    console.error('Firebase SDKが読み込まれていません');
}
