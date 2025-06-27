// シンプル認証システム
class SimpleAuth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('simpleAuthUsers') || '{}');
        this.currentUser = JSON.parse(localStorage.getItem('simpleAuthCurrentUser') || 'null');
        this.isInitialized = false;
        this.syncKey = 'simpleAuthSync';
        this.authStateCallbacks = [];
    }

    // 初期化
    init() {
        if (this.isInitialized) return;
        
        console.log('SimpleAuth初期化開始...');
        console.log('保存されたユーザー数:', Object.keys(this.users).length);
        console.log('現在のユーザー:', this.currentUser ? this.currentUser.email : '未ログイン');
        
        // クラウド同期を試行
        this.syncWithCloud();
        
        // 既存のFirebase認証を無効化
        this.disableFirebaseAuth();
        
        // シンプル認証を有効化
        this.enableSimpleAuth();
        
        // 認証状態リスナーを設定
        this.setupAuthStateListener();
        
        this.isInitialized = true;
        console.log('SimpleAuth初期化完了');
        
        // 既にログイン済みの場合は認証状態を通知
        if (this.currentUser) {
            console.log('既存のログイン状態を復元:', this.currentUser.email);
            this.notifyAuthStateChange(this.currentUser);
        }
    }

    // 認証状態リスナーを設定
    setupAuthStateListener() {
        // ページ読み込み時に認証状態をチェック
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.checkAuthState();
            });
        } else {
            this.checkAuthState();
        }
        
        // ストレージ変更を監視（他のタブでのログイン/ログアウト）
        window.addEventListener('storage', (e) => {
            if (e.key === 'simpleAuthCurrentUser') {
                console.log('ストレージ変更を検出:', e.key);
                this.currentUser = e.newValue ? JSON.parse(e.newValue) : null;
                this.notifyAuthStateChange(this.currentUser);
            }
        });
    }

    // 認証状態をチェック
    checkAuthState() {
        const savedUser = localStorage.getItem('simpleAuthCurrentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                if (user && user.email) {
                    console.log('保存された認証状態を復元:', user.email);
                    this.currentUser = user;
                    this.notifyAuthStateChange(user);
                }
            } catch (error) {
                console.error('保存された認証状態の復元エラー:', error);
                localStorage.removeItem('simpleAuthCurrentUser');
            }
        }
    }

    // 認証状態変更を通知
    notifyAuthStateChange(user) {
        console.log('認証状態変更を通知:', user ? user.email : 'ログアウト');
        this.authStateCallbacks.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('認証状態変更コールバックエラー:', error);
            }
        });
    }

    // 認証状態リスナーを追加
    onAuthStateChanged(callback) {
        this.authStateCallbacks.push(callback);
        
        // 即座に現在の状態を通知
        if (this.currentUser) {
            setTimeout(() => callback(this.currentUser), 0);
        }
        
        return () => {
            const index = this.authStateCallbacks.indexOf(callback);
            if (index > -1) {
                this.authStateCallbacks.splice(index, 1);
            }
        };
    }

    // クラウド同期
    async syncWithCloud() {
        try {
            // Firebase Firestoreが利用可能な場合は同期
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const syncDoc = await db.collection('auth_sync').doc('users').get();
                
                if (syncDoc.exists) {
                    const cloudUsers = syncDoc.data().users || {};
                    console.log('クラウドからユーザーデータを同期:', Object.keys(cloudUsers).length, 'ユーザー');
                    
                    // ローカルとクラウドをマージ
                    this.users = { ...this.users, ...cloudUsers };
                    localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
                }
            }
        } catch (error) {
            console.log('クラウド同期エラー（ローカル認証を使用）:', error.message);
        }
    }

    // クラウドに保存
    async saveToCloud() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                await db.collection('auth_sync').doc('users').set({
                    users: this.users,
                    lastUpdated: new Date().toISOString()
                });
                console.log('ユーザーデータをクラウドに保存');
            }
        } catch (error) {
            console.log('クラウド保存エラー:', error.message);
        }
    }

    // Firebase認証を無効化
    disableFirebaseAuth() {
        // Firebase認証の代わりにシンプル認証を使用
        if (typeof auth !== 'undefined') {
            // Firebase認証をオーバーライド
            auth.onAuthStateChanged = (callback) => {
                // シンプル認証の状態を返す
                callback(this.currentUser);
            };
            
            auth.signInWithEmailAndPassword = (email, password) => {
                return this.signIn(email, password);
            };
            
            auth.createUserWithEmailAndPassword = (email, password) => {
                return this.signUp(email, password);
            };
            
            auth.signOut = () => {
                return this.signOut();
            };
        }
    }

    // シンプル認証を有効化
    enableSimpleAuth() {
        // 認証状態を監視
        this.onAuthStateChanged = (callback) => {
            this.authStateCallbacks.push(callback);
            
            // 即座に現在の状態を通知
            if (this.currentUser) {
                setTimeout(() => callback(this.currentUser), 0);
            }
            
            return () => {
                const index = this.authStateCallbacks.indexOf(callback);
                if (index > -1) {
                    this.authStateCallbacks.splice(index, 1);
                }
            };
        };
        
        // 既存の認証状態をチェック
        if (this.currentUser) {
            console.log('既存の認証状態を復元:', this.currentUser.email);
            this.notifyAuthStateChange(this.currentUser);
        }
    }

    // サインアップ
    async signUp(email, password) {
        try {
            console.log('シンプル認証: サインアップ開始', { email });
            
            // ユーザーが既に存在するかチェック
            if (this.users[email]) {
                console.log('シンプル認証: ユーザーは既に存在します');
                throw new Error('auth/email-already-in-use');
            }

            // パスワードの長さチェック
            if (password.length < 6) {
                console.log('シンプル認証: パスワードが短すぎます');
                throw new Error('auth/weak-password');
            }

            // 新しいユーザーを作成
            const userId = this.generateUserId();
            const user = {
                uid: userId,
                email: email,
                displayName: email.split('@')[0],
                createdAt: new Date().toISOString()
            };

            // ユーザーを保存
            this.users[email] = {
                ...user,
                password: this.hashPassword(password)
            };

            // ローカルストレージに保存
            localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
            
            // クラウドに同期
            await this.saveToCloud();

            // 現在のユーザーを設定
            this.currentUser = user;
            localStorage.setItem('simpleAuthCurrentUser', JSON.stringify(user));
            
            // 認証状態変更を通知
            this.notifyAuthStateChange(user);

            console.log('シンプル認証: サインアップ成功', user);
            return { user: user };
        } catch (error) {
            console.error('シンプル認証: サインアップエラー', error);
            throw error;
        }
    }

    // サインイン
    async signIn(email, password) {
        try {
            console.log('シンプル認証: サインイン開始', { email });
            
            // クラウドから最新データを同期
            await this.syncWithCloud();
            
            const userData = this.users[email];
            console.log('シンプル認証: ユーザーデータ検索結果', userData ? '見つかりました' : '見つかりませんでした');
            
            if (!userData) {
                console.log('シンプル認証: ユーザーが見つかりません');
                throw new Error('auth/user-not-found');
            }

            const passwordValid = this.verifyPassword(password, userData.password);
            console.log('シンプル認証: パスワード検証結果', passwordValid);
            
            if (!passwordValid) {
                console.log('シンプル認証: パスワードが正しくありません');
                throw new Error('auth/wrong-password');
            }

            // ユーザー情報を設定（パスワードは除外）
            const user = {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName,
                createdAt: userData.createdAt
            };

            this.currentUser = user;
            localStorage.setItem('simpleAuthCurrentUser', JSON.stringify(user));
            
            // 最終ログイン時間を更新
            this.updateLastLogin(user.uid);
            
            // 認証状態変更を通知
            this.notifyAuthStateChange(user);
            
            console.log('シンプル認証: サインイン成功', user);

            return { user: user };
        } catch (error) {
            console.error('シンプル認証: サインインエラー', error);
            throw error;
        }
    }

    // サインアウト
    async signOut() {
        console.log('シンプル認証: サインアウト開始');
        
        this.currentUser = null;
        localStorage.removeItem('simpleAuthCurrentUser');
        
        // 認証状態変更を通知
        this.notifyAuthStateChange(null);
        
        console.log('シンプル認証: サインアウト完了');
        return Promise.resolve();
    }

    // ユーザーID生成
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // パスワードハッシュ（簡易版）
    hashPassword(password) {
        // 実際のアプリではbcryptなどを使用
        return btoa(password + '_salt');
    }

    // パスワード検証
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // 現在のユーザーを取得
    getCurrentUser() {
        return this.currentUser;
    }

    // 認証状態をチェック
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // ユーザーデータを取得
    getUserData(userId) {
        for (const email in this.users) {
            if (this.users[email].uid === userId) {
                const userData = { ...this.users[email] };
                delete userData.password; // パスワードは除外
                return userData;
            }
        }
        return null;
    }

    // ユーザーデータを更新
    updateUserData(userId, data) {
        for (const email in this.users) {
            if (this.users[email].uid === userId) {
                this.users[email] = { ...this.users[email], ...data };
                localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
                return true;
            }
        }
        return false;
    }

    // ユーザーを削除
    deleteUser(userId) {
        for (const email in this.users) {
            if (this.users[email].uid === userId) {
                delete this.users[email];
                localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
                return true;
            }
        }
        return false;
    }

    // 全ユーザーを取得（管理者用）
    getAllUsers() {
        const users = [];
        for (const email in this.users) {
            const userData = this.users[email];
            // パスワードは除外してユーザー情報のみ返す
            const user = {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName,
                createdAt: userData.createdAt,
                lastLogin: userData.lastLogin || null
            };
            
            // ユーザーのルーティンと完了データを取得
            try {
                const userRoutines = JSON.parse(localStorage.getItem(`routines_${userData.uid}`)) || [];
                const userCompletions = JSON.parse(localStorage.getItem(`completions_${userData.uid}`)) || [];
                
                user.routines = userRoutines;
                user.completions = userCompletions;
            } catch (error) {
                console.error('ユーザーデータ取得エラー:', error);
                user.routines = [];
                user.completions = [];
            }
            
            users.push(user);
        }
        return users;
    }

    // ユーザーの最終ログイン時間を更新
    updateLastLogin(userId) {
        for (const email in this.users) {
            if (this.users[email].uid === userId) {
                this.users[email].lastLogin = new Date().toISOString();
                localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
                break;
            }
        }
    }

    // データをエクスポート
    exportData() {
        return {
            users: this.users,
            currentUser: this.currentUser
        };
    }

    // データをインポート
    importData(data) {
        if (data.users) {
            this.users = data.users;
            localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
        }
        if (data.currentUser) {
            this.currentUser = data.currentUser;
            localStorage.setItem('simpleAuthCurrentUser', JSON.stringify(this.currentUser));
        }
    }

    // データをリセット
    resetData() {
        this.users = {};
        this.currentUser = null;
        localStorage.removeItem('simpleAuthUsers');
        localStorage.removeItem('simpleAuthCurrentUser');
    }

    // 管理者ユーザーを作成
    createAdminUser(email, password) {
        try {
            console.log('管理者ユーザー作成開始:', email);
            
            // 既に存在するかチェック
            if (this.users[email]) {
                console.log('ユーザーは既に存在します。管理者権限を付与します。');
                this.users[email].isAdmin = true;
                this.users[email].role = 'admin';
                this.users[email].adminCreatedAt = new Date().toISOString();
                localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
                console.log('管理者権限を付与しました:', email);
                return { success: true, message: '管理者権限を付与しました' };
            }
            
            // 新しい管理者ユーザーを作成
            const userId = this.generateUserId();
            const hashedPassword = this.hashPassword(password);
            
            this.users[email] = {
                uid: userId,
                email: email,
                displayName: email.split('@')[0], // メールアドレスの@前を表示名として使用
                password: hashedPassword,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isAdmin: true,
                role: 'admin',
                adminCreatedAt: new Date().toISOString(),
                emailVerified: true,
                profile: {
                    displayName: email.split('@')[0],
                    photoURL: null
                }
            };
            
            // ローカルストレージに保存
            localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
            
            // クラウドに同期
            this.saveToCloud();
            
            console.log('管理者ユーザーを作成しました:', email);
            console.log('ユーザーID:', userId);
            console.log('管理者権限: 有効');
            
            return { 
                success: true, 
                message: '管理者ユーザーを作成しました',
                user: this.users[email]
            };
            
        } catch (error) {
            console.error('管理者ユーザー作成エラー:', error);
            return { 
                success: false, 
                message: '管理者ユーザーの作成に失敗しました: ' + error.message 
            };
        }
    }
    
    // 管理者ユーザーかどうかをチェック
    isAdminUser(email) {
        const user = this.users[email];
        return user && user.isAdmin === true;
    }
    
    // 管理者ユーザーでログイン
    async signInAsAdmin(email, password) {
        try {
            console.log('管理者ログイン試行:', email);
            
            // ユーザーが存在するかチェック
            if (!this.users[email]) {
                throw new Error('ユーザーが見つかりません');
            }
            
            // 管理者権限をチェック
            if (!this.isAdminUser(email)) {
                throw new Error('管理者権限がありません');
            }
            
            // パスワードを検証
            if (!this.verifyPassword(password, this.users[email].password)) {
                throw new Error('パスワードが正しくありません');
            }
            
            // ログイン成功
            this.currentUser = this.users[email];
            localStorage.setItem('simpleAuthCurrentUser', JSON.stringify(this.currentUser));
            
            // 最終ログイン時間を更新
            this.updateLastLogin(this.currentUser.uid);
            
            console.log('管理者ログイン成功:', email);
            this.notifyAuthStateChange(this.currentUser);
            
            return { 
                success: true, 
                message: '管理者としてログインしました',
                user: this.currentUser
            };
            
        } catch (error) {
            console.error('管理者ログインエラー:', error);
            return { 
                success: false, 
                message: error.message 
            };
        }
    }

    // パスワードリセット（管理者用）
    resetPassword(email, newPassword) {
        try {
            console.log('パスワードリセット開始:', email);
            
            if (!this.users[email]) {
                console.log('ユーザーが見つかりません:', email);
                return { success: false, message: 'ユーザーが見つかりません' };
            }
            
            // 新しいパスワードをハッシュ化
            const hashedPassword = this.hashPassword(newPassword);
            
            // パスワードを更新
            this.users[email].password = hashedPassword;
            localStorage.setItem('simpleAuthUsers', JSON.stringify(this.users));
            
            // クラウドに保存
            this.saveToCloud();
            
            console.log('パスワードリセット完了:', email);
            return { success: true, message: 'パスワードをリセットしました' };
            
        } catch (error) {
            console.error('パスワードリセットエラー:', error);
            return { success: false, message: error.message };
        }
    }

    // ユーザー情報を表示（デバッグ用）
    showUserInfo(email) {
        if (!this.users[email]) {
            console.log('ユーザーが見つかりません:', email);
            return null;
        }
        
        const userInfo = { ...this.users[email] };
        delete userInfo.password; // パスワードは除外
        
        console.log('ユーザー情報:', userInfo);
        return userInfo;
    }

    // 全ユーザーの一覧を表示（デバッグ用）
    listAllUsers() {
        console.log('=== 全ユーザー一覧 ===');
        const userList = [];
        
        for (const email in this.users) {
            const userInfo = { ...this.users[email] };
            delete userInfo.password; // パスワードは除外
            userList.push(userInfo);
            console.log(`- ${email}: ${userInfo.displayName || '名前なし'} (ID: ${userInfo.uid})`);
        }
        
        console.log('=== ユーザー一覧終了 ===');
        return userList;
    }
}

// グローバルインスタンス
const simpleAuth = new SimpleAuth();

// シンプル認証を開始
function startSimpleAuth() {
    simpleAuth.init();
    return simpleAuth;
}

// 認証状態の監視
function onAuthStateChanged(callback) {
    if (simpleAuth.isInitialized) {
        callback(simpleAuth.getCurrentUser());
    } else {
        // 初期化後にコールバックを実行
        setTimeout(() => {
            simpleAuth.init();
            callback(simpleAuth.getCurrentUser());
        }, 100);
    }
} 