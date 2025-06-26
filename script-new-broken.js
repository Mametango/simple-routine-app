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
let isGoogleLoginInProgress = false; // ログイン処琁E��のフラグ

// グローバルフラグを設定！Eirebase設定からアクセス可能にする�E�E
window.isGoogleLoginInProgress = false;

// ペ�Eジ読み込み時�E初期匁E
document.addEventListener('DOMContentLoaded', function() {
    console.log('ペ�Eジ読み込み完亁E);
    
    try {
        // チE�Eタの初期匁E
        initializeData();
        
        // イベントリスナ�Eの設宁E
        setupEventListeners();
        
        // 認証状態�E確誁E
        const isAuthenticated = checkAuthState();
        
        if (!isAuthenticated) {
            console.log('未認証 - 認証画面を表示');
            showAuthScreen();
        } else {
            console.log('認証済み - メインアプリを表示');
            // 認証状態変更ハンドラーで処琁E��れる
        }
        
        // Lucideアイコンの初期匁E
        if (window.lucide) {
            lucide.createIcons();
        }
        
        console.log('初期化完亁E);
        
    } catch (error) {
        console.error('初期化エラー:', error);
        showNotification('アプリの初期化中にエラーが発生しました', 'error');
    }
});

// チE�Eタの初期匁E
function initializeData() {
    console.log('チE�Eタ初期化開姁E);
    
    try {
        // ストレージタイプ�E読み込み
        const storageType = localStorage.getItem('storageType');
        if (storageType) {
            currentStorage = storageType;
            console.log('initializeData - 保存されたストレージタイプを設宁E', currentStorage);
        } else {
            console.log('initializeData - 保存されたストレージタイプなし、デフォルト値を使用:', currentStorage);
        }
        
        // Firebaseストレージが選択されてぁE��場合�E、FirebaseからチE�Eタを読み込み
        if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
            console.log('Firebaseストレージが選択されてぁE��ため、FirebaseからチE�Eタを読み込みまぁE);
            loadDataFromFirebase();
        } else {
            // ローカルストレージからチE�Eタを読み込み
            loadDataFromLocalStorage();
        }
        
        console.log('チE�Eタ初期化完亁E- routines:', routines.length, '件');
    } catch (error) {
        console.error('チE�Eタ初期化エラー:', error);
        // エラーが発生した場合�EチE��ォルト値を使用
        routines = [];
        completions = [];
        currentStorage = 'local';
    }
}

// ローカルストレージからチE�Eタを読み込み
function loadDataFromLocalStorage() {
    console.log('ローカルストレージからチE�Eタ読み込み開姁E);
    
    // appDataからルーチE��ンチE�Eタを読み込み
    const savedAppData = localStorage.getItem('appData');
    if (savedAppData) {
        const appData = JSON.parse(savedAppData);
        routines = appData.routines || [];
        completions = appData.completions || [];
        console.log('appDataからルーチE��ンチE�Eタ読み込み完亁E', routines.length);
        console.log('appDataから完亁E��ータ読み込み完亁E', completions.length);
    } else {
        // 旧形式�EチE�Eタも確誁E
        const savedRoutines = localStorage.getItem('routines');
        if (savedRoutines) {
            routines = JSON.parse(savedRoutines);
            console.log('旧形式からルーチE��ンチE�Eタ読み込み完亁E', routines.length);
        }
        
        const savedCompletions = localStorage.getItem('completions');
        if (savedCompletions) {
            completions = JSON.parse(savedCompletions);
            console.log('旧形式から完亁E��ータ読み込み完亁E', completions.length);
        }
    }
}

// FirebaseからチE�Eタを読み込み
async function loadDataFromFirebase() {
    console.log('FirebaseからチE�Eタ読み込み開姁E);
    
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.error('Firebaseが利用できません');
        loadDataFromLocalStorage();
        return;
    }
    
    if (!currentUserInfo || !currentUserInfo.id) {
        console.error('ユーザー惁E��が不足してぁE��ぁE);
        loadDataFromLocalStorage();
        return;
    }
    
    try {
        const db = firebase.firestore();
        const userId = currentUserInfo.id;
        
        console.log('FirebaseからチE�Eタ読み込み - ユーザーID:', userId);
        console.log('FirebaseからチE�Eタ読み込み - 現在のローカルチE�Eタ:', {
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
                
                console.log('FirebaseチE�Eタ詳細:', {
                    routinesCount: firebaseRoutines.length,
                    completionsCount: firebaseCompletions.length,
                    lastUpdated: firebaseData.data.lastUpdated
                });
                
                // ローカルチE�Eタと比輁E
                const localLastUpdated = localStorage.getItem('lastUpdated');
                if (localLastUpdated && firebaseData.data.lastUpdated) {
                    const firebaseLastUpdated = new Date(firebaseData.data.lastUpdated);
                    const localLastUpdatedDate = new Date(localLastUpdated);
                    
                    console.log('チE�Eタ比輁E', {
                        firebase: firebaseLastUpdated.toISOString(),
                        local: localLastUpdatedDate.toISOString(),
                        firebaseIsNewer: firebaseLastUpdated > localLastUpdatedDate
                    });
                    
                    if (firebaseLastUpdated > localLastUpdatedDate) {
                        console.log('FirebaseのチE�Eタが新しいため、ローカルチE�Eタを更新');
                        routines = firebaseRoutines;
                        completions = firebaseCompletions;
                    } else {
                        console.log('ローカルチE�Eタが新しいか同じため、FirebaseチE�Eタを使用しなぁE);
                        // ローカルチE�Eタを維持E
                    }
                } else {
                    console.log('日付情報がなぁE��め、FirebaseチE�Eタを使用');
                    routines = firebaseRoutines;
                    completions = firebaseCompletions;
                }
                
                // ローカルストレージにも保存（バチE��アチE�E�E�E
                localStorage.setItem('appData', JSON.stringify({
                    routines: routines,
                    completions: completions,
                    lastUpdated: firebaseData.data.lastUpdated
                }));
                localStorage.setItem('lastUpdated', firebaseData.data.lastUpdated);
                
                console.log('FirebaseからルーチE��ンチE�Eタ読み込み完亁E', routines.length);
                console.log('Firebaseから完亁E��ータ読み込み完亁E', completions.length);
                
                // UIを更新
                displayTodayRoutines();
                displayAllRoutines();
                
                showNotification('FirebaseからチE�Eタを読み込みました', 'success');
            } else {
                console.log('FirebaseにチE�Eタがありません');
                loadDataFromLocalStorage();
            }
        } else {
            console.log('Firebaseにドキュメントが存在しません');
            loadDataFromLocalStorage();
        }
    } catch (error) {
        console.error('FirebaseからチE�Eタ読み込みエラー:', error);
        showNotification('FirebaseからチE�Eタ読み込みに失敗しました。ローカルチE�Eタを使用します、E, 'warning');
        loadDataFromLocalStorage();
    }
}

// イベントリスナ�Eの設宁E
function setupEventListeners() {
    console.log('イベントリスナ�E設定開姁E);
    
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
    
    // パスワード表示刁E��替ぁE
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // ログイン状態保持チェチE��ボックス
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        rememberMe.addEventListener('change', handlePersistenceChange);
    }
    
    // ルーチE��ン追加フォーム
    const routineForm = document.getElementById('routineForm');
    if (routineForm) {
        routineForm.addEventListener('submit', handleRoutineFormSubmit);
    }
    
    // 頻度ボタン�E�イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('frequency-btn')) {
            handleFrequencyButtonClick(event);
        }
    });
    
    // タブ�Eタン�E�イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('tab-button')) {
            handleTabButtonClick(event);
        }
    });
    
    // ルーチE��ン完亁E�Eタン�E�イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.closest('.completion-btn')) {
            const routineId = event.target.closest('.routine-item').dataset.routineId;
            toggleRoutineCompletion(routineId);
        }
    });
    
    // ルーチE��ン編雁E�Eタン�E�イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.closest('.edit-btn')) {
            const routineId = event.target.closest('.routine-item').dataset.routineId;
            editRoutine(routineId);
        }
    });
    
    // ルーチE��ン削除ボタン�E�イベント委譲�E�E
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
    
    // 設定�Eタン
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showStorageModal);
    }
    
    // 管琁E��E�Eタン
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', showAdminDashboard);
    }
    
    // ログアウト�Eタン
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // ルーチE��ン追加ボタン
    const addRoutineBtn = document.getElementById('addRoutineBtn');
    if (addRoutineBtn) {
        addRoutineBtn.addEventListener('click', showAddRoutineScreen);
    }
    
    // 戻る�Eタン�E�イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.closest('.back-btn')) {
            showMainScreen();
        }
    });
    
    // キャンセルボタン�E�イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.closest('.cancel-button')) {
            showMainScreen();
        }
    });
    
    // ストレージ選択（イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.closest('.storage-option')) {
            const storageType = event.target.closest('.storage-option').dataset.storageType;
            if (storageType) {
                selectStorage(storageType);
            }
        }
    });
    
    // ストレージ確認�Eタン�E�イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.closest('.modal-btn.primary')) {
            confirmStorageSelection();
        }
    });
    
    // モーダル閉じる�Eタン�E�イベント委譲�E�E
    document.addEventListener('click', function(event) {
        if (event.target.closest('.modal-close') || event.target.closest('.close')) {
            hideStorageModal();
        }
    });
    
    // ヘルプ�Eタン
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
    
    // 管琁E��E��チE��ュボ�Eド関連
    const adminBackBtn = document.getElementById('adminBackBtn');
    if (adminBackBtn) {
        adminBackBtn.addEventListener('click', hideAdminDashboard);
    }
    
    // 管琁E��E��ブ�Eタン�E�イベント委譲�E�E
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
    
    console.log('イベントリスナ�E設定完亁E);
}

// 認証状態�E確誁E
function checkAuthState() {
    console.log('認証状態確認開姁E);
    
    // ローカル認証を確誁E
    const isLoggedIn = checkLocalAuth();
    
    if (isLoggedIn) {
        console.log('ローカル認証済み');
        return true;
    }
    
    // Firebase認証を確認！Eoogleログインのみ�E�E
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            console.log('Firebase認証済み:', currentUser.email);
            // Firebase認証状態変更ハンドラーで処琁E��れる
            return true;
        }
    }
    
    console.log('未認証');
    return false;
}

// ローカル認証の確誁E
function checkLocalAuth() {
    console.log('ローカル認証確誁E);
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    
    if (isLoggedIn && userInfo) {
        console.log('ローカルユーザー発要E', userInfo.email);
        currentUserInfo = userInfo;
        
        // Googleユーザーの場合�EFirebaseストレージを強制設宁E
        if (userInfo.isGoogleUser || userInfo.uid) {
            console.log('checkLocalAuth - Googleユーザー検�E、Firebaseストレージを設宁E);
            currentStorage = 'firebase';
            localStorage.setItem('storageType', 'firebase');
        } else {
            console.log('checkLocalAuth - 通常ユーザー、保存されたストレージタイプを使用');
            currentStorage = localStorage.getItem('storageType') || 'local';
        }
        
        console.log('checkLocalAuth - 最終的なcurrentStorage:', currentStorage);
        
        // 認証状態変更処琁E��実衁E
        handleAuthStateChange(userInfo);
        return true;
    }
    
    console.log('ローカル認証なぁE);
    return false;
}

// 認証状態変更の処琁E
function handleAuthStateChange(user) {
    console.log('認証状態変更処琁E��姁E', user ? user.email : 'なぁE);
    console.log('handleAuthStateChange - user object:', user);
    
    if (user) {
        // Googleユーザーの場合�EFirebaseストレージを強制設宁E
        const isGoogleUser = user.isGoogleUser || user.uid || (user.providerData && user.providerData.length > 0 && user.providerData[0].providerId === 'google.com');
        console.log('handleAuthStateChange - isGoogleUser check:', {
            userIsGoogleUser: user.isGoogleUser,
            userUid: user.uid,
            providerData: user.providerData,
            isGoogleUser: isGoogleUser
        });
        
        if (isGoogleUser) {
            console.log('Googleユーザー検�E、Firebaseストレージを設宁E);
            currentStorage = 'firebase';
            localStorage.setItem('storageType', 'firebase');
        } else {
            console.log('通常ユーザー、現在のストレージタイプを維持E', currentStorage);
        }
        
        // ユーザー惁E��の設宁E
        setUserInfo(user);
        
        // メインアプリの表示
        showMainApp();
        
        // アプリの初期匁E
        initializeApp();
        
        // サーバ�E接続時にオンライン同期を実衁E
        if (currentStorage === 'firebase') {
            console.log('Firebase同期を開姁E);
            setTimeout(() => {
                performActualSync();
            }, 1000);
        }
        
        // ログイン成功通知
        showNotification('ログインに成功しました', 'success');
    } else {
        // ログアウト状慁E
        clearUserInfo();
        showAuthScreen();
    }
}

// ユーザー惁E��を設宁E
function setUserInfo(user) {
    console.log('ユーザー惁E��設宁E', user.email);
    console.log('setUserInfo - user object:', user);
    
    // Googleユーザーの場合�Euidを使用、そぁE��なければidまた�Euidを使用
    const isGoogleUser = user.isGoogleUser || user.uid || (user.providerData && user.providerData.length > 0 && user.providerData[0].providerId === 'google.com');
    const userId = isGoogleUser ? user.uid : (user.id || user.uid || Date.now().toString());
    
    currentUserInfo = {
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        id: userId,
        uid: user.uid,
        isGoogleUser: isGoogleUser
    };
    
    console.log('setUserInfo - 設定されたユーザー惁E��:', currentUserInfo);
    
    // ユーザータイプを設宁E
    setUserType(user);
    
    // ログイン状態を保孁E
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
    
    console.log('ユーザー惁E��設定完亁E);
}

// ユーザー惁E��をクリア
function clearUserInfo() {
    currentUserInfo = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    console.log('ユーザー惁E��クリア完亁E);
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
        
        // 背景色を強制設宁E
        document.body.style.background = '#f8fafc';
        app.style.background = '#f8fafc';
        
        // ペ�Eジタイトルを更新
        document.title = 'My Routine - ルーチE��ン管琁E;
    } else {
        console.error('App element not found');
        return;
    }
    
    // ユーザー惁E��を更新
    updateUserInfo();
    
    // ルーチE��ンを読み込み
    loadRoutines();
    
    // 同期状態を更新
    console.log('showMainApp - updateSyncStatus前�EcurrentStorage:', currentStorage);
    updateSyncStatus();
    
    // 庁E��を表示�E�一般ユーザーのみ�E�E
    showAdsIfNeeded();
    
    // 成功通知を表示
    if (currentUserInfo) {
        const userTypeText = currentUserInfo.email === 'yasnaries@gmail.com' ? '�E�管琁E��E��E : '';
        const storageText = currentStorage === 'firebase' ? 'サーバ�E同期' : 'ローカル保孁E;
        console.log('showMainApp - 通知用storageText:', storageText, 'currentStorage:', currentStorage);
        showNotification(`ログインに成功しました�E�E{userTypeText}�E�E{storageText}モード）`, 'success');
    }
    
    console.log('showMainApp completed');
}

// ユーザー惁E��を更新
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
    
    // 管琁E��E�Eタンの表示/非表示
    if (adminBtn) {
        if (isAdmin()) {
            adminBtn.style.display = 'block';
        } else {
            adminBtn.style.display = 'none';
        }
    }
}

// ルーチE��ンを読み込み
function loadRoutines() {
    console.log('loadRoutines called');
    console.log('loadRoutines - 現在のroutines配�E:', routines);
    console.log('loadRoutines - routines配�Eの镁E', routines.length);
    console.log('loadRoutines - currentStorage:', currentStorage);
    
    // Firebaseストレージが選択されてぁE��場合�E、FirebaseからチE�Eタを読み込み
    if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
        console.log('Firebaseストレージが選択されてぁE��ため、FirebaseからチE�Eタを読み込みまぁE);
        loadDataFromFirebase().then(() => {
            // チE�Eタ読み込み後にUIを更新
            displayTodayRoutines();
            displayAllRoutines();
        }).catch(error => {
            console.error('FirebaseからチE�Eタ読み込みエラー:', error);
            // エラーの場合�EローカルチE�Eタを使用
            displayTodayRoutines();
            displayAllRoutines();
        });
    } else {
        // ローカルストレージのチE�Eタを使用
        console.log('ローカルストレージのチE�Eタを使用');
        displayTodayRoutines();
        displayAllRoutines();
    }
    
    console.log('loadRoutines completed');
}

// 今日のルーティンを表示（デバッグ強化版）
function displayTodayRoutines() {
    console.log('displayTodayRoutines 開始');
    logDataState('displayTodayRoutines開始');
    
    const todayRoutinesList = document.getElementById('todayRoutinesList');
    if (!todayRoutinesList) {
        console.error('Today routines list element not found');
        return;
    }
    
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    const todayDay = today.getDay();
    const todayDateNum = today.getDate();
    
    console.log('今日の日付情報:', {
        fullDate: today.toISOString(),
        dateString: todayDate,
        dayOfWeek: todayDay,
        dateOfMonth: todayDateNum
    });
    
    const todayRoutines = routines.filter(routine => {
        console.log(`ルーティン ${routine.title} の判定:`, {
            frequency: routine.frequency,
            weeklyDays: routine.weeklyDays,
            monthlyDate: routine.monthlyDate
        });
        
        if (routine.frequency === 'daily') {
            console.log(`  → 毎日ルーティン: 表示`);
            return true;
        }
        if (routine.frequency === 'weekly') {
            const shouldShow = routine.weeklyDays && routine.weeklyDays.includes(todayDay);
            console.log(`  → 毎週ルーティン: ${shouldShow ? '表示' : '非表示'} (曜日: ${todayDay}, 設定: ${routine.weeklyDays})`);
            return shouldShow;
        }
        if (routine.frequency === 'monthly') {
            const shouldShow = routine.monthlyDate === todayDateNum;
            console.log(`  → 毎月ルーティン: ${shouldShow ? '表示' : '非表示'} (日付: ${todayDateNum}, 設定: ${routine.monthlyDate})`);
            return shouldShow;
        }
        console.log(`  → 不明な頻度: 非表示`);
        return false;
    });
    
    console.log('今日表示されるルーティン:', todayRoutines.length, '件');
    todayRoutines.forEach(routine => {
        console.log(`  - ${routine.title} (${routine.frequency})`);
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
    
    console.log('displayTodayRoutines 完了');
}

// 全ルーチEンを表示
function displayAllRoutines() {
    console.log('displayAllRoutines called');
    console.log('現在のroutines配E:', routines);
    console.log('routines配Eの镁E', routines.length);
    
    const allRoutinesList = document.getElementById('allRoutinesList');
    if (!allRoutinesList) {
        console.error('All routines list element not found');
        return;
    }
    
    if (routines.length === 0) {
        console.log('ルーチE��ンぁE件のため、空の状態を表示');
        allRoutinesList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="list" class="empty-icon"></i>
                <h3>まだルーチE��ンがありません</h3>
                <p>新しいルーチE��ンを追加して、毎日の習�Eを始めましょぁE��E/p>
                <button class="add-first-routine-btn" onclick="showAddRoutineScreen()">
                    <i data-lucide="plus" class="button-icon"></i>
                    ルーチE��ンを追加
                </button>
            </div>
        `;
    } else {
        console.log('ルーチE��ンを表示:', routines.length, '件');
        allRoutinesList.innerHTML = routines.map(routine => createRoutineHTML(routine)).join('');
    }
    
    // Lucideアイコンを�E期化
    if (window.lucide) {
        lucide.createIcons();
    }
    
    console.log('displayAllRoutines completed');
}

// ルーチE��ンのHTMLを生戁E
function createRoutineHTML(routine) {
    const isCompleted = isRoutineCompletedToday(routine.id);
    const completionClass = isCompleted ? 'completed' : '';
    
    return `
        <div class="routine-item ${completionClass}" data-routine-id="${routine.id}">
            <div class="routine-content">
                <div class="routine-header">
                    <h3 class="routine-title">${routine.title}</h3>
                    <div class="routine-actions">
                        <button class="action-btn edit-btn" onclick="editRoutine('${routine.id}')" title="編雁E>
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
                ${isCompleted ? '完亁E��み' : '完亁E��する'}
            </button>
        </div>
    `;
}

// 頻度チE��ストを取征E
function getFrequencyText(frequency) {
    switch (frequency) {
        case 'daily': return '毎日';
        case 'weekly': return '毎週';
        case 'monthly': return '毎月';
        default: return frequency;
    }
}

// 今日ルーチE��ンが完亁E��てぁE��かチェチE��
function isRoutineCompletedToday(routineId) {
    const today = new Date().toISOString().split('T')[0];
    
    // completions配列から完了データを検索
    const completion = completions.find(c => 
        c.routineId === routineId && c.date === today
    );
    
    const isCompleted = completion !== undefined;
    console.log(`完了チェック [${routineId}]: ${isCompleted ? '完了済み' : '未完了'} (日付: ${today})`);
    
    return isCompleted;
}

// ルーチEン完亁E刁E替ぁE
async function toggleRoutineCompletion(routineId) {
    console.log('ルーチEン完亁EEり替ぁE', routineId);
    
    const today = new Date().toISOString().split('T')[0];
    
    // completions配Eから完亁Eータを検索
    const completionIndex = completions.findIndex(c => 
        c.routineId === routineId && c.date === today
    );
    
    if (completionIndex !== -1) {
        // 完亁Eータを削除
        completions.splice(completionIndex, 1);
        console.log('ルーチEン完亁E解除:', routineId);
    } else {
        // 完亁Eータを追加
        completions.push({
            routineId: routineId,
            date: today,
            completedAt: new Date().toISOString()
        });
        console.log('ルーチEン完亁E設宁E', routineId);
    }
    
    // 表示を更新
    displayTodayRoutines();
    displayAllRoutines();
    
    // チE�Eタを保存（完亁E��征E���E�E
    await saveData();
    
    // Firebaseストレージが選択されてぁE��場合�E、Firebaseに同期
    if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
        console.log('Firebaseストレージが選択されてぁE��ため、Firebaseに同期しまぁE);
        try {
            await performActualSync();
            console.log('Firebase同期完亁E);
        } catch (error) {
            console.error('Firebase同期エラー:', error);
            showNotification('Firebase同期に失敗しました', 'error');
        }
    }
}

// ルーチE��ン追加画面を表示
function showAddRoutineScreen() {
    console.log('ルーチE��ン追加画面表示');
    
    const mainScreen = document.getElementById('mainScreen');
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    
    if (mainScreen) mainScreen.style.display = 'none';
    if (addRoutineScreen) addRoutineScreen.style.display = 'block';
}

// メイン画面に戻めE
function showMainScreen() {
    console.log('メイン画面表示');
    
    const mainScreen = document.getElementById('mainScreen');
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    
    if (mainScreen) mainScreen.style.display = 'block';
    if (addRoutineScreen) addRoutineScreen.style.display = 'none';
    
    // ルーチE��ンの表示を更新�E�データ再読み込みなし！E
    console.log('showMainScreen - 表示更新前�Eroutines配�E:', routines);
    displayTodayRoutines();
    displayAllRoutines();
    console.log('showMainScreen - 表示更新後�Eroutines配�E:', routines);
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
            console.log('Firebase同期状態に設宁E);
            syncStatus.textContent = '🟢 オンライン同期';
            syncStatus.className = 'sync-status synced';
            syncStatus.title = 'Firebaseサーバ�Eと同期中';
            break;
        case 'google-drive':
            console.log('Google Drive同期状態に設宁E);
            syncStatus.textContent = '🟢 Google Drive同期';
            syncStatus.className = 'sync-status synced';
            syncStatus.title = 'Google Driveと同期中';
            break;
        default:
            console.log('ローカル保存状態に設宁E(currentStorage:', currentStorage, ')');
            syncStatus.textContent = '🟡 ローカル保孁E;
            syncStatus.className = 'sync-status local';
            syncStatus.title = 'ローカルストレージに保存中';
            break;
    }
}

// 庁E��を表示�E�一般ユーザーのみ�E�E
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
    
    // ペ�Eジタイトルを更新
    document.title = 'My Routine - ログイン';
}

// Googleログイン処琁E
async function handleGoogleLogin() {
    console.log('Googleログイン開姁E);
    
    // 既にログイン処琁E��の場合�E何もしなぁE
    if (isGoogleLoginInProgress) {
        console.log('Googleログイン処琁E��です。しばらく征E��てから再試行してください、E);
        showNotification('ログイン処琁E��です。しばらく征E��てから再試行してください、E, 'info');
        return;
    }
    
    if (typeof firebase === 'undefined') {
        showNotification('Firebaseが読み込まれてぁE��せん', 'error');
        return;
    }
    
    isGoogleLoginInProgress = true;
    window.isGoogleLoginInProgress = true; // グローバルフラグも更新
    
    try {
        // ポップアチE�EブロチE��チェチE��
        const popupBlocked = await checkPopupBlocked();
        if (popupBlocked) {
            // ポップアチE�EがブロチE��されてぁE��場合�E代替手段を提桁E
            showPopupBlockedDialog();
            return;
        }
        
        const auth = firebase.auth();
        
        // 既存�EポップアチE�EをクリーンアチE�E
        await cleanupExistingPopups();
        
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // スコープを設宁E
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        
        // カスタムパラメータ
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        
        console.log('Google認証プロバイダー設定完亁E);
        
        // ポップアチE�E認証を試行（タイムアウト付き�E�E
        const result = await Promise.race([
            auth.signInWithPopup(googleProvider),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('認証タイムアウチE)), 30000)
            )
        ]);
        
        console.log('Googleログイン成功:', result.user.email);
        
        // 認証状態変更ハンドラーを呼び出してユーザー惁E��を設宁E
        console.log('handleGoogleLogin - handleAuthStateChangeを呼び出ぁE);
        handleAuthStateChange(result.user);
        
        console.log('Googleログイン完亁E', {
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
                errorMessage = 'ポップアチE�EがブロチE��されてぁE��す。ブラウザの設定でポップアチE�Eを許可してください、E;
                showPopupBlockedDialog();
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'ログインがキャンセルされました';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'ログイン処琁E��重褁E��てぁE��す。しばらく征E��てから再試行してください、E;
                break;
            case 'auth/unauthorized-domain':
                errorMessage = 'こ�Eドメインは認証が許可されてぁE��せん。管琁E��E��連絡してください、E;
                break;
            default:
                if (error.message.includes('タイムアウチE)) {
                    errorMessage = '認証がタイムアウトしました。�E試行してください、E;
                } else {
                    errorMessage = `ログインエラー: ${error.message}`;
                }
        }
        
        showNotification(errorMessage, 'error');
        
        // エラー後に少し征E��てからフラグをリセチE��
        setTimeout(() => {
            isGoogleLoginInProgress = false;
            window.isGoogleLoginInProgress = false;
        }, 2000);
        
    } finally {
        // 成功時�E即座にフラグをリセチE��
        if (!isGoogleLoginInProgress) {
            isGoogleLoginInProgress = false;
            window.isGoogleLoginInProgress = false;
        }
    }
}

// 認証フォーム送信処琁E
function handleAuthSubmit(event) {
    event.preventDefault();
    console.log('認証フォーム送信');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('メールアドレスとパスワードを入力してください', 'error');
        return;
    }
    
    // 通常ログイン処琁E��実衁E
    handleRegularLogin(email, password);
}

// ポップアチE�EブロチE��時�Eダイアログ表示
function showPopupBlockedDialog() {
    const dialogHTML = `
        <div class="popup-blocked-dialog" id="popupBlockedDialog">
            <div class="dialog-content">
                <h3>ポップアチE�EがブロチE��されてぁE��ぁE/h3>
                <p>GoogleログインにはポップアチE�Eの許可が忁E��です、E/p>
                <div class="dialog-options">
                    <button onclick="tryGoogleLoginAgain()" class="btn-primary">再試衁E/button>
                    <button onclick="useRegularLogin()" class="btn-secondary">通常ログインを使用</button>
                    <button onclick="closePopupBlockedDialog()" class="btn-cancel">キャンセル</button>
                </div>
                <div class="popup-instructions">
                    <h4>ポップアチE�Eを許可する方法！E/h4>
                    <ul>
                        <li>ブラウザのアドレスバ�E横のアイコンをクリチE��</li>
                        <li>「�EチE�EアチE�Eを許可」を選抁E/li>
                        <li>ペ�Eジを�E読み込みしてから再試衁E/li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // 既存�Eダイアログを削除
    const existingDialog = document.getElementById('popupBlockedDialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    // 新しいダイアログを追加
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    // フラグをリセチE��
    isGoogleLoginInProgress = false;
    window.isGoogleLoginInProgress = false;
}

// ポップアチE�EブロチE��ダイアログを閉じる
function closePopupBlockedDialog() {
    const dialog = document.getElementById('popupBlockedDialog');
    if (dialog) {
        dialog.remove();
    }
}

// Googleログインを�E試衁E
function tryGoogleLoginAgain() {
    closePopupBlockedDialog();
    setTimeout(() => {
        handleGoogleLogin();
    }, 500);
}

// 通常ログインに刁E��替ぁE
function useRegularLogin() {
    closePopupBlockedDialog();
    showNotification('通常ログインフォームに刁E��替えました', 'info');
    
    // ログインフォームにフォーカス
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
}

// 既存�EポップアチE�EをクリーンアチE�E
async function cleanupExistingPopups() {
    try {
        // 既存�EFirebase認証ポップアチE�Eをキャンセル
        const auth = firebase.auth();
        if (auth.currentUser) {
            // 現在のユーザーがいる場合�E一旦サインアウチE
            await auth.signOut();
        }
        
        // 少し征E��してから次の処琁E��
        await new Promise(resolve => setTimeout(resolve, 1000));
        
    } catch (error) {
        console.log('ポップアチE�EクリーンアチE�Eエラー�E�無視！E', error);
    }
}

// ポップアチE�EブロチE��チェチE���E�改喁E���E�E
function checkPopupBlocked() {
    return new Promise((resolve) => {
        try {
            const popup = window.open('', '_blank', 'width=1,height=1,scrollbars=no,resizable=no');
            
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                resolve(true); // ポップアチE�EがブロチE��されてぁE��
            } else {
                // ポップアチE�Eが開ぁE��場合、少し征E��てから閉じめE
                setTimeout(() => {
                    try {
                        popup.close();
                    } catch (e) {
                        console.log('ポップアチE�Eクローズエラー�E�無視！E', e);
                    }
                }, 100);
                resolve(false); // ポップアチE�Eが許可されてぁE��
            }
        } catch (error) {
            console.log('ポップアチE�EチェチE��エラー:', error);
            resolve(true); // エラーの場合�EブロチE��されてぁE��とみなぁE
        }
    });
}

// ローカルアカウントとのリンク
async function linkWithLocalAccount(googleUser) {
    console.log('ローカルアカウントとのリンク開姁E', googleUser.email);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === googleUser.email);
    
    if (existingUser) {
        // 既存�Eローカルアカウントとリンク
        existingUser.isGoogleLinked = true;
        existingUser.googleUid = googleUser.uid;
        existingUser.displayName = googleUser.displayName || existingUser.displayName;
        
        const updatedUsers = users.map(u => 
            u.email === googleUser.email ? existingUser : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        console.log('既存アカウントとリンク完亁E);
    } else {
        // 新しいGoogleユーザー用のローカルアカウントを作�E
        const newUser = {
            id: googleUser.uid,
            email: googleUser.email,
            displayName: googleUser.displayName || googleUser.email.split('@')[0],
            password: '', // Googleユーザーはパスワード不要E
            createdAt: new Date().toISOString(),
            isGoogleLinked: true,
            googleUid: googleUser.uid
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('新規Googleユーザーアカウント作�E完亁E);
    }
}

// パスワード表示刁E��替ぁE
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
    
    // Lucideアイコンを�E初期匁E
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ログイン永続化の変更
function handlePersistenceChange(event) {
    const isChecked = event.target.checked;
    localStorage.setItem('rememberMe', isChecked);
    console.log('ログイン永続化設宁E', isChecked);
}

// 永続化状態�E復允E
function restorePersistenceState() {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const checkbox = document.getElementById('rememberMe');
    if (checkbox) {
        checkbox.checked = rememberMe;
    }
}

// 通常ログイン処琁E��Eoogleアカウント対応！E
async function handleRegularLogin(email, password) {
    console.log('通常ログイン開姁E', email);
    
    try {
        // ローカルユーザーをチェチE��
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            // ユーザーが見つからなぁE��合、新規ユーザーとして作�E
            console.log('新規ユーザーとして作�E:', email);
            
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
            
            // ユーザー惁E��を設宁E
            currentUserInfo = {
                email: newUser.email,
                displayName: newUser.displayName,
                id: newUser.id,
                isGoogleUser: false
            };
            
            // ローカルストレージを使用
            currentStorage = 'local';
            localStorage.setItem('storageType', 'local');
            
            // ログイン状態を保孁E
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
            
            // メインアプリを表示
            showMainApp();
            
            showNotification('新規ユーザーとして登録されました', 'success');
            return;
        }
        
        // パスワードチェチE��
        if (user.password !== password) {
            // 管琁E��E��カウント�E特別処琁E
            if (email === 'yasnaries@gmail.com') {
                // 管琁E��E��カウント�E場合�E、パスワードが空また�E未設定�E場合に自動設宁E
                if (!user.password || user.password === '') {
                    user.password = password;
                    const updatedUsers = users.map(u => 
                        u.email === email ? user : u
                    );
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    console.log('管琁E��E��カウント�Eパスワードを設定しました');
                } else {
                    throw new Error('管琁E��E��スワードが正しくありません。正しいパスワードを入力してください、E);
                }
            } else {
                throw new Error('パスワードが正しくありません');
            }
        }
        
        // ユーザー惁E��を設宁E
        currentUserInfo = {
            email: user.email,
            displayName: user.displayName,
            id: user.id,
            isGoogleUser: user.isGoogleLinked || false
        };
        
        // GoogleアカウントとリンクされてぁE��場合�E処琁E
        if (user.isGoogleLinked && user.googleUid) {
            try {
                // Firebase認証状態をチェチE���E�Eoogleログインのみ�E�E
                const firebaseUser = firebase.auth().currentUser;
                if (firebaseUser && firebaseUser.uid === user.googleUid) {
                    // 既にGoogleでログイン済み
                    currentStorage = 'firebase';
                    localStorage.setItem('storageType', 'firebase');
                    console.log('Google認証済み - サーバ�E同期モーチE);
                } else {
                    // Google認証が忁E��だが、E��常ログインではFirebase認証を試行しなぁE
                    console.log('Googleアカウントとの再認証が忁E��でぁE- ローカルモードで続衁E);
                    currentStorage = 'local';
                    localStorage.setItem('storageType', 'local');
                    showNotification('Googleアカウントとの再認証が忁E��です、Eoogleログインを使用するとサーバ�E同期が可能です、E, 'info');
                }
            } catch (firebaseError) {
                console.log('Firebase認証エラー - ローカルモードで続衁E', firebaseError);
                currentStorage = 'local';
                localStorage.setItem('storageType', 'local');
            }
        } else {
            // 通常のローカルアカウンチE
            currentStorage = 'local';
            localStorage.setItem('storageType', 'local');
        }
        
        // ログイン状態を保孁E
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        
        // メインアプリを表示
        showMainApp();
        
        // 成功通知
        const storageText = currentStorage === 'firebase' ? 'サーバ�E同期' : 'ローカル保孁E;
        const userTypeText = email === 'yasnaries@gmail.com' ? '�E�管琁E��E��E : '';
        showNotification(`ログインに成功しました�E�E{userTypeText}�E�E{storageText}モード）`, 'success');
        
    } catch (error) {
        console.error('通常ログインエラー:', error);
        showNotification('ログインに失敗しました: ' + error.message, 'error');
    }
}

// ログイン状態チェチE���E�Eoogleアカウント対応！E
function checkLoginStatus() {
    console.log('ログイン状態チェチE��開姁E);
    
    try {
        // ローカルログイン状態をチェチE��
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        
        if (isLoggedIn && userInfo) {
            console.log('ローカルログイン状態を検�E:', userInfo.email);
            currentUserInfo = userInfo;
            
            // ストレージタイプを取征E
            currentStorage = localStorage.getItem('storageType') || 'local';
            
            // Googleアカウント�E場合�EFirebase認証状態もチェチE��
            if (userInfo.isGoogleUser) {
                const firebaseUser = firebase.auth().currentUser;
                if (firebaseUser && firebaseUser.uid === userInfo.uid) {
                    console.log('Firebase認証状態も確認済み');
                    currentStorage = 'firebase';
                    localStorage.setItem('storageType', 'firebase');
                } else {
                    console.log('Firebase認証状態が不一致 - ローカルモードで続衁E);
                    currentStorage = 'local';
                    localStorage.setItem('storageType', 'local');
                }
            }
            
            // メインアプリを表示
            showMainApp();
            return true;
        }
        
        // Firebase認証状態をチェチE��
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('Firebase認証状態を検�E:', user.email);
                
                // ローカルアカウントをチェチE��
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
        console.error('ログイン状態チェチE��エラー:', error);
        return false;
    }
}

// 手動同期機�E
function manualSync() {
    console.log('手動同期開姁E);
    console.log('手動同期 - 現在のストレージタイチE', currentStorage);
    console.log('手動同期 - 現在のユーザー惁E��:', currentUserInfo);
    console.log('手動同期 - ユーザーID詳細:', {
        email: currentUserInfo?.email,
        displayName: currentUserInfo?.displayName,
        id: currentUserInfo?.id,
        uid: currentUserInfo?.uid,
        isGoogleUser: currentUserInfo?.isGoogleUser
    });
    console.log('手動同期 - 現在のローカルチE�Eタ:', {
        routinesCount: routines.length,
        completionsCount: completions.length,
        lastUpdated: localStorage.getItem('lastUpdated')
    });
    
    // 同期前�E状態チェチE��
    if (!currentUserInfo) {
        console.error('手動同期エラー: ユーザー惁E��がありません');
        showNotification('ログインが忁E��でぁE, 'error');
        return;
    }
    
    if (!currentStorage) {
        console.error('手動同期エラー: ストレージタイプが設定されてぁE��せん');
        showNotification('ストレージ設定が忁E��でぁE, 'error');
        return;
    }
    
    // Firebaseストレージの場合、�E期化状態をチェチE��
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
        syncBtn.disabled = true; // ボタンを無効匁E
        console.log('同期ボタンを無効匁E);
    }
    
    // 実際の同期処琁E
    const syncPromise = performActualSync();
    
    syncPromise.then(() => {
        console.log('手動同期完亁E);
        console.log('手動同期完亁E���EローカルチE�Eタ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        if (syncBtn) {
            syncBtn.classList.remove('syncing');
            syncBtn.disabled = false; // ボタンを�E有効匁E
            console.log('同期ボタンを�E有効匁E);
        }
        
        showNotification('同期が完亁E��ました', 'success');
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
            syncBtn.disabled = false; // ボタンを�E有効匁E
            console.log('同期ボタンを�E有効化（エラー時！E);
        }
        
        // エラーメチE��ージを詳細匁E
        let errorMessage = '同期エラーが発生しました';
        if (error.message.includes('Firebaseが利用できません')) {
            errorMessage = 'Firebaseが利用できません。設定を確認してください、E;
        } else if (error.message.includes('ユーザー惁E��が不足')) {
            errorMessage = 'ユーザー惁E��が不足してぁE��す。�Eログインしてください、E;
        } else if (error.message.includes('permission-denied')) {
            errorMessage = 'Firebaseの権限が不足してぁE��す、E;
        } else if (error.message.includes('unavailable')) {
            errorMessage = 'Firebaseサーバ�Eに接続できません、E;
        } else if (error.message.includes('network')) {
            errorMessage = 'ネットワークエラーが発生しました、E;
        }
        
        showNotification(errorMessage, 'error');
        updateSyncStatus();
    });
}

// 実際の同期処琁E
async function performActualSync() {
    console.log('実際の同期処琁E��姁E);
    console.log('performActualSync - 現在のストレージタイチE', currentStorage);
    console.log('performActualSync - 現在のユーザー惁E��:', currentUserInfo);
    
    try {
        switch (currentStorage) {
            case 'firebase':
                console.log('Firebase同期を実衁E);
                await syncWithFirebase();
                break;
            case 'google-drive':
                console.log('Google Drive同期を実衁E);
                await syncWithGoogleDrive();
                break;
            default:
                console.log('ローカルストレージ同期を実衁E);
                await syncWithLocalStorage();
                break;
        }
        
        console.log('同期処琁E��亁E);
        return Promise.resolve();
    } catch (error) {
        console.error('同期処琁E��ラー詳細:', {
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
    console.log('Firebase同期開姁E);
    
    // Firebaseの利用可能性チェチE��
    if (typeof firebase === 'undefined') {
        throw new Error('Firebaseが利用できません�E�Eirebase未定義�E�E);
    }
    
    if (!firebase.firestore) {
        throw new Error('Firebaseが利用できません�E�Eirestore未定義�E�E);
    }
    
    if (!currentUserInfo) {
        throw new Error('ユーザー惁E��が不足してぁE��す！EurrentUserInfo未定義�E�E);
    }
    
    if (!currentUserInfo.id) {
        throw new Error('ユーザー惁E��が不足してぁE��す（ユーザーID未定義�E�E);
    }
    
    const db = firebase.firestore();
    const userId = currentUserInfo.id;
    
    console.log('Firebase同期 - ユーザー惁E��詳細:', {
        email: currentUserInfo.email,
        displayName: currentUserInfo.displayName,
        id: currentUserInfo.id,
        uid: currentUserInfo.uid,
        isGoogleUser: currentUserInfo.isGoogleUser
    });
    console.log('Firebase同期 - ユーザーID:', userId);
    console.log('Firebase同期 - 現在のローカルチE�Eタ:', {
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
            syncStatus.title = 'Firebaseサーバ�Eと同期中...';
        }
        
        // FirebaseからチE�Eタを読み込み
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
                
                console.log('日付比輁E', {
                    firebase: firebaseLastUpdated.toISOString(),
                    local: localLastUpdated.toISOString(),
                    firebaseIsNewer: firebaseLastUpdated > localLastUpdated
                });
                
                if (firebaseLastUpdated > localLastUpdated) {
                    console.log('FirebaseのチE�Eタが新しいため、ローカルチE�Eタを更新');
                    shouldUpdateLocal = true;
                    shouldUpdateFirebase = false; // 既に最新なので更新不要E
                } else if (firebaseLastUpdated.getTime() === localLastUpdated.getTime()) {
                    console.log('チE�Eタが同じ日時なので、Firebase更新をスキチE�E');
                    shouldUpdateFirebase = false;
                }
            }
        } else {
            console.log('Firebaseにドキュメントが存在しなぁE��め、新規作�E');
        }
        
        // ローカルチE�Eタを更新�E�忁E��な場合！E
        if (shouldUpdateLocal && firebaseData && firebaseData.data) {
            routines = firebaseData.data.routines || [];
            completions = firebaseData.data.completions || [];
            localStorage.setItem('appData', JSON.stringify({
                routines: routines,
                completions: completions,
                lastUpdated: firebaseData.data.lastUpdated
            }));
            localStorage.setItem('lastUpdated', firebaseData.data.lastUpdated);
            
            console.log('ローカルチE�Eタ更新完亁E', {
                routinesCount: routines.length,
                completionsCount: completions.length
            });
            
            // UIを更新
            displayTodayRoutines();
            displayAllRoutines();
            showNotification('Firebaseから最新チE�Eタを取得しました', 'success');
        }
        
        // FirebaseにチE�Eタを保存（忁E��な場合！E
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
            
            console.log('Firebase保存完亁E);
            showNotification('Firebase同期が完亁E��ました', 'success');
        } else {
            console.log('Firebase更新をスキチE�E');
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
        
        // 同期状態を「ローカル保存」に戻ぁE
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
    console.log('Google Drive同期開姁E);
    
    // Google Drive同期は未実裁E�Eため、ローカルストレージにフォールバック
    await syncWithLocalStorage();
    console.log('Google Drive同期完亁E��ローカルフォールバック�E�E);
}

// ローカルストレージとの同期
async function syncWithLocalStorage() {
    console.log('ローカルストレージ同期開姁E);
    
    // 現在のチE�Eタをローカルストレージに保孁E
    const data = {
        routines: routines,
        completions: completions,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('appData', JSON.stringify(data));
    
    // 少し征E��して同期感を演�E
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('ローカルストレージ同期完亁E);
}

// 通知表示機�E
function showNotification(message, type = 'info') {
    console.log('通知表示:', message, type);
    
    // 既存�E通知を削除
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // 通知要素を作�E
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // アイコンを設宁E
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
    
    // Lucideアイコンを�E期化
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // アニメーション効极E
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 自動で非表示�E��E功とエラーは5秒、その他�E3秒！E
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
    console.log('ストレージ選抁E', storageType);
    
    // 選択状態を更新
    const storageOptions = document.querySelectorAll('.storage-option');
    storageOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[onclick="selectStorage('${storageType}')"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // 選択されたストレージタイプを保孁E
    localStorage.setItem('selectedStorage', storageType);
}

function confirmStorageSelection() {
    const selectedStorage = localStorage.getItem('selectedStorage') || 'local';
    console.log('ストレージ選択確誁E', selectedStorage);
    
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

// 管琁E��E��チE��ュボ�Eド表示
function showAdminDashboard() {
    console.log('管琁E��E��チE��ュボ�Eド表示');
    
    // メインアプリを非表示
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'none';
    }
    
    // 管琁E��E��チE��ュボ�Eドを表示
    const adminDashboard = document.getElementById('adminDashboardScreen');
    if (adminDashboard) {
        adminDashboard.style.display = 'block';
        
        // 最初�Eタブを表示
        showAdminTab('users');
        
        // チE�Eタを読み込み
        loadAdminData();
        
        // Lucideアイコンを�E期化
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// 管琁E��E��チE��ュボ�Eド非表示
function hideAdminDashboard() {
    console.log('管琁E��E��チE��ュボ�Eド非表示');
    
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

// 管琁E��E��ブ表示
function showAdminTab(tabName) {
    console.log('管琁E��E��ブ表示:', tabName);
    
    // タブ�EタンのアクチE��ブ状態を更新
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

// 管琁E��E��ータの読み込み
function loadAdminData() {
    console.log('管琁E��E��ータ読み込み開姁E);
    
    // ユーザーリストを読み込み
    loadUsersList();
    
    // 友達リストを読み込み
    loadFriendsList();
    
    // 統計を読み込み
    loadAdminStats();
}

// ユーザーリスト�E読み込み
function loadUsersList() {
    console.log('ユーザーリスト読み込み');
    
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    // ローカルストレージからユーザーチE�Eタを取征E
    const users = getAllUsers();
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="users" class="empty-icon"></i>
                <h3>ユーザーが見つかりません</h3>
                <p>まだユーザーが登録されてぁE��せん</p>
            </div>
        `;
    } else {
        usersList.innerHTML = users.map(user => createUserItemHTML(user)).join('');
    }
    
    // Lucideアイコンを�E期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// すべてのユーザーを取征E
function getAllUsers() {
    const users = [];
    
    // ローカルストレージからユーザー惁E��を取征E
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (userInfo) {
        users.push({
            email: userInfo.email,
            displayName: userInfo.displayName,
            userType: getUserType(),
            isCurrentUser: true
        });
    }
    
    // 友達リストを取征E
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    friendsList.forEach(email => {
        if (!users.find(u => u.email === email)) {
            users.push({
                email: email,
                displayName: email.split('@')[0],
                userType: 'friend',
                isCurrentUser: false
            });
        }
    });
    
    return users;
}

// ユーザーアイチE��のHTML生�E
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

// ユーザータイプ�EチE��スト取征E
function getUserTypeText(userType) {
    switch (userType) {
        case 'admin': return '管琁E��E;
        case 'friend': return '友達';
        case 'general': return '一般ユーザー';
        default: return '一般ユーザー';
    }
}

// ユーザータイプ�Eアイコン取征E
function getUserTypeIcon(userType) {
    switch (userType) {
        case 'admin': return 'shield';
        case 'friend': return 'heart';
        case 'general': return 'user';
        default: return 'user';
    }
}

// 友達としてマ�Eク
function markAsFriend(email) {
    console.log('友達としてマ�Eク:', email);
    
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
    
    if (confirm(`${email}を友達リストから削除しますか�E�`)) {
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
    
    if (confirm(`${email}を削除しますか�E�この操作�E取り消せません。`)) {
        // 友達リストからも削除
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        const updatedList = friendsList.filter(friend => friend !== email);
        localStorage.setItem('friendsList', JSON.stringify(updatedList));
        
        showNotification(`${email}を削除しました`, 'success');
        loadUsersList(); // リストを更新
    }
}

// 友達リスト�E読み込み
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
                <p>友達を追加して、一緒にルーチE��ンを管琁E��ましょぁE��E/p>
            </div>
        `;
    } else {
        friendsList.innerHTML = friends.map(email => createFriendItemHTML(email)).join('');
    }
    
    // Lucideアイコンを�E期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 友達アイチE��のHTML生�E
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

// 管琁E��E��計�E読み込み
function loadAdminStats() {
    console.log('管琁E��E��計読み込み');
    
    // ユーザー数
    const users = getAllUsers();
    const totalUsersCount = document.getElementById('totalUsersCount');
    if (totalUsersCount) {
        totalUsersCount.textContent = users.length;
    }
    
    // 友達数
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    const friendsCount = document.getElementById('friendsCount');
    if (friendsCount) {
        friendsCount.textContent = friendsList.length;
    }
    
    // ルーチE��ン数
    const totalRoutinesCount = document.getElementById('totalRoutinesCount');
    if (totalRoutinesCount) {
        totalRoutinesCount.textContent = routines.length;
    }
    
    // 完亁E��
    const completionRate = document.getElementById('completionRate');
    if (completionRate) {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = routines.filter(routine => {
            const completionKey = `completion_${routine.id}_${today}`;
            return localStorage.getItem(completionKey) === 'true';
        }).length;
        
        const rate = routines.length > 0 ? Math.round((completedToday / routines.length) * 100) : 0;
        completionRate.textContent = `${rate}%`;
    }
}

// 友達追加モーダル表示
function showAddFriendModal() {
    console.log('友達追加モーダル表示');
    
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'block';
        
        // フォームをリセチE��
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

// 友達追加処琁E
function addFriend() {
    console.log('友達追加処琁E);
    
    const email = document.getElementById('friendEmail').value.trim();
    const name = document.getElementById('friendName').value.trim();
    
    if (!email) {
        showNotification('メールアドレスを�E力してください', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('有効なメールアドレスを�E力してください', 'error');
        return;
    }
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    if (friendsList.includes(email)) {
        showNotification('こ�Eユーザーは既に友達リストに含まれてぁE��ぁE, 'warning');
        return;
    }
    
    // 友達リストに追加
    friendsList.push(email);
    localStorage.setItem('friendsList', JSON.stringify(friendsList));
    
    // 表示名も保存（任意！E
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

// メールアドレスの妥当性チェチE��
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ルーチE��ンの編雁E
function editRoutine(routineId) {
    console.log('ルーチE��ン編雁E', routineId);
    
    const routine = routines.find(r => r.id === routineId);
    if (!routine) {
        console.error('ルーチE��ンが見つかりません:', routineId);
        return;
    }
    
    showEditForm(routine);
}

// ルーチE��ンの削除
function deleteRoutine(routineId) {
    console.log('ルーチE��ン削除:', routineId);
    
    if (confirm('こ�EルーチE��ンを削除しますか�E�E)) {
        routines = routines.filter(r => r.id !== routineId);
        saveData();
        
        // 表示を更新
        displayTodayRoutines();
        displayAllRoutines();
        
        showNotification('ルーチE��ンを削除しました', 'success');
    }
}

// 編雁E��ォームの表示
function showEditForm(routine) {
    const editForm = document.getElementById('editRoutineForm');
    if (!editForm) return;
    
    // フォームに値を設宁E
    document.getElementById('editRoutineId').value = routine.id;
    document.getElementById('editRoutineTitle').value = routine.title;
    document.getElementById('editRoutineDescription').value = routine.description || '';
    document.getElementById('editRoutineTime').value = routine.time || '';
    
    // 頻度を設宁E
    const frequencySelect = document.getElementById('editRoutineFrequency');
    if (frequencySelect) {
        frequencySelect.value = routine.frequency;
    }
    
    // 編雁E��ォームを表示
    editForm.style.display = 'block';
}

// 編雁E��れたルーチE��ンを保孁E
async function saveEditedRoutine(routineId) {
    const title = document.getElementById('editRoutineTitle').value.trim();
    const description = document.getElementById('editRoutineDescription').value.trim();
    const time = document.getElementById('editRoutineTime').value;
    const frequency = document.getElementById('editRoutineFrequency').value;
    
    if (!title) {
        showNotification('タイトルを�E力してください', 'error');
        return;
    }
    
    const routineIndex = routines.findIndex(r => r.id === routineId);
    if (routineIndex === -1) {
        console.error('ルーチE��ンが見つかりません:', routineId);
        return;
    }
    
    // ルーチE��ンを更新
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
    
    showNotification('ルーチE��ンを更新しました', 'success');
}

// 編雁E��ォームを非表示
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

// 頻度の選抁E
function selectFrequency(formType, frequency) {
    console.log('頻度選抁E', formType, frequency);
    
    // 隠しフィールドに頻度を設宁E
    const frequencyInput = document.getElementById(`${formType}RoutineFrequency`);
    if (frequencyInput) {
        frequencyInput.value = frequency;
        console.log('頻度を設宁E', frequency);
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
        // 毎週の曜日選抁E
        const weeklyDaysRow = document.getElementById('addWeeklyDaysRow');
        if (weeklyDaysRow) {
            weeklyDaysRow.style.display = frequency === 'weekly' ? 'block' : 'none';
            console.log('毎週の曜日選択フィールチE', frequency === 'weekly' ? '表示' : '非表示');
        }
        
        // 毎月の日付選抁E
        const monthlyDateRow = document.getElementById('addMonthlyDateRow');
        if (monthlyDateRow) {
            monthlyDateRow.style.display = frequency === 'monthly' ? 'block' : 'none';
            console.log('毎月の日付選択フィールチE', frequency === 'monthly' ? '表示' : '非表示');
        } else {
            console.error('addMonthlyDateRow要素が見つかりません');
        }
    } else if (formType === 'edit') {
        // 編雁E��ォームの場吁E
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

// ルーチE��ンフォームの送信処琁E
async function handleRoutineFormSubmit(event) {
    event.preventDefault();
    console.log('ルーチE��ンフォーム送信');
    
    const formType = event.target.id === 'routineForm' ? 'add' : 'edit';
    const title = document.getElementById('routineName').value.trim();
    const description = document.getElementById('routineDescription').value.trim();
    const frequency = document.getElementById('addRoutineFrequency').value;
    
    console.log('フォームチE�Eタ:', { title, description, frequency });
    
    if (!title) {
        showNotification('タイトルを�E力してください', 'error');
        return;
    }
    
    if (!frequency) {
        showNotification('頻度を選択してください', 'error');
        return;
    }
    
    // 頻度に応じた追加チE�Eタを取征E
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
        console.log('毎月の日付�E力値:', monthlyDate);
        if (!monthlyDate || monthlyDate < 1 || monthlyDate > 31) {
            showNotification('1から31の間�E日付を入力してください', 'error');
            return;
        }
        additionalData.monthlyDate = parseInt(monthlyDate);
        console.log('毎月の日付データ設宁E', additionalData.monthlyDate);
    }
    
    if (formType === 'add') {
        // 新しいルーチE��ンを追加
        const newRoutine = {
            id: Date.now().toString(),
            title,
            description,
            frequency,
            ...additionalData,
            createdAt: new Date().toISOString(),
            userId: currentUserInfo?.id || 'unknown'
        };
        
        console.log('新しいルーチE��ン:', newRoutine);
        console.log('ルーチE��ン追加前�EチE�Eタ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated'),
            currentStorage: currentStorage,
            currentUserInfo: currentUserInfo
        });
        
        routines.push(newRoutine);
        console.log('routines配�Eに追加後�E長ぁE', routines.length);
        console.log('routines配�Eの冁E��:', routines);
        
        // チE�Eタを保存（完亁E��征E���E�E
        console.log('チE�Eタ保存開姁E);
        await saveData();
        console.log('チE�Eタ保存完亁E);
        console.log('ルーチE��ン追加後�EチE�Eタ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        // フォームをリセチE��
        event.target.reset();
        document.getElementById('addRoutineFrequency').value = '';
        
        // 頻度ボタンの選択状態をリセチE��
        const frequencyButtons = document.querySelectorAll('.frequency-btn');
        frequencyButtons.forEach(btn => btn.classList.remove('active'));
        
        // 追加フィールドを非表示
        const weeklyDaysRow = document.getElementById('addWeeklyDaysRow');
        const monthlyDateRow = document.getElementById('addMonthlyDateRow');
        if (weeklyDaysRow) weeklyDaysRow.style.display = 'none';
        if (monthlyDateRow) monthlyDateRow.style.display = 'none';
        
        // メイン画面に戻る！EhowMainScreen冁E��表示更新される！E
        console.log('メイン画面に戻る前のroutines配�E:', routines);
        showMainScreen();
        
        showNotification('ルーチE��ンを追加しました', 'success');
    } else {
        // 既存�EルーチE��ンを更新
        const routineId = document.getElementById('editRoutineId').value;
        saveEditedRoutine(routineId);
    }
}

// 頻度ボタンのクリチE��処琁E
function handleFrequencyButtonClick(event) {
    console.log('頻度ボタンクリチE��:', event.target);
    console.log('頻度ボタンのdata-frequency:', event.target.dataset.frequency);
    
    // クリチE��された�Eタンの頻度を取征E
    const frequency = event.target.dataset.frequency;
    if (!frequency) {
        console.error('頻度が設定されてぁE��せん');
        return;
    }
    
    console.log('選択された頻度:', frequency);
    
    // フォームタイプを判宁E
    const form = event.target.closest('form');
    const formType = form ? (form.id === 'routineForm' ? 'add' : 'edit') : 'add';
    console.log('フォームタイチE', formType);
    
    // 頻度を設宁E
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

// タブ�EタンのクリチE��処琁E
function handleTabButtonClick(event) {
    const frequency = event.target.dataset.frequency;
    if (frequency) {
        filterRoutinesByFrequency(frequency);
    }
}

// 頻度別にルーチE��ンをフィルタリング
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
                    <h3>${getFrequencyText(frequency)}のルーチE��ンはありません</h3>
                    <p>新しいルーチE��ンを追加しましょぁE��E/p>
                </div>
            `;
        } else {
            allRoutinesList.innerHTML = filteredRoutines.map(routine => createRoutineHTML(routine)).join('');
        }
        
        // Lucideアイコンを�E期化
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// チE�Eタの保孁E
async function saveData() {
    console.log('チE�Eタ保存開姁E);
    console.log('saveData - currentStorage:', currentStorage);
    
    try {
        const data = {
            routines: routines,
            completions: completions,
            lastUpdated: new Date().toISOString()
        };
        
        switch (currentStorage) {
            case 'firebase':
                // Firebaseストレージが選択されてぁE��場合�E、performActualSyncを使用
                if (currentUserInfo && currentUserInfo.id) {
                    console.log('Firebaseストレージが選択されてぁE��ため、performActualSyncを使用');
                    // ローカルストレージにも保存（バチE��アチE�E�E�E
                    localStorage.setItem('appData', JSON.stringify(data));
                    localStorage.setItem('lastUpdated', data.lastUpdated);
                    
                    // Firebaseに同期�E�完亁E��征E���E�E
                    try {
                        await performActualSync();
                        console.log('Firebase同期完亁E);
                    } catch (error) {
                        console.error('Firebase同期エラー:', error);
                        showNotification('Firebase同期に失敗しました', 'error');
                    }
                } else {
                    console.log('ユーザー惁E��が不足してぁE��ため、ローカルストレージに保孁E);
                    localStorage.setItem('appData', JSON.stringify(data));
                }
                break;
            case 'google-drive':
                // Google Driveに保存（実裁E��定！E
                console.log('Google Drive保存（未実裁E��E);
                localStorage.setItem('appData', JSON.stringify(data));
                break;
            default:
                // ローカルストレージに保孁E
                localStorage.setItem('appData', JSON.stringify(data));
                console.log('ローカルストレージに保存完亁E);
                break;
        }
    } catch (error) {
        console.error('チE�Eタ保存エラー:', error);
    }
}

// ルーチE��ンの追加
async function addRoutine(routineData) {
    console.log('ルーチE��ン追加:', routineData);
    
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
    
    showNotification('ルーチE��ンを追加しました', 'success');
}

// アプリの初期匁E
function initializeApp() {
    console.log('アプリ初期化開姁E);
    
    // ストレージの初期匁E
    initializeStorage();
    
    // チE�Eタの読み込み
    loadRoutines();
    
    // 同期状態�E更新
    updateSyncStatus();
    
    // 庁E��の表示
    showAdsIfNeeded();
    
    console.log('アプリ初期化完亁E);
}

// ストレージの初期匁E
function initializeStorage() {
    console.log('ストレージ初期匁E);
    
    // 保存されたチE�Eタを読み込み
    try {
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            const data = JSON.parse(savedData);
            routines = data.routines || [];
            completions = data.completions || [];
            console.log('保存されたチE�Eタを読み込みました');
        }
    } catch (error) {
        console.error('チE�Eタ読み込みエラー:', error);
        routines = [];
        completions = [];
    }
}

// ログアウト�E琁E
async function logout() {
    console.log('ログアウト開姁E);
    
    try {
        // Firebase認証からログアウチE
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
        }
        
        // ローカルチE�Eタをクリア
        clearUserInfo();
        
        // 画面を認証画面に戻ぁE
        showAuthScreen();
        
        showNotification('ログアウトしました', 'info');
        
    } catch (error) {
        console.error('ログアウトエラー:', error);
        showNotification('ログアウトエラーが発生しました', 'error');
    }
}

// ユーザータイプ�E設宁E
function setUserType(user) {
    console.log('ユーザータイプ設定開姁E', user.email);
    
    let userType = 'general'; // チE��ォルト�E一般ユーザー
    
    // 管琁E��E��ェチE��
    if (user.email === 'yasnaries@gmail.com') {
        userType = 'admin';
        console.log('管琁E��E��して設宁E', user.email);
    } else {
        // 友達リストをチェチE��
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        if (friendsList.includes(user.email)) {
            userType = 'friend';
            console.log('友達として設宁E', user.email);
        }
    }
    
    // ユーザータイプを保孁E
    localStorage.setItem('userType', userType);
    
    // currentUserInfoにユーザータイプを追加
    if (currentUserInfo) {
        currentUserInfo.userType = userType;
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
    }
    
    console.log('ユーザータイプ設定完亁E', userType);
}

// ユーザータイプ�E取征E
function getUserType() {
    if (!currentUserInfo) {
        console.log('ユーザー惁E��がありません');
        return 'general';
    }
    
    const userType = localStorage.getItem('userType') || 'general';
    console.log('ユーザータイプ取征E', userType);
    return userType;
}

// 管琁E��E��どぁE��チェチE��
function isAdmin() {
    return getUserType() === 'admin';
}

// 友達かどぁE��チェチE��
function isFriend() {
    return getUserType() === 'friend';
}

// 一般ユーザーかどぁE��チェチE��
function isGeneralUser() {
    return getUserType() === 'general';
}

// 通知許可要汁E
function requestNotificationPermission() {
    console.log('通知許可要汁E);
    
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('通知が有効になりました', 'success');
            } else {
                showNotification('通知が拒否されました', 'info');
            }
        });
    } else {
        showNotification('こ�Eブラウザは通知をサポ�EトしてぁE��せん', 'warning');
    }
}

// Firebase設定確誁E
function checkFirebaseStatus() {
    console.log('Firebase設定確認開姁E);
    
    let status = 'Firebase設定確誁E\n\n';
    
    // Firebase SDKの確誁E
    if (typeof firebase === 'undefined') {
        status += '❁EFirebase SDKが読み込まれてぁE��せん\n';
    } else {
        status += '✁EFirebase SDKが読み込まれてぁE��す\n';
        
        // 認証の確誁E
        if (firebase.auth) {
            status += '✁EFirebase Authが利用可能です\n';
        } else {
            status += '❁EFirebase Authが利用できません\n';
        }
        
        // Firestoreの確誁E
        if (firebase.firestore) {
            status += '✁EFirestoreが利用可能です\n';
        } else {
            status += '❁EFirestoreが利用できません\n';
        }
    }
    
    // 設定�E確誁E
    const config = window.firebaseConfig;
    if (config) {
        status += '\n設定情報:\n';
        status += `API Key: ${config.apiKey ? '✁E設定済み' : '❁E未設宁E}\n`;
        status += `Auth Domain: ${config.authDomain ? '✁E設定済み' : '❁E未設宁E}\n`;
        status += `Project ID: ${config.projectId ? '✁E設定済み' : '❁E未設宁E}\n`;
    } else {
        status += '\n❁EFirebase設定が見つかりません\n';
    }
    
    alert(status);
}

// Firebase設定修正
function fixFirebaseConfig() {
    console.log('Firebase設定修正開姁E);
    
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
                    <p><strong>API Key:</strong> ${config.apiKey || '未設宁E}</p>
                    <p><strong>Auth Domain:</strong> ${config.authDomain || '未設宁E}</p>
                    <p><strong>Project ID:</strong> ${config.projectId || '未設宁E}</p>
                    <p><strong>Storage Bucket:</strong> ${config.storageBucket || '未設宁E}</p>
                    <p><strong>Messaging Sender ID:</strong> ${config.messagingSenderId || '未設宁E}</p>
                    <p><strong>App ID:</strong> ${config.appId || '未設宁E}</p>
                `;
            } else {
                currentConfig.innerHTML = '<p>設定が見つかりません</p>';
            }
        }
    }
}

// ユーザー検索機�E
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
                <p>"${searchTerm}"に一致するユーザーはぁE��せん</p>
            </div>
        `;
    } else {
        usersList.innerHTML = filteredUsers.map(user => createUserItemHTML(user)).join('');
    }
    
    // Lucideアイコンを�E期化
    if (window.lucide) {
        lucide.createIcons();
    }
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
            isLoggedIn: localStorage.getItem('isLoggedIn')
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
