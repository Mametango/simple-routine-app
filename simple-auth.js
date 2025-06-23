// シンプル認証システム
class SimpleAuth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('simpleAuthUsers') || '{}');
        this.currentUser = JSON.parse(localStorage.getItem('simpleAuthCurrentUser') || 'null');
        this.isInitialized = false;
    }

    // 初期化
    init() {
        if (this.isInitialized) return;
        
        // 既存のFirebase認証を無効化
        this.disableFirebaseAuth();
        
        // シンプル認証を有効化
        this.enableSimpleAuth();
        
        this.isInitialized = true;
        console.log('SimpleAuth initialized');
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
            callback(this.currentUser);
        };
    }

    // サインアップ
    async signUp(email, password) {
        try {
            // ユーザーが既に存在するかチェック
            if (this.users[email]) {
                throw new Error('auth/email-already-in-use');
            }

            // パスワードの長さチェック
            if (password.length < 6) {
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

            // 現在のユーザーを設定
            this.currentUser = user;
            localStorage.setItem('simpleAuthCurrentUser', JSON.stringify(user));

            return { user: user };
        } catch (error) {
            throw error;
        }
    }

    // サインイン
    async signIn(email, password) {
        try {
            const userData = this.users[email];
            
            if (!userData) {
                throw new Error('auth/user-not-found');
            }

            if (!this.verifyPassword(password, userData.password)) {
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

            return { user: user };
        } catch (error) {
            throw error;
        }
    }

    // サインアウト
    async signOut() {
        this.currentUser = null;
        localStorage.removeItem('simpleAuthCurrentUser');
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
        const users = {};
        for (const email in this.users) {
            users[email] = { ...this.users[email] };
            delete users[email].password;
        }
        return users;
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