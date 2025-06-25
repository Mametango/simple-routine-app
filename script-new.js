// 洗練されたログイン画面用のJavaScript

// デバッグ情報
console.log('=== script-new.js 読み込み開始 ===');
console.log('バージョン: 1.0.3');
console.log('読み込み時刻:', new Date().toISOString());

// グローバル変数の定義
let currentUserInfo = null;
let currentStorage = 'local';
let routines = [];
let completions = [];
let isGoogleLoginInProgress = false; // ログイン処理中のフラグ

// グローバルフラグを設定（Firebase設定からアクセス可能にする）
window.isGoogleLoginInProgress = false;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ページ読み込み完了 ===');
    console.log('script-new.js が正常に読み込まれました');
    
    // データ初期化
    initializeData();
    
    // Lucideアイコン初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        console.log('Lucideアイコン初期化完了');
    }
    
    // 認証状態チェック
    const isLoggedIn = checkAuthState();
    
    if (!isLoggedIn) {
        // ログインしていない場合は認証画面を表示
        console.log('未ログイン - 認証画面を表示');
        showAuthScreen();
    } else {
        // ログイン済みの場合はメインアプリを表示
        console.log('ログイン済み - メインアプリを表示');
        showMainApp();
    }
    
    // イベントリスナー設定
    setupEventListeners();
    
    // アプリ初期化
    initializeApp();
    
    console.log('=== 初期化完了 ===');
});

// データの初期化
function initializeData() {
    console.log('データ初期化開始');
    
    try {
        // ルーティンデータの読み込み
        const savedRoutines = localStorage.getItem('routines');
        if (savedRoutines) {
            routines = JSON.parse(savedRoutines);
            console.log('ルーティンデータ読み込み完了:', routines.length);
        }
        
        // 完了データの読み込み
        const savedCompletions = localStorage.getItem('completions');
        if (savedCompletions) {
            completions = JSON.parse(savedCompletions);
            console.log('完了データ読み込み完了:', completions.length);
        }
        
        // ストレージタイプの読み込み
        const storageType = localStorage.getItem('storageType');
        if (storageType) {
            currentStorage = storageType;
            console.log('ストレージタイプ設定:', currentStorage);
        }
        
        console.log('データ初期化完了');
    } catch (error) {
        console.error('データ初期化エラー:', error);
        // エラーが発生した場合はデフォルト値を使用
        routines = [];
        completions = [];
        currentStorage = 'local';
    }
}

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
    
    // ルーティン追加フォーム
    const routineForm = document.getElementById('routineForm');
    if (routineForm) {
        routineForm.addEventListener('submit', handleRoutineFormSubmit);
    }
    
    // 頻度ボタン
    const frequencyButtons = document.querySelectorAll('.frequency-btn');
    frequencyButtons.forEach(button => {
        button.addEventListener('click', handleFrequencyButtonClick);
    });
    
    // タブボタン
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabButtonClick);
    });
    
    console.log('イベントリスナー設定完了');
}

// 認証状態の確認
function checkAuthState() {
    console.log('認証状態確認開始');
    
    // ローカル認証を確認
    const isLoggedIn = checkLocalAuth();
    
    if (isLoggedIn) {
        console.log('ローカル認証済み');
        return true;
    }
    
    // Firebase認証を確認（Googleログインのみ）
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            console.log('Firebase認証済み:', currentUser.email);
            // Firebase認証状態変更ハンドラーで処理される
            return true;
        }
    }
    
    console.log('未認証');
    return false;
}

// ローカル認証の確認
function checkLocalAuth() {
    console.log('ローカル認証確認');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    
    if (isLoggedIn && userInfo) {
        console.log('ローカルユーザー発見:', userInfo.email);
        currentUserInfo = userInfo;
        currentStorage = localStorage.getItem('storageType') || 'local';
        
        // 認証状態変更処理を実行
        handleAuthStateChange(userInfo);
        return true;
    }
    
    console.log('ローカル認証なし');
    return false;
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
    
    // currentUserInfoを設定
    currentUserInfo = {
        email: user.email,
        displayName: user.displayName || user.email,
        uid: user.uid || null,
        id: user.id || Date.now().toString(),
        isGoogleUser: user.uid ? true : false
    };
    
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
    localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
    
    // ユーザータイプの設定
    setUserType(window.currentUser);
}

// ユーザー情報のクリア
function clearUserInfo() {
    console.log('ユーザー情報クリア');
    
    currentUserInfo = null;
    window.currentUser = null;
    localStorage.removeItem('userData');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userType');
}

// メインアプリを表示する関数
function showMainApp() {
    console.log('showMainApp called');
    
    // 認証画面を非表示
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.style.display = 'none';
        console.log('Auth container hidden');
    } else {
        console.error('Auth container not found');
    }
    
    // メインアプリを表示
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'block';
        app.classList.add('app-active');
        console.log('Main app displayed');
        
        // 背景色を強制設定
        document.body.style.background = '#f8fafc';
        app.style.background = '#f8fafc';
        
        // ページタイトルを更新
        document.title = 'My Routine - ルーティン管理';
    } else {
        console.error('App element not found');
        return;
    }
    
    // ユーザー情報を更新
    updateUserInfo();
    
    // ルーティンを読み込み
    loadRoutines();
    
    // 同期状態を更新
    updateSyncStatus();
    
    // 広告を表示（一般ユーザーのみ）
    showAdsIfNeeded();
    
    // 成功通知を表示
    if (currentUserInfo) {
        const userTypeText = currentUserInfo.email === 'yasnaries@gmail.com' ? '（管理者）' : '';
        const storageText = currentStorage === 'firebase' ? 'サーバー同期' : 'ローカル保存';
        showNotification(`ログインに成功しました！${userTypeText}（${storageText}モード）`, 'success');
    }
    
    console.log('showMainApp completed');
}

// ユーザー情報を更新
function updateUserInfo() {
    const currentUser = document.getElementById('currentUser');
    const userTypeDisplay = document.getElementById('userTypeDisplay');
    const adminBtn = document.getElementById('adminBtn');
    
    if (currentUser && currentUserInfo) {
        currentUser.textContent = currentUserInfo.email || currentUserInfo.displayName || 'ユーザー';
    }
    
    if (userTypeDisplay) {
        const userType = getUserType();
        userTypeDisplay.textContent = userType;
        userTypeDisplay.className = `user-type-display user-type-${userType}`;
    }
    
    // 管理者ボタンの表示/非表示
    if (adminBtn) {
        if (isAdmin()) {
            adminBtn.style.display = 'block';
        } else {
            adminBtn.style.display = 'none';
        }
    }
}

// ルーティンを読み込み
function loadRoutines() {
    console.log('Loading routines...');
    
    // 今日のルーティンを表示
    displayTodayRoutines();
    
    // 全ルーティンを表示
    displayAllRoutines();
}

// 今日のルーティンを表示
function displayTodayRoutines() {
    const todayRoutinesList = document.getElementById('todayRoutinesList');
    if (!todayRoutinesList) {
        console.error('Today routines list element not found');
        return;
    }
    
    const today = new Date();
    const todayRoutines = routines.filter(routine => {
        if (routine.frequency === 'daily') return true;
        if (routine.frequency === 'weekly') {
            return routine.weeklyDays && routine.weeklyDays.includes(today.getDay());
        }
        if (routine.frequency === 'monthly') {
            return routine.monthlyDate === today.getDate();
        }
        return false;
    });
    
    if (todayRoutines.length === 0) {
        todayRoutinesList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calendar" class="empty-icon"></i>
                <h3>今日のルーティンはありません</h3>
                <p>新しいルーティンを追加して、今日の習慣を始めましょう！</p>
                <button class="add-first-routine-btn" onclick="showAddRoutineScreen()">
                    <i data-lucide="plus" class="button-icon"></i>
                    ルーティンを追加
                </button>
            </div>
        `;
    } else {
        todayRoutinesList.innerHTML = todayRoutines.map(routine => createRoutineHTML(routine)).join('');
    }
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 全ルーティンを表示
function displayAllRoutines() {
    const allRoutinesList = document.getElementById('allRoutinesList');
    if (!allRoutinesList) {
        console.error('All routines list element not found');
        return;
    }
    
    if (routines.length === 0) {
        allRoutinesList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="list" class="empty-icon"></i>
                <h3>まだルーティンがありません</h3>
                <p>新しいルーティンを追加して、毎日の習慣を始めましょう！</p>
                <button class="add-first-routine-btn" onclick="showAddRoutineScreen()">
                    <i data-lucide="plus" class="button-icon"></i>
                    ルーティンを追加
                </button>
            </div>
        `;
    } else {
        allRoutinesList.innerHTML = routines.map(routine => createRoutineHTML(routine)).join('');
    }
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// ルーティンのHTMLを生成
function createRoutineHTML(routine) {
    const isCompleted = isRoutineCompletedToday(routine.id);
    const completionClass = isCompleted ? 'completed' : '';
    
    return `
        <div class="routine-item ${completionClass}" data-routine-id="${routine.id}">
            <div class="routine-content">
                <div class="routine-header">
                    <h3 class="routine-title">${routine.title}</h3>
                    <div class="routine-actions">
                        <button class="action-btn edit-btn" onclick="editRoutine('${routine.id}')" title="編集">
                            <i data-lucide="edit" class="action-icon"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteRoutine('${routine.id}')" title="削除">
                            <i data-lucide="trash" class="action-icon"></i>
                        </button>
                    </div>
                </div>
                ${routine.description ? `<p class="routine-description">${routine.description}</p>` : ''}
                <div class="routine-meta">
                    <span class="routine-frequency">
                        <i data-lucide="repeat" class="meta-icon"></i>
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
            <button class="completion-btn ${completionClass}" onclick="toggleRoutineCompletion('${routine.id}')">
                <i data-lucide="${isCompleted ? 'check-circle' : 'circle'}" class="completion-icon"></i>
                ${isCompleted ? '完了済み' : '完了にする'}
            </button>
        </div>
    `;
}

// 頻度テキストを取得
function getFrequencyText(frequency) {
    switch (frequency) {
        case 'daily': return '毎日';
        case 'weekly': return '毎週';
        case 'monthly': return '毎月';
        default: return frequency;
    }
}

// 今日ルーティンが完了しているかチェック
function isRoutineCompletedToday(routineId) {
    const today = new Date().toDateString();
    return completions.some(completion => 
        completion.routineId === routineId && 
        completion.date === today
    );
}

// ルーティン完了を切り替え
function toggleRoutineCompletion(routineId) {
    const today = new Date().toDateString();
    const existingCompletion = completions.find(completion => 
        completion.routineId === routineId && 
        completion.date === today
    );
    
    if (existingCompletion) {
        // 完了を取り消し
        completions = completions.filter(completion => completion !== existingCompletion);
    } else {
        // 完了にする
        completions.push({
            routineId: routineId,
            date: today,
            timestamp: new Date().toISOString()
        });
    }
    
    // データを保存
    saveData();
    
    // 表示を更新
    displayTodayRoutines();
    displayAllRoutines();
}

// ルーティン追加画面を表示
function showAddRoutineScreen() {
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    if (addRoutineScreen) {
        addRoutineScreen.style.display = 'flex';
    }
}

// メイン画面に戻る
function showMainScreen() {
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    if (addRoutineScreen) {
        addRoutineScreen.style.display = 'none';
    }
}

// 同期状態を更新
function updateSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        if (currentStorage === 'firebase') {
            syncStatus.textContent = '🟢 サーバー同期';
            syncStatus.className = 'sync-status server-sync';
        } else {
            syncStatus.textContent = '🟡 ローカル保存';
            syncStatus.className = 'sync-status local-sync';
        }
    }
}

// 広告を表示（一般ユーザーのみ）
function showAdsIfNeeded() {
    const adContainer = document.getElementById('adContainer');
    if (adContainer) {
        if (getUserType() === 'general') {
            adContainer.style.display = 'block';
        } else {
            adContainer.style.display = 'none';
        }
    }
}

// 認証画面の表示
function showAuthScreen() {
    console.log('認証画面表示');
    
    const authContainer = document.getElementById('authContainer');
    const app = document.getElementById('app');
    
    if (authContainer) {
        authContainer.style.display = 'flex';
        console.log('Auth container displayed');
    } else {
        console.error('Auth container not found');
    }
    
    if (app) {
        app.style.display = 'none';
        app.classList.remove('app-active');
        console.log('Main app hidden');
    } else {
        console.error('App element not found');
    }
    
    // ページタイトルを更新
    document.title = 'My Routine - ログイン';
}

// Googleログイン処理
async function handleGoogleLogin() {
    console.log('Googleログイン開始');
    
    // 既にログイン処理中の場合は何もしない
    if (isGoogleLoginInProgress) {
        console.log('Googleログイン処理中です。しばらく待ってから再試行してください。');
        showNotification('ログイン処理中です。しばらく待ってから再試行してください。', 'info');
        return;
    }
    
    if (typeof firebase === 'undefined') {
        showNotification('Firebaseが読み込まれていません', 'error');
        return;
    }
    
    isGoogleLoginInProgress = true;
    window.isGoogleLoginInProgress = true; // グローバルフラグも更新
    
    try {
        // ポップアップブロックチェック
        const popupBlocked = await checkPopupBlocked();
        if (popupBlocked) {
            // ポップアップがブロックされている場合の代替手段を提案
            showPopupBlockedDialog();
            return;
        }
        
        const auth = firebase.auth();
        
        // 既存のポップアップをクリーンアップ
        await cleanupExistingPopups();
        
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // スコープを設定
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        
        // カスタムパラメータ
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        
        console.log('Google認証プロバイダー設定完了');
        
        // ポップアップ認証を試行（タイムアウト付き）
        const result = await Promise.race([
            auth.signInWithPopup(googleProvider),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('認証タイムアウト')), 30000)
            )
        ]);
        
        console.log('Googleログイン成功:', result.user.email);
        
        // ユーザー情報を設定
        const user = result.user;
        currentUserInfo = {
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            uid: user.uid,
            id: user.uid, // Google UIDをIDとして使用
            isGoogleUser: true
        };
        
        // ローカルアカウントとリンク
        await linkWithLocalAccount(user);
        
        // Firebaseストレージを使用
        currentStorage = 'firebase';
        localStorage.setItem('storageType', 'firebase');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        
        // メインアプリを表示
        showMainApp();
        
        // 成功通知（詳細版）
        const userTypeText = user.email === 'yasnaries@gmail.com' ? '（管理者）' : '';
        const storageText = 'サーバー同期';
        showNotification(`Googleログインに成功しました！${userTypeText}（${storageText}モード）`, 'success');
        
        console.log('Googleログイン完了:', {
            email: user.email,
            displayName: user.displayName,
            userType: user.email === 'yasnaries@gmail.com' ? 'admin' : 'user',
            storage: 'firebase',
            isGoogleUser: true
        });
        
    } catch (error) {
        console.error('Googleログインエラー:', error);
        
        let errorMessage = 'Googleログインに失敗しました';
        
        switch (error.code) {
            case 'auth/popup-blocked':
                errorMessage = 'ポップアップがブロックされています。ブラウザの設定でポップアップを許可してください。';
                showPopupBlockedDialog();
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'ログインがキャンセルされました';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'ログイン処理が重複しています。しばらく待ってから再試行してください。';
                break;
            case 'auth/unauthorized-domain':
                errorMessage = 'このドメインは認証が許可されていません。管理者に連絡してください。';
                break;
            default:
                if (error.message.includes('タイムアウト')) {
                    errorMessage = '認証がタイムアウトしました。再試行してください。';
                } else {
                    errorMessage = `ログインエラー: ${error.message}`;
                }
        }
        
        showNotification(errorMessage, 'error');
        
        // エラー後に少し待ってからフラグをリセット
        setTimeout(() => {
            isGoogleLoginInProgress = false;
            window.isGoogleLoginInProgress = false;
        }, 2000);
        
    } finally {
        // 成功時は即座にフラグをリセット
        if (!isGoogleLoginInProgress) {
            isGoogleLoginInProgress = false;
            window.isGoogleLoginInProgress = false;
        }
    }
}

// 認証フォーム送信処理
function handleAuthSubmit(event) {
    event.preventDefault();
    console.log('認証フォーム送信');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('メールアドレスとパスワードを入力してください', 'error');
        return;
    }
    
    // 通常ログイン処理を実行
    handleRegularLogin(email, password);
}

// ポップアップブロック時のダイアログ表示
function showPopupBlockedDialog() {
    const dialogHTML = `
        <div class="popup-blocked-dialog" id="popupBlockedDialog">
            <div class="dialog-content">
                <h3>ポップアップがブロックされています</h3>
                <p>Googleログインにはポップアップの許可が必要です。</p>
                <div class="dialog-options">
                    <button onclick="tryGoogleLoginAgain()" class="btn-primary">再試行</button>
                    <button onclick="useRegularLogin()" class="btn-secondary">通常ログインを使用</button>
                    <button onclick="closePopupBlockedDialog()" class="btn-cancel">キャンセル</button>
                </div>
                <div class="popup-instructions">
                    <h4>ポップアップを許可する方法：</h4>
                    <ul>
                        <li>ブラウザのアドレスバー横のアイコンをクリック</li>
                        <li>「ポップアップを許可」を選択</li>
                        <li>ページを再読み込みしてから再試行</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // 既存のダイアログを削除
    const existingDialog = document.getElementById('popupBlockedDialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    // 新しいダイアログを追加
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    // フラグをリセット
    isGoogleLoginInProgress = false;
    window.isGoogleLoginInProgress = false;
}

// ポップアップブロックダイアログを閉じる
function closePopupBlockedDialog() {
    const dialog = document.getElementById('popupBlockedDialog');
    if (dialog) {
        dialog.remove();
    }
}

// Googleログインを再試行
function tryGoogleLoginAgain() {
    closePopupBlockedDialog();
    setTimeout(() => {
        handleGoogleLogin();
    }, 500);
}

// 通常ログインに切り替え
function useRegularLogin() {
    closePopupBlockedDialog();
    showNotification('通常ログインフォームに切り替えました', 'info');
    
    // ログインフォームにフォーカス
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
}

// 既存のポップアップをクリーンアップ
async function cleanupExistingPopups() {
    try {
        // 既存のFirebase認証ポップアップをキャンセル
        const auth = firebase.auth();
        if (auth.currentUser) {
            // 現在のユーザーがいる場合は一旦サインアウト
            await auth.signOut();
        }
        
        // 少し待機してから次の処理へ
        await new Promise(resolve => setTimeout(resolve, 1000));
        
    } catch (error) {
        console.log('ポップアップクリーンアップエラー（無視）:', error);
    }
}

// ポップアップブロックチェック（改善版）
function checkPopupBlocked() {
    return new Promise((resolve) => {
        try {
            const popup = window.open('', '_blank', 'width=1,height=1,scrollbars=no,resizable=no');
            
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                resolve(true); // ポップアップがブロックされている
            } else {
                // ポップアップが開いた場合、少し待ってから閉じる
                setTimeout(() => {
                    try {
                        popup.close();
                    } catch (e) {
                        console.log('ポップアップクローズエラー（無視）:', e);
                    }
                }, 100);
                resolve(false); // ポップアップが許可されている
            }
        } catch (error) {
            console.log('ポップアップチェックエラー:', error);
            resolve(true); // エラーの場合はブロックされているとみなす
        }
    });
}

// ローカルアカウントとのリンク
async function linkWithLocalAccount(googleUser) {
    console.log('ローカルアカウントとのリンク開始:', googleUser.email);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === googleUser.email);
    
    if (existingUser) {
        // 既存のローカルアカウントとリンク
        existingUser.isGoogleLinked = true;
        existingUser.googleUid = googleUser.uid;
        existingUser.displayName = googleUser.displayName || existingUser.displayName;
        
        const updatedUsers = users.map(u => 
            u.email === googleUser.email ? existingUser : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        console.log('既存アカウントとリンク完了');
    } else {
        // 新しいGoogleユーザー用のローカルアカウントを作成
        const newUser = {
            id: googleUser.uid,
            email: googleUser.email,
            displayName: googleUser.displayName || googleUser.email.split('@')[0],
            password: '', // Googleユーザーはパスワード不要
            createdAt: new Date().toISOString(),
            isGoogleLinked: true,
            googleUid: googleUser.uid
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('新規Googleユーザーアカウント作成完了');
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

// ログイン永続化の変更
function handlePersistenceChange(event) {
    const isChecked = event.target.checked;
    localStorage.setItem('rememberMe', isChecked);
    console.log('ログイン永続化設定:', isChecked);
}

// 永続化状態の復元
function restorePersistenceState() {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const checkbox = document.getElementById('rememberMe');
    if (checkbox) {
        checkbox.checked = rememberMe;
    }
}

// 通常ログイン処理（Googleアカウント対応）
async function handleRegularLogin(email, password) {
    console.log('通常ログイン開始:', email);
    
    try {
        // ローカルユーザーをチェック
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            // ユーザーが見つからない場合、新規ユーザーとして作成
            console.log('新規ユーザーとして作成:', email);
            
            const newUser = {
                id: Date.now().toString(),
                email: email,
                displayName: email.split('@')[0], // メールアドレスの@前を表示名として使用
                password: password,
                createdAt: new Date().toISOString(),
                isGoogleLinked: false
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // ユーザー情報を設定
            currentUserInfo = {
                email: newUser.email,
                displayName: newUser.displayName,
                id: newUser.id,
                isGoogleUser: false
            };
            
            // ローカルストレージを使用
            currentStorage = 'local';
            localStorage.setItem('storageType', 'local');
            
            // ログイン状態を保存
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
            
            // メインアプリを表示
            showMainApp();
            
            showNotification('新規ユーザーとして登録されました', 'success');
            return;
        }
        
        // パスワードチェック
        if (user.password !== password) {
            // 管理者アカウントの特別処理
            if (email === 'yasnaries@gmail.com') {
                // 管理者アカウントの場合は、パスワードが空または未設定の場合に自動設定
                if (!user.password || user.password === '') {
                    user.password = password;
                    const updatedUsers = users.map(u => 
                        u.email === email ? user : u
                    );
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    console.log('管理者アカウントのパスワードを設定しました');
                } else {
                    throw new Error('管理者パスワードが正しくありません。正しいパスワードを入力してください。');
                }
            } else {
                throw new Error('パスワードが正しくありません');
            }
        }
        
        // ユーザー情報を設定
        currentUserInfo = {
            email: user.email,
            displayName: user.displayName,
            id: user.id,
            isGoogleUser: user.isGoogleLinked || false
        };
        
        // Googleアカウントとリンクされている場合の処理
        if (user.isGoogleLinked && user.googleUid) {
            try {
                // Firebase認証状態をチェック（Googleログインのみ）
                const firebaseUser = firebase.auth().currentUser;
                if (firebaseUser && firebaseUser.uid === user.googleUid) {
                    // 既にGoogleでログイン済み
                    currentStorage = 'firebase';
                    localStorage.setItem('storageType', 'firebase');
                    console.log('Google認証済み - サーバー同期モード');
                } else {
                    // Google認証が必要だが、通常ログインではFirebase認証を試行しない
                    console.log('Googleアカウントとの再認証が必要です - ローカルモードで続行');
                    currentStorage = 'local';
                    localStorage.setItem('storageType', 'local');
                    showNotification('Googleアカウントとの再認証が必要です。Googleログインを使用するとサーバー同期が可能です。', 'info');
                }
            } catch (firebaseError) {
                console.log('Firebase認証エラー - ローカルモードで続行:', firebaseError);
                currentStorage = 'local';
                localStorage.setItem('storageType', 'local');
            }
        } else {
            // 通常のローカルアカウント
            currentStorage = 'local';
            localStorage.setItem('storageType', 'local');
        }
        
        // ログイン状態を保存
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        
        // メインアプリを表示
        showMainApp();
        
        // 成功通知
        const storageText = currentStorage === 'firebase' ? 'サーバー同期' : 'ローカル保存';
        const userTypeText = email === 'yasnaries@gmail.com' ? '（管理者）' : '';
        showNotification(`ログインに成功しました！${userTypeText}（${storageText}モード）`, 'success');
        
    } catch (error) {
        console.error('通常ログインエラー:', error);
        showNotification('ログインに失敗しました: ' + error.message, 'error');
    }
}

// ログイン状態チェック（Googleアカウント対応）
function checkLoginStatus() {
    console.log('ログイン状態チェック開始');
    
    try {
        // ローカルログイン状態をチェック
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        
        if (isLoggedIn && userInfo) {
            console.log('ローカルログイン状態を検出:', userInfo.email);
            currentUserInfo = userInfo;
            
            // ストレージタイプを取得
            currentStorage = localStorage.getItem('storageType') || 'local';
            
            // Googleアカウントの場合はFirebase認証状態もチェック
            if (userInfo.isGoogleUser) {
                const firebaseUser = firebase.auth().currentUser;
                if (firebaseUser && firebaseUser.uid === userInfo.uid) {
                    console.log('Firebase認証状態も確認済み');
                    currentStorage = 'firebase';
                    localStorage.setItem('storageType', 'firebase');
                } else {
                    console.log('Firebase認証状態が不一致 - ローカルモードで続行');
                    currentStorage = 'local';
                    localStorage.setItem('storageType', 'local');
                }
            }
            
            // メインアプリを表示
            showMainApp();
            return true;
        }
        
        // Firebase認証状態をチェック
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('Firebase認証状態を検出:', user.email);
                
                // ローカルアカウントをチェック
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const localUser = users.find(u => u.email === user.email);
                
                if (localUser) {
                    currentUserInfo = {
                        email: user.email,
                        displayName: user.displayName || localUser.displayName,
                        uid: user.uid,
                        id: localUser.id,
                        isGoogleUser: true
                    };
                    
                    currentStorage = 'firebase';
                    localStorage.setItem('storageType', 'firebase');
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
                    
                    showMainApp();
                    return true;
                }
            }
        });
        
        return false;
        
    } catch (error) {
        console.error('ログイン状態チェックエラー:', error);
        return false;
    }
} 