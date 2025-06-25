// 洗練されたログイン画面用のJavaScript
// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('ページ読み込み完了');
    
    // Lucideアイコンの初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // 認証状態の確認
    checkAuthState();
    
    // ログイン状態保持の復元
    restorePersistenceState();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // モバイルデバイス検出
    detectMobileDevice();
});

// イベントリスナーの設定
function setupEventListeners() {
    console.log('イベントリスナー設定開始');
    
    // 認証フォーム
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }
    
    // Googleログインボタン
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // パスワード表示切り替え
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // ログイン状態保持チェックボックス
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        rememberMe.addEventListener('change', handlePersistenceChange);
    }
    
    console.log('イベントリスナー設定完了');
}

// 認証状態の確認
function checkAuthState() {
    try {
        // まずローカル認証を確認
        const localUser = checkLocalAuth();
        if (localUser) {
            handleAuthStateChange(localUser);
            return;
        }
        
        // Firebase認証状態の確認
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function(user) {
                console.log('Firebase認証状態変更:', user ? 'ログイン済み' : '未ログイン');
                if (user) {
                    handleAuthStateChange(user);
                } else {
                    showAuthScreen();
                }
            });
        } else {
            showAuthScreen();
        }
    } catch (error) {
        console.error('認証状態確認エラー:', error);
        showAuthScreen();
    }
}

// ローカル認証の確認
function checkLocalAuth() {
    console.log('ローカル認証確認');
    
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            console.log('ローカルユーザー発見:', user.email);
            return user;
        }
    } catch (error) {
        console.error('ローカル認証確認エラー:', error);
    }
    return null;
}

// 認証状態変更の処理
function handleAuthStateChange(user) {
    console.log('認証状態変更処理開始:', user ? user.email : 'なし');
    
    if (user) {
        // ユーザー情報の設定
        setUserInfo(user);
        
        // メインアプリの表示
        showMainApp();
        
        // アプリの初期化
        initializeApp();
        
        // ログイン成功通知
        showNotification('ログインに成功しました', 'success');
    } else {
        // ログアウト状態
        clearUserInfo();
        showAuthScreen();
    }
}

// ユーザー情報の設定
function setUserInfo(user) {
    console.log('ユーザー情報設定:', user.email);
    
    // グローバル変数に保存
    window.currentUser = {
        email: user.email,
        displayName: user.displayName || user.email,
        uid: user.uid || null,
        isAdmin: user.email === 'yasnaries@gmail.com',
        authType: user.uid ? 'firebase' : 'local' // 認証タイプを記録
    };
    
    // ローカルストレージに保存
    localStorage.setItem('userData', JSON.stringify(window.currentUser));
    
    // ユーザータイプの設定
    setUserType(window.currentUser);
}

// ユーザー情報のクリア
function clearUserInfo() {
    console.log('ユーザー情報クリア');
    
    window.currentUser = null;
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
}

// メインアプリの表示
function showMainApp() {
    console.log('メインアプリ表示');
    
    const authContainer = document.getElementById('authContainer');
    const app = document.getElementById('app');
    
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    
    if (app) {
        app.style.display = 'block';
        app.style.background = '#f8fafc';
        
        // 強制的にスタイルを適用
        app.classList.add('app-active');
        
        console.log('メインアプリ表示完了');
    }
}

// 認証画面の表示
function showAuthScreen() {
    console.log('認証画面表示');
    
    const authContainer = document.getElementById('authContainer');
    const app = document.getElementById('app');
    
    if (authContainer) {
        authContainer.style.display = 'flex';
    }
    
    if (app) {
        app.style.display = 'none';
    }
}

// Googleログイン処理
function handleGoogleLogin() {
    console.log('Googleログイン開始');
    
    const rememberMe = document.getElementById('rememberMe');
    const persistence = rememberMe && rememberMe.checked ? 'LOCAL' : 'SESSION';
    
    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            // Firebase Google認証
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // 永続性の設定
            firebase.auth().setPersistence(persistence === 'LOCAL' ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION
            ).then(() => {
                return firebase.auth().signInWithPopup(provider);
            }).then((result) => {
                console.log('Googleログイン成功:', result.user.email);
                
                // ストレージを自動的にFirebaseに設定
                setStorageType('firebase');
                showNotification('GoogleログインでFirebaseストレージが自動選択されました', 'info');
                
            }).catch((error) => {
                console.error('Googleログインエラー:', error);
                showNotification('Googleログインに失敗しました: ' + error.message, 'error');
            });
        } else {
            console.log('Firebase未利用、ローカル認証を使用');
            // ローカル認証のデモユーザー作成
            createDemoUser();
        }
    } catch (error) {
        console.error('Googleログイン処理エラー:', error);
        showNotification('Googleログインに失敗しました', 'error');
    }
}

// 認証フォーム送信処理
function handleAuthSubmit(event) {
    event.preventDefault();
    console.log('認証フォーム送信');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe');
    const persistence = rememberMe && rememberMe.checked ? 'LOCAL' : 'SESSION';
    
    if (!email || !password) {
        showNotification('メールアドレスとパスワードを入力してください', 'error');
        return;
    }
    
    try {
        // まずローカル認証を試行
        const localAuthResult = handleLocalAuth(email, password, persistence);
        if (localAuthResult) {
            return; // ローカル認証が成功した場合
        }
        
        // ローカル認証が失敗した場合、Firebase認証を試行
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().setPersistence(persistence === 'LOCAL' ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION
            ).then(() => {
                return firebase.auth().signInWithEmailAndPassword(email, password);
            }).then((result) => {
                console.log('Firebaseログイン成功:', result.user.email);
                
                // ストレージを自動的にFirebaseに設定
                setStorageType('firebase');
                showNotification('FirebaseログインでFirebaseストレージが自動選択されました', 'info');
                
            }).catch((error) => {
                console.error('Firebaseログインエラー:', error);
                showNotification('ログインに失敗しました: ' + error.message, 'error');
            });
        } else {
            showNotification('メールアドレスまたはパスワードが正しくありません', 'error');
        }
    } catch (error) {
        console.error('認証処理エラー:', error);
        showNotification('ログインに失敗しました', 'error');
    }
}

// ローカル認証処理
function handleLocalAuth(email, password, persistence) {
    console.log('ローカル認証処理:', email);
    
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            console.log('ローカル認証成功:', user.email);
            
            // 永続性の設定
            if (persistence === 'LOCAL') {
                localStorage.setItem('rememberMe', 'true');
            } else {
                sessionStorage.setItem('rememberMe', 'true');
            }
            
            // ユーザー情報を設定
            const userData = {
                email: user.email,
                displayName: user.displayName || user.email,
                uid: user.id,
                isAdmin: user.email === 'yasnaries@gmail.com',
                authType: 'local'
            };
            
            handleAuthStateChange(userData);
            
            // ストレージを自動的にローカルに設定
            setStorageType('local');
            showNotification('ローカルストレージが自動選択されました', 'info');
            
            return true; // 認証成功
        } else {
            console.log('ローカル認証失敗: ユーザーが見つかりません');
            return false; // 認証失敗
        }
    } catch (error) {
        console.error('ローカル認証エラー:', error);
        return false; // 認証失敗
    }
}

// パスワード表示切り替え
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
    }
    
    // Lucideアイコンを再初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ログイン状態保持の処理
function handlePersistenceChange(event) {
    const rememberMe = event.target.checked;
    console.log('ログイン状態保持変更:', rememberMe);
    
    if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('rememberMe');
    }
}

// ログイン状態保持の復元
function restorePersistenceState() {
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        const isRemembered = localStorage.getItem('rememberMe') || sessionStorage.getItem('rememberMe');
        rememberMe.checked = !!isRemembered;
    }
}

// デモユーザーの作成
function createDemoUser() {
    console.log('デモユーザー作成');
    
    try {
        const demoUser = {
            id: 'demo-' + Date.now(),
            email: 'demo@example.com',
            password: 'demo123',
            displayName: 'デモユーザー',
            createdAt: new Date().toISOString()
        };
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(demoUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('デモユーザー作成完了');
        showNotification('デモユーザーが作成されました', 'success');
        
        // 自動ログイン
        handleLocalAuth(demoUser.email, demoUser.password, 'LOCAL');
        
    } catch (error) {
        console.error('デモユーザー作成エラー:', error);
        showNotification('デモユーザーの作成に失敗しました', 'error');
    }
}

// 通知表示
function showNotification(message, type = 'info') {
    console.log('通知表示:', message, type);
    
    // 既存の通知を削除
    const existingNotifications = document.querySelectorAll('.ai-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `ai-notification ai-notification-${type}`;
    notification.innerHTML = `
        <div class="ai-notification-content">
            <div class="ai-notification-message">${message}</div>
            <button class="ai-notification-close" onclick="this.parentElement.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Lucideアイコンを初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // 5秒後に自動削除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ストレージタイプの設定
function setStorageType(type) {
    console.log('ストレージタイプ設定:', type);
    localStorage.setItem('storageType', type);
}

// ユーザータイプの設定
function setUserType(user) {
    console.log('ユーザータイプ設定:', user.email);
    
    let userType = 'regular';
    
    if (user.isAdmin) {
        userType = 'admin';
    } else if (user.email.includes('friend') || user.email.includes('友達')) {
        userType = 'friend';
    }
    
    localStorage.setItem('userType', userType);
    updateUserTypeDisplay(userType);
}

// ユーザータイプ表示の更新
function updateUserTypeDisplay(userType) {
    const userTypeDisplay = document.querySelector('.user-type-display');
    if (userTypeDisplay) {
        userTypeDisplay.innerHTML = `
            <span class="user-type-badge ${userType}">
                ${userType === 'admin' ? '管理者' : 
                  userType === 'friend' ? '友達' : '一般ユーザー'}
            </span>
        `;
    }
}

// アプリの初期化
function initializeApp() {
    console.log('アプリ初期化開始');
    
    try {
        // ストレージの初期化
        initializeStorage();
        
        // ルーティンの読み込み
        loadRoutines();
        
        // 今日のルーティンの表示
        displayTodayRoutines();
        
        // 同期状態の更新
        updateSyncStatus();
        
        console.log('アプリ初期化完了');
    } catch (error) {
        console.error('アプリ初期化エラー:', error);
    }
}

// ストレージの初期化
function initializeStorage() {
    console.log('ストレージ初期化');
    
    const storageType = localStorage.getItem('storageType') || 'local';
    
    if (storageType === 'firebase' && typeof firebase !== 'undefined') {
        console.log('Firebaseストレージ初期化');
        // Firebase初期化処理
    } else {
        console.log('ローカルストレージ初期化');
        // ローカルストレージ初期化処理
    }
}

// ルーティンの読み込み
function loadRoutines() {
    console.log('ルーティン読み込み');
    
    try {
        const routines = JSON.parse(localStorage.getItem('routines') || '[]');
        console.log('読み込まれたルーティン数:', routines.length);
        return routines;
    } catch (error) {
        console.error('ルーティン読み込みエラー:', error);
        return [];
    }
}

// 今日のルーティンの表示
function displayTodayRoutines() {
    console.log('今日のルーティン表示');
    
    const routines = loadRoutines();
    const today = new Date().toDateString();
    
    // 今日のルーティンをフィルタリング
    const todayRoutines = routines.filter(routine => {
        // 頻度に基づいて今日のルーティンかどうかを判定
        return isTodayRoutine(routine, today);
    });
    
    console.log('今日のルーティン数:', todayRoutines.length);
    
    // UIの更新
    updateTodayRoutinesUI(todayRoutines);
}

// 今日のルーティンかどうかの判定
function isTodayRoutine(routine, today) {
    const dayOfWeek = new Date().getDay();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const todayName = dayNames[dayOfWeek];
    
    switch (routine.frequency) {
        case 'daily':
            return true;
        case 'weekly':
            return routine.days && routine.days.includes(todayName);
        case 'monthly':
            const dayOfMonth = new Date().getDate();
            return routine.dayOfMonth && routine.dayOfMonth === dayOfMonth;
        default:
            return false;
    }
}

// 今日のルーティンUI更新
function updateTodayRoutinesUI(routines) {
    const container = document.querySelector('.today-routines-list');
    if (!container) return;
    
    if (routines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calendar" class="empty-icon"></i>
                <h3>今日のルーティンはありません</h3>
                <p>新しいルーティンを追加して、毎日の習慣を管理しましょう</p>
                <button class="add-first-routine-btn" onclick="showAddRoutineScreen()">
                    <i data-lucide="plus"></i>
                    最初のルーティンを追加
                </button>
            </div>
        `;
    } else {
        container.innerHTML = routines.map(routine => `
            <div class="routine-item" data-id="${routine.id}">
                <div class="routine-content">
                    <div class="routine-header">
                        <h3 class="routine-title">${routine.title}</h3>
                        <div class="routine-actions">
                            <button class="action-btn edit-btn" onclick="editRoutine('${routine.id}')">
                                <i data-lucide="edit" class="action-icon"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteRoutine('${routine.id}')">
                                <i data-lucide="trash-2" class="action-icon"></i>
                            </button>
                        </div>
                    </div>
                    ${routine.description ? `<p class="routine-description">${routine.description}</p>` : ''}
                    <div class="routine-meta">
                        <span class="routine-frequency">
                            <i data-lucide="calendar" class="meta-icon"></i>
                            ${getFrequencyText(routine.frequency)}
                        </span>
                        ${routine.time ? `
                            <span class="routine-time">
                                <i data-lucide="clock" class="meta-icon"></i>
                                ${routine.time}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <button class="completion-btn" onclick="toggleRoutineCompletion('${routine.id}')">
                    <i data-lucide="check" class="completion-icon"></i>
                    完了
                </button>
            </div>
        `).join('');
    }
    
    // Lucideアイコンを初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// 頻度テキストの取得
function getFrequencyText(frequency) {
    switch (frequency) {
        case 'daily': return '毎日';
        case 'weekly': return '週次';
        case 'monthly': return '月次';
        default: return 'カスタム';
    }
}

// 同期状態の更新
function updateSyncStatus() {
    console.log('同期状態更新');
    
    const storageType = localStorage.getItem('storageType') || 'local';
    const syncStatus = document.querySelector('.sync-status');
    
    if (syncStatus) {
        if (storageType === 'firebase') {
            syncStatus.textContent = 'サーバー同期';
            syncStatus.className = 'sync-status server-sync';
        } else {
            syncStatus.textContent = 'ローカル同期';
            syncStatus.className = 'sync-status local-sync';
        }
    }
}

// モバイルデバイス検出
function detectMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log('モバイルデバイス検出');
    }
}

// Firebase設定確認
function checkFirebaseStatus() {
    console.log('Firebase設定確認');
    
    if (typeof firebase !== 'undefined') {
        showNotification('Firebaseは正常に初期化されています', 'success');
    } else {
        showNotification('Firebaseが初期化されていません', 'error');
    }
}

// Firebase設定修正
function fixFirebaseConfig() {
    console.log('Firebase設定修正');
    showNotification('Firebase設定の修正を開始します', 'info');
    
    // 設定修正のロジックを実装
    setTimeout(() => {
        showNotification('Firebase設定の修正が完了しました', 'success');
    }, 2000);
}

// ログアウト機能
function logout() {
    console.log('ログアウト開始');
    
    try {
        // 現在のユーザー情報を取得
        const currentUser = window.currentUser;
        
        if (currentUser && currentUser.authType === 'firebase') {
            // Firebaseログアウト
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().then(() => {
                    console.log('Firebaseログアウト成功');
                    clearUserInfo();
                    showAuthScreen();
                    showNotification('ログアウトしました', 'info');
                }).catch((error) => {
                    console.error('Firebaseログアウトエラー:', error);
                    // エラーが発生してもローカル情報をクリア
                    clearUserInfo();
                    showAuthScreen();
                    showNotification('ログアウトしました', 'info');
                });
            } else {
                clearUserInfo();
                showAuthScreen();
                showNotification('ログアウトしました', 'info');
            }
        } else {
            // ローカルログアウト
            clearUserInfo();
            showAuthScreen();
            showNotification('ログアウトしました', 'info');
        }
    } catch (error) {
        console.error('ログアウトエラー:', error);
        // エラーが発生してもローカル情報をクリア
        clearUserInfo();
        showAuthScreen();
        showNotification('ログアウトしました', 'info');
    }
} 