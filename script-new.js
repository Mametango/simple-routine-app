// 洗練されたログイン画面用のJavaScript

// デバッグ情報
console.log('=== script-new.js 読み込み開始 ===');
console.log('バージョン: 1.0.12');
console.log('読み込み時刻:', new Date().toISOString());

// グローバル変数の定義
let currentUserInfo = null;
let currentStorage = 'local';
let routines = [];
let completions = [];
let isGoogleLoginInProgress = false; // ログイン処理中のフラグ

// グローバル変数をwindowに公開
window.currentUserInfo = currentUserInfo;
window.currentStorage = currentStorage;
window.routines = routines;
window.completions = completions;
window.isGoogleLoginInProgress = isGoogleLoginInProgress;

// 画面切り替え関数
function showScreen(screenName) {
    console.log('画面切り替え:', screenName);
    
    // すべての画面を非表示
    const screens = ['authView', 'registerView', 'mainView', 'addRoutineView'];
    screens.forEach(screen => {
        const element = document.getElementById(screen);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // 指定された画面を表示
    const targetScreen = document.getElementById(screenName);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    } else {
        console.error('画面が見つかりません:', screenName);
    }
}

// ログイン処理関数
async function handleLogin(email, password) {
    console.log('ログイン処理開始:', email);
    
    try {
        if (window.simpleAuth && window.simpleAuth.signIn) {
            const result = await window.simpleAuth.signIn(email, password);
            if (result.user) {
                console.log('ログイン成功:', result.user);
                // グローバル変数を更新
                currentUserInfo = result.user;
                window.currentUserInfo = currentUserInfo;
                
                // ローカルストレージに保存
                localStorage.setItem('userInfo', JSON.stringify(result.user));
                
                showMainApp();
                return { success: true, user: result.user };
            } else {
                console.log('ログイン失敗');
                return { success: false, message: 'ログインに失敗しました' };
            }
        } else {
            console.log('simpleAuthが利用できません');
            return { success: false, message: '認証システムが利用できません' };
        }
    } catch (error) {
        console.error('ログインエラー:', error);
        return { success: false, message: error.message };
    }
}

// 登録処理関数
async function handleRegister(email, password) {
    console.log('登録処理開始:', email);
    
    try {
        if (window.simpleAuth && window.simpleAuth.signUp) {
            const result = await window.simpleAuth.signUp(email, password);
            if (result.user) {
                console.log('登録成功:', result.user);
                // グローバル変数を更新
                currentUserInfo = result.user;
                window.currentUserInfo = currentUserInfo;
                
                // ローカルストレージに保存
                localStorage.setItem('userInfo', JSON.stringify(result.user));
                
                showMainApp();
                return { success: true, user: result.user };
            } else {
                console.log('登録失敗');
                return { success: false, message: result.message || '登録に失敗しました' };
            }
        } else {
            console.log('simpleAuthが利用できません');
            return { success: false, message: '認証システムが利用できません' };
        }
    } catch (error) {
        console.error('登録エラー:', error);
        return { success: false, message: error.message };
    }
}

// メインアプリ表示関数
function showMainApp() {
    console.log('メインアプリ表示開始');
    
    if (!currentUserInfo) {
        console.error('ユーザー情報がありません');
        showScreen('authView');
        return;
    }
    
    // メイン画面を表示
    showScreen('mainView');
    
    // データを読み込み
    initializeData();
    
    // ルーティンを表示
    displayTodayRoutines();
    displayAllRoutines();
    
    console.log('メインアプリ表示完了');
}

// ログイン関数（グローバル公開用）
function login(email, password) {
    return handleLogin(email, password);
}

// 登録関数（グローバル公開用）
function register(email, password) {
    return handleRegister(email, password);
}

// セキュリティチェック関数
function isMyData(data, dataType = 'routine') {
    if (!currentUserInfo || !currentUserInfo.id) {
        console.error('ユーザー情報が不足しています');
        return false;
    }
    
    if (!data.userId) {
        console.warn(`${dataType}にuserIdがありません:`, data);
        return false;
    }
    
    const isMyData = data.userId === currentUserInfo.id;
    
    // 管理者アカウントでも他人のデータは除外
    if (!isMyData) {
        console.warn(`他人の${dataType}を検出（管理者でも除外）:`, {
            dataId: data.id || data.routineId,
            dataTitle: data.title,
            dataUserId: data.userId,
            currentUserId: currentUserInfo.id,
            currentUserEmail: currentUserInfo.email,
            isAdmin: isAdmin()
        });
    } else {
        console.log(`自分の${dataType}を確認:`, {
            dataId: data.id || data.routineId,
            dataTitle: data.title,
            currentUserId: currentUserInfo.id,
            currentUserEmail: currentUserInfo.email,
            isAdmin: isAdmin()
        });
    }
    
    return isMyData;
}

// 今日のルーティンを表示
function displayTodayRoutines() {
    console.log('今日のルーティン表示開始');
    console.log('現在のユーザーID:', currentUserInfo?.id);
    console.log('現在のユーザーメール:', currentUserInfo?.email);
    console.log('表示前の全ルーティン数:', routines.length);
    
    // 現在のユーザーのルーティンのみをフィルタ
    const myRoutines = routines.filter(routine => {
        const isMyRoutine = isMyData(routine, 'routine');
        if (!isMyRoutine) {
            console.warn('他人のルーティンを除外:', {
                id: routine.id,
                title: routine.title,
                userId: routine.userId,
                currentUserId: currentUserInfo?.id
            });
        }
        return isMyRoutine;
    });
    
    console.log('フィルタ後の自分のルーティン数:', myRoutines.length);
    
    // 今日のルーティンをフィルタ
    const today = new Date();
    const todayRoutines = myRoutines.filter(routine => {
        switch (routine.frequency) {
            case 'daily':
                return true;
            case 'weekly':
                return routine.weeklyDays && routine.weeklyDays.includes(today.getDay());
            case 'monthly':
                return routine.monthlyDate && routine.monthlyDate === today.getDate();
            default:
                return false;
        }
    });
    
    // DOM要素を取得
    const todayRoutinesList = document.getElementById('todayList');
    if (!todayRoutinesList) {
        console.error('todayList要素が見つかりません');
        return;
    }
    
    // ルーティンリストを更新
    if (todayRoutines.length === 0) {
        todayRoutinesList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="check-circle" class="empty-icon"></i>
                <h3>今日のルーティンはありません</h3>
                <p>新しいルーティンを追加しましょう！</p>
            </div>
        `;
    } else {
        todayRoutinesList.innerHTML = todayRoutines.map(routine => createRoutineHTML(routine)).join('');
    }
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
    
    console.log('今日のルーティン表示完了:', todayRoutines.length);
}

// 全ルーティンを表示
function displayAllRoutines() {
    console.log('全ルーティン表示開始');
    console.log('現在のユーザーID:', currentUserInfo?.id);
    console.log('表示前の全ルーティン数:', routines.length);
    
    // 現在のユーザーのルーティンのみをフィルタ
    const myRoutines = routines.filter(routine => {
        const isMyRoutine = isMyData(routine, 'routine');
        return isMyRoutine;
    });
    
    console.log('フィルタ後の自分のルーティン数:', myRoutines.length);
    
    // DOM要素を取得
    const allRoutinesList = document.getElementById('allList');
    if (!allRoutinesList) {
        console.error('allList要素が見つかりません');
        return;
    }
    
    // ルーティンリストを更新
    if (myRoutines.length === 0) {
        allRoutinesList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="list" class="empty-icon"></i>
                <h3>ルーティンがありません</h3>
                <p>新しいルーティンを追加しましょう！</p>
            </div>
        `;
    } else {
        allRoutinesList.innerHTML = myRoutines.map(routine => createRoutineHTML(routine)).join('');
    }
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
    
    console.log('全ルーティン表示完了:', myRoutines.length);
}

// ルーティンのHTMLを生成
function createRoutineHTML(routine) {
    const isCompleted = isRoutineCompletedToday(routine.id);
    const completionClass = isCompleted ? 'completed' : '';
    
    return `
        <li class="routine-item ${completionClass}" data-routine-id="${routine.id}">
            <div>
                <h3>${routine.title}</h3>
                ${routine.description ? `<div>${routine.description}</div>` : ''}
                <div class="frequency">${getFrequencyText(routine.frequency)}</div>
            </div>
            <button onclick="toggleRoutineCompletion('${routine.id}')" class="btn ${isCompleted ? 'secondary' : ''}">
                ${isCompleted ? '✓' : '○'}
            </button>
        </li>
    `;
}

// 頻度テキストを取得
function getFrequencyText(frequency) {
    switch (frequency) {
        case 'daily':
            return '毎日';
        case 'weekly':
            return '毎週';
        case 'monthly':
            return '毎月';
        default:
            return '未設定';
    }
}

// 今日ルーティンが完了しているかチェック
function isRoutineCompletedToday(routineId) {
    const today = new Date().toISOString().split('T')[0];
    
    // completions配列が初期化されているかチェック
    if (!Array.isArray(completions)) {
        console.warn('completions配列が初期化されていません。初期化します。');
        completions = [];
    }
    
    // 現在のユーザーの完了データのみをフィルタ
    const myCompletions = completions.filter(completion => {
        const isMyCompletion = isMyData(completion, 'completion');
        if (!isMyCompletion) {
            console.warn('他人の完了データを除外:', {
                routineId: completion.routineId,
                date: completion.date,
                userId: completion.userId,
                currentUserId: currentUserInfo?.id
            });
        }
        return isMyCompletion;
    });
    
    // 完了データを検索
    const completion = myCompletions.find(c => 
        c.routineId === routineId && c.date === today
    );
    
    const isCompleted = completion !== undefined;
    console.log(`完了チェック [${routineId}]: ${isCompleted ? '完了済み' : '未完了'} (日付: ${today}, 自分の完了データ数: ${myCompletions.length})`);
    
    return isCompleted;
}

// 管理者かどうかチェック（簡易版）
function isAdmin() {
    if (!currentUserInfo) return false;
    return currentUserInfo.email === 'yasnaries@gmail.com';
}

// イベントリスナーの設定
function setupEventListeners() {
    console.log('=== イベントリスナー設定開始 ===');
    
    try {
        // 要素存在確認
        console.log('要素存在確認:');
        console.log('- loginForm:', !!document.getElementById('loginForm'));
        console.log('- registerForm:', !!document.getElementById('registerForm'));
        console.log('- addRoutineForm:', !!document.getElementById('addRoutineForm'));
        console.log('- showAddRoutine:', !!document.getElementById('showAddRoutine'));
        console.log('- addRoutineView:', !!document.getElementById('addRoutineView'));
        console.log('- logoutBtn:', !!document.getElementById('logoutBtn'));
        console.log('- showRegister:', !!document.getElementById('showRegister'));
        console.log('- backToLogin:', !!document.getElementById('backToLogin'));
        console.log('- cancelAddRoutine:', !!document.getElementById('cancelAddRoutine'));
        
        // ログインフォーム
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                if (!email || !password) {
                    alert('メールアドレスとパスワードを入力してください');
                    return;
                }
                
                const result = await handleLogin(email, password);
                if (!result.success) {
                    alert(result.message);
                }
            });
        } else {
            console.log('❌ loginForm要素が見つかりません');
        }
        
        // 登録フォーム
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('registerEmail').value;
                const password = document.getElementById('registerPassword').value;
                
                if (!email || !password) {
                    alert('メールアドレスとパスワードを入力してください');
                    return;
                }
                
                const result = await handleRegister(email, password);
                if (!result.success) {
                    alert(result.message);
                }
            });
        } else {
            console.log('❌ registerForm要素が見つかりません');
        }
        
        // ルーティン追加フォーム
        const addRoutineForm = document.getElementById('addRoutineForm');
        if (addRoutineForm) {
            addRoutineForm.addEventListener('submit', handleRoutineFormSubmit);
        } else {
            console.log('❌ addRoutineForm要素が見つかりません');
        }
        
        // ルーティン追加ボタン
        const showAddRoutineBtn = document.getElementById('showAddRoutine');
        if (showAddRoutineBtn) {
            showAddRoutineBtn.addEventListener('click', () => {
                showScreen('addRoutineView');
            });
        } else {
            console.log('❌ showAddRoutine要素が見つかりません');
        }
        
        // ログアウトボタン
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await logout();
                showScreen('authView');
            });
        } else {
            console.log('❌ logoutBtn要素が見つかりません');
        }
        
        // 新規登録ボタン
        const showRegisterBtn = document.getElementById('showRegister');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => {
                showScreen('registerView');
            });
        } else {
            console.log('❌ showRegister要素が見つかりません');
        }
        
        // 戻るボタン
        const backToLoginBtn = document.getElementById('backToLogin');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => {
                showScreen('authView');
            });
        } else {
            console.log('❌ backToLogin要素が見つかりません');
        }
        
        // キャンセルボタン
        const cancelAddRoutineBtn = document.getElementById('cancelAddRoutine');
        if (cancelAddRoutineBtn) {
            cancelAddRoutineBtn.addEventListener('click', () => {
                showScreen('mainView');
            });
        } else {
            console.log('❌ cancelAddRoutine要素が見つかりません');
        }
        
        // デバッグ認証ボタン
        const debugAuthBtn = document.getElementById('debugAuth');
        if (debugAuthBtn) {
            debugAuthBtn.addEventListener('click', handleDebugAuth);
        } else {
            console.log('❌ debugAuth要素が見つかりません');
        }
        
        // 頻度ボタン
        const frequencyButtons = document.querySelectorAll('#addRoutineForm .tab');
        frequencyButtons.forEach(button => {
            button.addEventListener('click', handleFrequencyButtonClick);
        });
        
        // タブボタン
        const tabButtons = document.querySelectorAll('#mainView .tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', handleTabButtonClick);
        });
        
        console.log('✅ イベントリスナー設定完了');
        
    } catch (error) {
        console.error('イベントリスナー設定エラー:', error);
    }
    
    console.log('=== イベントリスナー設定終了 ===');
}

// 認証状態をチェック
function checkAuthState() {
    console.log('認証状態チェック開始');
    
    try {
        // ローカルストレージからユーザー情報を取得
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            currentUserInfo = JSON.parse(userInfo);
            window.currentUserInfo = currentUserInfo;
            console.log('ローカルストレージからユーザー情報を取得:', currentUserInfo);
            
            // 認証済みの場合はメインアプリを表示
            showMainApp();
            return true;
        }
        
        // Firebase認証状態をチェック
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const user = firebase.auth().currentUser;
            if (user) {
                currentUserInfo = {
                    id: user.uid,
                    email: user.email,
                    displayName: user.displayName
                };
                window.currentUserInfo = currentUserInfo;
                localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
                console.log('Firebase認証状態からユーザー情報を取得:', currentUserInfo);
                
                // 認証済みの場合はメインアプリを表示
                showMainApp();
                return true;
            }
        }
        
        console.log('認証状態なし');
        return false;
    } catch (error) {
        console.error('認証状態チェックエラー:', error);
        return false;
    }
}

// 認証画面を表示
function showAuthScreen() {
    console.log('認証画面表示');
    
    const authContainer = document.getElementById('authContainer');
    const app = document.getElementById('app');
    
    if (authContainer) authContainer.style.display = 'block';
    if (app) app.style.display = 'none';
}

// ルーティンを読み込み
function loadRoutines() {
    console.log('ルーティン読み込み開始');
    
    try {
        // 現在のストレージタイプに応じてデータを読み込み
        if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
            loadDataFromFirebase();
        } else {
            loadDataFromLocalStorage();
        }
        
        // UIを更新
        displayTodayRoutines();
        displayAllRoutines();
        
        console.log('ルーティン読み込み完了');
    } catch (error) {
        console.error('ルーティン読み込みエラー:', error);
        showNotification('ルーティンの読み込みに失敗しました', 'error');
    }
}

// ルーティン完了を切り替え
async function toggleRoutineCompletion(routineId) {
    console.log('ルーティン完了切り替え開始:', routineId);
    
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // completions配列が初期化されているかチェック
        if (!Array.isArray(completions)) {
            console.warn('completions配列が初期化されていません。初期化します。');
            completions = [];
        }
        
        // 現在のユーザーの完了データのみをフィルタ
        const myCompletions = completions.filter(completion => {
            const isMyCompletion = isMyData(completion, 'completion');
            if (!isMyCompletion) {
                console.warn('他人の完了データを除外:', {
                    routineId: completion.routineId,
                    date: completion.date,
                    userId: completion.userId,
                    currentUserId: currentUserInfo?.id
                });
            }
            return isMyCompletion;
        });
        
        // 既存の完了データを検索
        const existingIndex = myCompletions.findIndex(c => 
            c.routineId === routineId && c.date === today
        );
        
        if (existingIndex !== -1) {
            // 完了データを削除
            myCompletions.splice(existingIndex, 1);
            console.log('完了データを削除:', routineId);
        } else {
            // 完了データを追加
            const newCompletion = {
                id: Date.now().toString(),
                routineId: routineId,
                date: today,
                userId: currentUserInfo.id,
                timestamp: new Date().toISOString()
            };
            myCompletions.push(newCompletion);
            console.log('完了データを追加:', newCompletion);
        }
        
        // 完了データを更新
        completions = myCompletions;
        
        // データを保存
        await saveData();
        
        // UIを更新
        displayTodayRoutines();
        displayAllRoutines();
        
        console.log('ルーティン完了切り替え完了');
    } catch (error) {
        console.error('ルーティン完了切り替えエラー:', error);
        showNotification('ルーティンの完了状態の更新に失敗しました', 'error');
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM読み込み完了 - 初期化開始');
    
    try {
        // イベントリスナーの設定
        setupEventListeners();
        
        // 認証状態の確認
        const isAuthenticated = checkAuthState();
        
        if (!isAuthenticated) {
            console.log('未認証 - 認証画面を表示');
            showScreen('authView');
        } else {
            console.log('認証済み - メインアプリを表示');
            // checkAuthState内でshowMainAppが呼ばれる
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
    
    try {
        const appData = localStorage.getItem('appData');
        const lastUpdated = localStorage.getItem('lastUpdated');
        
        console.log('ローカルストレージ読み込み - 現在のユーザー:', currentUserInfo?.email);
        console.log('ローカルストレージ読み込み - appData存在:', !!appData);
        console.log('ローカルストレージ読み込み - lastUpdated:', lastUpdated);
        
        if (appData) {
            const data = JSON.parse(appData);
            console.log('ローカルストレージから読み込み:', data);
            
            // データの整合性チェック
            if (data.routines && Array.isArray(data.routines)) {
                routines = data.routines;
                console.log('ローカルストレージからルーティン読み込み:', routines.length);
            } else {
                routines = [];
                console.log('ローカルストレージのルーティンデータが不正、初期化');
            }
            
            if (data.completions && Array.isArray(data.completions)) {
                completions = data.completions;
                console.log('ローカルストレージから完了データ読み込み:', completions.length);
            } else {
                completions = [];
                console.log('ローカルストレージの完了データが不正、初期化');
            }
            
            // データの所有者チェック（Firebaseストレージの場合）
            if (currentStorage === 'firebase' && currentUserInfo) {
                console.log('Firebaseストレージモード - データ所有者チェック開始');
                console.log('現在のユーザーID:', currentUserInfo.id);
                console.log('現在のユーザーメール:', currentUserInfo.email);
                console.log('チェック前のルーティン数:', routines.length);
                console.log('チェック前の完了データ数:', completions.length);
                
                // ルーティンの所有者をチェック（isMyData関数を使用）
                const validRoutines = routines.filter(routine => {
                    const isMyRoutine = isMyData(routine, 'routine');
                    if (!isMyRoutine) {
                        console.log('他のユーザーのルーティンを除外:', {
                            id: routine.id,
                            title: routine.title,
                            userId: routine.userId,
                            currentUserId: currentUserInfo.id,
                            currentUserEmail: currentUserInfo.email
                        });
                    }
                    return isMyRoutine;
                });
                
                if (validRoutines.length !== routines.length) {
                    console.log('他のユーザーのルーティンを除外:', routines.length - validRoutines.length);
                    routines = validRoutines;
                }
                
                // 完了データの所有者をチェック（isMyData関数を使用）
                const validCompletions = completions.filter(completion => {
                    const isMyCompletion = isMyData(completion, 'completion');
                    if (!isMyCompletion) {
                        console.log('他のユーザーの完了データを除外:', {
                            routineId: completion.routineId,
                            date: completion.date,
                            userId: completion.userId,
                            currentUserId: currentUserInfo.id,
                            currentUserEmail: currentUserInfo.email
                        });
                    }
                    return isMyCompletion;
                });
                
                if (validCompletions.length !== completions.length) {
                    console.log('他のユーザーの完了データを除外:', completions.length - validCompletions.length);
                    completions = validCompletions;
                }
                
                console.log('チェック後のルーティン数:', routines.length);
                console.log('チェック後の完了データ数:', completions.length);
            }
            
            // UIを更新
            displayTodayRoutines();
            displayAllRoutines();
            
            console.log('ローカルストレージからデータ読み込み完了');
        } else {
            console.log('ローカルストレージにデータがありません');
            routines = [];
            completions = [];
        }
    } catch (error) {
        console.error('ローカルストレージからデータ読み込みエラー:', error);
        routines = [];
        completions = [];
        showNotification('ローカルデータの読み込みに失敗しました', 'error');
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
                
                // Firebaseから読み込んだデータの所有者チェック
                console.log('Firebaseデータ所有者チェック開始');
                console.log('現在のユーザーID:', currentUserInfo.id);
                console.log('現在のユーザーメール:', currentUserInfo.email);
                console.log('チェック前のルーティン数:', routines.length);
                console.log('チェック前の完了データ数:', completions.length);
                
                // ルーティンの所有者をチェック
                const validRoutines = routines.filter(routine => {
                    const isMyRoutine = isMyData(routine, 'routine');
                    if (!isMyRoutine) {
                        console.log('Firebaseから読み込んだ他人のルーティンを除外:', {
                            id: routine.id,
                            title: routine.title,
                            userId: routine.userId,
                            currentUserId: currentUserInfo.id,
                            currentUserEmail: currentUserInfo.email
                        });
                    }
                    return isMyRoutine;
                });
                
                if (validRoutines.length !== routines.length) {
                    console.log('Firebaseから読み込んだ他人のルーティンを除外:', routines.length - validRoutines.length);
                    routines = validRoutines;
                }
                
                // 完了データの所有者をチェック
                const validCompletions = completions.filter(completion => {
                    const isMyCompletion = isMyData(completion, 'completion');
                    if (!isMyCompletion) {
                        console.log('Firebaseから読み込んだ他人の完了データを除外:', {
                            routineId: completion.routineId,
                            date: completion.date,
                            userId: completion.userId,
                            currentUserId: currentUserInfo.id,
                            currentUserEmail: currentUserInfo.email
                        });
                    }
                    return isMyCompletion;
                });
                
                if (validCompletions.length !== completions.length) {
                    console.log('Firebaseから読み込んだ他人の完了データを除外:', completions.length - validCompletions.length);
                    completions = validCompletions;
                }
                
                console.log('Firebaseデータ所有者チェック完了');
                console.log('チェック後のルーティン数:', routines.length);
                console.log('チェック後の完了データ数:', completions.length);
                
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

// データの保存
async function saveData() {
    console.log('データ保存開始');
    console.log('現在のストレージタイプ:', currentStorage);
    console.log('現在のユーザー:', currentUserInfo);
    
    const data = {
        routines: routines,
        completions: completions,
        lastUpdated: new Date().toISOString()
    };
    
    try {
        // currentStorageが未定義の場合はローカルストレージを使用
        const storageType = currentStorage || 'local';
        
        switch (storageType) {
            case 'firebase':
                if (currentUserInfo && currentUserInfo.id) {
                    console.log('Firebaseに保存');
                    localStorage.setItem('appData', JSON.stringify(data));
                    localStorage.setItem('lastUpdated', data.lastUpdated);
                    
                    // Firebaseに同期（完了を待つ）
                    try {
                        if (typeof performActualSync === 'function') {
                            await performActualSync();
                            console.log('Firebase同期完了');
                        } else {
                            console.log('performActualSync関数が見つかりません');
                        }
                    } catch (error) {
                        console.error('Firebase同期エラー:', error);
                        showNotification('Firebase同期に失敗しました', 'error');
                    }
                } else {
                    console.log('ユーザー情報が不足しているため、ローカルストレージに保存');
                    localStorage.setItem('appData', JSON.stringify(data));
                    localStorage.setItem('lastUpdated', data.lastUpdated);
                }
                break;
            case 'google-drive':
                // Google Driveに保存（実装予定）
                console.log('Google Drive保存（未実装）');
                localStorage.setItem('appData', JSON.stringify(data));
                localStorage.setItem('lastUpdated', data.lastUpdated);
                break;
            default:
                // ローカルストレージに保存
                localStorage.setItem('appData', JSON.stringify(data));
                localStorage.setItem('lastUpdated', data.lastUpdated);
                console.log('ローカルストレージに保存完了');
                break;
        }
        
        console.log('データ保存完了');
        
    } catch (error) {
        console.error('データ保存エラー:', error);
        showNotification('データの保存に失敗しました', 'error');
    }
}

// 管理者ダッシュボードの表示
function showAdminDashboard() {
    console.log('管理者ダッシュボード表示');
    
    if (!isAdmin()) {
        showNotification('管理者権限が必要です', 'error');
        return;
    }
    
    const dashboard = document.getElementById('adminDashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        
        // 管理者データを読み込み
        loadAdminData();
        
        // デフォルトでユーザータブを表示
        showAdminTab('users');
    }
}

// 管理者ダッシュボードの非表示
function hideAdminDashboard() {
    console.log('管理者ダッシュボード非表示');
    
    const dashboard = document.getElementById('adminDashboard');
    if (dashboard) {
        dashboard.style.display = 'none';
    }
}

// 管理者タブの表示
function showAdminTab(tabName) {
    console.log('管理者タブ表示:', tabName);
    
    // すべてのタブコンテンツを非表示
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // すべてのタブボタンのアクティブ状態を解除
    const tabButtons = document.querySelectorAll('.admin-tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 選択されたタブを表示
    const selectedContent = document.getElementById(`${tabName}Tab`);
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    if (selectedButton) {
        selectedButton.classList.add('active');
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
    
    // 統計情報を読み込み
    loadAdminStats();
}

// ユーザーリストの読み込み
function loadUsersList() {
    console.log('ユーザーリスト読み込み');
    
    const usersList = document.getElementById('usersList');
    if (!usersList) {
        console.error('usersList要素が見つかりません');
        return;
    }
    
    const users = getAllUsers();
    console.log('全ユーザー数:', users.length);
    
    if (users.length === 0) {
        usersList.innerHTML = '<p class="empty-message">ユーザーが登録されていません</p>';
        return;
    }
    
    usersList.innerHTML = users.map(user => createUserItemHTML(user)).join('');
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 全ユーザーの取得
function getAllUsers() {
    console.log('全ユーザー取得開始');
    
    try {
        // ローカルストレージからユーザーを取得
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('ローカルストレージから取得したユーザー数:', users.length);
        
        // ユーザータイプを設定
        const usersWithType = users.map(user => ({
            ...user,
            userType: getUserTypeForUser(user.email)
        }));
        
        console.log('全ユーザー取得完了:', usersWithType.length);
        return usersWithType;
        
    } catch (error) {
        console.error('全ユーザー取得エラー:', error);
        return [];
    }
}

// ユーザーのユーザータイプを取得
function getUserTypeForUser(email) {
    if (email === 'yasnaries@gmail.com') {
        return 'admin';
    }
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    if (friendsList.includes(email)) {
        return 'friend';
    }
    
    return 'general';
}

// ユーザーアイテムのHTML生成
function createUserItemHTML(user) {
    const userTypeText = getUserTypeText(user.userType);
    const userTypeIcon = getUserTypeIcon(user.userType);
    
    return `
        <div class="user-item" data-email="${user.email}">
            <div class="user-info">
                <div class="user-avatar">
                    ${user.photoURL ? 
                        `<img src="${user.photoURL}" alt="プロフィール画像">` : 
                        `<div class="avatar-placeholder">${user.displayName.charAt(0).toUpperCase()}</div>`
                    }
                </div>
                <div class="user-details">
                    <div class="user-name">${user.displayName}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-type">
                        <i data-lucide="${userTypeIcon}"></i>
                        ${userTypeText}
                    </div>
                </div>
            </div>
            <div class="user-actions">
                ${user.userType === 'general' ? 
                    `<button class="action-btn friend-btn" onclick="markAsFriend('${user.email}')" title="友達に追加">
                        <i data-lucide="user-plus"></i>
                    </button>` : 
                    user.userType === 'friend' ? 
                    `<button class="action-btn unfriend-btn" onclick="removeFriend('${user.email}')" title="友達から削除">
                        <i data-lucide="user-minus"></i>
                    </button>` : 
                    ''
                }
                ${user.userType !== 'admin' ? 
                    `<button class="action-btn delete-btn" onclick="removeUser('${user.email}')" title="ユーザーを削除">
                        <i data-lucide="trash"></i>
                    </button>` : 
                    ''
                }
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
        default: return '不明';
    }
}

// ユーザータイプのアイコン取得
function getUserTypeIcon(userType) {
    switch (userType) {
        case 'admin': return 'shield';
        case 'friend': return 'users';
        case 'general': return 'user';
        default: return 'help-circle';
    }
}

// 友達に追加
function markAsFriend(email) {
    console.log('友達に追加:', email);
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    if (!friendsList.includes(email)) {
        friendsList.push(email);
        localStorage.setItem('friendsList', JSON.stringify(friendsList));
        
        showNotification(`${email}を友達に追加しました`, 'success');
        
        // ユーザーリストを更新
        loadUsersList();
    } else {
        showNotification(`${email}は既に友達です`, 'info');
    }
}

// 友達から削除
function removeFriend(email) {
    console.log('友達から削除:', email);
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    const updatedFriendsList = friendsList.filter(friend => friend !== email);
    localStorage.setItem('friendsList', JSON.stringify(updatedFriendsList));
    
    showNotification(`${email}を友達から削除しました`, 'success');
    
    // ユーザーリストを更新
    loadUsersList();
}

// ユーザーを削除
function removeUser(email) {
    console.log('ユーザー削除:', email);
    
    if (email === 'yasnaries@gmail.com') {
        showNotification('管理者は削除できません', 'error');
        return;
    }
    
    if (confirm(`${email}を削除しますか？この操作は取り消せません。`)) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.filter(user => user.email !== email);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // 友達リストからも削除
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        const updatedFriendsList = friendsList.filter(friend => friend !== email);
        localStorage.setItem('friendsList', JSON.stringify(updatedFriendsList));
        
        showNotification(`${email}を削除しました`, 'success');
        
        // ユーザーリストを更新
        loadUsersList();
    }
}

// 友達リストの読み込み
function loadFriendsList() {
    console.log('友達リスト読み込み');
    
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) {
        console.error('friendsList要素が見つかりません');
        return;
    }
    
    const friends = JSON.parse(localStorage.getItem('friendsList') || '[]');
    console.log('友達数:', friends.length);
    
    if (friends.length === 0) {
        friendsList.innerHTML = '<p class="empty-message">友達が登録されていません</p>';
        return;
    }
    
    friendsList.innerHTML = friends.map(email => createFriendItemHTML(email)).join('');
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 友達アイテムのHTML生成
function createFriendItemHTML(email) {
    return `
        <div class="friend-item" data-email="${email}">
            <div class="friend-info">
                <div class="friend-avatar">
                    <div class="avatar-placeholder">${email.charAt(0).toUpperCase()}</div>
                </div>
                <div class="friend-details">
                    <div class="friend-email">${email}</div>
                    <div class="friend-type">
                        <i data-lucide="users"></i>
                        友達
                    </div>
                </div>
            </div>
            <div class="friend-actions">
                <button class="action-btn unfriend-btn" onclick="removeFriend('${email}')" title="友達から削除">
                    <i data-lucide="user-minus"></i>
                </button>
            </div>
        </div>
    `;
}

// 管理者統計の読み込み
function loadAdminStats() {
    console.log('管理者統計読み込み');
    
    const statsContainer = document.getElementById('adminStats');
    if (!statsContainer) {
        console.error('adminStats要素が見つかりません');
        return;
    }
    
    const users = getAllUsers();
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.userType === 'admin').length;
    const friendUsers = users.filter(user => user.userType === 'friend').length;
    const generalUsers = users.filter(user => user.userType === 'general').length;
    
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${totalUsers}</div>
                <div class="stat-label">総ユーザー数</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${adminUsers}</div>
                <div class="stat-label">管理者</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${friendUsers}</div>
                <div class="stat-label">友達</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${generalUsers}</div>
                <div class="stat-label">一般ユーザー</div>
            </div>
        </div>
        <div class="stats-actions">
            <button class="action-btn" onclick="showDataDebugInfo()">
                <i data-lucide="database"></i>
                データデバッグ情報
            </button>
        </div>
    `;
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 友達追加モーダルの表示
function showAddFriendModal() {
    console.log('友達追加モーダル表示');
    
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 友達追加モーダルの非表示
function hideAddFriendModal() {
    console.log('友達追加モーダル非表示');
    
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'none';
        
        // 入力フィールドをクリア
        const emailInput = document.getElementById('friendEmail');
        if (emailInput) {
            emailInput.value = '';
        }
    }
}

// 友達を追加
function addFriend() {
    console.log('友達追加');
    
    const emailInput = document.getElementById('friendEmail');
    if (!emailInput) {
        console.error('friendEmail要素が見つかりません');
        return;
    }
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('メールアドレスを入力してください', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('有効なメールアドレスを入力してください', 'warning');
        return;
    }
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    if (friendsList.includes(email)) {
        showNotification(`${email}は既に友達です`, 'info');
        return;
    }
    
    friendsList.push(email);
    localStorage.setItem('friendsList', JSON.stringify(friendsList));
    
    showNotification(`${email}を友達に追加しました`, 'success');
    hideAddFriendModal();
    
    // 友達リストを更新
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
        showNotification('ルーティンが見つかりません', 'error');
        return;
    }
    
    showEditForm(routine);
}

// ルーティンの削除
function deleteRoutine(routineId) {
    console.log('ルーティン削除:', routineId);
    
    const routine = routines.find(r => r.id === routineId);
    if (!routine) {
        showNotification('ルーティンが見つかりません', 'error');
        return;
    }
    
    if (confirm(`「${routine.title}」を削除しますか？この操作は取り消せません。`)) {
        // ルーティンを削除
        const index = routines.findIndex(r => r.id === routineId);
        if (index !== -1) {
            routines.splice(index, 1);
        }
        
        // 関連する完了データも削除
        completions = completions.filter(c => c.routineId !== routineId);
        
        // データを保存
        saveData();
        
        // 表示を更新
        displayTodayRoutines();
        displayAllRoutines();
        
        showNotification('ルーティンを削除しました', 'success');
    }
}

// 編集フォームの表示
function showEditForm(routine) {
    console.log('編集フォーム表示:', routine);
    
    const editForm = document.getElementById('editForm');
    if (!editForm) {
        console.error('editForm要素が見つかりません');
        return;
    }
    
    // フォームに値を設定
    document.getElementById('editTitle').value = routine.title;
    document.getElementById('editDescription').value = routine.description || '';
    document.getElementById('editTime').value = routine.time || '';
    
    // 頻度を設定
    const frequencyButtons = editForm.querySelectorAll('.frequency-btn');
    frequencyButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.frequency === routine.frequency) {
            btn.classList.add('active');
        }
    });
    
    // 編集フォームを表示
    editForm.style.display = 'block';
    
    // ルーティンIDを保存
    editForm.dataset.routineId = routine.id;
}

// 編集されたルーティンの保存
async function saveEditedRoutine(routineId) {
    console.log('編集されたルーティンを保存:', routineId);
    
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const time = document.getElementById('editTime').value;
    
    if (!title) {
        showNotification('タイトルを入力してください', 'warning');
        return;
    }
    
    // 頻度を取得
    const activeFrequencyBtn = document.querySelector('#editForm .frequency-btn.active');
    const frequency = activeFrequencyBtn ? activeFrequencyBtn.dataset.frequency : 'daily';
    
    // ルーティンを更新
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
        routine.title = title;
        routine.description = description;
        routine.time = time;
        routine.frequency = frequency;
        routine.updatedAt = new Date().toISOString();
        
        // データを保存
        await saveData();
        
        // 表示を更新
        displayTodayRoutines();
        displayAllRoutines();
        
        // 編集フォームを非表示
        hideEditForm();
        
        showNotification('ルーティンを更新しました', 'success');
    }
}

// 編集フォームの非表示
function hideEditForm() {
    console.log('編集フォーム非表示');
    
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.style.display = 'none';
    }
}

// 頻度オプションの表示
function showFrequencyOptions(formType, selectedFrequency) {
    console.log('頻度オプション表示:', formType, selectedFrequency);
    
    const frequencyContainer = document.getElementById(`${formType}FrequencyOptions`);
    if (!frequencyContainer) {
        console.error(`${formType}FrequencyOptions要素が見つかりません`);
        return;
    }
    
    frequencyContainer.innerHTML = `
        <div class="frequency-buttons">
            <button type="button" class="frequency-btn ${selectedFrequency === 'daily' ? 'active' : ''}" data-frequency="daily" onclick="selectFrequency('${formType}', 'daily')">
                <i data-lucide="calendar"></i>
                毎日
            </button>
            <button type="button" class="frequency-btn ${selectedFrequency === 'weekly' ? 'active' : ''}" data-frequency="weekly" onclick="selectFrequency('${formType}', 'weekly')">
                <i data-lucide="calendar-days"></i>
                毎週
            </button>
            <button type="button" class="frequency-btn ${selectedFrequency === 'monthly' ? 'active' : ''}" data-frequency="monthly" onclick="selectFrequency('${formType}', 'monthly')">
                <i data-lucide="calendar-range"></i>
                毎月
            </button>
        </div>
    `;
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 頻度の選択
function selectFrequency(formType, frequency) {
    console.log('頻度選択:', formType, frequency);
    
    // すべての頻度ボタンのアクティブ状態を解除
    const frequencyButtons = document.querySelectorAll(`#${formType}FrequencyOptions .frequency-btn`);
    frequencyButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 選択された頻度ボタンをアクティブにする
    const selectedButton = document.querySelector(`#${formType}FrequencyOptions .frequency-btn[data-frequency="${frequency}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // 選択された頻度を保存
    window[`${formType}SelectedFrequency`] = frequency;
}

// ルーティンフォームの送信処理
async function handleRoutineFormSubmit(event) {
    event.preventDefault();
    console.log('ルーティンフォーム送信開始');
    
    // フォームデータを取得
    const title = document.getElementById('routineName').value.trim();
    const description = document.getElementById('routineDesc').value.trim();
    
    // 現在アクティブな頻度ボタンを取得
    const activeTab = document.querySelector('#addRoutineForm .tab.active');
    const frequency = activeTab ? activeTab.dataset.freq : 'daily';
    
    console.log('フォームデータ:', { title, description, frequency });
    
    if (!title) {
        showNotification('ルーティン名を入力してください', 'warning');
        return;
    }
    
    // 週次・月次の追加オプションを取得
    let weeklyDays = [];
    let monthlyDate = null;
    
    if (frequency === 'weekly') {
        const weekdayInputs = document.querySelectorAll('#weeklyDays input[type="checkbox"]:checked');
        weeklyDays = Array.from(weekdayInputs).map(input => parseInt(input.value));
        if (weeklyDays.length === 0) {
            showNotification('曜日を選択してください', 'warning');
            return;
        }
    }
    
    if (frequency === 'monthly') {
        const monthlyDateInput = document.getElementById('monthlyDateInput');
        monthlyDate = monthlyDateInput ? parseInt(monthlyDateInput.value) : null;
        if (!monthlyDate || monthlyDate < 1 || monthlyDate > 31) {
            showNotification('有効な日付（1-31）を入力してください', 'warning');
            return;
        }
    }
    
    // ルーティンデータを作成
    const routineData = {
        title: title,
        description: description,
        frequency: frequency,
        weeklyDays: weeklyDays,
        monthlyDate: monthlyDate
    };
    
    console.log('ルーティンデータ:', routineData);
    
    try {
        // ルーティンを追加
        await addRoutine(routineData);
        
        // 成功通知
        showNotification('ルーティンを追加しました', 'success');
        
        // フォームをリセット
        event.target.reset();
        
        // 頻度オプションをリセット
        const tabs = document.querySelectorAll('#addRoutineForm .tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector('#addRoutineForm .tab[data-freq="daily"]').classList.add('active');
        
        // 週次・月次のオプションを非表示
        document.getElementById('weeklyDays').classList.add('hidden');
        document.getElementById('monthlyDate').classList.add('hidden');
        
        // メイン画面に戻る
        showScreen('mainView');
        
    } catch (error) {
        console.error('ルーティン追加エラー:', error);
        showNotification('ルーティンの追加に失敗しました', 'error');
    }
}

// 頻度ボタンのクリック処理
function handleFrequencyButtonClick(event) {
    console.log('頻度ボタンクリック');
    
    const button = event.target.closest('.frequency-btn');
    if (!button) return;
    
    const frequency = button.dataset.frequency;
    console.log('選択された頻度:', frequency);
    
    // ルーティン追加画面の頻度ボタンの場合
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    if (addRoutineScreen && addRoutineScreen.contains(button)) {
        // すべての頻度ボタンのアクティブ状態を解除
        const allFrequencyButtons = addRoutineScreen.querySelectorAll('.frequency-btn');
        allFrequencyButtons.forEach(btn => btn.classList.remove('active'));
        
        // クリックされたボタンをアクティブにする
        button.classList.add('active');
        
        // 頻度を保存
        document.getElementById('addRoutineFrequency').value = frequency;
        
        // 週次・月次の追加オプションを表示/非表示
        const weeklyDaysRow = document.getElementById('addWeeklyDaysRow');
        const monthlyDateRow = document.getElementById('addMonthlyDateRow');
        
        if (weeklyDaysRow) {
            weeklyDaysRow.style.display = frequency === 'weekly' ? 'block' : 'none';
        }
        if (monthlyDateRow) {
            monthlyDateRow.style.display = frequency === 'monthly' ? 'block' : 'none';
        }
        
        return;
    }
    
    // 編集フォームの頻度ボタンの場合（既存の処理）
    const formType = button.closest('.frequency-options')?.id.replace('FrequencyOptions', '');
    if (formType) {
        selectFrequency(formType, frequency);
    }
}

// タブボタンのクリック処理
function handleTabButtonClick(event) {
    console.log('タブボタンクリック');
    
    const button = event.target.closest('.tab-button');
    if (!button) return;
    
    const frequency = button.dataset.frequency;
    filterRoutinesByFrequency(frequency, button);
}

// 頻度によるルーティンのフィルタリング
function filterRoutinesByFrequency(frequency, clickedButton) {
    console.log('頻度フィルタリング:', frequency);
    
    // すべてのタブボタンのアクティブ状態を解除
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // クリックされたボタンをアクティブにする
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // 現在のユーザーのルーティンのみをフィルタ
    const myRoutines = routines.filter(routine => {
        const isMyRoutine = isMyData(routine, 'routine');
        return isMyRoutine;
    });
    
    // 頻度でフィルタ
    let filteredRoutines;
    switch (frequency) {
        case 'all':
            filteredRoutines = myRoutines;
            break;
        case 'daily':
            filteredRoutines = myRoutines.filter(routine => routine.frequency === 'daily');
            break;
        case 'weekly':
            filteredRoutines = myRoutines.filter(routine => routine.frequency === 'weekly');
            break;
        case 'monthly':
            filteredRoutines = myRoutines.filter(routine => routine.frequency === 'monthly');
            break;
        default:
            filteredRoutines = myRoutines;
    }
    
    // ルーティンリストを更新
    const allRoutinesList = document.getElementById('allList');
    if (allRoutinesList) {
        if (filteredRoutines.length === 0) {
            allRoutinesList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list" class="empty-icon"></i>
                    <h3>ルーティンがありません</h3>
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
    
    console.log('フィルタリング完了:', filteredRoutines.length);
}

// データデバッグ情報の表示
function showDataDebugInfo() {
    console.log('データデバッグ情報表示');
    
    const debugInfo = {
        currentUser: currentUserInfo,
        currentStorage: currentStorage,
        routines: routines,
        completions: completions,
        localStorage: {
            users: JSON.parse(localStorage.getItem('users') || '[]'),
            friendsList: JSON.parse(localStorage.getItem('friendsList') || '[]'),
            appData: localStorage.getItem('appData'),
            lastUpdated: localStorage.getItem('lastUpdated'),
            userInfo: localStorage.getItem('userInfo'),
            userType: localStorage.getItem('userType'),
            currentStorage: localStorage.getItem('currentStorage')
        }
    };
    
    // デバッグ情報をコンソールに出力
    console.log('=== データデバッグ情報 ===');
    console.log('現在のユーザー:', debugInfo.currentUser);
    console.log('現在のストレージ:', debugInfo.currentStorage);
    console.log('ルーティン数:', debugInfo.routines.length);
    console.log('完了データ数:', debugInfo.completions.length);
    console.log('ローカルストレージ:', debugInfo.localStorage);
    
    // アラートで表示
    const message = `
データデバッグ情報:

現在のユーザー: ${debugInfo.currentUser ? debugInfo.currentUser.email : 'なし'}
現在のストレージ: ${debugInfo.currentStorage}
ルーティン数: ${debugInfo.routines.length}
完了データ数: ${debugInfo.completions.length}
ローカルユーザー数: ${debugInfo.localStorage.users.length}
友達数: ${debugInfo.localStorage.friendsList.length}

詳細はコンソールを確認してください。
    `;
    
    alert(message);
}

// データ状態のログ出力
function logDataState(context) {
    console.log(`=== データ状態ログ [${context}] ===`);
    console.log('currentUserInfo:', currentUserInfo);
    console.log('currentStorage:', currentStorage);
    console.log('routines:', routines);
    console.log('completions:', completions);
    console.log('=== データ状態ログ終了 ===');
}

// アプリ初期化関数
function initializeApp() {
    console.log('アプリ初期化開始');

    // simpleAuthの初期化
    if (typeof startSimpleAuth === 'function') {
        if (!window.simpleAuth) {
            window.simpleAuth = startSimpleAuth();
            console.log('simpleAuth初期化完了:', window.simpleAuth);
        } else {
            console.log('simpleAuthは既に初期化済み');
        }
    } else {
        console.error('startSimpleAuth関数が見つかりません');
    }

    try {
        // イベントリスナーの設定
        setupEventListeners();
        
        // 認証状態の確認
        const isAuthenticated = checkAuthState();
        
        if (!isAuthenticated) {
            console.log('未認証 - 認証画面を表示');
            showScreen('authView');
        } else {
            console.log('認証済み - メインアプリを表示');
            // checkAuthState内でshowMainAppが呼ばれる
        }
        
        // Lucideアイコンの初期化
        if (window.lucide) {
            lucide.createIcons();
        }
        
        console.log('アプリ初期化完了');
        
    } catch (error) {
        console.error('アプリ初期化エラー:', error);
        showNotification('アプリの初期化中にエラーが発生しました', 'error');
    }
}

// グローバルスコープに関数を明示的に公開
window.displayTodayRoutines = displayTodayRoutines;
window.displayAllRoutines = displayAllRoutines;
window.createRoutineHTML = createRoutineHTML;
window.getFrequencyText = getFrequencyText;
window.isRoutineCompletedToday = isRoutineCompletedToday;
window.isMyData = isMyData;
window.setupEventListeners = setupEventListeners;
window.initializeApp = initializeApp;
window.checkAuthState = checkAuthState;
window.showScreen = showScreen;
window.login = login;
window.register = register;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showMainApp = showMainApp;
window.initializeData = initializeData;
window.handleRoutineFormSubmit = handleRoutineFormSubmit;
window.handleFrequencyButtonClick = handleFrequencyButtonClick;
window.handleTabButtonClick = handleTabButtonClick;
window.addRoutine = addRoutine;
window.logout = logout;
window.showNotification = showNotification;
window.showDataDebugInfo = showDataDebugInfo;

// デバッグ用の関数
window.debugRoutineAddition = function() {
    console.log('=== ルーティン追加デバッグ開始 ===');
    console.log('currentUserInfo:', currentUserInfo);
    console.log('routines:', routines);
    console.log('addRoutineBtn要素:', document.getElementById('addRoutineBtn'));
    console.log('addRoutineScreen要素:', document.getElementById('addRoutineScreen'));
    console.log('routineForm要素:', document.getElementById('routineForm'));
    console.log('setupEventListeners関数:', typeof setupEventListeners);
    console.log('showScreen関数:', typeof showScreen);
    console.log('handleRoutineFormSubmit関数:', typeof handleRoutineFormSubmit);
    console.log('=== ルーティン追加デバッグ終了 ===');
};

// ルーティンの追加
async function addRoutine(routineData) {
    console.log('ルーティン追加:', routineData);
    
    if (!currentUserInfo) {
        console.error('ユーザー情報がありません');
        showNotification('ユーザー情報が不足しています', 'error');
        return;
    }
    
    const newRoutine = {
        id: Date.now().toString(),
        title: routineData.title,
        description: routineData.description,
        frequency: routineData.frequency,
        weeklyDays: routineData.weeklyDays || [],
        monthlyDate: routineData.monthlyDate || null,
        createdAt: new Date().toISOString(),
        userId: currentUserInfo.id
    };
    
    console.log('新しいルーティン:', newRoutine);
    
    try {
        routines.push(newRoutine);
        await saveData();
        
        // 表示を更新
        displayTodayRoutines();
        displayAllRoutines();
        
        console.log('ルーティン追加完了');
        
    } catch (error) {
        console.error('ルーティン追加エラー:', error);
        showNotification('ルーティンの追加に失敗しました', 'error');
    }
}

// 通知の表示
function showNotification(message, type = 'info') {
    console.log('通知表示:', message, type);
    
    // シンプルなアラートで表示（後で改善可能）
    alert(`${type.toUpperCase()}: ${message}`);
}

// ログアウト関数
async function logout() {
    console.log('ログアウト開始');
    
    try {
        // Firebase認証からログアウト
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
            console.log('Firebase認証からログアウト完了');
        }
        
        // グローバル変数をリセット
        currentUserInfo = null;
        window.currentUserInfo = null;
        routines = [];
        window.routines = routines;
        completions = [];
        window.completions = completions;
        
        // ローカルストレージからユーザー情報を削除
        localStorage.removeItem('userInfo');
        
        // 認証画面を表示
        showScreen('authView');
        
        console.log('ログアウト完了');
        
    } catch (error) {
        console.error('ログアウトエラー:', error);
        // エラーが発生しても認証画面を表示
        showScreen('authView');
    }
}

// デバッグ認証処理
function handleDebugAuth() {
    console.log('デバッグ認証開始');
    
    if (!window.simpleAuth) {
        alert('認証システムが利用できません');
        return;
    }
    
    // 全ユーザーを表示
    const users = window.simpleAuth.listAllUsers();
    
    if (users.length === 0) {
        alert('登録されているユーザーがありません');
        return;
    }
    
    // パスワードリセットの選択
    const email = prompt(
        'パスワードをリセットするユーザーのメールアドレスを入力してください:\n\n' +
        '登録済みユーザー:\n' +
        users.map(user => `- ${user.email}`).join('\n')
    );
    
    if (!email) {
        console.log('パスワードリセットをキャンセルしました');
        return;
    }
    
    if (!window.simpleAuth.users[email]) {
        alert('指定されたユーザーが見つかりません');
        return;
    }
    
    // 新しいパスワードを入力
    const newPassword = prompt(
        `ユーザー "${email}" の新しいパスワードを入力してください:`
    );
    
    if (!newPassword) {
        console.log('パスワードリセットをキャンセルしました');
        return;
    }
    
    // パスワードをリセット
    const result = window.simpleAuth.resetPassword(email, newPassword);
    
    if (result.success) {
        alert(`パスワードをリセットしました！\n\nメール: ${email}\n新しいパスワード: ${newPassword}\n\nこのパスワードでログインしてください。`);
        console.log('パスワードリセット成功:', result.message);
    } else {
        alert(`パスワードリセットに失敗しました: ${result.message}`);
        console.error('パスワードリセット失敗:', result.message);
    }
}

console.log('=== script-new.js 読み込み完了 ===');
console.log('グローバル関数公開完了');