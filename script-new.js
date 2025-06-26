// 洗練されたログイン画面用のJavaScript

// デバッグ情報
console.log('=== script-new.js 読み込み開始 ===');
console.log('バージョン: 1.0.4');
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
    console.log('ページ読み込み完了');
    
    try {
        // データの初期化
        initializeData();
        
        // イベントリスナーの設定
        setupEventListeners();
        
        // 認証状態の確認
        const isAuthenticated = checkAuthState();
        
        if (!isAuthenticated) {
            console.log('未認証 - 認証画面を表示');
            showAuthScreen();
        } else {
            console.log('認証済み - メインアプリを表示');
            // 認証状態変更ハンドラーで処理される
        }
        
        // Lucideアイコンの初期化
        if (window.lucide) {
            lucide.createIcons();
        }
        
        console.log('初期化完了');
        
    } catch (error) {
        console.error('初期化エラー:', error);
        showNotification('アプリの初期化中にエラーが発生しました', 'error');
    }
});

// データの初期化
function initializeData() {
    console.log('データ初期化開始');
    
    try {
        // ストレージタイプの読み込み
        const storageType = localStorage.getItem('storageType');
        if (storageType) {
            currentStorage = storageType;
            console.log('initializeData - 保存されたストレージタイプを設定:', currentStorage);
        } else {
            console.log('initializeData - 保存されたストレージタイプなし、デフォルト値を使用:', currentStorage);
        }
        
        // Firebaseストレージが選択されている場合は、Firebaseからデータを読み込み
        if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
            console.log('Firebaseストレージが選択されているため、Firebaseからデータを読み込みます');
            loadDataFromFirebase();
        } else {
            // ローカルストレージからデータを読み込み
            loadDataFromLocalStorage();
        }
        
        console.log('データ初期化完了 - routines:', routines.length, '件');
    } catch (error) {
        console.error('データ初期化エラー:', error);
        // エラーが発生した場合はデフォルト値を使用
        routines = [];
        completions = [];
        currentStorage = 'local';
    }
}

// ローカルストレージからデータを読み込み
function loadDataFromLocalStorage() {
    console.log('ローカルストレージからデータ読み込み開始');
    
    // appDataからルーティンデータを読み込み
    const savedAppData = localStorage.getItem('appData');
    if (savedAppData) {
        const appData = JSON.parse(savedAppData);
        routines = appData.routines || [];
        completions = appData.completions || [];
        console.log('appDataからルーティンデータ読み込み完了:', routines.length);
        console.log('appDataから完了データ読み込み完了:', completions.length);
    } else {
        // 旧形式のデータも確認
        const savedRoutines = localStorage.getItem('routines');
        if (savedRoutines) {
            routines = JSON.parse(savedRoutines);
            console.log('旧形式からルーティンデータ読み込み完了:', routines.length);
        }
        
        const savedCompletions = localStorage.getItem('completions');
        if (savedCompletions) {
            completions = JSON.parse(savedCompletions);
            console.log('旧形式から完了データ読み込み完了:', completions.length);
        }
    }
}

// Firebaseからデータを読み込み
async function loadDataFromFirebase() {
    console.log('Firebaseからデータ読み込み開始');
    
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.error('Firebaseが利用できません');
        loadDataFromLocalStorage();
        return;
    }
    
    if (!currentUserInfo || !currentUserInfo.id) {
        console.error('ユーザー情報が不足しています');
        loadDataFromLocalStorage();
        return;
    }
    
    try {
        const db = firebase.firestore();
        const userId = currentUserInfo.id;
        
        console.log('Firebaseからデータ読み込み - ユーザーID:', userId);
        console.log('Firebaseからデータ読み込み - 現在のローカルデータ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        const docRef = db.collection('users').doc(userId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const firebaseData = doc.data();
            console.log('Firebaseから読み込み:', firebaseData);
            
            if (firebaseData.data) {
                const firebaseRoutines = firebaseData.data.routines || [];
                const firebaseCompletions = firebaseData.data.completions || [];
                
                console.log('Firebaseデータ詳細:', {
                    routinesCount: firebaseRoutines.length,
                    completionsCount: firebaseCompletions.length,
                    lastUpdated: firebaseData.data.lastUpdated
                });
                
                // ローカルデータと比較
                const localLastUpdated = localStorage.getItem('lastUpdated');
                if (localLastUpdated && firebaseData.data.lastUpdated) {
                    const firebaseLastUpdated = new Date(firebaseData.data.lastUpdated);
                    const localLastUpdatedDate = new Date(localLastUpdated);
                    
                    console.log('データ比較:', {
                        firebase: firebaseLastUpdated.toISOString(),
                        local: localLastUpdatedDate.toISOString(),
                        firebaseIsNewer: firebaseLastUpdated > localLastUpdatedDate
                    });
                    
                    if (firebaseLastUpdated > localLastUpdatedDate) {
                        console.log('Firebaseのデータが新しいため、ローカルデータを更新');
                        routines = firebaseRoutines;
                        completions = firebaseCompletions;
                    } else {
                        console.log('ローカルデータが新しいか同じため、Firebaseデータを使用しない');
                        // ローカルデータを維持
                    }
                } else {
                    console.log('日付情報がないため、Firebaseデータを使用');
                    routines = firebaseRoutines;
                    completions = firebaseCompletions;
                }
                
                // ローカルストレージにも保存（バックアップ）
                localStorage.setItem('appData', JSON.stringify({
                    routines: routines,
                    completions: completions,
                    lastUpdated: firebaseData.data.lastUpdated
                }));
                localStorage.setItem('lastUpdated', firebaseData.data.lastUpdated);
                
                console.log('Firebaseからルーティンデータ読み込み完了:', routines.length);
                console.log('Firebaseから完了データ読み込み完了:', completions.length);
                
                // UIを更新
                displayTodayRoutines();
                displayAllRoutines();
                
                showNotification('Firebaseからデータを読み込みました', 'success');
            } else {
                console.log('Firebaseにデータがありません');
                loadDataFromLocalStorage();
            }
        } else {
            console.log('Firebaseにドキュメントが存在しません');
            loadDataFromLocalStorage();
        }
    } catch (error) {
        console.error('Firebaseからデータ読み込みエラー:', error);
        showNotification('Firebaseからデータ読み込みに失敗しました。ローカルデータを使用します。', 'warning');
        loadDataFromLocalStorage();
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
    
    // 頻度ボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('frequency-btn')) {
            handleFrequencyButtonClick(event);
        }
    });
    
    // タブボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('tab-button')) {
            handleTabButtonClick(event);
        }
    });
    
    // ルーティン完了ボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.completion-btn')) {
            const routineId = event.target.closest('.routine-item').dataset.routineId;
            toggleRoutineCompletion(routineId);
        }
    });
    
    // ルーティン編集ボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.edit-btn')) {
            const routineId = event.target.closest('.routine-item').dataset.routineId;
            editRoutine(routineId);
        }
    });
    
    // ルーティン削除ボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.delete-btn')) {
            const routineId = event.target.closest('.routine-item').dataset.routineId;
            deleteRoutine(routineId);
        }
    });
    
    // 同期ボタン
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.addEventListener('click', manualSync);
    }
    
    // 通知ボタン
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', requestNotificationPermission);
    }
    
    // 設定ボタン
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showStorageModal);
    }
    
    // 管理者ボタン
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', showAdminDashboard);
    }
    
    // ログアウトボタン
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // ルーティン追加ボタン
    const addRoutineBtn = document.getElementById('addRoutineBtn');
    if (addRoutineBtn) {
        addRoutineBtn.addEventListener('click', showAddRoutineScreen);
    }
    
    // 戻るボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.back-btn')) {
            showMainScreen();
        }
    });
    
    // キャンセルボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.cancel-button')) {
            showMainScreen();
        }
    });
    
    // ストレージ選択（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.storage-option')) {
            const storageType = event.target.closest('.storage-option').dataset.storageType;
            if (storageType) {
                selectStorage(storageType);
            }
        }
    });
    
    // ストレージ確認ボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.modal-btn.primary')) {
            confirmStorageSelection();
        }
    });
    
    // モーダル閉じるボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.modal-close') || event.target.closest('.close')) {
            hideStorageModal();
        }
    });
    
    // ヘルプボタン
    const firebaseDebugBtn = document.getElementById('firebaseDebugBtn');
    if (firebaseDebugBtn) {
        firebaseDebugBtn.addEventListener('click', checkFirebaseStatus);
    }
    
    const fixFirebaseConfigBtn = document.getElementById('fixFirebaseConfigBtn');
    if (fixFirebaseConfigBtn) {
        fixFirebaseConfigBtn.addEventListener('click', function(event) {
            event.preventDefault();
            fixFirebaseConfig();
        });
    }
    
    // 管理者ダッシュボード関連
    const adminBackBtn = document.getElementById('adminBackBtn');
    if (adminBackBtn) {
        adminBackBtn.addEventListener('click', hideAdminDashboard);
    }
    
    // 管理者タブボタン（イベント委譲）
    document.addEventListener('click', function(event) {
        if (event.target.closest('.admin-tab-btn')) {
            const tabName = event.target.closest('.admin-tab-btn').dataset.tab;
            if (tabName) {
                showAdminTab(tabName);
            }
        }
    });
    
    // 友達追加ボタン
    const addFriendBtn = document.getElementById('addFriendBtn');
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', showAddFriendModal);
    }
    
    // 友達追加モーダル関連
    const closeAddFriendModal = document.getElementById('closeAddFriendModal');
    if (closeAddFriendModal) {
        closeAddFriendModal.addEventListener('click', hideAddFriendModal);
    }
    
    const cancelAddFriend = document.getElementById('cancelAddFriend');
    if (cancelAddFriend) {
        cancelAddFriend.addEventListener('click', hideAddFriendModal);
    }
    
    const confirmAddFriend = document.getElementById('confirmAddFriend');
    if (confirmAddFriend) {
        confirmAddFriend.addEventListener('click', addFriend);
    }
    
    // ユーザー検索
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            filterUsers(searchTerm);
        });
    }
    
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
        
        // Googleユーザーの場合はFirebaseストレージを強制設定
        if (userInfo.isGoogleUser || userInfo.uid) {
            console.log('checkLocalAuth - Googleユーザー検出、Firebaseストレージを設定');
            currentStorage = 'firebase';
            localStorage.setItem('storageType', 'firebase');
        } else {
            console.log('checkLocalAuth - 通常ユーザー、保存されたストレージタイプを使用');
            currentStorage = localStorage.getItem('storageType') || 'local';
        }
        
        console.log('checkLocalAuth - 最終的なcurrentStorage:', currentStorage);
        
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
    console.log('handleAuthStateChange - user object:', user);
    
    if (user) {
        // Googleユーザーの場合はFirebaseストレージを強制設定
        const isGoogleUser = user.isGoogleUser || user.uid || (user.providerData && user.providerData.length > 0 && user.providerData[0].providerId === 'google.com');
        console.log('handleAuthStateChange - isGoogleUser check:', {
            userIsGoogleUser: user.isGoogleUser,
            userUid: user.uid,
            providerData: user.providerData,
            isGoogleUser: isGoogleUser
        });
        
        if (isGoogleUser) {
            console.log('Googleユーザー検出、Firebaseストレージを設定');
            currentStorage = 'firebase';
            localStorage.setItem('storageType', 'firebase');
        } else {
            console.log('通常ユーザー、現在のストレージタイプを維持:', currentStorage);
        }
        
        // ユーザー情報の設定
        setUserInfo(user);
        
        // メインアプリの表示
        showMainApp();
        
        // アプリの初期化
        initializeApp();
        
        // サーバー接続時にオンライン同期を実行
        if (currentStorage === 'firebase') {
            console.log('Firebase同期を開始');
            setTimeout(() => {
                performActualSync();
            }, 1000);
        }
        
        // ログイン成功通知
        showNotification('ログインに成功しました', 'success');
    } else {
        // ログアウト状態
        clearUserInfo();
        showAuthScreen();
    }
}

// ユーザー情報を設定
function setUserInfo(user) {
    console.log('ユーザー情報設定:', user.email);
    console.log('setUserInfo - user object:', user);
    
    // Googleユーザーの場合はuidを使用、そうでなければidまたはuidを使用
    const isGoogleUser = user.isGoogleUser || user.uid || (user.providerData && user.providerData.length > 0 && user.providerData[0].providerId === 'google.com');
    const userId = isGoogleUser ? user.uid : (user.id || user.uid || Date.now().toString());
    
    currentUserInfo = {
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        id: userId,
        uid: user.uid,
        isGoogleUser: isGoogleUser
    };
    
    console.log('setUserInfo - 設定されたユーザー情報:', currentUserInfo);
    
    // ユーザータイプを設定
    setUserType(user);
    
    // ログイン状態を保存
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
    
    console.log('ユーザー情報設定完了');
}

// ユーザー情報をクリア
function clearUserInfo() {
    currentUserInfo = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    console.log('ユーザー情報クリア完了');
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
    console.log('showMainApp - updateSyncStatus前のcurrentStorage:', currentStorage);
    updateSyncStatus();
    
    // 広告を表示（一般ユーザーのみ）
    showAdsIfNeeded();
    
    // 成功通知を表示
    if (currentUserInfo) {
        const userTypeText = currentUserInfo.email === 'yasnaries@gmail.com' ? '（管理者）' : '';
        const storageText = currentStorage === 'firebase' ? 'サーバー同期' : 'ローカル保存';
        console.log('showMainApp - 通知用storageText:', storageText, 'currentStorage:', currentStorage);
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
    console.log('loadRoutines called');
    console.log('loadRoutines - 現在のroutines配列:', routines);
    console.log('loadRoutines - routines配列の長さ:', routines.length);
    console.log('loadRoutines - currentStorage:', currentStorage);
    
    // Firebaseストレージが選択されている場合は、Firebaseからデータを読み込み
    if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
        console.log('Firebaseストレージが選択されているため、Firebaseからデータを読み込みます');
        loadDataFromFirebase().then(() => {
            // データ読み込み後にUIを更新
            displayTodayRoutines();
            displayAllRoutines();
        }).catch(error => {
            console.error('Firebaseからデータ読み込みエラー:', error);
            // エラーの場合はローカルデータを使用
            displayTodayRoutines();
            displayAllRoutines();
        });
    } else {
        // ローカルストレージのデータを使用
        console.log('ローカルストレージのデータを使用');
        displayTodayRoutines();
        displayAllRoutines();
    }
    
    console.log('loadRoutines completed');
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
    console.log('displayAllRoutines called');
    console.log('現在のroutines配列:', routines);
    console.log('routines配列の長さ:', routines.length);
    
    const allRoutinesList = document.getElementById('allRoutinesList');
    if (!allRoutinesList) {
        console.error('All routines list element not found');
        return;
    }
    
    if (routines.length === 0) {
        console.log('ルーティンが0件のため、空の状態を表示');
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
        console.log('ルーティンを表示:', routines.length, '件');
        allRoutinesList.innerHTML = routines.map(routine => createRoutineHTML(routine)).join('');
    }
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
    
    console.log('displayAllRoutines completed');
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
    const today = new Date().toISOString().split('T')[0];
    
    // completions配列から完了データを検索
    const completion = completions.find(c => 
        c.routineId === routineId && c.date === today
    );
    
    return completion !== undefined;
}

// ルーティン完了を切り替え
async function toggleRoutineCompletion(routineId) {
    console.log('ルーティン完了切り替え:', routineId);
    
    const today = new Date().toISOString().split('T')[0];
    
    // completions配列から完了データを検索
    const completionIndex = completions.findIndex(c => 
        c.routineId === routineId && c.date === today
    );
    
    if (completionIndex !== -1) {
        // 完了データを削除
        completions.splice(completionIndex, 1);
        console.log('ルーティン完了を解除:', routineId);
    } else {
        // 完了データを追加
        completions.push({
            routineId: routineId,
            date: today,
            completedAt: new Date().toISOString()
        });
        console.log('ルーティン完了を設定:', routineId);
    }
    
    // 表示を更新
    displayTodayRoutines();
    displayAllRoutines();
    
    // データを保存（完了を待つ）
    await saveData();
    
    // Firebaseストレージが選択されている場合は、Firebaseに同期
    if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
        console.log('Firebaseストレージが選択されているため、Firebaseに同期します');
        try {
            await performActualSync();
            console.log('Firebase同期完了');
        } catch (error) {
            console.error('Firebase同期エラー:', error);
            showNotification('Firebase同期に失敗しました', 'error');
        }
    }
}

// ルーティン追加画面を表示
function showAddRoutineScreen() {
    console.log('ルーティン追加画面表示');
    
    const mainScreen = document.getElementById('mainScreen');
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    
    if (mainScreen) mainScreen.style.display = 'none';
    if (addRoutineScreen) addRoutineScreen.style.display = 'block';
}

// メイン画面に戻る
function showMainScreen() {
    console.log('メイン画面表示');
    
    const mainScreen = document.getElementById('mainScreen');
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    
    if (mainScreen) mainScreen.style.display = 'block';
    if (addRoutineScreen) addRoutineScreen.style.display = 'none';
    
    // ルーティンの表示を更新（データ再読み込みなし）
    console.log('showMainScreen - 表示更新前のroutines配列:', routines);
    displayTodayRoutines();
    displayAllRoutines();
    console.log('showMainScreen - 表示更新後のroutines配列:', routines);
}

// 同期状態を更新
function updateSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    if (!syncStatus) {
        console.error('syncStatus要素が見つかりません');
        return;
    }
    
    console.log('updateSyncStatus called - currentStorage:', currentStorage);
    
    switch (currentStorage) {
        case 'firebase':
            console.log('Firebase同期状態に設定');
            syncStatus.textContent = '🟢 オンライン同期';
            syncStatus.className = 'sync-status synced';
            syncStatus.title = 'Firebaseサーバーと同期中';
            break;
        case 'google-drive':
            console.log('Google Drive同期状態に設定');
            syncStatus.textContent = '🟢 Google Drive同期';
            syncStatus.className = 'sync-status synced';
            syncStatus.title = 'Google Driveと同期中';
            break;
        default:
            console.log('ローカル保存状態に設定 (currentStorage:', currentStorage, ')');
            syncStatus.textContent = '🟡 ローカル保存';
            syncStatus.className = 'sync-status local';
            syncStatus.title = 'ローカルストレージに保存中';
            break;
    }
}

// 広告を表示（一般ユーザーのみ）
function showAdsIfNeeded() {
    const userType = getUserType();
    const adContainer = document.getElementById('adContainer');
    
    if (adContainer) {
        if (userType === 'general') {
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
        
        // 認証状態変更ハンドラーを呼び出してユーザー情報を設定
        console.log('handleGoogleLogin - handleAuthStateChangeを呼び出し');
        handleAuthStateChange(result.user);
        
        console.log('Googleログイン完了:', {
            email: result.user.email,
            displayName: result.user.displayName,
            userType: result.user.email === 'yasnaries@gmail.com' ? 'admin' : 'user',
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

// 手動同期機能
function manualSync() {
    console.log('手動同期開始');
    console.log('手動同期 - 現在のストレージタイプ:', currentStorage);
    console.log('手動同期 - 現在のユーザー情報:', currentUserInfo);
    console.log('手動同期 - ユーザーID詳細:', {
        email: currentUserInfo?.email,
        displayName: currentUserInfo?.displayName,
        id: currentUserInfo?.id,
        uid: currentUserInfo?.uid,
        isGoogleUser: currentUserInfo?.isGoogleUser
    });
    console.log('手動同期 - 現在のローカルデータ:', {
        routinesCount: routines.length,
        completionsCount: completions.length,
        lastUpdated: localStorage.getItem('lastUpdated')
    });
    
    // 同期前の状態チェック
    if (!currentUserInfo) {
        console.error('手動同期エラー: ユーザー情報がありません');
        showNotification('ログインが必要です', 'error');
        return;
    }
    
    if (!currentStorage) {
        console.error('手動同期エラー: ストレージタイプが設定されていません');
        showNotification('ストレージ設定が必要です', 'error');
        return;
    }
    
    // Firebaseストレージの場合、初期化状態をチェック
    if (currentStorage === 'firebase') {
        const firebaseStatus = checkFirebaseInitialization();
        if (!firebaseStatus.initialized) {
            console.error('手動同期エラー: Firebase初期化エラー:', firebaseStatus.error);
            showNotification(`Firebase初期化エラー: ${firebaseStatus.error}`, 'error');
            return;
        }
    }
    
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.classList.add('syncing');
        syncBtn.disabled = true; // ボタンを無効化
        console.log('同期ボタンを無効化');
    }
    
    // 実際の同期処理
    const syncPromise = performActualSync();
    
    syncPromise.then(() => {
        console.log('手動同期完了');
        console.log('手動同期完了後のローカルデータ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        if (syncBtn) {
            syncBtn.classList.remove('syncing');
            syncBtn.disabled = false; // ボタンを再有効化
            console.log('同期ボタンを再有効化');
        }
        
        showNotification('同期が完了しました', 'success');
        updateSyncStatus();
    }).catch((error) => {
        console.error('同期エラー詳細:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            currentStorage: currentStorage,
            userInfo: currentUserInfo
        });
        
        if (syncBtn) {
            syncBtn.classList.remove('syncing');
            syncBtn.disabled = false; // ボタンを再有効化
            console.log('同期ボタンを再有効化（エラー時）');
        }
        
        // エラーメッセージを詳細化
        let errorMessage = '同期エラーが発生しました';
        if (error.message.includes('Firebaseが利用できません')) {
            errorMessage = 'Firebaseが利用できません。設定を確認してください。';
        } else if (error.message.includes('ユーザー情報が不足')) {
            errorMessage = 'ユーザー情報が不足しています。再ログインしてください。';
        } else if (error.message.includes('permission-denied')) {
            errorMessage = 'Firebaseの権限が不足しています。';
        } else if (error.message.includes('unavailable')) {
            errorMessage = 'Firebaseサーバーに接続できません。';
        } else if (error.message.includes('network')) {
            errorMessage = 'ネットワークエラーが発生しました。';
        }
        
        showNotification(errorMessage, 'error');
        updateSyncStatus();
    });
}

// 実際の同期処理
async function performActualSync() {
    console.log('実際の同期処理開始');
    console.log('performActualSync - 現在のストレージタイプ:', currentStorage);
    console.log('performActualSync - 現在のユーザー情報:', currentUserInfo);
    
    try {
        switch (currentStorage) {
            case 'firebase':
                console.log('Firebase同期を実行');
                await syncWithFirebase();
                break;
            case 'google-drive':
                console.log('Google Drive同期を実行');
                await syncWithGoogleDrive();
                break;
            default:
                console.log('ローカルストレージ同期を実行');
                await syncWithLocalStorage();
                break;
        }
        
        console.log('同期処理完了');
        return Promise.resolve();
    } catch (error) {
        console.error('同期処理エラー詳細:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            currentStorage: currentStorage
        });
        return Promise.reject(error);
    }
}

// Firebaseとの同期
async function syncWithFirebase() {
    console.log('Firebase同期開始');
    
    // Firebaseの利用可能性チェック
    if (typeof firebase === 'undefined') {
        throw new Error('Firebaseが利用できません（firebase未定義）');
    }
    
    if (!firebase.firestore) {
        throw new Error('Firebaseが利用できません（firestore未定義）');
    }
    
    if (!currentUserInfo) {
        throw new Error('ユーザー情報が不足しています（currentUserInfo未定義）');
    }
    
    if (!currentUserInfo.id) {
        throw new Error('ユーザー情報が不足しています（ユーザーID未定義）');
    }
    
    const db = firebase.firestore();
    const userId = currentUserInfo.id;
    
    console.log('Firebase同期 - ユーザー情報詳細:', {
        email: currentUserInfo.email,
        displayName: currentUserInfo.displayName,
        id: currentUserInfo.id,
        uid: currentUserInfo.uid,
        isGoogleUser: currentUserInfo.isGoogleUser
    });
    console.log('Firebase同期 - ユーザーID:', userId);
    console.log('Firebase同期 - 現在のローカルデータ:', {
        routinesCount: routines.length,
        completionsCount: completions.length,
        lastUpdated: localStorage.getItem('lastUpdated')
    });
    
    try {
        // 同期状態を「同期中」に更新
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            syncStatus.textContent = '🔄 同期中...';
            syncStatus.className = 'sync-status syncing';
            syncStatus.title = 'Firebaseサーバーと同期中...';
        }
        
        // Firebaseからデータを読み込み
        const docRef = db.collection('users').doc(userId);
        console.log('Firebase同期 - ドキュメント参照:', docRef.path);
        
        const doc = await docRef.get();
        
        let firebaseData = null;
        let shouldUpdateLocal = false;
        let shouldUpdateFirebase = true;
        
        if (doc.exists) {
            firebaseData = doc.data();
            console.log('Firebaseから読み込み:', firebaseData);
            
            if (firebaseData.data && firebaseData.data.lastUpdated) {
                const firebaseLastUpdated = new Date(firebaseData.data.lastUpdated);
                const localLastUpdated = localStorage.getItem('lastUpdated') ? 
                    new Date(localStorage.getItem('lastUpdated')) : new Date(0);
                
                console.log('日付比較:', {
                    firebase: firebaseLastUpdated.toISOString(),
                    local: localLastUpdated.toISOString(),
                    firebaseIsNewer: firebaseLastUpdated > localLastUpdated
                });
                
                if (firebaseLastUpdated > localLastUpdated) {
                    console.log('Firebaseのデータが新しいため、ローカルデータを更新');
                    shouldUpdateLocal = true;
                    shouldUpdateFirebase = false; // 既に最新なので更新不要
                } else if (firebaseLastUpdated.getTime() === localLastUpdated.getTime()) {
                    console.log('データが同じ日時なので、Firebase更新をスキップ');
                    shouldUpdateFirebase = false;
                }
            }
        } else {
            console.log('Firebaseにドキュメントが存在しないため、新規作成');
        }
        
        // ローカルデータを更新（必要な場合）
        if (shouldUpdateLocal && firebaseData && firebaseData.data) {
            routines = firebaseData.data.routines || [];
            completions = firebaseData.data.completions || [];
            localStorage.setItem('appData', JSON.stringify({
                routines: routines,
                completions: completions,
                lastUpdated: firebaseData.data.lastUpdated
            }));
            localStorage.setItem('lastUpdated', firebaseData.data.lastUpdated);
            
            console.log('ローカルデータ更新完了:', {
                routinesCount: routines.length,
                completionsCount: completions.length
            });
            
            // UIを更新
            displayTodayRoutines();
            displayAllRoutines();
            showNotification('Firebaseから最新データを取得しました', 'success');
        }
        
        // Firebaseにデータを保存（必要な場合）
        if (shouldUpdateFirebase) {
            const data = {
                routines: routines || [],
                completions: completions || [],
                lastUpdated: new Date().toISOString(),
                userInfo: {
                    email: currentUserInfo.email,
                    displayName: currentUserInfo.displayName,
                    isGoogleUser: currentUserInfo.isGoogleUser || false
                }
            };
            
            console.log('Firebase同期 - 保存データ:', data);
            
            await docRef.set({
                data: data,
                updatedAt: new Date(),
                userEmail: currentUserInfo.email
            });
            
            // ローカルストレージのlastUpdatedも更新
            localStorage.setItem('lastUpdated', data.lastUpdated);
            
            console.log('Firebase保存完了');
            showNotification('Firebase同期が完了しました', 'success');
        } else {
            console.log('Firebase更新をスキップ');
        }
        
        // 同期状態を「オンライン同期」に更新
        updateSyncStatus();
        
    } catch (error) {
        console.error('Firebase同期エラー詳細:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            name: error.name
        });
        
        // 同期状態を「ローカル保存」に戻す
        currentStorage = 'local';
        localStorage.setItem('storageType', 'local');
        updateSyncStatus();
        
        // エラー通知
        showNotification(`Firebase同期エラー: ${error.message}`, 'error');
        
        throw error;
    }
}

// Google Driveとの同期
async function syncWithGoogleDrive() {
    console.log('Google Drive同期開始');
    
    // Google Drive同期は未実装のため、ローカルストレージにフォールバック
    await syncWithLocalStorage();
    console.log('Google Drive同期完了（ローカルフォールバック）');
}

// ローカルストレージとの同期
async function syncWithLocalStorage() {
    console.log('ローカルストレージ同期開始');
    
    // 現在のデータをローカルストレージに保存
    const data = {
        routines: routines,
        completions: completions,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('appData', JSON.stringify(data));
    
    // 少し待機して同期感を演出
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('ローカルストレージ同期完了');
}

// 通知表示機能
function showNotification(message, type = 'info') {
    console.log('通知表示:', message, type);
    
    // 既存の通知を削除
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // 通知要素を作成
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // アイコンを設定
    let icon = 'info';
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'alert-circle';
            break;
        case 'warning':
            icon = 'alert-triangle';
            break;
        default:
            icon = 'info';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${icon}" class="notification-icon"></i>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i data-lucide="x"></i>
        </button>
    `;
    
    // 通知を表示
    document.body.appendChild(notification);
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // アニメーション効果
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 自動で非表示（成功とエラーは5秒、その他は3秒）
    const autoHideTime = (type === 'success' || type === 'error') ? 5000 : 3000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, autoHideTime);
}

// ストレージモーダル関連
function showStorageModal() {
    const storageModal = document.getElementById('storageModal');
    if (storageModal) {
        storageModal.style.display = 'block';
    }
}

function hideStorageModal() {
    const storageModal = document.getElementById('storageModal');
    if (storageModal) {
        storageModal.style.display = 'none';
    }
}

function selectStorage(storageType) {
    console.log('ストレージ選択:', storageType);
    
    // 選択状態を更新
    const storageOptions = document.querySelectorAll('.storage-option');
    storageOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[onclick="selectStorage('${storageType}')"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // 選択されたストレージタイプを保存
    localStorage.setItem('selectedStorage', storageType);
}

function confirmStorageSelection() {
    const selectedStorage = localStorage.getItem('selectedStorage') || 'local';
    console.log('ストレージ選択確認:', selectedStorage);
    
    currentStorage = selectedStorage;
    localStorage.setItem('storageType', selectedStorage);
    
    hideStorageModal();
    updateSyncStatus();
    
    showNotification(`${getStorageDisplayName(selectedStorage)}が選択されました`, 'success');
}

function getStorageDisplayName(storageType) {
    switch (storageType) {
        case 'local': return 'ローカルストレージ';
        case 'firebase': return 'Firebase';
        case 'google-drive': return 'Google Drive';
        default: return 'ローカルストレージ';
    }
}

// 管理者ダッシュボード表示
function showAdminDashboard() {
    console.log('管理者ダッシュボード表示');
    
    // メインアプリを非表示
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'none';
    }
    
    // 管理者ダッシュボードを表示
    const adminDashboard = document.getElementById('adminDashboardScreen');
    if (adminDashboard) {
        adminDashboard.style.display = 'block';
        
        // 最初のタブを表示
        showAdminTab('users');
        
        // データを読み込み
        loadAdminData();
        
        // Lucideアイコンを初期化
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// 管理者ダッシュボード非表示
function hideAdminDashboard() {
    console.log('管理者ダッシュボード非表示');
    
    const adminDashboard = document.getElementById('adminDashboardScreen');
    if (adminDashboard) {
        adminDashboard.style.display = 'none';
    }
    
    // メインアプリを表示
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'block';
    }
}

// 管理者タブ表示
function showAdminTab(tabName) {
    console.log('管理者タブ表示:', tabName);
    
    // タブボタンのアクティブ状態を更新
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTabBtn) {
        activeTabBtn.classList.add('active');
    }
    
    // タブパネルの表示を更新
    const tabPanels = document.querySelectorAll('.admin-tab-panel');
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
    const activePanel = document.getElementById(`${tabName}Tab`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    
    // タブに応じたデータを読み込み
    switch (tabName) {
        case 'users':
            loadUsersList();
            break;
        case 'friends':
            loadFriendsList();
            break;
        case 'stats':
            loadAdminStats();
            break;
    }
}

// 管理者データの読み込み
function loadAdminData() {
    console.log('管理者データ読み込み開始');
    
    // ユーザーリストを読み込み
    loadUsersList();
    
    // 友達リストを読み込み
    loadFriendsList();
    
    // 統計を読み込み
    loadAdminStats();
}

// ユーザーリストの読み込み
function loadUsersList() {
    console.log('ユーザーリスト読み込み');
    
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    // ローカルストレージからユーザーデータを取得
    const users = getAllUsers();
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="users" class="empty-icon"></i>
                <h3>ユーザーが見つかりません</h3>
                <p>まだユーザーが登録されていません</p>
            </div>
        `;
    } else {
        usersList.innerHTML = users.map(user => createUserItemHTML(user)).join('');
    }
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// すべてのユーザーを取得
function getAllUsers() {
    console.log('getAllUsers開始');
    
    const users = [];
    
    // ローカルストレージから登録済みユーザーを取得
    const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('登録済みユーザー:', registeredUsers.length, '人');
    
    // 登録済みユーザーを追加
    registeredUsers.forEach(user => {
        users.push({
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            userType: user.email === 'yasnaries@gmail.com' ? 'admin' : 'general',
            isCurrentUser: currentUserInfo && currentUserInfo.email === user.email,
            createdAt: user.createdAt,
            isGoogleLinked: user.isGoogleLinked || false
        });
    });
    
    // 友達リストを取得（重複を避けて追加）
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    console.log('友達リスト:', friendsList.length, '人');
    
    friendsList.forEach(email => {
        if (!users.find(u => u.email === email)) {
            users.push({
                email: email,
                displayName: email.split('@')[0],
                userType: 'friend',
                isCurrentUser: currentUserInfo && currentUserInfo.email === email,
                createdAt: null,
                isGoogleLinked: false
            });
        }
    });
    
    // 現在のユーザーが登録済みユーザーに含まれていない場合は追加
    if (currentUserInfo && !users.find(u => u.email === currentUserInfo.email)) {
        users.push({
            email: currentUserInfo.email,
            displayName: currentUserInfo.displayName || currentUserInfo.email.split('@')[0],
            userType: currentUserInfo.email === 'yasnaries@gmail.com' ? 'admin' : 'general',
            isCurrentUser: true,
            createdAt: new Date().toISOString(),
            isGoogleLinked: currentUserInfo.isGoogleUser || false
        });
    }
    
    console.log('総ユーザー数:', users.length, '人');
    console.log('ユーザー詳細:', users.map(u => ({
        email: u.email,
        userType: u.userType,
        isCurrentUser: u.isCurrentUser
    })));
    
    return users;
}

// ユーザーアイテムのHTML生成
function createUserItemHTML(user) {
    const userTypeText = getUserTypeText(user.userType);
    const userTypeClass = user.userType;
    const isFriend = user.userType === 'friend';
    
    return `
        <div class="user-item" data-email="${user.email}">
            <div class="user-info">
                <div class="user-avatar">
                    ${user.displayName.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                    <div class="user-name">${user.displayName}</div>
                    <div class="user-email">${user.email}</div>
                    <span class="user-type ${userTypeClass}">
                        <i data-lucide="${getUserTypeIcon(user.userType)}"></i>
                        ${userTypeText}
                    </span>
                </div>
            </div>
            <div class="user-actions">
                ${!isFriend ? `
                    <button class="action-btn primary" onclick="markAsFriend('${user.email}')">
                        <i data-lucide="heart"></i>
                        友達にする
                    </button>
                ` : `
                    <button class="action-btn secondary" onclick="removeFriend('${user.email}')">
                        <i data-lucide="user-minus"></i>
                        友達解除
                    </button>
                `}
                ${user.isCurrentUser ? `
                    <span class="action-btn secondary">現在のユーザー</span>
                ` : `
                    <button class="action-btn danger" onclick="removeUser('${user.email}')">
                        <i data-lucide="trash"></i>
                        削除
                    </button>
                `}
            </div>
        </div>
    `;
}

// ユーザータイプのテキスト取得
function getUserTypeText(userType) {
    switch (userType) {
        case 'admin': return '管理者';
        case 'friend': return '友達';
        case 'general': return '一般ユーザー';
        default: return '一般ユーザー';
    }
}

// ユーザータイプのアイコン取得
function getUserTypeIcon(userType) {
    switch (userType) {
        case 'admin': return 'shield';
        case 'friend': return 'heart';
        case 'general': return 'user';
        default: return 'user';
    }
}

// 友達としてマーク
function markAsFriend(email) {
    console.log('友達としてマーク:', email);
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    if (!friendsList.includes(email)) {
        friendsList.push(email);
        localStorage.setItem('friendsList', JSON.stringify(friendsList));
        
        showNotification(`${email}を友達に追加しました`, 'success');
        loadUsersList(); // リストを更新
    }
}

// 友達解除
function removeFriend(email) {
    console.log('友達解除:', email);
    
    if (confirm(`${email}を友達リストから削除しますか？`)) {
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        const updatedList = friendsList.filter(friend => friend !== email);
        localStorage.setItem('friendsList', JSON.stringify(updatedList));
        
        showNotification(`${email}を友達リストから削除しました`, 'info');
        loadUsersList(); // リストを更新
        loadFriendsList(); // 友達リストも更新
    }
}

// ユーザー削除
function removeUser(email) {
    console.log('ユーザー削除:', email);
    
    if (confirm(`${email}を削除しますか？この操作は取り消せません。`)) {
        // 友達リストからも削除
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        const updatedList = friendsList.filter(friend => friend !== email);
        localStorage.setItem('friendsList', JSON.stringify(updatedList));
        
        showNotification(`${email}を削除しました`, 'success');
        loadUsersList(); // リストを更新
    }
}

// 友達リストの読み込み
function loadFriendsList() {
    console.log('友達リスト読み込み');
    
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) return;
    
    const friends = JSON.parse(localStorage.getItem('friendsList') || '[]');
    
    if (friends.length === 0) {
        friendsList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="heart" class="empty-icon"></i>
                <h3>友達がいません</h3>
                <p>友達を追加して、一緒にルーティンを管理しましょう！</p>
            </div>
        `;
    } else {
        friendsList.innerHTML = friends.map(email => createFriendItemHTML(email)).join('');
    }
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 友達アイテムのHTML生成
function createFriendItemHTML(email) {
    const displayName = email.split('@')[0];
    
    return `
        <div class="friend-item" data-email="${email}">
            <div class="user-info">
                <div class="user-avatar">
                    ${displayName.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                    <div class="user-name">${displayName}</div>
                    <div class="user-email">${email}</div>
                    <span class="user-type friend">
                        <i data-lucide="heart"></i>
                        友達
                    </span>
                </div>
            </div>
            <div class="user-actions">
                <button class="action-btn secondary" onclick="removeFriend('${email}')">
                    <i data-lucide="user-minus"></i>
                    友達解除
                </button>
            </div>
        </div>
    `;
}

// 管理者統計の読み込み
function loadAdminStats() {
    console.log('管理者統計読み込み開始');
    
    // ユーザー数
    const users = getAllUsers();
    const totalUsersCount = document.getElementById('totalUsersCount');
    if (totalUsersCount) {
        totalUsersCount.textContent = users.length;
        console.log('総ユーザー数表示:', users.length);
    }
    
    // ユーザータイプ別の統計
    const adminUsers = users.filter(u => u.userType === 'admin').length;
    const friendUsers = users.filter(u => u.userType === 'friend').length;
    const generalUsers = users.filter(u => u.userType === 'general').length;
    
    console.log('ユーザータイプ別統計:', {
        admin: adminUsers,
        friend: friendUsers,
        general: generalUsers,
        total: users.length
    });
    
    // 友達数
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    const friendsCount = document.getElementById('friendsCount');
    if (friendsCount) {
        friendsCount.textContent = friendsList.length;
        console.log('友達数表示:', friendsList.length);
    }
    
    // ルーティン数
    const totalRoutinesCount = document.getElementById('totalRoutinesCount');
    if (totalRoutinesCount) {
        totalRoutinesCount.textContent = routines.length;
        console.log('総ルーティン数表示:', routines.length);
    }
    
    // 完了率
    const completionRate = document.getElementById('completionRate');
    if (completionRate) {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = routines.filter(routine => {
            const completionKey = `completion_${routine.id}_${today}`;
            return localStorage.getItem(completionKey) === 'true';
        }).length;
        
        const rate = routines.length > 0 ? Math.round((completedToday / routines.length) * 100) : 0;
        completionRate.textContent = `${rate}%`;
        console.log('完了率表示:', rate + '%', `(${completedToday}/${routines.length})`);
    }
    
    // 追加の統計情報をコンソールに出力
    console.log('管理者統計詳細:', {
        totalUsers: users.length,
        adminUsers: adminUsers,
        friendUsers: friendUsers,
        generalUsers: generalUsers,
        friendsList: friendsList.length,
        totalRoutines: routines.length,
        currentUser: currentUserInfo?.email,
        storageType: currentStorage
    });
    
    console.log('管理者統計読み込み完了');
}

// 友達追加モーダル表示
function showAddFriendModal() {
    console.log('友達追加モーダル表示');
    
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'block';
        
        // フォームをリセット
        document.getElementById('friendEmail').value = '';
        document.getElementById('friendName').value = '';
    }
}

// 友達追加モーダル非表示
function hideAddFriendModal() {
    console.log('友達追加モーダル非表示');
    
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 友達追加処理
function addFriend() {
    console.log('友達追加処理');
    
    const email = document.getElementById('friendEmail').value.trim();
    const name = document.getElementById('friendName').value.trim();
    
    if (!email) {
        showNotification('メールアドレスを入力してください', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('有効なメールアドレスを入力してください', 'error');
        return;
    }
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    if (friendsList.includes(email)) {
        showNotification('このユーザーは既に友達リストに含まれています', 'warning');
        return;
    }
    
    // 友達リストに追加
    friendsList.push(email);
    localStorage.setItem('friendsList', JSON.stringify(friendsList));
    
    // 表示名も保存（任意）
    if (name) {
        const friendNames = JSON.parse(localStorage.getItem('friendNames') || '{}');
        friendNames[email] = name;
        localStorage.setItem('friendNames', JSON.stringify(friendNames));
    }
    
    hideAddFriendModal();
    showNotification(`${email}を友達に追加しました`, 'success');
    
    // リストを更新
    loadUsersList();
    loadFriendsList();
}

// メールアドレスの妥当性チェック
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ルーティンの編集
function editRoutine(routineId) {
    console.log('ルーティン編集:', routineId);
    
    const routine = routines.find(r => r.id === routineId);
    if (!routine) {
        console.error('ルーティンが見つかりません:', routineId);
        return;
    }
    
    showEditForm(routine);
}

// ルーティンの削除
function deleteRoutine(routineId) {
    console.log('ルーティン削除:', routineId);
    
    if (confirm('このルーティンを削除しますか？')) {
        routines = routines.filter(r => r.id !== routineId);
        saveData();
        
        // 表示を更新
        displayTodayRoutines();
        displayAllRoutines();
        
        showNotification('ルーティンを削除しました', 'success');
    }
}

// 編集フォームの表示
function showEditForm(routine) {
    const editForm = document.getElementById('editRoutineForm');
    if (!editForm) return;
    
    // フォームに値を設定
    document.getElementById('editRoutineId').value = routine.id;
    document.getElementById('editRoutineTitle').value = routine.title;
    document.getElementById('editRoutineDescription').value = routine.description || '';
    document.getElementById('editRoutineTime').value = routine.time || '';
    
    // 頻度を設定
    const frequencySelect = document.getElementById('editRoutineFrequency');
    if (frequencySelect) {
        frequencySelect.value = routine.frequency;
    }
    
    // 編集フォームを表示
    editForm.style.display = 'block';
}

// 編集されたルーティンを保存
async function saveEditedRoutine(routineId) {
    const title = document.getElementById('editRoutineTitle').value.trim();
    const description = document.getElementById('editRoutineDescription').value.trim();
    const time = document.getElementById('editRoutineTime').value;
    const frequency = document.getElementById('editRoutineFrequency').value;
    
    if (!title) {
        showNotification('タイトルを入力してください', 'error');
        return;
    }
    
    const routineIndex = routines.findIndex(r => r.id === routineId);
    if (routineIndex === -1) {
        console.error('ルーティンが見つかりません:', routineId);
        return;
    }
    
    // ルーティンを更新
    routines[routineIndex] = {
        ...routines[routineIndex],
        title,
        description,
        time,
        frequency,
        updatedAt: new Date().toISOString()
    };
    
    await saveData();
    hideEditForm();
    
    // 表示を更新
    displayTodayRoutines();
    displayAllRoutines();
    
    showNotification('ルーティンを更新しました', 'success');
}

// 編集フォームを非表示
function hideEditForm() {
    const editForm = document.getElementById('editRoutineForm');
    if (editForm) {
        editForm.style.display = 'none';
    }
}

// 頻度オプションの表示
function showFrequencyOptions(formType, selectedFrequency) {
    const optionsContainer = document.getElementById(`${formType}FrequencyOptions`);
    if (!optionsContainer) return;
    
    const frequencies = [
        { value: 'daily', label: '毎日' },
        { value: 'weekly', label: '毎週' },
        { value: 'monthly', label: '毎月' }
    ];
    
    optionsContainer.innerHTML = frequencies.map(freq => `
        <button type="button" 
                class="frequency-btn ${freq.value === selectedFrequency ? 'selected' : ''}"
                onclick="selectFrequency('${formType}', '${freq.value}')">
            ${freq.label}
        </button>
    `).join('');
    
    optionsContainer.style.display = 'block';
}

// 頻度の選択
function selectFrequency(formType, frequency) {
    console.log('頻度選択:', formType, frequency);
    
    // 隠しフィールドに頻度を設定
    const frequencyInput = document.getElementById(`${formType}RoutineFrequency`);
    if (frequencyInput) {
        frequencyInput.value = frequency;
        console.log('頻度を設定:', frequency);
    } else {
        console.warn('頻度入力フィールドが見つかりません:', `${formType}RoutineFrequency`);
    }
    
    // 頻度オプションを非表示
    const optionsContainer = document.getElementById(`${formType}FrequencyOptions`);
    if (optionsContainer) {
        optionsContainer.style.display = 'none';
    }
    
    // 選択状態を更新
    const buttons = document.querySelectorAll('.frequency-btn');
    buttons?.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.frequency === frequency) {
            btn.classList.add('selected');
        }
    });
    
    // 頻度に応じて追加フィールドを表示/非表示
    if (formType === 'add') {
        // 毎週の曜日選択
        const weeklyDaysRow = document.getElementById('addWeeklyDaysRow');
        if (weeklyDaysRow) {
            weeklyDaysRow.style.display = frequency === 'weekly' ? 'block' : 'none';
            console.log('毎週の曜日選択フィールド:', frequency === 'weekly' ? '表示' : '非表示');
        }
        
        // 毎月の日付選択
        const monthlyDateRow = document.getElementById('addMonthlyDateRow');
        if (monthlyDateRow) {
            monthlyDateRow.style.display = frequency === 'monthly' ? 'block' : 'none';
            console.log('毎月の日付選択フィールド:', frequency === 'monthly' ? '表示' : '非表示');
        } else {
            console.error('addMonthlyDateRow要素が見つかりません');
        }
    } else if (formType === 'edit') {
        // 編集フォームの場合
        const editWeeklyDaysRow = document.getElementById('editWeeklyDaysRow');
        if (editWeeklyDaysRow) {
            editWeeklyDaysRow.style.display = frequency === 'weekly' ? 'block' : 'none';
        }
        
        const editMonthlyDateRow = document.getElementById('editMonthlyDateRow');
        if (editMonthlyDateRow) {
            editMonthlyDateRow.style.display = frequency === 'monthly' ? 'block' : 'none';
        }
    }
}

// ルーティンフォームの送信処理
async function handleRoutineFormSubmit(event) {
    event.preventDefault();
    console.log('ルーティンフォーム送信');
    
    const formType = event.target.id === 'routineForm' ? 'add' : 'edit';
    const title = document.getElementById('routineName').value.trim();
    const description = document.getElementById('routineDescription').value.trim();
    const frequency = document.getElementById('addRoutineFrequency').value;
    
    console.log('フォームデータ:', { title, description, frequency });
    
    if (!title) {
        showNotification('タイトルを入力してください', 'error');
        return;
    }
    
    if (!frequency) {
        showNotification('頻度を選択してください', 'error');
        return;
    }
    
    // 頻度に応じた追加データを取得
    let additionalData = {};
    
    if (frequency === 'weekly') {
        const selectedWeekdays = Array.from(document.querySelectorAll('.add-weekday-input:checked'))
            .map(checkbox => parseInt(checkbox.value));
        if (selectedWeekdays.length === 0) {
            showNotification('曜日を選択してください', 'error');
            return;
        }
        additionalData.weeklyDays = selectedWeekdays;
    }
    
    if (frequency === 'monthly') {
        const monthlyDate = document.getElementById('addMonthlyDateInput').value;
        console.log('毎月の日付入力値:', monthlyDate);
        if (!monthlyDate || monthlyDate < 1 || monthlyDate > 31) {
            showNotification('1から31の間の日付を入力してください', 'error');
            return;
        }
        additionalData.monthlyDate = parseInt(monthlyDate);
        console.log('毎月の日付データ設定:', additionalData.monthlyDate);
    }
    
    if (formType === 'add') {
        // 新しいルーティンを追加
        const newRoutine = {
            id: Date.now().toString(),
            title,
            description,
            frequency,
            ...additionalData,
            createdAt: new Date().toISOString(),
            userId: currentUserInfo?.id || 'unknown'
        };
        
        console.log('新しいルーティン:', newRoutine);
        console.log('ルーティン追加前のデータ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated'),
            currentStorage: currentStorage,
            currentUserInfo: currentUserInfo
        });
        
        routines.push(newRoutine);
        console.log('routines配列に追加後の長さ:', routines.length);
        console.log('routines配列の内容:', routines);
        
        // データを保存（完了を待つ）
        console.log('データ保存開始');
        await saveData();
        console.log('データ保存完了');
        console.log('ルーティン追加後のデータ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        // フォームをリセット
        event.target.reset();
        document.getElementById('addRoutineFrequency').value = '';
        
        // 頻度ボタンの選択状態をリセット
        const frequencyButtons = document.querySelectorAll('.frequency-btn');
        frequencyButtons.forEach(btn => btn.classList.remove('active'));
        
        // 追加フィールドを非表示
        const weeklyDaysRow = document.getElementById('addWeeklyDaysRow');
        const monthlyDateRow = document.getElementById('addMonthlyDateRow');
        if (weeklyDaysRow) weeklyDaysRow.style.display = 'none';
        if (monthlyDateRow) monthlyDateRow.style.display = 'none';
        
        // メイン画面に戻る（showMainScreen内で表示更新される）
        console.log('メイン画面に戻る前のroutines配列:', routines);
        showMainScreen();
        
        showNotification('ルーティンを追加しました', 'success');
    } else {
        // 既存のルーティンを更新
        const routineId = document.getElementById('editRoutineId').value;
        saveEditedRoutine(routineId);
    }
}

// 頻度ボタンのクリック処理
function handleFrequencyButtonClick(event) {
    console.log('頻度ボタンクリック:', event.target);
    console.log('頻度ボタンのdata-frequency:', event.target.dataset.frequency);
    
    // クリックされたボタンの頻度を取得
    const frequency = event.target.dataset.frequency;
    if (!frequency) {
        console.error('頻度が設定されていません');
        return;
    }
    
    console.log('選択された頻度:', frequency);
    
    // フォームタイプを判定
    const form = event.target.closest('form');
    const formType = form ? (form.id === 'routineForm' ? 'add' : 'edit') : 'add';
    console.log('フォームタイプ:', formType);
    
    // 頻度を設定
    selectFrequency(formType, frequency);
    
    // 選択状態を更新
    const frequencyButtons = form.querySelectorAll('.frequency-btn');
    frequencyButtons.forEach(btn => {
        btn.classList.remove('active', 'selected');
        if (btn.dataset.frequency === frequency) {
            btn.classList.add('active', 'selected');
        }
    });
}

// タブボタンのクリック処理
function handleTabButtonClick(event) {
    const frequency = event.target.dataset.frequency;
    if (frequency) {
        filterRoutinesByFrequency(frequency);
    }
}

// 頻度別にルーティンをフィルタリング
function filterRoutinesByFrequency(frequency) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    const filteredRoutines = routines.filter(routine => routine.frequency === frequency);
    
    const allRoutinesList = document.getElementById('allRoutinesList');
    if (allRoutinesList) {
        if (filteredRoutines.length === 0) {
            allRoutinesList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list" class="empty-icon"></i>
                    <h3>${getFrequencyText(frequency)}のルーティンはありません</h3>
                    <p>新しいルーティンを追加しましょう！</p>
                </div>
            `;
        } else {
            allRoutinesList.innerHTML = filteredRoutines.map(routine => createRoutineHTML(routine)).join('');
        }
        
        // Lucideアイコンを初期化
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// データの保存
async function saveData() {
    console.log('データ保存開始');
    console.log('saveData - currentStorage:', currentStorage);
    
    try {
        const data = {
            routines: routines,
            completions: completions,
            lastUpdated: new Date().toISOString()
        };
        
        switch (currentStorage) {
            case 'firebase':
                // Firebaseストレージが選択されている場合は、performActualSyncを使用
                if (currentUserInfo && currentUserInfo.id) {
                    console.log('Firebaseストレージが選択されているため、performActualSyncを使用');
                    // ローカルストレージにも保存（バックアップ）
                    localStorage.setItem('appData', JSON.stringify(data));
                    localStorage.setItem('lastUpdated', data.lastUpdated);
                    
                    // Firebaseに同期（完了を待つ）
                    try {
                        await performActualSync();
                        console.log('Firebase同期完了');
                    } catch (error) {
                        console.error('Firebase同期エラー:', error);
                        showNotification('Firebase同期に失敗しました', 'error');
                    }
                } else {
                    console.log('ユーザー情報が不足しているため、ローカルストレージに保存');
                    localStorage.setItem('appData', JSON.stringify(data));
                }
                break;
            case 'google-drive':
                // Google Driveに保存（実装予定）
                console.log('Google Drive保存（未実装）');
                localStorage.setItem('appData', JSON.stringify(data));
                break;
            default:
                // ローカルストレージに保存
                localStorage.setItem('appData', JSON.stringify(data));
                console.log('ローカルストレージに保存完了');
                break;
        }
    } catch (error) {
        console.error('データ保存エラー:', error);
    }
}

// ルーティンの追加
async function addRoutine(routineData) {
    console.log('ルーティン追加:', routineData);
    
    const newRoutine = {
        id: Date.now().toString(),
        ...routineData,
        createdAt: new Date().toISOString(),
        userId: currentUserInfo?.id || 'unknown'
    };
    
    routines.push(newRoutine);
    await saveData();
    
    // 表示を更新
    displayTodayRoutines();
    displayAllRoutines();
    
    showNotification('ルーティンを追加しました', 'success');
}

// アプリの初期化
function initializeApp() {
    console.log('アプリ初期化開始');
    
    // ストレージの初期化
    initializeStorage();
    
    // データの読み込み
    loadRoutines();
    
    // 同期状態の更新
    updateSyncStatus();
    
    // 広告の表示
    showAdsIfNeeded();
    
    console.log('アプリ初期化完了');
}

// ストレージの初期化
function initializeStorage() {
    console.log('ストレージ初期化');
    
    // 保存されたデータを読み込み
    try {
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            const data = JSON.parse(savedData);
            routines = data.routines || [];
            completions = data.completions || [];
            console.log('保存されたデータを読み込みました');
        }
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        routines = [];
        completions = [];
    }
}

// ログアウト処理
async function logout() {
    console.log('ログアウト開始');
    
    try {
        // Firebase認証からログアウト
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
        }
        
        // ローカルデータをクリア
        clearUserInfo();
        
        // 画面を認証画面に戻す
        showAuthScreen();
        
        showNotification('ログアウトしました', 'info');
        
    } catch (error) {
        console.error('ログアウトエラー:', error);
        showNotification('ログアウトエラーが発生しました', 'error');
    }
}

// ユーザータイプの設定
function setUserType(user) {
    console.log('ユーザータイプ設定開始:', user.email);
    
    let userType = 'general'; // デフォルトは一般ユーザー
    
    // 管理者チェック
    if (user.email === 'yasnaries@gmail.com') {
        userType = 'admin';
        console.log('管理者として設定:', user.email);
    } else {
        // 友達リストをチェック
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        if (friendsList.includes(user.email)) {
            userType = 'friend';
            console.log('友達として設定:', user.email);
        }
    }
    
    // ユーザータイプを保存
    localStorage.setItem('userType', userType);
    
    // currentUserInfoにユーザータイプを追加
    if (currentUserInfo) {
        currentUserInfo.userType = userType;
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
    }
    
    console.log('ユーザータイプ設定完了:', userType);
}

// ユーザータイプの取得
function getUserType() {
    if (!currentUserInfo) {
        console.log('ユーザー情報がありません');
        return 'general';
    }
    
    const userType = localStorage.getItem('userType') || 'general';
    console.log('ユーザータイプ取得:', userType);
    return userType;
}

// 管理者かどうかチェック
function isAdmin() {
    return getUserType() === 'admin';
}

// 友達かどうかチェック
function isFriend() {
    return getUserType() === 'friend';
}

// 一般ユーザーかどうかチェック
function isGeneralUser() {
    return getUserType() === 'general';
}

// 通知許可要求
function requestNotificationPermission() {
    console.log('通知許可要求');
    
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('通知が有効になりました', 'success');
            } else {
                showNotification('通知が拒否されました', 'info');
            }
        });
    } else {
        showNotification('このブラウザは通知をサポートしていません', 'warning');
    }
}

// Firebase設定確認
function checkFirebaseStatus() {
    console.log('Firebase設定確認開始');
    
    let status = 'Firebase設定確認:\n\n';
    
    // Firebase SDKの確認
    if (typeof firebase === 'undefined') {
        status += '❌ Firebase SDKが読み込まれていません\n';
    } else {
        status += '✅ Firebase SDKが読み込まれています\n';
        
        // 認証の確認
        if (firebase.auth) {
            status += '✅ Firebase Authが利用可能です\n';
        } else {
            status += '❌ Firebase Authが利用できません\n';
        }
        
        // Firestoreの確認
        if (firebase.firestore) {
            status += '✅ Firestoreが利用可能です\n';
        } else {
            status += '❌ Firestoreが利用できません\n';
        }
    }
    
    // 設定の確認
    const config = window.firebaseConfig;
    if (config) {
        status += '\n設定情報:\n';
        status += `API Key: ${config.apiKey ? '✅ 設定済み' : '❌ 未設定'}\n`;
        status += `Auth Domain: ${config.authDomain ? '✅ 設定済み' : '❌ 未設定'}\n`;
        status += `Project ID: ${config.projectId ? '✅ 設定済み' : '❌ 未設定'}\n`;
    } else {
        status += '\n❌ Firebase設定が見つかりません\n';
    }
    
    alert(status);
}

// Firebase設定修正
function fixFirebaseConfig() {
    console.log('Firebase設定修正開始');
    
    // 設定修正モーダルを表示
    const modal = document.getElementById('firebaseConfigModal');
    if (modal) {
        modal.style.display = 'block';
        
        // 現在の設定を表示
        const currentConfig = document.getElementById('currentConfig');
        if (currentConfig) {
            const config = window.firebaseConfig;
            if (config) {
                currentConfig.innerHTML = `
                    <p><strong>API Key:</strong> ${config.apiKey || '未設定'}</p>
                    <p><strong>Auth Domain:</strong> ${config.authDomain || '未設定'}</p>
                    <p><strong>Project ID:</strong> ${config.projectId || '未設定'}</p>
                    <p><strong>Storage Bucket:</strong> ${config.storageBucket || '未設定'}</p>
                    <p><strong>Messaging Sender ID:</strong> ${config.messagingSenderId || '未設定'}</p>
                    <p><strong>App ID:</strong> ${config.appId || '未設定'}</p>
                `;
            } else {
                currentConfig.innerHTML = '<p>設定が見つかりません</p>';
            }
        }
    }
}

// ユーザー検索機能
function filterUsers(searchTerm) {
    console.log('ユーザー検索:', searchTerm);
    
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    const users = getAllUsers();
    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        user.displayName.toLowerCase().includes(searchTerm)
    );
    
    if (filteredUsers.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="search" class="empty-icon"></i>
                <h3>検索結果が見つかりません</h3>
                <p>"${searchTerm}"に一致するユーザーはいません</p>
            </div>
        `;
    } else {
        usersList.innerHTML = filteredUsers.map(user => createUserItemHTML(user)).join('');
    }
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Firebaseの初期化状態をチェック
function checkFirebaseInitialization() {
    console.log('Firebase初期化状態チェック開始');
    
    try {
        // Firebaseが利用可能かチェック
        if (typeof firebase === 'undefined') {
            console.error('Firebase初期化エラー: firebaseが未定義');
            return {
                initialized: false,
                error: 'Firebaseが利用できません'
            };
        }
        
        // Firestoreが利用可能かチェック
        if (!firebase.firestore) {
            console.error('Firebase初期化エラー: firestoreが未定義');
            return {
                initialized: false,
                error: 'Firestoreが利用できません'
            };
        }
        
        // Firestoreインスタンスを取得してみる
        const db = firebase.firestore();
        if (!db) {
            console.error('Firebase初期化エラー: Firestoreインスタンスが取得できません');
            return {
                initialized: false,
                error: 'Firestoreインスタンスが取得できません'
            };
        }
        
        console.log('Firebase初期化状態: 正常');
        return {
            initialized: true,
            error: null
        };
        
    } catch (error) {
        console.error('Firebase初期化状態チェックエラー:', error);
        return {
            initialized: false,
            error: error.message
        };
    }
}

// 手動同期機能
function manualSync() {
    console.log('手動同期開始');
    console.log('手動同期 - 現在のストレージタイプ:', currentStorage);
    console.log('手動同期 - 現在のユーザー情報:', currentUserInfo);
    console.log('手動同期 - ユーザーID詳細:', {
        email: currentUserInfo?.email,
        displayName: currentUserInfo?.displayName,
        id: currentUserInfo?.id,
        uid: currentUserInfo?.uid,
        isGoogleUser: currentUserInfo?.isGoogleUser
    });
    console.log('手動同期 - 現在のローカルデータ:', {
        routinesCount: routines.length,
        completionsCount: completions.length,
        lastUpdated: localStorage.getItem('lastUpdated')
    });
    
    // 同期前の状態チェック
    if (!currentUserInfo) {
        console.error('手動同期エラー: ユーザー情報がありません');
        showNotification('ログインが必要です', 'error');
        return;
    }
    
    if (!currentStorage) {
        console.error('手動同期エラー: ストレージタイプが設定されていません');
        showNotification('ストレージ設定が必要です', 'error');
        return;
    }
    
    // Firebaseストレージの場合、初期化状態をチェック
    if (currentStorage === 'firebase') {
        const firebaseStatus = checkFirebaseInitialization();
        if (!firebaseStatus.initialized) {
            console.error('手動同期エラー: Firebase初期化エラー:', firebaseStatus.error);
            showNotification(`Firebase初期化エラー: ${firebaseStatus.error}`, 'error');
            return;
        }
    }
    
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.classList.add('syncing');
        syncBtn.disabled = true; // ボタンを無効化
        console.log('同期ボタンを無効化');
    }
    
    // 実際の同期処理
    const syncPromise = performActualSync();
    
    syncPromise.then(() => {
        console.log('手動同期完了');
        console.log('手動同期完了後のローカルデータ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        if (syncBtn) {
            syncBtn.classList.remove('syncing');
            syncBtn.disabled = false; // ボタンを再有効化
            console.log('同期ボタンを再有効化');
        }
        
        showNotification('同期が完了しました', 'success');
        updateSyncStatus();
    }).catch((error) => {
        console.error('同期エラー詳細:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            currentStorage: currentStorage,
            userInfo: currentUserInfo
        });
        
        if (syncBtn) {
            syncBtn.classList.remove('syncing');
            syncBtn.disabled = false; // ボタンを再有効化
            console.log('同期ボタンを再有効化（エラー時）');
        }
        
        // エラーメッセージを詳細化
        let errorMessage = '同期エラーが発生しました';
        if (error.message.includes('Firebaseが利用できません')) {
            errorMessage = 'Firebaseが利用できません。設定を確認してください。';
        } else if (error.message.includes('ユーザー情報が不足')) {
            errorMessage = 'ユーザー情報が不足しています。再ログインしてください。';
        } else if (error.message.includes('permission-denied')) {
            errorMessage = 'Firebaseの権限が不足しています。';
        } else if (error.message.includes('unavailable')) {
            errorMessage = 'Firebaseサーバーに接続できません。';
        } else if (error.message.includes('network')) {
            errorMessage = 'ネットワークエラーが発生しました。';
        }
        
        showNotification(errorMessage, 'error');
        updateSyncStatus();
    });
}

// デバッグ用のデータ状態表示関数
function showDataDebugInfo() {
    const debugInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        userInfo: currentUserInfo,
        storageType: currentStorage,
        routinesCount: routines.length,
        completionsCount: completions.length,
        localStorage: {
            appData: localStorage.getItem('appData') ? '存在' : 'なし',
            lastUpdated: localStorage.getItem('lastUpdated'),
            storageType: localStorage.getItem('storageType'),
            isLoggedIn: localStorage.getItem('isLoggedIn'),
            userInfo: localStorage.getItem('userInfo') ? '存在' : 'なし'
        },
        today: {
            date: new Date().toISOString().split('T')[0],
            day: new Date().getDay(),
            dateNum: new Date().getDate()
        }
    };
    
    console.log('=== デバッグ情報 ===');
    console.log(JSON.stringify(debugInfo, null, 2));
    console.log('==================');
    
    // アラートでも表示（モバイルでの確認用）
    alert(`デバッグ情報:\n\n` +
          `時刻: ${debugInfo.timestamp}\n` +
          `プラットフォーム: ${debugInfo.platform}\n` +
          `ユーザー: ${debugInfo.userInfo?.email || 'なし'}\n` +
          `ストレージ: ${debugInfo.storageType}\n` +
          `ルーティン数: ${debugInfo.routinesCount}\n` +
          `完了数: ${debugInfo.completionsCount}\n` +
          `今日: ${debugInfo.today.date} (曜日: ${debugInfo.today.day}, 日: ${debugInfo.today.dateNum})`);
}

// データの状態を詳細にログ出力する関数
function logDataState(context) {
    console.log(`=== データ状態ログ [${context}] ===`);
    console.log('現在時刻:', new Date().toISOString());
    console.log('ユーザー情報:', {
        email: currentUserInfo?.email,
        id: currentUserInfo?.id,
        uid: currentUserInfo?.uid,
        isGoogleUser: currentUserInfo?.isGoogleUser
    });
    console.log('ストレージタイプ:', currentStorage);
    console.log('ルーティン配列:', {
        length: routines.length,
        data: routines.map(r => ({
            id: r.id,
            title: r.title,
            frequency: r.frequency,
            weeklyDays: r.weeklyDays,
            monthlyDate: r.monthlyDate,
            createdAt: r.createdAt
        }))
    });
    console.log('完了配列:', {
        length: completions.length,
        data: completions.map(c => ({
            routineId: c.routineId,
            date: c.date,
            completedAt: c.completedAt
        }))
    });
    console.log('ローカルストレージ:', {
        appData: localStorage.getItem('appData') ? '存在' : 'なし',
        lastUpdated: localStorage.getItem('lastUpdated'),
        storageType: localStorage.getItem('storageType'),
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        userInfo: localStorage.getItem('userInfo') ? '存在' : 'なし'
    });
    console.log('今日の日付:', new Date().toISOString().split('T')[0]);
    console.log('今日の曜日:', new Date().getDay());
    console.log('今日の日:', new Date().getDate());
    console.log('================================');
}

// デバッグ用のデータ状態表示関数