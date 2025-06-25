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
    try {
        console.log('=== Firebase設定開始 ===');
        console.log('プロジェクトID:', firebaseConfig.projectId);
        
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase初期化完了');
        
        // FirestoreとAuthの初期化
        const db = firebase.firestore();
        const auth = firebase.auth();
        
        console.log('Firestore初期化完了');
        console.log('Auth初期化完了');
        
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
        
        console.log('Google認証プロバイダー設定完了');
        console.log('=== Firebase設定完了 ===');
        
        // 認証方法をGoogleのみに制限
        auth.fetchSignInMethodsForEmail = async function(email) {
            // Google認証のみを許可
            return ['google.com'];
        };
        
        console.log('Firebase初期化完了（Google認証のみ）');
        
    } catch (error) {
        console.error('Firebase設定エラー:', error);
        console.error('エラー詳細:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
    }
} else {
    console.error('Firebase SDKが読み込まれていません');
    console.error('firebase-config.jsがfirebase SDKの読み込み後に実行されていることを確認してください');
}

// Firebase認証状態の監視
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('Firebase認証状態変更 - ログイン:', user.email);
            // Googleログインの場合のみ処理
            if (user.providerData[0] && user.providerData[0].providerId === 'google.com') {
                handleFirebaseAuthStateChange(user);
            }
        } else {
            console.log('Firebase認証状態変更 - ログアウト');
        }
    });
}

// Firebase認証状態変更時の処理
function handleFirebaseAuthStateChange(user) {
    console.log('Firebase認証状態変更処理開始:', user.email);
    
    // ローカルアカウントをチェック
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const localUser = users.find(u => u.email === user.email);
    
    if (localUser) {
        // 既存のローカルアカウントとリンク
        currentUserInfo = {
            email: user.email,
            displayName: user.displayName || localUser.displayName,
            uid: user.uid,
            id: localUser.id,
            isGoogleUser: true
        };
        
        // Googleアカウントとリンク情報を更新
        localUser.isGoogleLinked = true;
        localUser.googleUid = user.uid;
        localUser.displayName = user.displayName || localUser.displayName;
        
        const updatedUsers = users.map(u => 
            u.email === user.email ? localUser : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // ストレージをFirebaseに設定
        currentStorage = 'firebase';
        localStorage.setItem('storageType', 'firebase');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        
        // メインアプリを表示
        showMainApp();
        
        console.log('Googleアカウントとローカルアカウントをリンク完了');
    } else {
        // 新しいGoogleユーザーの場合
        createLocalAccountForGoogleUser(user);
    }
} 