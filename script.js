// グローバル変数
let currentUser = null;
let routines = [];
let completions = [];
let currentEditId = null;
let googleDriveInitialized = false;

// リアルタイム同期リスナー
let routinesListener = null;
let completionsListener = null;

// ユーザータイプ定義
const USER_TYPES = {
    REGULAR: 'regular',    // 一般ユーザー
    FRIEND: 'friend',      // 友達
    ADMIN: 'admin'         // 管理者
};

// ユーザータイプの表示名
const USER_TYPE_NAMES = {
    [USER_TYPES.REGULAR]: '一般ユーザー',
    [USER_TYPES.FRIEND]: '友達',
    [USER_TYPES.ADMIN]: '管理者'
};

// ユーザータイプのアイコン
const USER_TYPE_ICONS = {
    [USER_TYPES.REGULAR]: '👤',
    [USER_TYPES.FRIEND]: '👥',
    [USER_TYPES.ADMIN]: '🛡️'
};

// 友達管理クラス
class FriendManager {
    constructor() {
        this.friends = this.loadFriends();
    }
    
    // 友達リストを読み込み
    loadFriends() {
        const friendsData = localStorage.getItem('friendList');
        return friendsData ? JSON.parse(friendsData) : [];
    }
    
    // 友達リストを保存
    saveFriends() {
        localStorage.setItem('friendList', JSON.stringify(this.friends));
    }
    
    // 友達を追加
    addFriend(userId, userEmail, userName) {
        const friend = {
            id: userId,
            email: userEmail,
            name: userName,
            addedAt: new Date().toISOString(),
            addedBy: currentUser ? currentUser.email : 'unknown'
        };
        
        if (!this.friends.find(f => f.id === userId)) {
            this.friends.push(friend);
            this.saveFriends();
            console.log('友達を追加しました:', userEmail);
            return true;
        }
        return false;
    }
    
    // 友達を削除
    removeFriend(userId) {
        const index = this.friends.findIndex(f => f.id === userId);
        if (index !== -1) {
            this.friends.splice(index, 1);
            this.saveFriends();
            console.log('友達を削除しました:', userId);
            return true;
        }
        return false;
    }
    
    // 友達かどうかチェック
    isFriend(userId) {
        return this.friends.some(f => f.id === userId);
    }
    
    // 友達リストを取得
    getFriends() {
        return this.friends;
    }
    
    // 友達数を取得
    getFriendCount() {
        return this.friends.length;
    }
}

// グローバルで友達マネージャーを初期化
const friendManager = new FriendManager();

// 広告管理クラス
class AdManager {
    constructor() {
        this.adEnabled = this.loadAdSettings();
    }
    
    // 広告設定を読み込み
    loadAdSettings() {
        const settings = localStorage.getItem('adSettings');
        return settings ? JSON.parse(settings) : { enabled: true };
    }
    
    // 広告設定を保存
    saveAdSettings() {
        localStorage.setItem('adSettings', JSON.stringify(this.adEnabled));
    }
    
    // 広告を表示するかどうか判定
    shouldShowAds(userType) {
        // 一般ユーザーのみに広告を表示
        return this.adEnabled.enabled && userType === USER_TYPES.REGULAR;
    }
    
    // 広告を表示
    showAds() {
        if (!this.shouldShowAds(getCurrentUserType())) {
            return;
        }
        
        // 広告表示ロジック（将来的に実装）
        console.log('広告を表示します');
        this.displayAdPlaceholder();
    }
    
    // 広告プレースホルダーを表示
    displayAdPlaceholder() {
        const adContainer = document.getElementById('adContainer');
        if (adContainer) {
            adContainer.innerHTML = `
                <div class="ad-placeholder">
                    <div class="ad-content">
                        <h3>📢 広告エリア</h3>
                        <p>ここに広告が表示されます</p>
                        <small>一般ユーザーのみに表示</small>
                    </div>
                </div>
            `;
            adContainer.style.display = 'block';
        }
    }
    
    // 広告を非表示
    hideAds() {
        const adContainer = document.getElementById('adContainer');
        if (adContainer) {
            adContainer.style.display = 'none';
        }
    }
}

// グローバルで広告マネージャーを初期化
const adManager = new AdManager();

// 現在のユーザータイプを取得
function getCurrentUserType() {
    if (!currentUser) return USER_TYPES.REGULAR;
    
    // 管理者チェック
    if (isAdminUser(currentUser)) {
        return USER_TYPES.ADMIN;
    }
    
    // 友達チェック
    if (friendManager.isFriend(currentUser.id)) {
        return USER_TYPES.FRIEND;
    }
    
    // デフォルトは一般ユーザー
    return USER_TYPES.REGULAR;
}

// ユーザータイプを設定
function setUserType(userId, userType) {
    if (userType === USER_TYPES.FRIEND) {
        // 友達として追加
        const user = getAllUsersData().find(u => u.uid === userId);
        if (user) {
            friendManager.addFriend(userId, user.email, user.displayName || user.email);
        }
    } else if (userType === USER_TYPES.REGULAR) {
        // 友達から削除（一般ユーザーに戻す）
        friendManager.removeFriend(userId);
    }
    
    // 現在のユーザーの場合、UIを更新
    if (currentUser && currentUser.id === userId) {
        updateUserTypeDisplay();
        updateAdDisplay();
    }
}

// ユーザータイプ表示を更新
function updateUserTypeDisplay() {
    const userType = getCurrentUserType();
    const userTypeElement = document.getElementById('userTypeDisplay');
    
    if (userTypeElement) {
        userTypeElement.innerHTML = `
            <span class="user-type-badge ${userType}">
                ${USER_TYPE_ICONS[userType]} ${USER_TYPE_NAMES[userType]}
            </span>
        `;
    }
}

// 広告表示を更新
function updateAdDisplay() {
    const userType = getCurrentUserType();
    
    if (adManager.shouldShowAds(userType)) {
        adManager.showAds();
    } else {
        adManager.hideAds();
    }
}

// 設定管理クラス
class SettingsManager {
    constructor() {
        this.settings = {};
        this.loadSettings();
    }
    
    // 設定を読み込み
    loadSettings() {
        try {
            const globalSettings = JSON.parse(localStorage.getItem('globalSettings') || '{}');
            this.settings = globalSettings;
            console.log('設定を読み込み:', this.settings);
        } catch (error) {
            console.error('設定読み込みエラー:', error);
            this.settings = {};
        }
    }
    
    // 設定を保存
    saveSettings() {
        try {
            localStorage.setItem('globalSettings', JSON.stringify(this.settings));
            console.log('設定を保存:', this.settings);
        } catch (error) {
            console.error('設定保存エラー:', error);
        }
    }
    
    // ユーザー設定を取得
    getUserSetting(userId, key, defaultValue = null) {
        if (!userId) return defaultValue;
        
        if (!this.settings[userId]) {
            this.settings[userId] = {};
        }
        
        return this.settings[userId][key] !== undefined ? this.settings[userId][key] : defaultValue;
    }
    
    // ユーザー設定を設定
    setUserSetting(userId, key, value) {
        if (!userId) return;
        
        if (!this.settings[userId]) {
            this.settings[userId] = {};
        }
        
        this.settings[userId][key] = value;
        this.saveSettings();
        console.log(`ユーザー設定を更新: ${userId}.${key} = ${value}`);
    }
    
    // 全ユーザーで共通の設定を取得
    getGlobalSetting(key, defaultValue = null) {
        return this.settings.global && this.settings.global[key] !== undefined 
            ? this.settings.global[key] 
            : defaultValue;
    }
    
    // 全ユーザーで共通の設定を設定
    setGlobalSetting(key, value) {
        if (!this.settings.global) {
            this.settings.global = {};
        }
        
        this.settings.global[key] = value;
        this.saveSettings();
        console.log(`グローバル設定を更新: global.${key} = ${value}`);
    }
    
    // 設定をクラウドに同期
    async syncToCloud() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore && currentUser) {
                const db = firebase.firestore();
                await db.collection('users').doc(currentUser.id).collection('settings').doc('app').set({
                    settings: this.settings,
                    lastUpdated: new Date().toISOString()
                });
                console.log('設定をクラウドに同期しました');
                return true;
            }
        } catch (error) {
            console.error('設定クラウド同期エラー:', error);
        }
        return false;
    }
    
    // 設定をクラウドから同期
    async syncFromCloud() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore && currentUser) {
                const db = firebase.firestore();
                const doc = await db.collection('users').doc(currentUser.id).collection('settings').doc('app').get();
                
                if (doc.exists) {
                    const cloudSettings = doc.data().settings || {};
                    // ローカルとクラウドをマージ（クラウドを優先）
                    this.settings = { ...this.settings, ...cloudSettings };
                    this.saveSettings();
                    console.log('設定をクラウドから同期しました');
                    return true;
                }
            }
        } catch (error) {
            console.error('設定クラウド同期エラー:', error);
        }
        return false;
    }
}

// グローバル設定マネージャー
let settingsManager = new SettingsManager();

// 選択されたストレージを取得（ユーザー別）
function getSelectedStorage() {
    if (!currentUser) {
        return localStorage.getItem('selectedStorage') || 'firebase';
    }
    return settingsManager.getUserSetting(currentUser.id, 'selectedStorage', 'firebase');
}

// 選択されたストレージを設定（ユーザー別）
function setSelectedStorage(storageType) {
    if (currentUser) {
        settingsManager.setUserSetting(currentUser.id, 'selectedStorage', storageType);
    } else {
        localStorage.setItem('selectedStorage', storageType);
    }
}

// 初期設定を読み込み
let selectedStorage = getSelectedStorage();

// デバイス情報を取得
function getDeviceInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString()
    };
}

// デバイス間認証状態をチェック
function checkCrossDeviceAuth() {
    console.log('=== デバイス間認証チェック ===');
    console.log('デバイス情報:', getDeviceInfo());
    
    // ログイン状態保持設定を復元
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const rememberMeCheckbox = document.getElementById('rememberMe');
    if (rememberMeCheckbox) {
        rememberMeCheckbox.checked = rememberMe;
        console.log('ログイン状態保持設定を復元:', rememberMe);
    }
    
    // シンプル認証状態をチェック
    if (typeof simpleAuth !== 'undefined') {
        if (simpleAuth.isAuthenticated()) {
            console.log('シンプル認証済み:', simpleAuth.getCurrentUser().email);
            
            // ユーザー情報を設定
            const user = simpleAuth.getCurrentUser();
            if (user) {
                currentUser = {
                    id: user.uid || user.email,
                    username: user.displayName || user.email,
                    email: user.email
                };
                
                // 管理者かどうかをチェック
                const isAdmin = isAdminUser(currentUser);
                console.log('管理者権限:', isAdmin ? 'あり' : 'なし');
                
                if (isAdmin) {
                    // 管理者の場合は管理者ダッシュボードを表示
                    console.log('管理者としてログイン: 管理者ダッシュボードを表示');
                    showAdminDashboard();
                } else {
                    // 一般ユーザーの場合は通常のメインアプリを表示
                    console.log('一般ユーザーとしてログイン: メインアプリを表示');
                    showMainApp();
                    initializeApp();
                }
            }
        } else {
            console.log('シンプル認証未認証');
            
            // ログイン状態保持が有効で、永続的な認証情報がある場合は自動ログイン
            const persistentAuth = localStorage.getItem('simpleAuthPersistent') === 'true';
            if (rememberMe && persistentAuth) {
                console.log('永続的な認証情報を検出、自動ログインを試行');
                // 自動ログイン処理をここに追加（必要に応じて）
            }
        }
    }
    
    // Firebase認証状態もチェック
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('Firebase認証済み:', user.email);
                
                // ユーザー情報を設定
                currentUser = {
                    id: user.uid,
                    username: user.displayName || user.email,
                    email: user.email
                };
                
                // 管理者かどうかをチェック
                const isAdmin = isAdminUser(currentUser);
                console.log('管理者権限:', isAdmin ? 'あり' : 'なし');
                
                if (isAdmin) {
                    // 管理者の場合は管理者ダッシュボードを表示
                    console.log('管理者としてログイン: 管理者ダッシュボードを表示');
                    showAdminDashboard();
                } else {
                    // 一般ユーザーの場合は通常のメインアプリを表示
                    console.log('一般ユーザーとしてログイン: メインアプリを表示');
                    showMainApp();
                    initializeApp();
                }
            } else {
                console.log('Firebase認証未認証');
            }
        });
    }
}

// データ同期状態を表示
function showSyncStatus(isServer = true, storageType = selectedStorage) {
    const statusElement = document.getElementById('syncStatus');
    if (statusElement) {
        const storageNames = {
            'firebase': 'Firebase',
            'google-drive': 'Google Drive',
            'local': 'ローカル'
        };
        
        if (isServer) {
            statusElement.textContent = `🟢 ${storageNames[storageType]}同期済み`;
            statusElement.className = 'sync-status server-sync';
        } else {
            statusElement.textContent = `🟡 ${storageNames[storageType]}保存`;
            statusElement.className = 'sync-status local-sync';
        }
    }
}

// データ同期状態をチェック
function checkSyncStatus() {
    console.log('=== 同期状態チェック開始 ===');
    
    // Firebase利用可能性をチェック
    const firebaseAvailable = typeof firebase !== 'undefined' && firebase.firestore;
    console.log('Firebase利用可能:', firebaseAvailable);
    
    if (firebaseAvailable) {
        console.log('Firebase設定:', {
            projectId: firebase.app().options.projectId,
            authDomain: firebase.app().options.authDomain
        });
        
        // 認証状態をチェック
        const auth = firebase.auth();
        const currentUser = auth.currentUser;
        console.log('認証状態:', currentUser ? `ログイン済み (${currentUser.email})` : '未ログイン');
        
        if (currentUser) {
            // Firestore接続テスト
            const db = firebase.firestore();
            db.collection('test').doc('connection-test').get()
                .then(() => {
                    console.log('Firestore接続成功');
                    showSyncStatus(true);
                })
                .catch((error) => {
                    console.error('Firestore接続エラー:', error);
                    showSyncStatus(false);
                });
        } else {
            console.log('ユーザーが認証されていないため、ローカル保存を使用');
            showSyncStatus(false);
        }
    } else {
        console.log('Firebaseが利用できないため、ローカル保存を使用');
        showSyncStatus(false);
    }
    
    console.log('=== 同期状態チェック完了 ===');
    return firebaseAvailable;
}

// プルツーリフレッシュを初期化
function initPullToRefresh() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;
    
    console.log('プルツーリフレッシュを初期化');
    
    // プルツーリフレッシュインジケーターを作成
    createPullToRefreshIndicator();
    
    // タッチイベントを設定
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
}

// プルツーリフレッシュインジケーターを作成
function createPullToRefreshIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'pullToRefreshIndicator';
    indicator.innerHTML = `
        <div class="pull-indicator-content">
            <div class="pull-indicator-icon">⬇️</div>
            <div class="pull-indicator-text">下に引いて同期</div>
        </div>
    `;
    indicator.style.cssText = `
        position: fixed;
        top: -60px;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: transform 0.3s ease;
        transform: translateY(0);
    `;
    
    document.body.appendChild(indicator);
}

// デバイス間同期のためのユーティリティ
function syncUserData() {
    if (typeof simpleAuth !== 'undefined') {
        simpleAuth.syncWithCloud().then(() => {
            console.log('ユーザーデータの同期が完了しました');
        }).catch(error => {
            console.error('ユーザーデータ同期エラー:', error);
        });
    }
}

// 配列の安全な初期化
function ensureArraysInitialized() {
    if (!Array.isArray(routines)) {
        console.log('routines配列を初期化');
        routines = [];
    }
    if (!Array.isArray(completions)) {
        console.log('completions配列を初期化');
        completions = [];
    }
}

// 安全なfind関数
function safeFind(array, predicate) {
    if (!Array.isArray(array)) {
        console.warn('配列が初期化されていません:', array);
        return null;
    }
    try {
        return array.find(predicate);
    } catch (error) {
        console.error('find関数でエラーが発生:', error);
        return null;
    }
}

// 安全なfindIndex関数
function safeFindIndex(array, predicate) {
    if (!Array.isArray(array)) {
        console.warn('配列が初期化されていません:', array);
        return -1;
    }
    try {
        return array.findIndex(predicate);
    } catch (error) {
        console.error('findIndex関数でエラーが発生:', error);
        return -1;
    }
}

// プルツーリフレッシュ機能
let isRefreshing = false;
let startY = 0;
let currentY = 0;
let pullDistance = 0;
const PULL_THRESHOLD = 80;

// Google Drive API設定
const GOOGLE_DRIVE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Google Cloud Consoleで取得
const GOOGLE_DRIVE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Google Cloud Consoleで取得
const GOOGLE_DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Firebase設定を修正
function fixFirebaseConfig() {
    if (typeof startSimpleFirebaseSetup === 'function') {
        startSimpleFirebaseSetup();
    } else {
        alert('Firebase設定機能が利用できません');
    }
}

// AI通知を表示
function showAINotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.ai-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 通知要素を作成
    const notification = document.createElement('div');
    notification.className = `ai-notification ai-notification-${type}`;
    notification.innerHTML = `
        <div class="ai-notification-content">
            <span class="ai-notification-message">${message}</span>
            <button class="ai-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // 通知を表示
    document.body.appendChild(notification);
    
    // 3秒後に自動削除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// 認証状態変更ハンドラー（更新版）
async function handleAuthStateChange(user) {
    console.log('認証状態が変更されました:', user ? `ユーザー: ${user.email}` : 'ログアウト状態');
    const onAuthPage = window.location.pathname.includes('register.html') || window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

    if (user) {
        console.log('ユーザーがログインしました。UIを更新します。');
        
        try {
            // ユーザー情報を設定（Googleログイン対応）
            currentUser = {
                id: user.uid,
                username: user.displayName || user.email,
                email: user.email,
                photoURL: user.photoURL
            };
            
            // 管理者かどうかをチェック
            const isAdmin = isAdminUser(currentUser);
            console.log('管理者権限:', isAdmin ? 'あり' : 'なし');
            
            // Googleアカウントかどうかを判定してストレージを自動選択
            const isGoogleAccount = user.providerData.some(provider => provider.providerId === 'google.com');
            
            // 設定をクラウドから同期
            if (currentUser) {
                await settingsManager.syncFromCloud();
            }
            
            if (isGoogleAccount) {
                // Googleアカウントの場合はFirebaseを使用
                setSelectedStorage('firebase');
                console.log('Googleアカウントを検出: Firebaseストレージを使用');
                showAINotification('Googleアカウントでログインしました。Firebaseで同期します。', 'success');
                
                // リアルタイム同期を開始
                startRealtimeSync();
            } else {
                // その他のアカウントの場合はローカル保存を使用
                setSelectedStorage('local');
                console.log('通常アカウントを検出: ローカルストレージを使用');
                showAINotification('ローカル保存でログインしました。', 'info');
            }
            
            // 設定をクラウドに同期
            if (currentUser) {
                settingsManager.syncToCloud();
            }
            
            // 選択を保存
            localStorage.setItem('selectedStorage', selectedStorage);
            
            if (onAuthPage) {
                // 認証ページにいる場合は、適切な画面に切り替える
                console.log('認証ページから適切な画面に切り替えます。');
                
                // 管理者も一般ユーザーも通常のメインアプリを表示
                console.log('ログイン成功: メインアプリを表示');
                showMainApp();
                
                // 初期化を少し遅延させてUI更新を確実にする
                setTimeout(() => {
                    try {
                        // 全ユーザーで通常の初期化
                        initializeApp();
                    } catch (initError) {
                        console.error('初期化エラー:', initError);
                        showAINotification('初期化に失敗しましたが、ログインは成功しています。', 'warning');
                        
                        // フォールバック処理
                        try {
                            setSelectedStorage('local');
                            loadRoutinesFromLocal();
                            loadCompletionsFromLocal();
                            displayRoutines();
                            showAINotification('ローカル保存モードで動作します', 'info');
                        } catch (fallbackError) {
                            console.error('フォールバック処理も失敗:', fallbackError);
                            showAINotification('アプリの起動に失敗しました', 'error');
                        }
                    }
                }, 100);
            } else if (window.location.pathname.includes('register.html')) {
                // 登録ページからリダイレクト
                console.log('登録ページからリダイレクトします。');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('認証状態変更処理エラー:', error);
            showAINotification('ログイン処理でエラーが発生しました: ' + error.message, 'error');
        }
    } else {
        console.log('ユーザーがログアウトしました。認証画面を表示します。');
        currentUser = null;
        
        // リアルタイム同期を停止
        stopRealtimeSync();
        
        if (!onAuthPage) {
            // メインアプリにいる場合は、認証画面に切り替える
            console.log('メインアプリから認証画面に切り替えます。');
            showAuthForm();
        }
    }
}

// メインアプリを表示
function showMainApp() {
    console.log('メインアプリを表示中...');
    
    try {
        // 認証コンテナを非表示
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.style.display = 'none';
            console.log('認証コンテナを非表示にしました');
        } else {
            console.error('認証コンテナが見つかりません');
        }
        
        // メインアプリを表示
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'block';
            mainApp.className = 'app'; // CSSクラスを確実に適用
            console.log('メインアプリを表示しました');
            console.log('メインアプリの表示状態:', mainApp.style.display);
            console.log('メインアプリのクラス:', mainApp.className);
            
            // メインアプリの内容を確認
            const header = mainApp.querySelector('.header');
            const todaySection = mainApp.querySelector('.today-section');
            const allRoutinesSection = mainApp.querySelector('.all-routines-section');
            
            console.log('ヘッダー要素:', header ? '存在' : '存在しない');
            console.log('今日のルーティンセクション:', todaySection ? '存在' : '存在しない');
            console.log('全ルーティンセクション:', allRoutinesSection ? '存在' : '存在しない');
        } else {
            console.error('メインアプリ要素が見つかりません');
        }
        
        // ユーザー名を設定
        if (currentUser) {
            const currentUserElement = document.getElementById('currentUser');
            if (currentUserElement) {
                currentUserElement.textContent = currentUser.username;
                console.log('ユーザー名を設定:', currentUser.username);
            } else {
                console.error('ユーザー名要素が見つかりません');
            }
            
            // 管理者ボタンの表示制御
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn) {
                if (isAdminUser(currentUser)) {
                    adminBtn.style.display = 'block';
                    console.log('管理者ボタンを表示しました');
                    // 管理者ログイン成功の通知
                    showAINotification('管理者としてログインしました。ヘッダーのシールドアイコンから管理者ダッシュボードにアクセスできます。', 'success');
                } else {
                    adminBtn.style.display = 'none';
                    console.log('管理者ボタンを非表示にしました');
                }
            } else {
                console.error('管理者ボタン要素が見つかりません');
            }
        }
        
        // Lucideアイコンを再初期化
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('Lucideアイコンを初期化しました');
        } else {
            console.warn('Lucideが利用できません');
        }
        
        // 同期状態を表示
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            syncStatus.textContent = '🟡 同期中...';
            console.log('同期状態を設定しました');
        }
        
        // ユーザータイプ表示を更新
        updateUserTypeDisplay();
        
        // 広告表示を更新
        updateAdDisplay();
        
        // 強制的にCSSを適用
        document.body.style.background = '#f8fafc';
        document.body.style.color = '#333';
        
        console.log('メインアプリ表示完了');
        
        // 表示確認のためのタイマー
        setTimeout(() => {
            const mainApp = document.getElementById('mainApp');
            if (mainApp && mainApp.style.display === 'block') {
                console.log('メインアプリの表示が確認されました');
            } else {
                console.error('メインアプリの表示に失敗しました');
                // 強制的に表示
                if (mainApp) {
                    mainApp.style.display = 'block !important';
                    mainApp.className = 'app';
                }
            }
        }, 100);
        
    } catch (error) {
        console.error('メインアプリ表示エラー:', error);
        showAINotification('画面の表示に失敗しました: ' + error.message, 'error');
    }
}

// 認証フォームを表示
function showAuthForm() {
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authContainer').style.display = 'block';
}

// アプリを初期化
function initializeApp() {
    console.log('アプリを初期化中...');
    console.log('選択されたストレージ:', selectedStorage);
    
    try {
        // 配列を確実に初期化
        ensureArraysInitialized();
        
        // 選択されたストレージに応じて初期化
        switch (selectedStorage) {
            case 'firebase':
                if (typeof initializeFirebase === 'function') {
                    initializeFirebase();
                } else {
                    console.log('Firebase初期化関数が見つかりません。ローカルストレージを使用します。');
                    setSelectedStorage('local');
                    initializeLocalStorage();
                }
                break;
            case 'google-drive':
                if (typeof initializeGoogleDrive === 'function') {
                    initializeGoogleDrive();
                } else {
                    console.log('Google Drive初期化関数が見つかりません。ローカルストレージを使用します。');
                    setSelectedStorage('local');
                    initializeLocalStorage();
                }
                break;
            case 'local':
                if (typeof initializeLocalStorage === 'function') {
                    initializeLocalStorage();
                } else {
                    console.log('ローカルストレージ初期化関数が見つかりません。デフォルト処理を実行します。');
                    loadRoutinesFromLocal();
                    loadCompletionsFromLocal();
                    displayRoutines();
                }
                break;
            default:
                console.log('不明なストレージタイプ:', selectedStorage, 'ローカルストレージを使用します。');
                setSelectedStorage('local');
                if (typeof initializeLocalStorage === 'function') {
                    initializeLocalStorage();
                } else {
                    loadRoutinesFromLocal();
                    loadCompletionsFromLocal();
                    displayRoutines();
                }
                break;
        }
        
        // データ同期状態をチェック
        if (typeof checkSyncStatus === 'function') {
            checkSyncStatus();
        }
        
        // プルツーリフレッシュを初期化（モバイルのみ）
        if (typeof initPullToRefresh === 'function') {
            initPullToRefresh();
        }
        
        // データを読み込み
        loadRoutines();
        loadCompletions();
        
        // Firebaseストレージの場合はリアルタイム同期を開始
        if (selectedStorage === 'firebase' && currentUser) {
            try {
                startRealtimeSync();
            } catch (error) {
                console.error('リアルタイム同期開始エラー:', error);
                
                // Firebase接続エラーの場合、ローカルストレージに切り替え
                if (error.message.includes('400') || 
                    error.message.includes('Bad Request') ||
                    error.code === 'unavailable' ||
                    error.code === 'permission-denied' ||
                    error.message.includes('transport errored') ||
                    error.message.includes('WebChannelConnection')) {
                    
                    console.log('初期化時のFirebaseエラー: ローカルストレージに切り替え');
                    setSelectedStorage('local');
                    showAINotification('Firebase接続エラーのため、ローカル保存に切り替えました', 'warning');
                }
            }
        }
        
        // UIを更新
        displayRoutines();
        
        if (typeof setupEventListeners === 'function') {
            setupEventListeners();
        }
        
        console.log('アプリ初期化完了');
    } catch (error) {
        console.error('アプリ初期化エラー:', error);
        showAINotification('アプリの初期化に失敗しました: ' + error.message, 'error');
        
        // エラーが発生した場合はローカルストレージにフォールバック
        try {
            setSelectedStorage('local');
            loadRoutinesFromLocal();
            loadCompletionsFromLocal();
            displayRoutines();
            showAINotification('ローカル保存モードで動作します', 'info');
        } catch (fallbackError) {
            console.error('フォールバック処理も失敗:', fallbackError);
            showAINotification('アプリの起動に失敗しました', 'error');
        }
    }
}

// ルーティンを読み込み
function loadRoutines() {
    if (!currentUser) return;
    
    console.log('ルーティンを読み込み中...');
    
    switch (selectedStorage) {
        case 'firebase':
            loadRoutinesFromFirebase();
            break;
        case 'google-drive':
            loadDataFromGoogleDrive();
            break;
        case 'local':
            loadRoutinesFromLocal();
            break;
    }
}

// ローカルストレージからルーティンを読み込み
function loadRoutinesFromLocal() {
    if (typeof loadRoutinesFromStorage === 'function') {
        routines = loadRoutinesFromStorage(currentUser.id) || [];
    } else {
        routines = JSON.parse(localStorage.getItem(`routines_${currentUser.id}`)) || [];
    }
    console.log('ローカルからルーティンを読み込み:', routines.length, '件');
    displayRoutines();
}

// 完了データを読み込み
function loadCompletions() {
    if (!currentUser) return;
    
    console.log('完了データを読み込み中...');
    
    switch (selectedStorage) {
        case 'firebase':
            loadCompletionsFromFirebase();
            break;
        case 'google-drive':
            // Google Driveの場合はloadDataFromGoogleDriveで一括読み込み
            break;
        case 'local':
            loadCompletionsFromLocal();
            break;
    }
}

// ローカルストレージから完了データを読み込み
function loadCompletionsFromLocal() {
    if (typeof loadCompletionsFromStorage === 'function') {
        completions = loadCompletionsFromStorage(currentUser.id) || [];
    } else {
        completions = JSON.parse(localStorage.getItem(`completions_${currentUser.id}`)) || [];
    }
    console.log('ローカルから完了データを読み込み:', completions.length, '件');
}

// ルーティンを保存
function saveRoutines() {
    if (!currentUser) return;
    
    console.log('ルーティンを保存中...');
    
    switch (selectedStorage) {
        case 'firebase':
            saveRoutinesToFirebase();
            break;
        case 'google-drive':
            saveDataToGoogleDrive();
            break;
        case 'local':
            saveRoutinesToLocal();
            break;
    }
}

// ローカルストレージにルーティンを保存
function saveRoutinesToLocal() {
    if (typeof saveRoutinesToStorage === 'function') {
        saveRoutinesToStorage(currentUser.id, routines);
    } else {
        localStorage.setItem(`routines_${currentUser.id}`, JSON.stringify(routines));
    }
    console.log('ローカルにルーティンを保存:', routines.length, '件');
}

// 完了データを保存
function saveCompletions() {
    if (!currentUser) return;
    
    console.log('完了データを保存中...');
    
    switch (selectedStorage) {
        case 'firebase':
            saveCompletionsToFirebase();
            break;
        case 'google-drive':
            saveDataToGoogleDrive();
            break;
        case 'local':
            saveCompletionsToLocal();
            break;
    }
}

// ローカルストレージに完了データを保存
function saveCompletionsToLocal() {
    if (typeof saveCompletionsToStorage === 'function') {
        saveCompletionsToStorage(currentUser.id, completions);
    } else {
        localStorage.setItem(`completions_${currentUser.id}`, JSON.stringify(completions));
    }
    console.log('ローカルに完了データを保存:', completions.length, '件');
}

// ルーティンを表示
function displayRoutines() {
    displayTodayRoutines();
    displayAllRoutines();
}

// 今日のルーティンを表示
function displayTodayRoutines() {
    const todayEmptyState = document.getElementById('todayEmptyState');
    const todayRoutinesList = document.getElementById('todayRoutinesList');
    
    // 今日のルーティンをフィルタリング
    const todayRoutines = getTodayRoutines();
    
    if (todayRoutines.length === 0) {
        todayEmptyState.style.display = 'block';
        todayRoutinesList.style.display = 'none';
        return;
    }
    
    todayEmptyState.style.display = 'none';
    todayRoutinesList.style.display = 'block';
    
    todayRoutinesList.innerHTML = todayRoutines.map(routine => {
        const isCompleted = isRoutineCompletedToday(routine);
        const completionClass = isCompleted ? 'completed' : '';
        const checkIcon = isCompleted ? 'check-circle' : 'circle';
        
        return `
            <div class="routine-item ${completionClass}" data-id="${routine.id}">
                <div class="routine-content">
                    <div class="routine-header">
                        <h3 class="routine-title">${escapeHtml(routine.title)}</h3>
                        <div class="routine-actions">
                            <button class="action-btn edit-btn" onclick="editRoutine('${routine.id}')" title="編集">
                                <i data-lucide="edit-3" class="action-icon"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteRoutine('${routine.id}')" title="削除">
                                <i data-lucide="trash-2" class="action-icon"></i>
                            </button>
                        </div>
                    </div>
                    ${routine.description ? `<p class="routine-description">${escapeHtml(routine.description)}</p>` : ''}
                    <div class="routine-meta">
                        <span class="routine-frequency">
                            <i data-lucide="${getFrequencyIcon(routine.frequency)}" class="meta-icon"></i>
                            ${getFrequencyText(routine.frequency, routine.weeklyDays, routine.monthlyDate)}
                        </span>
                        ${routine.time ? `<span class="routine-time"><i data-lucide="clock" class="meta-icon"></i>${routine.time}</span>` : ''}
                    </div>
                </div>
                <button class="completion-btn ${completionClass}" onclick="toggleCompletion('${routine.id}')" title="${isCompleted ? '完了を取り消し' : '完了にする'}">
                    <i data-lucide="${checkIcon}" class="completion-icon"></i>
                </button>
            </div>
        `;
    }).join('');
}

// 全ルーティンを表示
function displayAllRoutines() {
    const allEmptyState = document.getElementById('allEmptyState');
    const allRoutinesList = document.getElementById('allRoutinesList');
    
    if (routines.length === 0) {
        allEmptyState.style.display = 'block';
        allRoutinesList.style.display = 'none';
        return;
    }
    
    allEmptyState.style.display = 'none';
    allRoutinesList.style.display = 'block';
    
    // 現在選択されている頻度でフィルタリング
    const selectedFrequency = document.querySelector('.tab-button.active').dataset.frequency;
    let filteredRoutines = routines;
    
    if (selectedFrequency !== 'all') {
        filteredRoutines = routines.filter(routine => routine.frequency === selectedFrequency);
    }
    
    if (filteredRoutines.length === 0) {
        allRoutinesList.innerHTML = '<div class="no-routines-message">この頻度のルーティンはありません</div>';
        return;
    }
    
    // 日付順でソート（最新のものを上に）
    filteredRoutines.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    allRoutinesList.innerHTML = filteredRoutines.map(routine => {
        const isCompleted = isRoutineCompletedToday(routine);
        const completionClass = isCompleted ? 'completed' : '';
        const checkIcon = isCompleted ? 'check-circle' : 'circle';
        
        return `
            <div class="routine-item ${completionClass}" data-id="${routine.id}">
                <div class="routine-content">
                    <div class="routine-header">
                        <h3 class="routine-title">${escapeHtml(routine.title)}</h3>
                        <div class="routine-actions">
                            <button class="action-btn edit-btn" onclick="editRoutine('${routine.id}')" title="編集">
                                <i data-lucide="edit-3" class="action-icon"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteRoutine('${routine.id}')" title="削除">
                                <i data-lucide="trash-2" class="action-icon"></i>
                            </button>
                        </div>
                    </div>
                    ${routine.description ? `<p class="routine-description">${escapeHtml(routine.description)}</p>` : ''}
                    <div class="routine-meta">
                        <span class="routine-frequency">
                            <i data-lucide="${getFrequencyIcon(routine.frequency)}" class="meta-icon"></i>
                            ${getFrequencyText(routine.frequency, routine.weeklyDays, routine.monthlyDate)}
                        </span>
                        ${routine.time ? `<span class="routine-time"><i data-lucide="clock" class="meta-icon"></i>${routine.time}</span>` : ''}
                    </div>
                </div>
                <button class="completion-btn ${completionClass}" onclick="toggleCompletion('${routine.id}')" title="${isCompleted ? '完了を取り消し' : '完了にする'}">
                    <i data-lucide="${checkIcon}" class="completion-icon"></i>
                </button>
            </div>
        `;
    }).join('');
    
    // Lucideアイコンを再初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// 今日のルーティンを取得
function getTodayRoutines() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    
    return routines.filter(routine => {
        switch (routine.frequency) {
            case 'daily':
                return true; // 毎日は常に今日のルーティン
                
            case 'weekly':
                // 週次ルーティンで、今日が該当曜日の場合
                return routine.weeklyDays && routine.weeklyDays.includes(dayOfWeek);
                
            case 'monthly':
                // 月次ルーティンで、今日が該当日の場合
                return routine.monthlyDate && routine.monthlyDate === dayOfMonth;
                
            default:
                return false;
        }
    });
}

// 完了状態をチェック
function checkCompletion(routineId) {
    ensureArraysInitialized();
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 該当するルーティンを取得
    const routine = safeFind(routines, r => r.id === routineId);
    if (!routine) return false;
    
    // 頻度に応じて完了状態をチェック
    switch (routine.frequency) {
        case 'daily':
            // 毎日：今日の完了状態をチェック
            return completions.some(completion => 
                completion.routineId === routineId && completion.date === todayStr
            );
            
        case 'weekly':
            // 毎週：今週の該当曜日が完了しているかチェック
            const currentWeekStart = getWeekStart(today);
            const weekCompletions = completions.filter(completion => 
                completion.routineId === routineId && 
                completion.date >= currentWeekStart && 
                completion.date <= todayStr
            );
            
            // 今週の該当曜日をチェック
            if (routine.weeklyDays && routine.weeklyDays.length > 0) {
                const currentDayOfWeek = today.getDay();
                return routine.weeklyDays.includes(currentDayOfWeek) && weekCompletions.length > 0;
            }
            return weekCompletions.length > 0;
            
        case 'monthly':
            // 毎月：今月の該当日が完了しているかチェック
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const targetDate = routine.monthlyDate || 1;
            
            // 今月の該当日をチェック
            const targetDay = new Date(currentYear, currentMonth, targetDate);
            const targetDayStr = targetDay.toISOString().split('T')[0];
            
            // 今日が該当日以降で、完了済みかチェック
            if (today >= targetDay) {
                return completions.some(completion => 
                    completion.routineId === routineId && completion.date === targetDayStr
                );
            }
            return false;
            
        default:
            return completions.some(completion => 
                completion.routineId === routineId && completion.date === todayStr
            );
    }
}

// 週の開始日を取得
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

// 完了状態を切り替え
function toggleCompletion(routineId) {
    const today = new Date().toISOString().split('T')[0];
    const existingCompletion = completions.find(c => c.routineId === routineId && c.date === today);
    
    if (existingCompletion) {
        // 完了を取り消し
        const index = completions.findIndex(c => c.routineId === routineId && c.date === today);
        completions.splice(index, 1);
        showAINotification('完了を取り消しました', 'info');
    } else {
        // 完了としてマーク
        completions.push({
            routineId: routineId,
            date: today,
            completedAt: new Date().toISOString()
        });
        showAINotification('完了しました！', 'success');
    }
    
    saveCompletions();
    displayRoutines();
    
    // 自動同期
    autoSyncOnChange();
}

// 頻度テキストを取得
function getFrequencyText(frequency, weeklyDays = [], monthlyDate = null) {
    const texts = {
        daily: '毎日',
        weekly: '毎週',
        monthly: '毎月'
    };
    const frequencyText = texts[frequency] || frequency;
    
    if (frequency === 'weekly') {
        const daysText = weeklyDays.length > 0 ? `(${weeklyDays.map(day => {
            const dayText = ['日', '月', '火', '水', '木', '金', '土'][day % 7];
            return `<span class="weekday-badge">${dayText}</span>`;
        }).join(', ')})` : '';
        return `${frequencyText} ${daysText}`;
    } else if (frequency === 'monthly') {
        const monthText = monthlyDate ? `の${monthlyDate}日` : '';
        return `${frequencyText} ${monthText}`;
    }
    return frequencyText;
}

// 統計を更新
function updateStats() {
    const totalCount = routines.length;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 頻度に応じて完了数を計算
    let completedCount = 0;
    
    routines.forEach(routine => {
        if (checkCompletion(routine.id)) {
            completedCount++;
        }
    });
    
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('completionRate').textContent = `${completionRate}%`;
    
    console.log('統計更新:', {
        total: totalCount,
        completed: completedCount,
        rate: completionRate + '%',
        date: todayStr
    });
}

// 新しいルーティンを追加
function addRoutine(routine) {
    routines.push(routine);
    saveRoutines();
    displayRoutines();
    
    // 自動同期
    autoSyncOnChange();
    
    showAINotification('ルーティンが追加されました', 'success');
}

// ルーティンを編集
function editRoutine(id) {
    ensureArraysInitialized();
    
    const routine = safeFind(routines, r => r.id === id);
    if (!routine) return;
    
    currentEditId = id;
    
    document.getElementById('editTitleInput').value = routine.title;
    document.getElementById('editDescriptionInput').value = routine.description || '';
    document.getElementById('editFrequencyInput').value = routine.frequency;
    document.getElementById('editTimeInput').value = routine.time || '';
    
    if (routine.frequency === 'weekly') {
        document.getElementById('editWeeklyDaysRow').style.display = 'block';
        // 曜日チェックボックスを設定
        routine.weeklyDays.forEach(day => {
            const checkbox = document.querySelector(`input[value="${day}"].edit-weekday-input`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    if (routine.frequency === 'monthly') {
        document.getElementById('editMonthlyDateRow').style.display = 'block';
        document.getElementById('editMonthlyDateInput').value = routine.monthlyDate || '';
    }
    
    document.getElementById('editFormContainer').style.display = 'block';
}

// 編集を保存
function saveEdit() {
    if (!currentEditId) return;
    
    ensureArraysInitialized();
    
    const routine = safeFind(routines, r => r.id === currentEditId);
    if (!routine) return;
    
    routine.title = document.getElementById('editTitleInput').value.trim();
    routine.description = document.getElementById('editDescriptionInput').value.trim();
    routine.frequency = document.getElementById('editFrequencyInput').value;
    routine.time = document.getElementById('editTimeInput').value;
    
    if (routine.frequency === 'weekly') {
        const weeklyDays = [];
        document.querySelectorAll('.edit-weekday-input:checked').forEach(checkbox => {
            weeklyDays.push(parseInt(checkbox.value));
        });
        routine.weeklyDays = weeklyDays;
    }
    
    if (routine.frequency === 'monthly') {
        const monthlyDate = document.getElementById('editMonthlyDateInput').value;
        routine.monthlyDate = monthlyDate ? parseInt(monthlyDate) : null;
    }
    
    saveRoutines();
    displayRoutines();
    
    // 編集フォームを非表示
    document.getElementById('editFormContainer').style.display = 'none';
    currentEditId = null;
}

// ルーティンを削除
function deleteRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;
    
    if (confirm(`「${routine.title}」を削除しますか？`)) {
        // ルーティンを削除
        const index = routines.findIndex(r => r.id === id);
        routines.splice(index, 1);
        
        // 関連する完了データも削除
        completions = completions.filter(c => c.routineId !== id);
        
        saveRoutines();
        saveCompletions();
        displayRoutines();
        
        // 自動同期
        autoSyncOnChange();
        
        showAINotification('ルーティンが削除されました', 'info');
    }
}

// イベントリスナーを設定
function setupEventListeners() {
    // パスワード表示切り替え
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                passwordInput.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        });
    }
    
    // 確認パスワード表示切り替え
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            if (confirmPasswordInput.type === 'password') {
                confirmPasswordInput.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                confirmPasswordInput.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        });
    }
}

// 通知権限を要求
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showAINotification('通知が有効になりました！', 'success');
            } else {
                showAINotification('通知が拒否されました', 'warning');
            }
        });
    } else {
        showAINotification('このブラウザは通知をサポートしていません', 'warning');
    }
}

// 設定を開く
function openSettings() {
    showStorageModal();
}

// エラー表示関数（グローバルスコープ）
function showError(message) {
    console.log('エラー表示:', message);
    const authError = document.getElementById('authError');
    if (authError) {
        authError.textContent = message;
        authError.style.display = 'block';
        
        // モバイル用のタッチでエラーを消去
        if (isMobile) {
            authError.addEventListener('touchstart', function() {
                console.log('エラーメッセージをタッチで消去');
                hideError();
            }, { once: true });
        }
        
        // 3秒後に自動で消去
        setTimeout(hideError, 3000);
    }
}

function hideError() {
    const authError = document.getElementById('authError');
    if (authError) {
        authError.style.display = 'none';
    }
}

// DOMContentLoadedイベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ページ初期化開始 ===');
    console.log('URL:', window.location.href);
    console.log('デバイス情報:', getDeviceInfo());
    
    // Firebase認証状態をチェック（重複を削除し、永続化設定を追加）
    if (typeof firebase !== 'undefined' && firebase.auth) {
        console.log('Firebase認証を初期化中...');
        
        // Firebase認証の永続化設定
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log('Firebase認証永続化設定完了');
                
                // 認証状態リスナーを設定（重複を避けるため一度だけ）
                firebase.auth().onAuthStateChanged(handleAuthStateChange);
                
                // Google認証を初期化
                if (typeof initializeGoogleAuth === 'function') {
                    initializeGoogleAuth();
                }
            })
            .catch((error) => {
                console.error('Firebase認証永続化設定エラー:', error);
                // エラーが発生しても認証状態リスナーは設定
                firebase.auth().onAuthStateChanged(handleAuthStateChange);
            });
    }
    
    // シンプル認証状態をチェック
    if (typeof simpleAuth !== 'undefined') {
        if (simpleAuth.isAuthenticated()) {
            console.log('シンプル認証済み:', simpleAuth.getCurrentUser().email);
            showMainApp();
            initializeApp();
        } else {
            console.log('シンプル認証未認証');
        }
    }
    
    // デバイス間認証チェック
    if (typeof checkCrossDeviceAuth === 'function') {
        setTimeout(checkCrossDeviceAuth, 1000);
    }
    
    // シンプル認証の初期化（Firebaseが利用できない場合）
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('Firebaseが利用できません。シンプル認証を使用します。');
        if (typeof SimpleAuth !== 'undefined') {
            console.log('シンプル認証クラスを初期化');
            try {
                window.simpleAuth = new SimpleAuth();
                simpleAuth.init();
                console.log('シンプル認証初期化完了');
                
                // 認証状態をチェック（重複を避けるため、ここではチェックのみ）
                if (simpleAuth.isAuthenticated()) {
                    console.log('既に認証済み、認証状態変更処理を実行');
                    // 認証状態変更処理は handleAuthStateChange で行われるため、
                    // ここでは何もしない
                } else {
                    console.log('未認証状態');
                }
                
                // シンプル認証の認証状態リスナーを設定
                simpleAuth.onAuthStateChanged((user) => {
                    if (user) {
                        console.log('シンプル認証状態変更: ログイン', user.email);
                        
                        // ユーザー情報を設定
                        currentUser = {
                            id: user.uid || user.email,
                            username: user.displayName || user.email,
                            email: user.email
                        };
                        
                        // 管理者かどうかをチェック
                        const isAdmin = isAdminUser(currentUser);
                        console.log('管理者権限:', isAdmin ? 'あり' : 'なし');
                        
                        // シンプル認証の場合はローカル保存を自動選択
                        selectedStorage = 'local';
                        localStorage.setItem('selectedStorage', selectedStorage);
                        
                        if (isAdmin) {
                            // 管理者の場合は管理者ダッシュボードを表示
                            console.log('管理者としてログイン: 管理者ダッシュボードを表示');
                            showAdminDashboard();
                        } else {
                            // 一般ユーザーの場合は通常のメインアプリを表示
                            console.log('一般ユーザーとしてログイン: メインアプリを表示');
                            showMainApp();
                        }
                    } else {
                        console.log('シンプル認証状態変更: ログアウト');
                        currentUser = null;
                        showAuthForm();
                    }
                });
            } catch (error) {
                console.error('シンプル認証初期化エラー:', error);
                showAINotification('認証システムの初期化に失敗しました', 'error');
            }
        } else {
            console.log('認証システムが利用できません。デモモードでアプリを表示します。');
            // デモモードでアプリを表示
            showMainApp();
            initializeApp();
        }
    }
    
    // モバイルデバイスかどうかをチェック
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('モバイルデバイス:', isMobile);
    console.log('ユーザーエージェント:', navigator.userAgent);
    console.log('画面サイズ:', window.innerWidth, 'x', window.innerHeight);
    console.log('タッチサポート:', 'ontouchstart' in window);
    
    // モバイル用の設定
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log('モバイルデバイスクラスを追加');
        
        // モバイルでの入力フィールドの改善
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
        inputs.forEach(input => {
            input.setAttribute('autocomplete', 'on');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');
            console.log('モバイル入力フィールド設定:', input.id);
        });
        
        // モバイル用のタッチイベント設定
        document.addEventListener('touchstart', function(e) {
            console.log('タッチ開始:', e.target.id || e.target.className);
        }, { passive: true });
        
        // モバイル用のフォーカスイベント
        document.addEventListener('focusin', function(e) {
            if (e.target.tagName === 'INPUT') {
                console.log('入力フィールドフォーカス:', e.target.id);
            }
        });
    }
    
    // Lucideアイコンを初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // イベントリスナーを設定
    if (typeof setupEventListeners === 'function') {
        setupEventListeners();
    }
    
    // 設定状態を確認
    if (typeof checkSettingsStatus === 'function') {
        checkSettingsStatus();
    }
    
    // デバッグ用: 設定状態を表示（開発時のみ）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('開発モード: 設定状態を確認するには showSettingsStatus() を実行してください');
        console.log('開発モード: 関数存在確認するには checkImportantFunctions() を実行してください');
    }
    
    // 重要な関数の存在確認
    if (typeof checkImportantFunctions === 'function') {
        setTimeout(checkImportantFunctions, 1000);
    }
    
    // フォーム送信イベント
    const authForm = document.getElementById('authForm');
    if (authForm) {
        // 通常のsubmitイベント
        authForm.addEventListener('submit', handleAuthSubmit);
        
        // モバイル用のタッチイベント
        if (isMobile) {
            const authButton = document.getElementById('authButton');
            if (authButton) {
                authButton.addEventListener('touchstart', function(e) {
                    console.log('モバイルログインボタンタッチ開始');
                    e.preventDefault();
                }, { passive: false });
                
                authButton.addEventListener('touchend', function(e) {
                    console.log('モバイルログインボタンタッチ終了');
                    e.preventDefault();
                    handleAuthSubmit(e);
                }, { passive: false });
            }
        }
    }
    
    // 頻度タブのイベントリスナー
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const frequency = this.dataset.frequency;
            if (typeof selectFrequency === 'function') {
                selectFrequency(frequency);
            }
        });
    });
    
    // フォームのイベントリスナー
    const frequencyInput = document.getElementById('frequencyInput');
    if (frequencyInput) {
        frequencyInput.addEventListener('change', function() {
            const frequency = this.value;
            if (frequency === 'weekly') {
                document.getElementById('weeklyDaysRow').style.display = 'block';
                document.getElementById('monthlyDateRow').style.display = 'none';
            } else if (frequency === 'monthly') {
                document.getElementById('weeklyDaysRow').style.display = 'none';
                document.getElementById('monthlyDateRow').style.display = 'block';
            } else {
                document.getElementById('weeklyDaysRow').style.display = 'none';
                document.getElementById('monthlyDateRow').style.display = 'none';
            }
        });
    }
    
    // 保存ボタンのイベントリスナー
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            if (typeof saveRoutine === 'function') {
                saveRoutine();
            }
        });
    }
    
    // フォームのEnterキーイベント
    const titleInput = document.getElementById('titleInput');
    if (titleInput) {
        titleInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (typeof saveRoutine === 'function') {
                    saveRoutine();
                }
            }
        });
    }
    
    // プルツーリフレッシュの初期化
    if (typeof initPullToRefresh === 'function') {
        initPullToRefresh();
    }
    
    // 管理者ログインボタンを追加
    if (typeof addAdminLoginButton === 'function') {
        addAdminLoginButton();
    }
    
    console.log('イベントリスナー設定完了');
});

// タッチ開始
function handleTouchStart(e) {
    if (window.scrollY > 0) return; // スクロール位置が0でない場合は無視
    
    startY = e.touches[0].clientY;
    currentY = startY;
    pullDistance = 0;
}

// タッチ移動
function handleTouchMove(e) {
    if (window.scrollY > 0) return; // スクロール位置が0でない場合は無視
    
    currentY = e.touches[0].clientY;
    pullDistance = Math.max(0, currentY - startY);
    
    if (pullDistance > 0) {
        e.preventDefault(); // デフォルトのスクロールを防ぐ
        
        const indicator = document.getElementById('pullToRefreshIndicator');
        if (indicator) {
            // 抵抗感のあるプル効果（距離に応じて減速）
            const resistance = 0.6;
            const translateY = Math.min(pullDistance * resistance, PULL_THRESHOLD);
            indicator.style.transform = `translateY(${translateY}px)`;
            
            // プル距離に応じてテキストを変更
            const textElement = indicator.querySelector('.pull-indicator-text');
            const iconElement = indicator.querySelector('.pull-indicator-icon');
            
            if (pullDistance >= PULL_THRESHOLD) {
                textElement.textContent = '離して同期';
                iconElement.textContent = '🔄';
                indicator.classList.add('ready');
            } else {
                textElement.textContent = '下に引いて同期';
                iconElement.textContent = '⬇️';
                indicator.classList.remove('ready');
            }
        }
    }
}

// タッチ終了
function handleTouchEnd(e) {
    if (window.scrollY > 0) return; // スクロール位置が0でない場合は無視
    
    const indicator = document.getElementById('pullToRefreshIndicator');
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        // プルツーリフレッシュを実行
        executePullToRefresh();
    } else {
        // インジケーターを元の位置に戻す
        if (indicator) {
            indicator.style.transform = 'translateY(0)';
        }
    }
    
    pullDistance = 0;
}

// プルツーリフレッシュを実行
async function executePullToRefresh() {
    if (isRefreshing) return;
    
    isRefreshing = true;
    console.log('プルツーリフレッシュを実行');
    
    const indicator = document.getElementById('pullToRefreshIndicator');
    if (indicator) {
        const textElement = indicator.querySelector('.pull-indicator-text');
        const iconElement = indicator.querySelector('.pull-indicator-icon');
        
        textElement.textContent = '同期中...';
        iconElement.textContent = '⏳';
        indicator.classList.add('refreshing');
        indicator.style.transform = `translateY(${PULL_THRESHOLD}px)`;
    }
    
    try {
        // データを再読み込み
        await refreshData();
        
        // 成功通知
        showAINotification('データを同期しました', 'success');
        
        if (indicator) {
            const textElement = indicator.querySelector('.pull-indicator-text');
            const iconElement = indicator.querySelector('.pull-indicator-icon');
            
            textElement.textContent = '同期完了';
            iconElement.textContent = '✅';
            indicator.classList.remove('refreshing');
        }
        
    } catch (error) {
        console.error('プルツーリフレッシュエラー:', error);
        showAINotification('同期に失敗しました', 'error');
        
        if (indicator) {
            const textElement = indicator.querySelector('.pull-indicator-text');
            const iconElement = indicator.querySelector('.pull-indicator-icon');
            
            textElement.textContent = '同期失敗';
            iconElement.textContent = '❌';
            indicator.classList.remove('refreshing');
        }
    }
    
    // 1.5秒後にインジケーターを元の位置に戻す
    setTimeout(() => {
        if (indicator) {
            indicator.style.transform = 'translateY(0)';
            indicator.classList.remove('ready');
        }
        isRefreshing = false;
    }, 1500);
}

// データを再読み込み
async function refreshData() {
    console.log('データを再読み込み中...');
    
    // ルーティンを再読み込み
    await loadRoutines();
    
    // 完了データを再読み込み
    await loadCompletions();
    
    // 統計を更新
    updateStats();
    
    // 同期状態をチェック
    checkSyncStatus();
    
    console.log('データ再読み込み完了');
}

// 画面遷移機能
function showMainScreen() {
    // メイン画面は常に表示されているので、追加画面のみ非表示
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    if (addRoutineScreen) {
        addRoutineScreen.style.display = 'none';
    }
    // フォームをリセット
    resetForm();
}

function showAddRoutineScreen() {
    document.getElementById('addRoutineScreen').style.display = 'flex';
    // フォームにフォーカス
    setTimeout(() => {
        document.getElementById('titleInput').focus();
    }, 100);
}

// フォームをリセット
function resetForm() {
    const titleInput = document.getElementById('titleInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const frequencyInput = document.getElementById('frequencyInput');
    const timeInput = document.getElementById('timeInput');
    const monthlyDateInput = document.getElementById('monthlyDateInput');
    
    if (titleInput) titleInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (frequencyInput) frequencyInput.value = 'daily';
    if (timeInput) timeInput.value = '';
    if (monthlyDateInput) monthlyDateInput.value = '';
    
    // チェックボックスをリセット
    document.querySelectorAll('.weekday-input').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 週次・月次の行を非表示
    const weeklyDaysRow = document.getElementById('weeklyDaysRow');
    const monthlyDateRow = document.getElementById('monthlyDateRow');
    if (weeklyDaysRow) weeklyDaysRow.style.display = 'none';
    if (monthlyDateRow) monthlyDateRow.style.display = 'none';
}

// ルーティン保存関数
function saveRoutine() {
    const title = document.getElementById('titleInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    const frequency = document.getElementById('frequencyInput').value;
    const time = document.getElementById('timeInput').value;
    
    if (!title) {
        showNotification('ルーティン名を入力してください', 'error');
        return;
    }
    
    let weeklyDays = [];
    let monthlyDate = null;
    
    if (frequency === 'weekly') {
        weeklyDays = Array.from(document.querySelectorAll('.weekday-input:checked')).map(cb => parseInt(cb.value));
        if (weeklyDays.length === 0) {
            showNotification('曜日を選択してください', 'error');
            return;
        }
    } else if (frequency === 'monthly') {
        monthlyDate = parseInt(document.getElementById('monthlyDateInput').value);
        if (!monthlyDate || monthlyDate < 1 || monthlyDate > 31) {
            showNotification('1から31の間で日付を入力してください', 'error');
            return;
        }
    }
    
    const routine = {
        id: Date.now().toString(),
        title: title,
        description: description,
        frequency: frequency,
        time: time,
        weeklyDays: weeklyDays,
        monthlyDate: monthlyDate,
        createdAt: new Date().toISOString(),
        completedDates: []
    };
    
    // ルーティンを保存
    if (typeof addRoutine === 'function') {
        addRoutine(routine);
    }
    
    // フォームをリセットしてメイン画面に戻る
    if (typeof resetForm === 'function') {
        resetForm();
    }
    if (typeof showMainScreen === 'function') {
        showMainScreen();
    }
    
    showNotification('ルーティンが追加されました', 'success');
}

// 頻度アイコンを取得
function getFrequencyIcon(frequency) {
    const icons = {
        daily: 'sun',
        weekly: 'calendar-days',
        monthly: 'calendar'
    };
    return icons[frequency] || 'target';
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 今日の完了状態をチェック
function isRoutineCompletedToday(routine) {
    const today = new Date().toISOString().split('T')[0];
    
    // completions配列から今日の完了状態をチェック
    return completions.some(completion => 
        completion.routineId === routine.id && completion.date === today
    );
}

// 通知表示関数
function showNotification(message, type = 'info') {
    if (typeof showAINotification === 'function') {
        showAINotification(message, type);
    } else {
        // フォールバック通知
        alert(message);
    }
}

// 頻度選択関数
function selectFrequency(frequency) {
    // アクティブなタブを更新
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-frequency="${frequency}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // ルーティンを再表示
    if (typeof displayRoutines === 'function') {
        displayRoutines();
    }
}

// 手動同期機能
async function manualSync() {
    console.log('=== 手動同期開始 ===');
    console.log('現在のストレージ:', selectedStorage);
    console.log('ユーザー:', currentUser ? currentUser.email : '未ログイン');
    
    if (!currentUser) {
        showAINotification('ログインが必要です', 'error');
        return;
    }
    
    const syncBtn = document.getElementById('syncBtn');
    const originalIcon = syncBtn.innerHTML;
    
    try {
        syncBtn.classList.add('syncing');
        syncBtn.disabled = true;
        
        showAINotification('同期中...', 'info');
        
        let success = false;
        let errorMessage = '';
        
        switch (selectedStorage) {
            case 'firebase':
                try {
                    // Firebaseの利用可能性をチェック
                    if (typeof firebase === 'undefined' || !firebase.firestore) {
                        throw new Error('Firebaseが利用できません。ローカル保存に切り替えます。');
                    }
                    
                    success = await syncWithFirebase();
                } catch (error) {
                    console.error('Firebase同期エラー:', error);
                    errorMessage = 'Firebase同期に失敗しました。インターネット接続を確認してください。';
                    
                    // Firebase接続エラーの場合、ローカルストレージに自動切り替え
                    if (error.message.includes('400') || 
                        error.message.includes('Bad Request') ||
                        error.code === 'unavailable' ||
                        error.code === 'permission-denied' ||
                        error.message.includes('transport errored') ||
                        error.message.includes('WebChannelConnection')) {
                        
                        console.log('Firebase接続エラーを検出: ローカルストレージに自動切り替え');
                        setSelectedStorage('local');
                        showAINotification('Firebase接続エラーのため、ローカル保存に切り替えました', 'warning');
                        
                        // ローカルにフォールバック
                        success = await syncWithLocal();
                        if (success) {
                            showAINotification('ローカル保存で動作します', 'info');
                        }
                    } else {
                        // その他のエラーの場合もローカルにフォールバック
                        console.log('ローカル保存にフォールバック');
                        setSelectedStorage('local');
                        success = await syncWithLocal();
                        if (success) {
                            showAINotification('Firebase同期に失敗しましたが、ローカル保存で動作します', 'warning');
                        }
                    }
                }
                break;
            case 'google-drive':
                try {
                    success = await syncWithGoogleDrive();
                } catch (error) {
                    console.error('Google Drive同期エラー:', error);
                    errorMessage = 'Google Drive同期に失敗しました。設定を確認してください。';
                    // ローカルにフォールバック
                    success = await syncWithLocal();
                    if (success) {
                        showAINotification('Google Drive同期に失敗しましたが、ローカル保存で動作します', 'warning');
                    }
                }
                break;
            case 'local':
                success = await syncWithLocal();
                break;
            default:
                console.log('不明なストレージタイプ:', selectedStorage, 'ローカルにフォールバック');
                setSelectedStorage('local');
                success = await syncWithLocal();
                break;
        }
        
        if (success) {
            showAINotification('同期が完了しました', 'success');
        } else {
            showAINotification(errorMessage || '同期に失敗しました', 'error');
        }
        
    } catch (error) {
        console.error('手動同期エラー:', error);
        
        // デバッグ情報を出力
        if (typeof debugError === 'function') {
            debugError(error);
        }
        
        showAINotification('同期に失敗しました: ' + error.message, 'error');
        
        // 最後の手段としてローカルにフォールバック
        try {
            console.log('ローカル保存にフォールバック');
            setSelectedStorage('local');
            await syncWithLocal();
            showAINotification('ローカル保存モードで動作します', 'info');
        } catch (fallbackError) {
            console.error('フォールバック処理も失敗:', fallbackError);
        }
    } finally {
        syncBtn.classList.remove('syncing');
        syncBtn.disabled = false;
    }
}

// Firebase同期
async function syncWithFirebase() {
    console.log('=== Firebase同期開始 ===');
    console.log('Firebase設定:', typeof firebase !== 'undefined' ? '利用可能' : '未定義');
    console.log('Firestore:', typeof firebase !== 'undefined' && firebase.firestore ? '利用可能' : '未定義');
    
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        throw new Error('Firebaseが利用できません');
    }
    
    try {
        // Firestore接続テストを改善
        const db = firebase.firestore();
        console.log('Firestore接続テスト開始...');
        
        // より安全な接続テスト
        const testDoc = db.collection('_test_connection').doc('test');
        await testDoc.set({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            test: true
        });
        
        // テストドキュメントを削除
        await testDoc.delete();
        
        console.log('Firestore接続テスト成功');
        
        console.log('Firebaseにルーティンを保存中...');
        await saveRoutinesToFirebase();
        
        console.log('Firebaseに完了データを保存中...');
        await saveCompletionsToFirebase();
        
        console.log('Firebaseからルーティンを読み込み中...');
        await loadRoutinesFromFirebase();
        
        console.log('Firebaseから完了データを読み込み中...');
        await loadCompletionsFromFirebase();
        
        displayRoutines();
        console.log('=== Firebase同期完了 ===');
        return true;
    } catch (error) {
        console.error('Firebase同期エラー:', error);
        console.error('エラー詳細:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        
        // Firebase接続エラーの場合、ローカルストレージに自動切り替え
        if (error.code === 'unavailable' || 
            error.message.includes('offline') || 
            error.code === 'permission-denied' ||
            error.message.includes('400') ||
            error.message.includes('Bad Request') ||
            error.message.includes('transport errored') ||
            error.message.includes('WebChannelConnection')) {
            
            console.log('Firebase接続エラーを検出: ローカルストレージに切り替え');
            setSelectedStorage('local');
            showAINotification('Firebase接続エラーのため、ローカル保存に切り替えました', 'warning');
            
            // ローカル同期を実行
            await syncWithLocal();
            return true;
        }
        
        // エラーメッセージを詳細化
        let errorMessage = 'Firebase同期に失敗しました';
        
        if (error.code === 'unavailable' || error.message.includes('offline')) {
            errorMessage = 'Firebaseに接続できません。インターネット接続を確認してください。';
        } else if (error.code === 'permission-denied') {
            errorMessage = 'Firebaseへのアクセス権限がありません。Firebaseコンソールでセキュリティルールを確認してください。';
        } else if (error.code === 'not-found') {
            errorMessage = 'Firestoreデータベースが見つかりません。FirebaseコンソールでFirestoreを有効化してください。';
        } else if (error.code === 'failed-precondition') {
            errorMessage = 'Firestoreデータベースが初期化されていません。FirebaseコンソールでFirestoreを設定してください。';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// Google Drive同期
async function syncWithGoogleDrive() {
    console.log('=== Google Drive同期開始 ===');
    
    if (!window.googleDriveStorage) {
        throw new Error('Google Driveストレージが利用できません。設定ファイルを確認してください。');
    }
    
    // 設定をチェック
    if (!window.GOOGLE_DRIVE_CONFIG || 
        window.GOOGLE_DRIVE_CONFIG.clientId === 'YOUR_GOOGLE_CLIENT_ID' ||
        window.GOOGLE_DRIVE_CONFIG.apiKey === 'YOUR_GOOGLE_API_KEY') {
        throw new Error('Google Drive設定が未設定です。google-drive-config.jsでAPIキーとクライアントIDを設定してください。');
    }
    
    try {
        // 初期化状態をチェック
        if (!window.googleDriveStorage.isInitialized()) {
            console.log('Google Drive APIを初期化中...');
            const initialized = await window.googleDriveStorage.initialize();
            if (!initialized) {
                throw new Error('Google Drive APIの初期化に失敗しました。設定を確認してください。');
            }
        }
        
        // 認証状態をチェック
        if (!window.googleDriveStorage.isAuthenticated()) {
            console.log('Google Drive認証中...');
            const authenticated = await window.googleDriveStorage.authenticate();
            if (!authenticated) {
                throw new Error('Google Drive認証に失敗しました。Googleアカウントでログインしてください。');
            }
        }
        
        console.log('Google Driveにデータを保存中...');
        const saved = await saveDataToGoogleDrive();
        if (saved) {
            console.log('Google Driveからデータを読み込み中...');
            await loadDataFromGoogleDrive();
            displayRoutines();
            console.log('=== Google Drive同期完了 ===');
        } else {
            throw new Error('Google Driveへの保存に失敗しました。');
        }
        
        return saved;
    } catch (error) {
        console.error('Google Drive同期エラー:', error);
        
        // エラーメッセージを詳細化
        let errorMessage = 'Google Drive同期に失敗しました';
        if (error.message.includes('設定が未設定')) {
            errorMessage = 'Google Drive設定が未設定です。google-drive-config.jsでAPIキーとクライアントIDを設定してください。';
        } else if (error.message.includes('設定')) {
            errorMessage = 'Google Drive設定が正しくありません。google-drive-config.jsを確認してください。';
        } else if (error.message.includes('認証')) {
            errorMessage = 'Google Drive認証に失敗しました。Googleアカウントでログインしてください。';
        } else if (error.message.includes('API')) {
            errorMessage = 'Google Drive APIエラーが発生しました。インターネット接続を確認してください。';
        } else if (error.message.includes('origin') || error.message.includes('client ID')) {
            errorMessage = 'Google Drive設定エラー: オリジンが登録されていません。Google Cloud Consoleで設定を確認してください。';
        } else {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// ローカル同期
async function syncWithLocal() {
    saveRoutinesToLocal();
    saveCompletionsToLocal();
    displayRoutines();
    return true;
}

// Google Drive初期化
function initializeGoogleDrive() {
    console.log('=== Google Drive初期化開始 ===');
    
    if (!window.googleDriveStorage) {
        console.error('Google Driveストレージが利用できません');
        showAINotification('Google Drive設定が正しくありません', 'error');
        return;
    }
    
    // 設定をチェック
    if (!window.GOOGLE_DRIVE_CONFIG || 
        window.GOOGLE_DRIVE_CONFIG.clientId === 'YOUR_GOOGLE_CLIENT_ID' ||
        window.GOOGLE_DRIVE_CONFIG.apiKey === 'YOUR_GOOGLE_API_KEY') {
        console.error('Google Drive設定が未設定です');
        showAINotification('Google Drive設定が未設定です。google-drive-config.jsを確認してください。', 'error');
        return;
    }
    
    window.googleDriveStorage.initialize().then(() => {
        console.log('Google Drive初期化完了');
        if (currentUser) {
            loadDataFromGoogleDrive();
        }
    }).catch(error => {
        console.error('Google Drive初期化エラー:', error);
        showAINotification('Google Drive初期化に失敗しました: ' + error.message, 'error');
    });
}

// Google Driveからデータを読み込み
async function loadDataFromGoogleDrive() {
    if (!window.googleDriveStorage) return;
    
    try {
        const data = await window.googleDriveStorage.loadData();
        if (data) {
            routines = data.routines || [];
            completions = data.completions || [];
            console.log('Google Driveからデータを読み込み:', routines.length, '件のルーティン');
            displayRoutines();
            showSyncStatus(true, 'google-drive');
        } else {
            console.log('Google Driveにデータがありません');
            showSyncStatus(false, 'google-drive');
        }
    } catch (error) {
        console.error('Google Drive読み込みエラー:', error);
        showSyncStatus(false, 'google-drive');
    }
}

// Google Driveにデータを保存
async function saveDataToGoogleDrive() {
    if (!window.googleDriveStorage) return false;
    
    try {
        const data = {
            routines: routines,
            completions: completions
        };
        
        const success = await window.googleDriveStorage.saveData(data);
        if (success) {
            console.log('Google Driveにデータを保存');
            showSyncStatus(true, 'google-drive');
        }
        return success;
    } catch (error) {
        console.error('Google Drive保存エラー:', error);
        showSyncStatus(false, 'google-drive');
        return false;
    }
}

// ストレージ選択モーダル
function showStorageModal() {
    const modal = document.getElementById('storageModal');
    modal.style.display = 'flex';
    
    // 現在の選択を反映
    document.querySelectorAll('.storage-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[onclick="selectStorage('${selectedStorage}')"]`).classList.add('selected');
    
    // 自動選択の説明を追加
    const modalBody = modal.querySelector('.modal-body');
    const autoSelectionInfo = document.createElement('div');
    autoSelectionInfo.className = 'auto-selection-info';
    autoSelectionInfo.innerHTML = `
        <div class="info-box">
            <h4>自動選択について</h4>
            <p>• <strong>Googleアカウント</strong>: Firebaseで自動同期</p>
            <p>• <strong>メール/パスワード</strong>: ローカル保存</p>
            <p>• <strong>シンプル認証</strong>: ローカル保存</p>
        </div>
    `;
    
    // 既存の情報があれば削除
    const existingInfo = modalBody.querySelector('.auto-selection-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // 情報を追加
    modalBody.appendChild(autoSelectionInfo);
}

function closeStorageModal() {
    document.getElementById('storageModal').style.display = 'none';
}

function selectStorage(storageType) {
    selectedStorage = storageType;
    
    // 選択状態を更新
    document.querySelectorAll('.storage-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[onclick="selectStorage('${storageType}')"]`).classList.add('selected');
}

function confirmStorageSelection() {
    console.log('ストレージ選択:', selectedStorage);
    
    // 選択を保存
    setSelectedStorage(selectedStorage);
    
    // 設定をクラウドに同期
    if (currentUser) {
        settingsManager.syncToCloud();
    }
    
    // 選択に応じて初期化
    switch (selectedStorage) {
        case 'firebase':
            initializeFirebase();
            break;
        case 'google-drive':
            initializeGoogleDrive();
            break;
        case 'local':
            initializeLocalStorage();
            break;
    }
    
    closeStorageModal();
    showAINotification(`${getStorageDisplayName(selectedStorage)}を選択しました`, 'success');
}

function getStorageDisplayName(storageType) {
    const names = {
        'firebase': 'Firebase',
        'google-drive': 'Google Drive',
        'local': 'ローカル保存'
    };
    return names[storageType] || storageType;
}

// ローカルストレージ初期化
function initializeLocalStorage() {
    console.log('ローカルストレージを使用');
    if (currentUser) {
        loadRoutinesFromLocal();
        loadCompletionsFromLocal();
        displayRoutines();
        showSyncStatus(false, 'local');
    }
}

// Firebaseからルーティンを読み込み
async function loadRoutinesFromFirebase() {
    if (typeof firebase !== 'undefined' && firebase.firestore && currentUser) {
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('users').doc(currentUser.id).collection('routines').get();
            
            routines = [];
            snapshot.forEach((doc) => {
                routines.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('Firebaseからルーティンを読み込み:', routines.length, '件');
            displayRoutines();
            showSyncStatus(true, 'firebase');
            return true;
        } catch (error) {
            console.error('Firebaseからの読み込みエラー:', error);
            showSyncStatus(false, 'firebase');
            // フォールバック: ローカルから読み込み
            loadRoutinesFromLocal();
            return false;
        }
    } else {
        console.log('Firebaseが利用できないか、ユーザーが未認証');
        loadRoutinesFromLocal();
        return false;
    }
}

// Firebaseにルーティンを保存
async function saveRoutinesToFirebase() {
    if (typeof firebase !== 'undefined' && firebase.firestore && currentUser) {
        try {
            const db = firebase.firestore();
            const batch = db.batch();
            
            // 既存のデータを削除
            const snapshot = await db.collection('users').doc(currentUser.id).collection('routines').get();
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            // 新しいデータを追加
            routines.forEach((routine) => {
                const docRef = db.collection('users').doc(currentUser.id).collection('routines').doc(routine.id);
                batch.set(docRef, {
                    ...routine,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            await batch.commit();
            console.log('Firebaseにルーティンを保存:', routines.length, '件');
            showSyncStatus(true, 'firebase');
            return true;
        } catch (error) {
            console.error('Firebaseへの保存エラー:', error);
            showSyncStatus(false, 'firebase');
            
            // Firebase接続エラーの場合、ローカルストレージに切り替え
            if (error.code === 'unavailable' || 
                error.message.includes('offline') || 
                error.code === 'permission-denied' ||
                error.message.includes('400') ||
                error.message.includes('Bad Request') ||
                error.message.includes('transport errored') ||
                error.message.includes('WebChannelConnection')) {
                
                console.log('Firebase保存エラー: ローカルストレージに切り替え');
                setSelectedStorage('local');
                showAINotification('Firebase接続エラーのため、ローカル保存に切り替えました', 'warning');
            }
            
            // フォールバック: ローカルに保存
            saveRoutinesToLocal();
            return false;
        }
    } else {
        console.log('Firebaseが利用できないか、ユーザーが未認証');
        saveRoutinesToLocal();
        return false;
    }
}

// Firebaseから完了データを読み込み
async function loadCompletionsFromFirebase() {
    if (typeof firebase !== 'undefined' && firebase.firestore && currentUser) {
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('users').doc(currentUser.id).collection('completions').get();
            
            completions = [];
            snapshot.forEach((doc) => {
                completions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('Firebaseから完了データを読み込み:', completions.length, '件');
            return true;
        } catch (error) {
            console.error('Firebaseからの読み込みエラー:', error);
            // フォールバック: ローカルから読み込み
            loadCompletionsFromLocal();
            return false;
        }
    } else {
        console.log('Firebaseが利用できないか、ユーザーが未認証');
        loadCompletionsFromLocal();
        return false;
    }
}

// Firebaseに完了データを保存
async function saveCompletionsToFirebase() {
    if (typeof firebase !== 'undefined' && firebase.firestore && currentUser) {
        try {
            const db = firebase.firestore();
            const batch = db.batch();
            
            // 既存のデータを削除
            const snapshot = await db.collection('users').doc(currentUser.id).collection('completions').get();
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            // 新しいデータを追加
            completions.forEach((completion) => {
                const docId = completion.id || completion.routineId + '_' + completion.date;
                const docRef = db.collection('users').doc(currentUser.id).collection('completions').doc(docId);
                batch.set(docRef, {
                    ...completion,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            await batch.commit();
            console.log('Firebaseに完了データを保存:', completions.length, '件');
            return true;
        } catch (error) {
            console.error('Firebaseへの保存エラー:', error);
            
            // Firebase接続エラーの場合、ローカルストレージに切り替え
            if (error.code === 'unavailable' || 
                error.message.includes('offline') || 
                error.code === 'permission-denied' ||
                error.message.includes('400') ||
                error.message.includes('Bad Request') ||
                error.message.includes('transport errored') ||
                error.message.includes('WebChannelConnection')) {
                
                console.log('Firebase完了データ保存エラー: ローカルストレージに切り替え');
                setSelectedStorage('local');
                showAINotification('Firebase接続エラーのため、ローカル保存に切り替えました', 'warning');
            }
            
            // フォールバック: ローカルに保存
            saveCompletionsToLocal();
            return false;
        }
    } else {
        console.log('Firebaseが利用できないか、ユーザーが未認証');
        saveCompletionsToLocal();
        return false;
    }
}

// Googleログイン機能
function initializeGoogleAuth() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('Firebaseが利用できません');
        return;
    }
    
    // 設定済みのGoogleプロバイダーを使用
    const googleProvider = window.googleAuthProvider;
    if (!googleProvider) {
        console.log('Google認証プロバイダーが設定されていません');
        return;
    }
    
    // Googleログインボタンのイベントリスナーを設定
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                console.log('Googleログイン開始');
                googleLoginBtn.disabled = true;
                googleLoginBtn.innerHTML = `
                    <svg class="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    ログイン中...
                `;
                
                // ログイン状態保持設定を取得
                const rememberMe = document.getElementById('rememberMe')?.checked || false;
                
                // ログイン状態保持設定をFirebaseに適用
                if (rememberMe) {
                    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                    console.log('ログイン状態保持: 永続的');
                } else {
                    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
                    console.log('ログイン状態保持: セッション');
                }
                
                const result = await firebase.auth().signInWithPopup(googleProvider);
                console.log('Googleログイン成功:', result.user.email);
                
                // ユーザー情報を設定
                currentUser = {
                    id: result.user.uid,
                    username: result.user.displayName || result.user.email,
                    email: result.user.email,
                    photoURL: result.user.photoURL
                };
                
                // Googleアカウントの場合はFirebaseストレージを自動選択
                selectedStorage = 'firebase';
                localStorage.setItem('selectedStorage', selectedStorage);
                
                // ログイン状態保持設定を保存
                localStorage.setItem('rememberMe', rememberMe);
                
                showAINotification('Googleログインに成功しました。Firebaseで同期します。', 'success');
                
                // メインアプリを表示
                showMainApp();
                initializeApp();
                
            } catch (error) {
                console.error('Googleログインエラー:', error);
                
                let errorMessage = 'Googleログインに失敗しました';
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = 'ログインがキャンセルされました';
                } else if (error.code === 'auth/popup-blocked') {
                    errorMessage = 'ポップアップがブロックされました。ポップアップを許可してください。';
                } else if (error.code === 'auth/unauthorized-domain') {
                    errorMessage = 'このドメインではGoogleログインが許可されていません';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showAINotification(errorMessage, 'error');
            } finally {
                // ボタンを元に戻す
                googleLoginBtn.disabled = false;
                const isRegisterPage = window.location.pathname.includes('register.html');
                googleLoginBtn.innerHTML = `
                    <svg class="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Googleでログイン
                `;
            }
        });
    }
}

// Firebase初期化
function initializeFirebase() {
    console.log('=== Firebase初期化開始 ===');
    
    try {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDKが読み込まれていません');
        }
        
        console.log('Firebase SDK確認完了');
        
        // Firestoreの初期化確認
        if (!firebase.firestore) {
            throw new Error('Firestore SDKが読み込まれていません');
        }
        
        console.log('Firestore SDK確認完了');
        
        // 認証の初期化確認
        if (!firebase.auth) {
            throw new Error('Firebase Auth SDKが読み込まれていません');
        }
        
        console.log('Firebase Auth SDK確認完了');
        
        // データベース接続テスト
        const db = firebase.firestore();
        console.log('Firestore接続テスト開始...');
        
        // 接続テスト（読み取りのみ）
        db.collection('_test_connection').doc('test').get()
            .then(() => {
                console.log('Firestore接続テスト成功');
            })
            .catch(error => {
                console.warn('Firestore接続テスト警告:', error);
                // 接続テストが失敗しても初期化は続行
            });
        
        console.log('=== Firebase初期化完了 ===');
        return true;
    } catch (error) {
        console.error('Firebase初期化エラー:', error);
        showAINotification('Firebase初期化に失敗しました: ' + error.message, 'error');
        return false;
    }
}

// 認証処理関数
async function handleAuthSubmit(e) {
    e.preventDefault();
    
    console.log('=== 認証処理開始 ===');
    console.log('イベントタイプ:', e.type);
    console.log('デバイス:', navigator.userAgent);
    console.log('Firebase利用可能:', typeof firebase !== 'undefined' && firebase.auth);
    console.log('シンプル認証利用可能:', typeof SimpleAuth !== 'undefined');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const authButton = document.getElementById('authButton');
    const authError = document.getElementById('authError');
    
    console.log('入力値:', { 
        email: email ? '入力済み' : '未入力', 
        password: password ? '入力済み' : '未入力',
        rememberMe: rememberMe 
    });
    
    if (!email || !password) {
        console.log('バリデーションエラー: 入力値不足');
        showError('メールアドレスとパスワードを入力してください');
        return;
    }
    
    // ログイン状態保持設定を保存
    localStorage.setItem('rememberMe', rememberMe);
    
    // ボタンを無効化
    authButton.disabled = true;
    authButton.textContent = 'ログイン中...';
    hideError();
    
    try {
        console.log('認証処理開始...');
        
        // Firebase認証を試行
        if (typeof firebase !== 'undefined' && firebase.auth) {
            console.log('Firebase認証を使用');
            
            // ログイン状態保持設定をFirebaseに適用
            if (rememberMe) {
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            } else {
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
            }
            
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('Firebase認証成功:', result.user.email);
            
            // メール/パスワードログインの場合はローカル保存を自動選択
            selectedStorage = 'local';
            localStorage.setItem('selectedStorage', selectedStorage);
            
            showAINotification('ログインに成功しました。ローカル保存を使用します。', 'success');
            
            // 認証成功時の処理は handleAuthStateChange で行われるため、
            // ここでは何もしない（Firebaseの認証状態変更リスナーが自動的に呼ばれる）
        } else {
            console.log('Firebase認証が利用できないため、シンプル認証を使用');
            // シンプル認証を使用
            if (typeof simpleAuth !== 'undefined') {
                console.log('シンプル認証処理開始');
                const result = await simpleAuth.signIn(email, password);
                console.log('シンプル認証結果:', result);
                
                // 認証成功時の処理
                if (simpleAuth.isAuthenticated()) {
                    console.log('シンプル認証成功、メインアプリを表示');
                    
                    // ユーザー情報を設定
                    const user = simpleAuth.getCurrentUser();
                    currentUser = {
                        id: user.uid || user.email,
                        username: user.displayName || user.email,
                        email: user.email
                    };
                    
                    console.log('ユーザー情報を設定:', currentUser);
                    
                    // ログイン状態保持設定をシンプル認証に適用
                    if (rememberMe) {
                        localStorage.setItem('simpleAuthPersistent', 'true');
                    } else {
                        localStorage.removeItem('simpleAuthPersistent');
                    }
                    
                    // ローカル保存を選択
                    selectedStorage = 'local';
                    localStorage.setItem('selectedStorage', selectedStorage);
                    
                    // 成功通知
                    showAINotification('ログインに成功しました。ローカル保存を使用します。', 'success');
                    
                    // メインアプリを表示
                    console.log('メインアプリを表示中...');
                    showMainApp();
                    
                    // 初期化を少し遅延させてUI更新を確実にする
                    setTimeout(() => {
                        try {
                            console.log('アプリ初期化開始...');
                            initializeApp();
                            console.log('アプリ初期化完了');
                        } catch (initError) {
                            console.error('初期化エラー:', initError);
                            showAINotification('初期化に失敗しましたが、ログインは成功しています。', 'warning');
                            
                            // フォールバック処理
                            try {
                                console.log('フォールバック処理開始...');
                                loadRoutinesFromLocal();
                                loadCompletionsFromLocal();
                                displayRoutines();
                                showAINotification('ローカル保存モードで動作します', 'info');
                                console.log('フォールバック処理完了');
                            } catch (fallbackError) {
                                console.error('フォールバック処理も失敗:', fallbackError);
                                showAINotification('アプリの起動に失敗しました', 'error');
                            }
                        }
                    }, 200);
                } else {
                    console.log('シンプル認証失敗');
                    throw new Error('認証に失敗しました');
                }
            } else {
                console.log('シンプル認証も利用できない');
                throw new Error('認証システムが利用できません');
            }
        }
    } catch (error) {
        console.error('認証エラー詳細:', error);
        console.error('エラーコード:', error.code);
        console.error('エラーメッセージ:', error.message);
        console.error('エラースタック:', error.stack);
        
        let errorMessage = 'ログインに失敗しました';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'ユーザーが見つかりません';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'パスワードが正しくありません';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'メールアドレスの形式が正しくありません';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください。';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.log('表示するエラーメッセージ:', errorMessage);
        showError(errorMessage);
        
        // エラー通知も表示
        showAINotification(errorMessage, 'error');
    } finally {
        // ボタンを元に戻す
        authButton.disabled = false;
        authButton.textContent = 'ログイン';
        console.log('=== 認証処理終了 ===');
    }
}

// 設定状態を確認
function checkSettingsStatus() {
    console.log('=== 設定状態確認 ===');
    
    // 現在のストレージ
    console.log('選択されたストレージ:', selectedStorage);
    console.log('ユーザー:', currentUser ? currentUser.email : '未ログイン');
    
    // Firebase設定
    const firebaseAvailable = typeof firebase !== 'undefined' && firebase.firestore;
    console.log('Firebase利用可能:', firebaseAvailable);
    
    // Google Drive設定
    const googleDriveAvailable = window.googleDriveStorage !== undefined;
    console.log('Google Driveストレージ利用可能:', googleDriveAvailable);
    
    if (googleDriveAvailable) {
        const config = window.GOOGLE_DRIVE_CONFIG;
        console.log('Google Drive設定:');
        console.log('- クライアントID:', config?.clientId === 'YOUR_GOOGLE_CLIENT_ID' ? '未設定' : '設定済み');
        console.log('- APIキー:', config?.apiKey === 'YOUR_GOOGLE_API_KEY' ? '未設定' : '設定済み');
        console.log('- 初期化状態:', window.googleDriveStorage.isInitialized());
        console.log('- 認証状態:', window.googleDriveStorage.isAuthenticated());
    }
    
    // ローカルストレージ
    console.log('ローカルストレージ利用可能:', true);
    
    console.log('=== 設定状態確認完了 ===');
}

// 設定状態を表示（デバッグ用）
function showSettingsStatus() {
    const status = {
        storage: selectedStorage,
        user: currentUser ? currentUser.email : '未ログイン',
        firebase: typeof firebase !== 'undefined' && firebase.firestore,
        googleDrive: window.googleDriveStorage !== undefined,
        googleDriveConfig: window.GOOGLE_DRIVE_CONFIG ? 
            (window.GOOGLE_DRIVE_CONFIG.clientId !== 'YOUR_GOOGLE_CLIENT_ID' && 
             window.GOOGLE_DRIVE_CONFIG.apiKey !== 'YOUR_GOOGLE_API_KEY') : false
    };
    
    console.log('設定状態:', status);
    
    let message = `設定状態:\n`;
    message += `ストレージ: ${status.storage}\n`;
    message += `ユーザー: ${status.user}\n`;
    message += `Firebase: ${status.firebase ? '利用可能' : '利用不可'}\n`;
    message += `Google Drive: ${status.googleDrive ? '利用可能' : '利用不可'}\n`;
    message += `Google Drive設定: ${status.googleDriveConfig ? '設定済み' : '未設定'}`;
    
    alert(message);
}

// エラーデバッグ用関数
function debugError(error) {
    console.error('=== エラーデバッグ情報 ===');
    console.error('エラーメッセージ:', error.message);
    console.error('エラースタック:', error.stack);
    console.error('エラー名:', error.name);
    console.error('現在のストレージ:', selectedStorage);
    console.error('ユーザー:', currentUser ? currentUser.email : '未ログイン');
    console.error('Firebase利用可能:', typeof firebase !== 'undefined' && firebase.firestore);
    console.error('Google Drive利用可能:', window.googleDriveStorage !== undefined);
    console.error('=== エラーデバッグ情報完了 ===');
}

// 関数の存在確認
function checkFunctionExists(functionName) {
    const exists = typeof window[functionName] === 'function';
    console.log(`関数 ${functionName} の存在:`, exists);
    return exists;
}

// 重要な関数の存在確認
function checkImportantFunctions() {
    console.log('=== 重要な関数の存在確認 ===');
    const functions = [
        'saveRoutinesToServer',
        'loadRoutinesFromServer', 
        'saveCompletionsToServer',
        'loadCompletionsFromServer',
        'saveRoutinesToFirebase',
        'loadRoutinesFromFirebase',
        'saveCompletionsToFirebase',
        'loadCompletionsFromFirebase',
        'saveDataToGoogleDrive',
        'loadDataFromGoogleDrive',
        'saveRoutinesToLocal',
        'loadRoutinesFromLocal',
        'saveCompletionsToLocal',
        'loadCompletionsFromLocal'
    ];
    
    functions.forEach(func => {
        checkFunctionExists(func);
    });
    console.log('=== 関数存在確認完了 ===');
}

// リアルタイム同期を開始
function startRealtimeSync() {
    if (typeof firebase === 'undefined' || !firebase.firestore || !currentUser) {
        console.log('リアルタイム同期を開始できません: Firebaseまたはユーザーが未定義');
        return;
    }
    
    console.log('リアルタイム同期を開始');
    const db = firebase.firestore();
    
    // ルーティンのリアルタイムリスナー
    routinesListener = db.collection('users').doc(currentUser.id).collection('routines')
        .onSnapshot((snapshot) => {
            console.log('ルーティンの変更を検出');
            routines = [];
            snapshot.forEach((doc) => {
                routines.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            displayRoutines();
            showSyncStatus(true, 'firebase');
        }, (error) => {
            console.error('ルーティンのリアルタイム同期エラー:', error);
            showSyncStatus(false, 'firebase');
            
            // Firebase接続エラーの場合、ローカルストレージに切り替え
            if (error.code === 'unavailable' || 
                error.message.includes('offline') || 
                error.code === 'permission-denied' ||
                error.message.includes('400') ||
                error.message.includes('Bad Request')) {
                
                console.log('リアルタイム同期エラー: ローカルストレージに切り替え');
                setSelectedStorage('local');
                showAINotification('Firebase接続エラーのため、ローカル保存に切り替えました', 'warning');
                stopRealtimeSync();
            }
        });
    
    // 完了データのリアルタイムリスナー
    completionsListener = db.collection('users').doc(currentUser.id).collection('completions')
        .onSnapshot((snapshot) => {
            console.log('完了データの変更を検出');
            completions = [];
            snapshot.forEach((doc) => {
                completions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            displayRoutines(); // 完了状態を再表示
        }, (error) => {
            console.error('完了データのリアルタイム同期エラー:', error);
            
            // Firebase接続エラーの場合、ローカルストレージに切り替え
            if (error.code === 'unavailable' || 
                error.message.includes('offline') || 
                error.code === 'permission-denied' ||
                error.message.includes('400') ||
                error.message.includes('Bad Request')) {
                
                console.log('リアルタイム同期エラー: ローカルストレージに切り替え');
                setSelectedStorage('local');
                showAINotification('Firebase接続エラーのため、ローカル保存に切り替えました', 'warning');
                stopRealtimeSync();
            }
        });
}

// リアルタイム同期を停止
function stopRealtimeSync() {
    if (routinesListener) {
        routinesListener();
        routinesListener = null;
        console.log('ルーティンのリアルタイム同期を停止');
    }
    
    if (completionsListener) {
        completionsListener();
        completionsListener = null;
        console.log('完了データのリアルタイム同期を停止');
    }
}

// データ変更時の自動同期
function autoSyncOnChange() {
    if (selectedStorage === 'firebase' && currentUser) {
        console.log('データ変更を検出: Firebaseに自動同期');
        // 少し遅延させて連続変更をまとめる
        clearTimeout(window.autoSyncTimeout);
        window.autoSyncTimeout = setTimeout(async () => {
            try {
                await saveRoutinesToFirebase();
                await saveCompletionsToFirebase();
                console.log('自動同期完了');
            } catch (error) {
                console.error('自動同期エラー:', error);
            }
        }, 1000); // 1秒の遅延
    }
}

// 管理者アカウントの設定
const ADMIN_EMAILS = [
    'admin@myroutine.com',
    'yasnaries@gmail.com'  // 管理者アカウント
];

// 管理者権限をチェック
function isAdminUser(user) {
    if (!user || !user.email) return false;
    
    // yasnaries@gmail.com のみを管理者として認識
    return user.email.toLowerCase() === 'yasnaries@gmail.com';
}

// 管理者専用の設定を取得
function getAdminSettings() {
    return JSON.parse(localStorage.getItem('adminSettings') || '{}');
}

// 管理者設定を保存
function saveAdminSettings(settings) {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
}

// 管理者ダッシュボードを表示
function showAdminDashboard() {
    console.log('管理者ダッシュボードを表示');
    
    const mainApp = document.getElementById('mainApp');
    if (!mainApp) return;
    
    // メイン画面の内容を非表示
    const todaySection = mainApp.querySelector('.today-section');
    const allRoutinesSection = mainApp.querySelector('.all-routines-section');
    const addRoutineScreen = mainApp.querySelector('.add-routine-screen');
    
    if (todaySection) todaySection.style.display = 'none';
    if (allRoutinesSection) allRoutinesSection.style.display = 'none';
    if (addRoutineScreen) addRoutineScreen.style.display = 'none';
    
    // 管理者ダッシュボードのHTMLを追加
    const adminDashboard = document.createElement('div');
    adminDashboard.id = 'adminDashboard';
    adminDashboard.className = 'admin-dashboard';
    adminDashboard.innerHTML = `
        <div class="admin-header">
            <div class="admin-header-content">
                <button onclick="hideAdminDashboard()" class="back-btn">
                    <i data-lucide="arrow-left" class="button-icon"></i>
                    戻る
                </button>
                <h1>🔧 管理者ダッシュボード</h1>
                <div class="admin-user-info">
                    <span>管理者: ${currentUser.email}</span>
                </div>
            </div>
        </div>
        
        <div class="admin-tabs">
            <button class="tab-button active" onclick="showAdminTab('users')">👥 ユーザー管理</button>
            <button class="tab-button" onclick="showAdminTab('friends')">👥 友達管理</button>
            <button class="tab-button" onclick="showAdminTab('stats')">📊 統計情報</button>
            <button class="tab-button" onclick="showAdminTab('settings')">⚙️ システム設定</button>
            <button class="tab-button" onclick="showAdminTab('backup')">💾 バックアップ</button>
        </div>
        
        <div id="adminContent" class="admin-content">
            <!-- タブコンテンツがここに表示される -->
        </div>
    `;
    
    mainApp.appendChild(adminDashboard);
    
    // Lucideアイコンを初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // デフォルトでユーザー管理タブを表示
    showAdminTab('users');
}

// 管理者ダッシュボードを非表示
function hideAdminDashboard() {
    console.log('管理者ダッシュボードを非表示');
    
    const mainApp = document.getElementById('mainApp');
    if (!mainApp) return;
    
    // 管理者ダッシュボードを削除
    const adminDashboard = document.getElementById('adminDashboard');
    if (adminDashboard) {
        adminDashboard.remove();
    }
    
    // メイン画面の内容を再表示
    const todaySection = mainApp.querySelector('.today-section');
    const allRoutinesSection = mainApp.querySelector('.all-routines-section');
    
    if (todaySection) todaySection.style.display = 'block';
    if (allRoutinesSection) allRoutinesSection.style.display = 'block';
}

// 管理者タブを切り替え
function showAdminTab(tabName) {
    console.log('管理者タブ切り替え:', tabName);
    
    // タブボタンのアクティブ状態を更新
    document.querySelectorAll('.admin-tabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const content = document.getElementById('adminContent');
    
    switch (tabName) {
        case 'users':
            showUsersManagement();
            break;
        case 'friends':
            showFriendsManagement();
            break;
        case 'stats':
            showStatistics();
            break;
        case 'settings':
            showSystemSettings();
            break;
        case 'backup':
            showBackupManagement();
            break;
    }
}

// ユーザー管理画面
function showUsersManagement() {
    const content = document.getElementById('adminContent');
    
    // 全ユーザーのデータを取得
    const allUsers = getAllUsersData();
    
    content.innerHTML = `
        <div class="users-management">
            <div class="section-header">
                <h2>👥 ユーザー管理</h2>
                <button onclick="refreshUsersList()" class="refresh-btn">🔄 更新</button>
            </div>
            
            <div class="users-stats">
                <div class="stat-card">
                    <div class="stat-number">${allUsers.length}</div>
                    <div class="stat-label">総ユーザー数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${allUsers.filter(u => u.lastLogin).length}</div>
                    <div class="stat-label">アクティブユーザー</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${allUsers.filter(u => u.routines && u.routines.length > 0).length}</div>
                    <div class="stat-label">ルーティン作成者</div>
                </div>
            </div>
            
            <div class="users-list">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>ユーザー</th>
                            <th>ルーティン数</th>
                            <th>最終ログイン</th>
                            <th>登録日</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allUsers.map(user => `
                            <tr>
                                <td>
                                    <div class="user-info">
                                        <div class="user-email">${user.email}</div>
                                        <div class="user-name">${user.displayName || '名前なし'}</div>
                                    </div>
                                </td>
                                <td>${user.routines ? user.routines.length : 0}</td>
                                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ja-JP') : '未ログイン'}</td>
                                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '不明'}</td>
                                <td>
                                    <button onclick="viewUserDetails('${user.uid}')" class="btn-small">詳細</button>
                                    <button onclick="deleteUser('${user.uid}')" class="btn-small danger">削除</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 友達管理画面
function showFriendsManagement() {
    const content = document.getElementById('adminContent');
    
    // 全ユーザーのデータを取得
    const allUsers = getAllUsersData();
    const friends = friendManager.getFriends();
    
    content.innerHTML = `
        <div class="friends-management">
            <div class="section-header">
                <h2>👥 友達管理</h2>
                <button onclick="refreshFriendsList()" class="refresh-btn">🔄 更新</button>
            </div>
            
            <div class="friends-stats">
                <div class="stat-card">
                    <div class="stat-number">${friends.length}</div>
                    <div class="stat-label">友達数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${allUsers.length - friends.length}</div>
                    <div class="stat-label">一般ユーザー数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${allUsers.filter(u => isAdminUser(u)).length}</div>
                    <div class="stat-label">管理者数</div>
                </div>
            </div>
            
            <div class="friends-section">
                <h3>👥 友達リスト</h3>
                <div class="friends-list">
                    ${friends.length > 0 ? friends.map(friend => `
                        <div class="friend-item">
                            <div class="friend-info">
                                <div class="friend-email">${friend.email}</div>
                                <div class="friend-name">${friend.name}</div>
                                <div class="friend-added">追加日: ${new Date(friend.addedAt).toLocaleDateString('ja-JP')}</div>
                            </div>
                            <div class="friend-actions">
                                <button onclick="removeFriendFromAdmin('${friend.id}')" class="btn-small danger">友達解除</button>
                            </div>
                        </div>
                    `).join('') : '<p class="no-friends">友達はいません</p>'}
                </div>
            </div>
            
            <div class="add-friend-section">
                <h3>➕ 友達を追加</h3>
                <div class="add-friend-form">
                    <select id="friendSelect" class="form-select">
                        <option value="">ユーザーを選択</option>
                        ${allUsers
                            .filter(user => !isAdminUser(user) && !friendManager.isFriend(user.uid))
                            .map(user => `
                                <option value="${user.uid}" data-email="${user.email}" data-name="${user.displayName || user.email}">
                                    ${user.email} (${user.displayName || '名前なし'})
                                </option>
                            `).join('')}
                    </select>
                    <button onclick="addFriendFromAdmin()" class="btn-primary">友達に追加</button>
                </div>
            </div>
        </div>
    `;
}

// 管理者から友達を追加
function addFriendFromAdmin() {
    const select = document.getElementById('friendSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption.value) {
        showNotification('ユーザーを選択してください', 'warning');
        return;
    }
    
    const userId = selectedOption.value;
    const userEmail = selectedOption.dataset.email;
    const userName = selectedOption.dataset.name;
    
    if (friendManager.addFriend(userId, userEmail, userName)) {
        showNotification(`${userEmail} を友達に追加しました`, 'success');
        refreshFriendsList();
    } else {
        showNotification('既に友達です', 'warning');
    }
}

// 管理者から友達を削除
function removeFriendFromAdmin(userId) {
    if (confirm('このユーザーを友達から削除しますか？')) {
        if (friendManager.removeFriend(userId)) {
            showNotification('友達から削除しました', 'success');
            refreshFriendsList();
        } else {
            showNotification('友達ではありません', 'warning');
        }
    }
}

// 友達リストを更新
function refreshFriendsList() {
    showFriendsManagement();
}

// 統計情報画面
function showStatistics() {
    const content = document.getElementById('adminContent');
    const allUsers = getAllUsersData();
    
    // 統計データを計算
    const totalRoutines = allUsers.reduce((sum, user) => sum + (user.routines ? user.routines.length : 0), 0);
    const totalCompletions = allUsers.reduce((sum, user) => sum + (user.completions ? user.completions.length : 0), 0);
    const activeUsers = allUsers.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    
    content.innerHTML = `
        <div class="statistics">
            <div class="section-header">
                <h2>📊 統計情報</h2>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card large">
                    <div class="stat-number">${allUsers.length}</div>
                    <div class="stat-label">総ユーザー数</div>
                </div>
                <div class="stat-card large">
                    <div class="stat-number">${totalRoutines}</div>
                    <div class="stat-label">総ルーティン数</div>
                </div>
                <div class="stat-card large">
                    <div class="stat-number">${totalCompletions}</div>
                    <div class="stat-label">総完了数</div>
                </div>
                <div class="stat-card large">
                    <div class="stat-number">${activeUsers}</div>
                    <div class="stat-label">週間アクティブユーザー</div>
                </div>
            </div>
            
            <div class="chart-section">
                <h3>ユーザー登録推移</h3>
                <div class="chart-placeholder">
                    チャート機能は今後追加予定
                </div>
            </div>
        </div>
    `;
}

// システム設定画面
function showSystemSettings() {
    const content = document.getElementById('adminContent');
    const adminSettings = getAdminSettings();
    
    content.innerHTML = `
        <div class="system-settings">
            <div class="section-header">
                <h2>⚙️ システム設定</h2>
                <button onclick="saveSystemSettings()" class="save-btn">💾 保存</button>
            </div>
            
            <div class="settings-form">
                <div class="setting-group">
                    <label>メンテナンスモード</label>
                    <input type="checkbox" id="maintenanceMode" ${adminSettings.maintenanceMode ? 'checked' : ''}>
                    <span class="setting-description">メンテナンス中は一般ユーザーのアクセスを制限</span>
                </div>
                
                <div class="setting-group">
                    <label>新規ユーザー登録</label>
                    <input type="checkbox" id="allowRegistration" ${adminSettings.allowRegistration !== false ? 'checked' : ''}>
                    <span class="setting-description">新規ユーザーの登録を許可</span>
                </div>
                
                <div class="setting-group">
                    <label>デモユーザー</label>
                    <input type="checkbox" id="showDemoUser" ${adminSettings.showDemoUser !== false ? 'checked' : ''}>
                    <span class="setting-description">デモユーザーボタンを表示</span>
                </div>
                
                <div class="setting-group">
                    <label>管理者メールアドレス</label>
                    <input type="text" id="adminEmails" value="${ADMIN_EMAILS.join(', ')}" placeholder="admin@example.com, admin2@example.com">
                    <span class="setting-description">管理者権限を持つメールアドレス（カンマ区切り）</span>
                </div>
            </div>
        </div>
    `;
}

// バックアップ管理画面
function showBackupManagement() {
    const content = document.getElementById('adminContent');
    
    content.innerHTML = `
        <div class="backup-management">
            <div class="section-header">
                <h2>💾 バックアップ管理</h2>
            </div>
            
            <div class="backup-actions">
                <div class="backup-action">
                    <h3>📤 全データエクスポート</h3>
                    <p>全ユーザーのデータをJSON形式でエクスポートします</p>
                    <button onclick="exportAllData()" class="backup-btn">エクスポート</button>
                </div>
                
                <div class="backup-action">
                    <h3>📥 データインポート</h3>
                    <p>バックアップファイルからデータを復元します</p>
                    <button onclick="importData()" class="backup-btn">インポート</button>
                </div>
                
                <div class="backup-action">
                    <h3>🗑️ 全データ削除</h3>
                    <p>全てのデータを削除します（取り消し不可）</p>
                    <button onclick="clearAllData()" class="backup-btn danger">削除</button>
                </div>
            </div>
        </div>
    `;
}

// 全ユーザーのデータを取得
function getAllUsersData() {
    const users = [];
    
    // シンプル認証のユーザー
    if (typeof simpleAuth !== 'undefined') {
        const simpleUsers = simpleAuth.getAllUsers();
        users.push(...simpleUsers);
    }
    
    // Firebase認証のユーザー（管理者のみ）
    if (typeof firebase !== 'undefined' && firebase.auth && isAdminUser(currentUser)) {
        // Firebaseからユーザーリストを取得（実装は後で追加）
    }
    
    return users;
}

// ユーザー詳細を表示
function viewUserDetails(userId) {
    const user = getAllUsersData().find(u => u.uid === userId);
    if (!user) {
        showAINotification('ユーザーが見つかりません', 'error');
        return;
    }
    
    // モーダルでユーザー詳細を表示
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>ユーザー詳細: ${user.email}</h3>
                <button onclick="this.closest('.modal').remove()" class="close-btn">×</button>
            </div>
            <div class="modal-body">
                <div class="user-details">
                    <p><strong>メール:</strong> ${user.email}</p>
                    <p><strong>表示名:</strong> ${user.displayName || '未設定'}</p>
                    <p><strong>登録日:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleString('ja-JP') : '不明'}</p>
                    <p><strong>最終ログイン:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleString('ja-JP') : '未ログイン'}</p>
                    <p><strong>ルーティン数:</strong> ${user.routines ? user.routines.length : 0}</p>
                    <p><strong>完了数:</strong> ${user.completions ? user.completions.length : 0}</p>
                </div>
                
                <div class="user-routines">
                    <h4>ルーティン一覧</h4>
                    ${user.routines && user.routines.length > 0 ? 
                        user.routines.map(routine => `
                            <div class="routine-item">
                                <strong>${routine.title}</strong> - ${routine.frequency}
                            </div>
                        `).join('') : 
                        '<p>ルーティンがありません</p>'
                    }
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ユーザーを削除
function deleteUser(userId) {
    if (!confirm('このユーザーを削除しますか？この操作は取り消しできません。')) {
        return;
    }
    
    try {
        // シンプル認証のユーザー削除
        if (typeof simpleAuth !== 'undefined') {
            simpleAuth.deleteUser(userId);
        }
        
        showAINotification('ユーザーを削除しました', 'success');
        showUsersManagement(); // リストを更新
    } catch (error) {
        console.error('ユーザー削除エラー:', error);
        showAINotification('ユーザー削除に失敗しました', 'error');
    }
}

// システム設定を保存
function saveSystemSettings() {
    const settings = {
        maintenanceMode: document.getElementById('maintenanceMode').checked,
        allowRegistration: document.getElementById('allowRegistration').checked,
        showDemoUser: document.getElementById('showDemoUser').checked,
        adminEmails: document.getElementById('adminEmails').value.split(',').map(email => email.trim())
    };
    
    saveAdminSettings(settings);
    showAINotification('システム設定を保存しました', 'success');
}

// 全データをエクスポート
function exportAllData() {
    const allUsers = getAllUsersData();
    const exportData = {
        users: allUsers,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-routine-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showAINotification('データをエクスポートしました', 'success');
}

// データをインポート
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                // データインポート処理（実装は後で追加）
                showAINotification('データをインポートしました', 'success');
            } catch (error) {
                console.error('インポートエラー:', error);
                showAINotification('インポートに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// 全データを削除
function clearAllData() {
    if (!confirm('本当に全データを削除しますか？この操作は取り消しできません。')) {
        return;
    }
    
    if (!confirm('最後の確認: 全データを削除しますか？')) {
        return;
    }
    
    try {
        // ローカルストレージをクリア
        localStorage.clear();
        
        // シンプル認証のデータをリセット
        if (typeof simpleAuth !== 'undefined') {
            simpleAuth.resetData();
        }
        
        showAINotification('全データを削除しました', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch (error) {
        console.error('データ削除エラー:', error);
        showAINotification('データ削除に失敗しました', 'error');
    }
}

// ユーザーリストを更新
function refreshUsersList() {
    showUsersManagement();
    showAINotification('ユーザーリストを更新しました', 'info');
}

// ログアウト機能
async function logout() {
    console.log('ログアウト開始');
    
    try {
        // Firebase認証のログアウト
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
        }
        
        // シンプル認証のログアウト
        if (typeof simpleAuth !== 'undefined') {
            await simpleAuth.signOut();
        }
        
        // 現在のユーザーをクリア
        currentUser = null;
        
        // リアルタイム同期を停止
        stopRealtimeSync();
        
        // 認証画面を表示
        showAuthForm();
        
        showAINotification('ログアウトしました', 'info');
        console.log('ログアウト完了');
    } catch (error) {
        console.error('ログアウトエラー:', error);
        showAINotification('ログアウトに失敗しました', 'error');
    }
}

// Firebase設定確認関数
function checkFirebaseStatus() {
    console.log('=== Firebase設定確認開始 ===');
    
    let status = {
        firebaseLoaded: false,
        firebaseInitialized: false,
        authAvailable: false,
        firestoreAvailable: false,
        config: null,
        currentUser: null,
        authState: 'unknown'
    };
    
    // Firebase SDK の読み込み確認
    if (typeof firebase !== 'undefined') {
        status.firebaseLoaded = true;
        console.log('✅ Firebase SDK 読み込み済み');
        
        // Firebase 初期化確認
        try {
            const apps = firebase.apps;
            if (apps && apps.length > 0) {
                status.firebaseInitialized = true;
                console.log('✅ Firebase 初期化済み');
                console.log('プロジェクトID:', firebase.app().options.projectId);
                
                // 設定情報を取得
                status.config = {
                    projectId: firebase.app().options.projectId,
                    authDomain: firebase.app().options.authDomain,
                    apiKey: firebase.app().options.apiKey ? '設定済み' : '未設定'
                };
            } else {
                console.log('❌ Firebase 初期化されていません');
            }
        } catch (error) {
            console.error('Firebase 初期化確認エラー:', error);
        }
        
        // Auth の利用可能性確認
        if (firebase.auth) {
            status.authAvailable = true;
            console.log('✅ Firebase Auth 利用可能');
            
            // 現在のユーザー確認
            const currentUser = firebase.auth().currentUser;
            if (currentUser) {
                status.currentUser = {
                    email: currentUser.email,
                    uid: currentUser.uid,
                    emailVerified: currentUser.emailVerified
                };
                status.authState = 'authenticated';
                console.log('✅ ユーザー認証済み:', currentUser.email);
            } else {
                status.authState = 'unauthenticated';
                console.log('❌ ユーザー未認証');
            }
        } else {
            console.log('❌ Firebase Auth 利用不可');
        }
        
        // Firestore の利用可能性確認
        if (firebase.firestore) {
            status.firestoreAvailable = true;
            console.log('✅ Firestore 利用可能');
        } else {
            console.log('❌ Firestore 利用不可');
        }
    } else {
        console.log('❌ Firebase SDK 読み込まれていません');
    }
    
    // シンプル認証の状態確認
    if (typeof simpleAuth !== 'undefined') {
        console.log('✅ シンプル認証利用可能');
        if (simpleAuth.isAuthenticated()) {
            const user = simpleAuth.getCurrentUser();
            console.log('✅ シンプル認証済み:', user.email);
        } else {
            console.log('❌ シンプル認証未認証');
        }
    } else {
        console.log('❌ シンプル認証利用不可');
    }
    
    // 結果を表示
    let message = '=== Firebase設定確認結果 ===\n\n';
    message += `Firebase SDK: ${status.firebaseLoaded ? '✅ 読み込み済み' : '❌ 未読み込み'}\n`;
    message += `Firebase初期化: ${status.firebaseInitialized ? '✅ 完了' : '❌ 未完了'}\n`;
    message += `Auth利用可能: ${status.authAvailable ? '✅ 利用可能' : '❌ 利用不可'}\n`;
    message += `Firestore利用可能: ${status.firestoreAvailable ? '✅ 利用可能' : '❌ 利用不可'}\n`;
    message += `認証状態: ${status.authState === 'authenticated' ? '✅ 認証済み' : '❌ 未認証'}\n\n`;
    
    if (status.config) {
        message += `プロジェクトID: ${status.config.projectId}\n`;
        message += `Auth Domain: ${status.config.authDomain}\n`;
        message += `API Key: ${status.config.apiKey}\n\n`;
    }
    
    if (status.currentUser) {
        message += `現在のユーザー: ${status.currentUser.email}\n`;
        message += `UID: ${status.currentUser.uid}\n`;
        message += `メール確認: ${status.currentUser.emailVerified ? '✅ 確認済み' : '❌ 未確認'}\n\n`;
    }
    
    message += '推奨アクション:\n';
    if (!status.firebaseLoaded) {
        message += '• Firebase SDKの読み込みを確認してください\n';
    }
    if (!status.firebaseInitialized) {
        message += '• Firebase設定ファイルを確認してください\n';
    }
    if (!status.authAvailable) {
        message += '• Firebase Authの設定を確認してください\n';
    }
    if (status.authState === 'unauthenticated') {
        message += '• デモユーザーでログインするか、新規登録してください\n';
    }
    
    console.log('=== Firebase設定確認完了 ===');
    alert(message);
    
    return status;
}

// 管理者ユーザーを作成してログイン
function createAndLoginAsAdmin() {
    console.log('管理者ユーザー作成・ログイン開始');
    
    const adminEmail = 'yasnaries@gmail.com';
    const adminPassword = 'admin123456'; // 安全なパスワードに変更することを推奨
    
    if (typeof simpleAuth !== 'undefined') {
        try {
            console.log('管理者ユーザー作成中...');
            
            // 管理者ユーザーを作成
            const createResult = simpleAuth.createAdminUser(adminEmail, adminPassword);
            
            if (createResult.success) {
                console.log('管理者ユーザー作成成功:', createResult.message);
                showAINotification('管理者ユーザーを作成しました。ログイン中...', 'success');
                
                // 作成後に自動ログイン
                setTimeout(() => {
                    simpleAuth.signInAsAdmin(adminEmail, adminPassword).then((loginResult) => {
                        if (loginResult.success) {
                            console.log('管理者ログイン成功');
                            
                            // ユーザー情報を設定
                            const user = simpleAuth.getCurrentUser();
                            currentUser = {
                                id: user.uid || user.email,
                                username: user.displayName || user.email,
                                email: user.email,
                                isAdmin: true
                            };
                            
                            // ローカル保存を選択
                            selectedStorage = 'local';
                            localStorage.setItem('selectedStorage', selectedStorage);
                            
                            showAINotification('管理者としてログインしました', 'success');
                            
                            // 管理者ダッシュボードを表示
                            console.log('管理者ダッシュボードを表示中...');
                            showAdminDashboard();
                            
                        } else {
                            console.error('管理者ログイン失敗:', loginResult.message);
                            showAINotification('管理者ログインに失敗しました: ' + loginResult.message, 'error');
                        }
                    }).catch(error => {
                        console.error('管理者ログインエラー:', error);
                        showAINotification('管理者ログインに失敗しました: ' + error.message, 'error');
                    });
                }, 500);
                
            } else {
                console.error('管理者ユーザー作成失敗:', createResult.message);
                showAINotification('管理者ユーザーの作成に失敗しました: ' + createResult.message, 'error');
            }
            
        } catch (error) {
            console.error('管理者ユーザー作成・ログインエラー:', error);
            showAINotification('管理者ユーザーの作成・ログインに失敗しました: ' + error.message, 'error');
        }
    } else {
        console.error('シンプル認証が利用できません');
        showAINotification('シンプル認証が利用できません', 'error');
    }
}

// 管理者ログインボタンを追加
function addAdminLoginButton() {
    console.log('管理者ログインボタンを追加中...');
    
    const authFooter = document.querySelector('.auth-footer');
    if (!authFooter) {
        console.log('auth-footerが見つかりません');
        return;
    }
    
    // 既存の管理者ボタンを削除
    const existingButton = document.getElementById('adminLoginButton');
    if (existingButton) {
        existingButton.remove();
    }
    
    const adminButton = document.createElement('button');
    adminButton.id = 'adminLoginButton';
    adminButton.className = 'admin-login-btn';
    adminButton.innerHTML = `
        <i data-lucide="shield"></i>
        管理者としてログイン
    `;
    adminButton.style.cssText = `
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease;
        margin-top: 10px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    `;
    
    // モバイル用のタッチイベント
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        adminButton.addEventListener('touchstart', function(e) {
            console.log('管理者ログインボタンタッチ開始');
            this.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        adminButton.addEventListener('touchend', function(e) {
            console.log('管理者ログインボタンタッチ終了');
            this.style.transform = 'scale(1)';
            e.preventDefault();
            createAndLoginAsAdmin();
        }, { passive: false });
    } else {
        adminButton.addEventListener('click', function(e) {
            console.log('管理者ログインボタンクリック');
            createAndLoginAsAdmin();
        });
    }
    
    // ホバー効果（デスクトップ用）
    adminButton.addEventListener('mouseenter', function() {
        if (!isMobile) {
            this.style.transform = 'translateY(-2px)';
        }
    });
    
    adminButton.addEventListener('mouseleave', function() {
        if (!isMobile) {
            this.style.transform = 'translateY(0)';
        }
    });
    
    authFooter.appendChild(adminButton);
    
    // Lucideアイコンを更新
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    console.log('管理者ログインボタン追加完了');
}
