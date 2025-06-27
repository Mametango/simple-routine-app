// 洗練されたログイン画面用のJavaScript

// デバッグ情報
console.log('=== script-new.js 読み込み開始 ===');
console.log('バージョン: 1.0.7');
console.log('読み込み時刻:', new Date().toISOString());

// 関数の存在チェックとグローバル公開を即座に実行
(function() {
    console.log('=== 関数存在チェック開始 ===');
    
    // グローバル変数の定義
    let currentUserInfo = null;
    let currentStorage = 'local';
    let routines = [];
    let completions = [];
    let isGoogleLoginInProgress = false; // ログイン処理中のフラグ

    // グローバルフラグを設定（Firebase設定からアクセス可能にする）
    window.isGoogleLoginInProgress = false;
    
    // グローバル変数をwindowに公開
    window.currentUserInfo = currentUserInfo;
    window.currentStorage = currentStorage;
    window.routines = routines;
    window.completions = completions;
    
    console.log('=== 関数存在チェック完了 ===');
})();

// グローバル変数の定義
let currentUserInfo = null;
let currentStorage = 'local';
let routines = [];
let completions = [];
let isGoogleLoginInProgress = false; // ログイン処理中のフラグ

// グローバルフラグを設定（Firebase設定からアクセス可能にする）
window.isGoogleLoginInProgress = false;

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
    
    const todayRoutinesList = document.getElementById('todayRoutinesList');
    if (!todayRoutinesList) {
        console.error('todayRoutinesList要素が見つかりません');
        return;
    }
    
    // 今日実行すべきルーティンをフィルタ
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
    
    console.log('今日実行すべきルーティン数:', todayRoutines.length);
    
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
    
    console.log('今日のルーティン表示完了');
}

// 全ルーティンを表示
function displayAllRoutines() {
    console.log('全ルーティン表示開始');
    console.log('現在のユーザーID:', currentUserInfo?.id);
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
    
    const allRoutinesList = document.getElementById('allRoutinesList');
    if (!allRoutinesList) {
        console.error('allRoutinesList要素が見つかりません');
        return;
    }
    
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
    
    console.log('全ルーティン表示完了');
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
        // 重要な要素の存在確認
        console.log('要素存在確認:');
        console.log('- authForm:', !!document.getElementById('authForm'));
        console.log('- googleLoginBtn:', !!document.getElementById('googleLoginBtn'));
        console.log('- registerForm:', !!document.getElementById('registerForm'));
        console.log('- routineForm:', !!document.getElementById('routineForm'));
        console.log('- addRoutineBtn:', !!document.getElementById('addRoutineBtn'));
        console.log('- addRoutineScreen:', !!document.getElementById('addRoutineScreen'));
        console.log('- app:', !!document.getElementById('app'));
        console.log('- backBtn:', !!document.querySelector('.back-btn'));
        console.log('- cancelButton:', !!document.querySelector('.cancel-button'));
        console.log('- frequencyButtons:', document.querySelectorAll('.frequency-btn').length);
        console.log('- tabButtons:', document.querySelectorAll('.tab-button').length);
        
        // ログインフォーム
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', handleLogin);
            console.log('✅ authFormイベントリスナー設定完了');
        } else {
            console.warn('❌ authForm要素が見つかりません');
        }
        
        // Googleログインボタン
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', handleGoogleLogin);
            console.log('Googleログインボタンイベントリスナー設定完了');
        } else {
            console.warn('googleLoginBtn要素が見つかりません');
        }
        
        // 登録フォーム
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        // ルーティン追加フォーム
        const routineForm = document.getElementById('routineForm');
        if (routineForm) {
            routineForm.addEventListener('submit', (event) => {
                console.log('ルーティンフォームが送信されました');
                handleRoutineFormSubmit(event);
            });
            console.log('routineFormイベントリスナー設定完了');
        } else {
            console.warn('routineForm要素が見つかりません');
        }
        
        // 頻度ボタン
        const frequencyButtons = document.querySelectorAll('.frequency-btn');
        console.log('頻度ボタン数:', frequencyButtons.length);
        frequencyButtons.forEach((button, index) => {
            button.addEventListener('click', (event) => {
                console.log(`頻度ボタン${index + 1}がクリックされました:`, button.dataset.frequency);
                handleFrequencyButtonClick(event);
            });
        });
        console.log('頻度ボタンイベントリスナー設定完了');
        
        // タブボタン
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', handleTabButtonClick);
        });
        
        // 画面切り替えボタン
        const addRoutineBtn = document.getElementById('addRoutineBtn');
        if (addRoutineBtn) {
            addRoutineBtn.addEventListener('click', () => {
                console.log('ルーティン追加ボタンがクリックされました');
                showScreen('add');
            });
            console.log('addRoutineBtnイベントリスナー設定完了');
        } else {
            console.warn('addRoutineBtn要素が見つかりません');
        }
        
        const backToMainBtn = document.getElementById('backToMainBtn');
        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', () => showScreen('main'));
        }
        
        // ルーティン追加画面の戻るボタン
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('戻るボタンがクリックされました');
                showScreen('main');
            });
            console.log('backBtnイベントリスナー設定完了');
        } else {
            console.warn('backBtn要素が見つかりません');
        }
        
        // ルーティン追加画面のキャンセルボタン
        const cancelButton = document.querySelector('.cancel-button');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                console.log('キャンセルボタンがクリックされました');
                showScreen('main');
            });
            console.log('cancelButtonイベントリスナー設定完了');
        } else {
            console.warn('cancelButton要素が見つかりません');
        }
        
        // ストレージ選択モーダル
        const storageModal = document.getElementById('storageModal');
        if (storageModal) {
            const closeBtn = storageModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', hideStorageModal);
            }
        }
        
        // 管理者ダッシュボード
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', showAdminDashboard);
        }
        
        const closeAdminBtn = document.getElementById('closeAdminBtn');
        if (closeAdminBtn) {
            closeAdminBtn.addEventListener('click', hideAdminDashboard);
        }
        
        // ログアウトボタン
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        console.log('イベントリスナー設定完了');
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
            console.log('ローカルストレージからユーザー情報を取得:', currentUserInfo);
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
                console.log('Firebase認証状態からユーザー情報を取得:', currentUserInfo);
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
    
    const data = {
        routines: routines,
        completions: completions,
        lastUpdated: new Date().toISOString()
    };
    
    try {
        switch (currentStorage) {
            case 'firebase':
                if (currentUserInfo && currentUserInfo.id) {
                    console.log('Firebaseに保存');
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
    
    // 同期状態の更新（安全な呼び出し）
    if (typeof updateSyncStatus === 'function') {
        updateSyncStatus();
    } else {
        console.warn('updateSyncStatus関数が見つかりません');
    }
    
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
    
    let status = 'Firebase初期化状態:\n\n';
    
    // Firebase SDKの確認
    if (typeof firebase === 'undefined') {
        status += '❌ Firebase SDKが読み込まれていません\n';
    } else {
        status += '✅ Firebase SDKが読み込まれています\n';
        
        // 初期化状態の確認
        try {
            const app = firebase.app();
            status += `✅ Firebase初期化済み (${app.name})\n`;
            
            // 設定の確認
            const config = app.options;
            status += `✅ API Key: ${config.apiKey ? '設定済み' : '未設定'}\n`;
            status += `✅ Auth Domain: ${config.authDomain ? '設定済み' : '未設定'}\n`;
            status += `✅ Project ID: ${config.projectId ? '設定済み' : '未設定'}\n`;
            
        } catch (error) {
            status += `❌ Firebase初期化エラー: ${error.message}\n`;
        }
    }
    
    alert(status);
}

// ユーザー情報をクリア
function clearUserInfo() {
    console.log('ユーザー情報クリア開始');
    
    // ローカルストレージから削除
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userType');
    
    // グローバル変数をリセット
    currentUserInfo = null;
    
    console.log('ユーザー情報クリア完了');
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
    
    let status = 'Firebase初期化状態:\n\n';
    
    // Firebase SDKの確認
    if (typeof firebase === 'undefined') {
        status += '❌ Firebase SDKが読み込まれていません\n';
    } else {
        status += '✅ Firebase SDKが読み込まれています\n';
        
        // 初期化状態の確認
        try {
            const app = firebase.app();
            status += `✅ Firebase初期化済み (${app.name})\n`;
            
            // 設定の確認
            const config = app.options;
            status += `✅ API Key: ${config.apiKey ? '設定済み' : '未設定'}\n`;
            status += `✅ Auth Domain: ${config.authDomain ? '設定済み' : '未設定'}\n`;
            status += `✅ Project ID: ${config.projectId ? '設定済み' : '未設定'}\n`;
            
        } catch (error) {
            status += `❌ Firebase初期化エラー: ${error.message}\n`;
        }
    }
    
    alert(status);
}

// 手動同期
function manualSync() {
    console.log('手動同期開始');
    
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> 同期中...';
    }
    
    performActualSync().finally(() => {
        if (syncBtn) {
            syncBtn.disabled = false;
            syncBtn.innerHTML = '<i data-lucide="refresh-cw"></i> 同期';
        }
    });
}

// 実際の同期処理
async function performActualSync() {
    console.log('実際の同期処理開始');
    
    try {
        switch (currentStorage) {
            case 'firebase':
                await syncWithFirebase();
                break;
            case 'google-drive':
                await syncWithGoogleDrive();
                break;
            default:
                await syncWithLocalStorage();
                break;
        }
        
        showNotification('同期が完了しました', 'success');
        console.log('同期処理完了');
        
    } catch (error) {
        console.error('同期処理エラー:', error);
        showNotification('同期に失敗しました: ' + error.message, 'error');
    }
}

// Firebaseとの同期
async function syncWithFirebase() {
    console.log('Firebase同期開始');
    
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        throw new Error('Firebaseが利用できません');
    }
    
    if (!currentUserInfo || !currentUserInfo.id) {
        throw new Error('ユーザー情報が不足しています');
    }
    
    const db = firebase.firestore();
    const userId = currentUserInfo.id;
    
    const data = {
        routines: routines,
        completions: completions,
        lastUpdated: new Date().toISOString()
    };
    
    await db.collection('users').doc(userId).set({
        data: data,
        updatedAt: new Date()
    });
    
    console.log('Firebase同期完了');
}

// Google Driveとの同期
async function syncWithGoogleDrive() {
    console.log('Google Drive同期開始');
    
    if (typeof window.googleDriveStorage === 'undefined') {
        throw new Error('Google Driveストレージが利用できません');
    }
    
    const data = {
        routines: routines,
        completions: completions,
        lastUpdated: new Date().toISOString()
    };
    
    const success = await window.googleDriveStorage.saveData(data);
    
    if (!success) {
        throw new Error('Google Driveへの保存に失敗しました');
    }
    
    console.log('Google Drive同期完了');
}

// ローカルストレージとの同期
async function syncWithLocalStorage() {
    console.log('ローカルストレージ同期開始');
    
    const data = {
        routines: routines,
        completions: completions,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('appData', JSON.stringify(data));
    localStorage.setItem('lastUpdated', data.lastUpdated);
    
    console.log('ローカルストレージ同期完了');
}

// 通知の表示
function showNotification(message, type = 'info') {
    console.log('通知表示:', message, type);
    
    // 既存の通知を削除
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;
    
    // 通知を表示
    document.body.appendChild(notification);
    
    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // 自動で削除（5秒後）
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ストレージ設定モーダルの表示
function showStorageModal() {
    console.log('ストレージ設定モーダル表示');
    
    const modal = document.getElementById('storageModal');
    if (modal) {
        modal.style.display = 'block';
        
        // 現在のストレージ設定を表示
        const currentStorageName = getStorageDisplayName(currentStorage);
        const currentStorageElement = document.getElementById('currentStorage');
        if (currentStorageElement) {
            currentStorageElement.textContent = currentStorageName;
        }
    }
}

// ストレージ設定モーダルの非表示
function hideStorageModal() {
    console.log('ストレージ設定モーダル非表示');
    
    const modal = document.getElementById('storageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ストレージの選択
function selectStorage(storageType) {
    console.log('ストレージ選択:', storageType);
    
    // 選択されたストレージをハイライト
    const storageOptions = document.querySelectorAll('.storage-option');
    storageOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[data-storage="${storageType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // 選択されたストレージを保存
    window.selectedStorage = storageType;
}

// ストレージ選択の確認
function confirmStorageSelection() {
    console.log('ストレージ選択確認');
    
    const selectedStorage = window.selectedStorage;
    if (!selectedStorage) {
        showNotification('ストレージを選択してください', 'warning');
        return;
    }
    
    // ストレージを変更
    currentStorage = selectedStorage;
    localStorage.setItem('currentStorage', selectedStorage);
    
    // 同期状態を更新
    updateSyncStatus();
    
    // モーダルを閉じる
    hideStorageModal();
    
    showNotification(`${getStorageDisplayName(selectedStorage)}に変更しました`, 'success');
}

// ストレージ表示名の取得
function getStorageDisplayName(storageType) {
    switch (storageType) {
        case 'firebase':
            return 'Firebase';
        case 'google-drive':
            return 'Google Drive';
        case 'local':
        default:
            return 'ローカルストレージ';
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
    console.log('ルーティンフォーム送信');
    
    const title = document.getElementById('routineName').value.trim();
    const description = document.getElementById('routineDescription').value.trim();
    const frequency = document.getElementById('addRoutineFrequency').value || 'daily';
    
    if (!title) {
        showNotification('ルーティン名を入力してください', 'warning');
        return;
    }
    
    // 週次・月次の追加オプションを取得
    let weeklyDays = [];
    let monthlyDate = null;
    
    if (frequency === 'weekly') {
        const weekdayInputs = document.querySelectorAll('.add-weekday-input:checked');
        weeklyDays = Array.from(weekdayInputs).map(input => parseInt(input.value));
        if (weeklyDays.length === 0) {
            showNotification('曜日を選択してください', 'warning');
            return;
        }
    }
    
    if (frequency === 'monthly') {
        const monthlyDateInput = document.getElementById('addMonthlyDateInput');
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
    
    // ルーティンを追加
    await addRoutine(routineData);
    
    // フォームをリセット
    event.target.reset();
    
    // 頻度オプションをリセット
    document.getElementById('addRoutineFrequency').value = 'daily';
    showFrequencyOptions('add', 'daily');
    
    // メイン画面に戻る
    showScreen('main');
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
    const allRoutinesList = document.getElementById('allRoutinesList');
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

// グローバルスコープに関数を明示的に公開
window.displayTodayRoutines = displayTodayRoutines;
window.displayAllRoutines = displayAllRoutines;
window.createRoutineHTML = createRoutineHTML;
window.getFrequencyText = getFrequencyText;
window.isRoutineCompletedToday = isRoutineCompletedToday;
window.isMyData = isMyData;
window.isAdmin = isAdmin;
window.setupEventListeners = setupEventListeners;
window.checkAuthState = checkAuthState;
window.showAuthScreen = showAuthScreen;
window.loadRoutines = loadRoutines;
window.toggleRoutineCompletion = toggleRoutineCompletion;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showMainApp = showMainApp;
window.showScreen = showScreen;
window.initializeData = initializeData;
window.loadDataFromLocalStorage = loadDataFromLocalStorage;
window.loadDataFromFirebase = loadDataFromFirebase;
window.saveData = saveData;
window.addRoutine = addRoutine;
window.initializeApp = initializeApp;
window.initializeStorage = initializeStorage;
window.logout = logout;
window.setUserType = setUserType;
window.getUserType = getUserType;
window.isFriend = isFriend;
window.isGeneralUser = isGeneralUser;
window.requestNotificationPermission = requestNotificationPermission;
window.checkFirebaseStatus = checkFirebaseStatus;
window.fixFirebaseConfig = fixFirebaseConfig;
window.filterUsers = filterUsers;
window.checkFirebaseInitialization = checkFirebaseInitialization;
window.manualSync = manualSync;
window.performActualSync = performActualSync;
window.syncWithFirebase = syncWithFirebase;
window.syncWithGoogleDrive = syncWithGoogleDrive;
window.syncWithLocalStorage = syncWithLocalStorage;
window.showNotification = showNotification;
window.showStorageModal = showStorageModal;
window.hideStorageModal = hideStorageModal;
window.selectStorage = selectStorage;
window.confirmStorageSelection = confirmStorageSelection;
window.getStorageDisplayName = getStorageDisplayName;
window.showAdminDashboard = showAdminDashboard;
window.hideAdminDashboard = hideAdminDashboard;
window.showAdminTab = showAdminTab;
window.loadAdminData = loadAdminData;
window.loadUsersList = loadUsersList;
window.getAllUsers = getAllUsers;
window.getUserTypeForUser = getUserTypeForUser;
window.createUserItemHTML = createUserItemHTML;
window.getUserTypeText = getUserTypeText;
window.getUserTypeIcon = getUserTypeIcon;
window.markAsFriend = markAsFriend;
window.removeFriend = removeFriend;
window.removeUser = removeUser;
window.loadFriendsList = loadFriendsList;
window.createFriendItemHTML = createFriendItemHTML;
window.loadAdminStats = loadAdminStats;
window.showAddFriendModal = showAddFriendModal;
window.hideAddFriendModal = hideAddFriendModal;
window.addFriend = addFriend;
window.isValidEmail = isValidEmail;
window.editRoutine = editRoutine;
window.deleteRoutine = deleteRoutine;
window.showEditForm = showEditForm;
window.saveEditedRoutine = saveEditedRoutine;
window.hideEditForm = hideEditForm;
window.showFrequencyOptions = showFrequencyOptions;
window.selectFrequency = selectFrequency;
window.handleRoutineFormSubmit = handleRoutineFormSubmit;
window.handleFrequencyButtonClick = handleFrequencyButtonClick;
window.handleTabButtonClick = handleTabButtonClick;
window.filterRoutinesByFrequency = filterRoutinesByFrequency;
window.showDataDebugInfo = showDataDebugInfo;
window.logDataState = logDataState;

console.log('=== script-new.js グローバル関数公開完了 ===');
console.log('公開された関数数:', Object.keys(window).filter(key => 
    typeof window[key] === 'function' && 
    ['displayTodayRoutines', 'setupEventListeners', 'loadRoutines'].includes(key)
).length);

// メインアプリを表示
function showMainApp() {
    console.log('showMainApp called');
    
    try {
        // 認証画面を非表示
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.style.display = 'none';
            console.log('認証画面を非表示にしました');
        }
        
        // メインアプリを表示
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'block';
            console.log('メインアプリを表示しました');
        }
        
        // ユーザー情報を表示
        const currentUserElement = document.getElementById('currentUser');
        if (currentUserElement && currentUserInfo) {
            currentUserElement.textContent = currentUserInfo.displayName || currentUserInfo.email;
            console.log('ユーザー情報を表示:', currentUserInfo.displayName || currentUserInfo.email);
        }
        
        // ユーザータイプを設定
        if (currentUserInfo) {
            setUserType(currentUserInfo);
        }
        
        // 管理者ボタンの表示/非表示
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            if (isAdmin()) {
                adminBtn.style.display = 'block';
                console.log('管理者ボタンを表示');
            } else {
                adminBtn.style.display = 'none';
                console.log('管理者ボタンを非表示');
            }
        }
        
        // 同期状態を更新
        console.log('showMainApp - updateSyncStatus前のcurrentStorage:', currentStorage);
        if (typeof updateSyncStatus === 'function') {
            updateSyncStatus(currentStorage);
        } else {
            console.warn('updateSyncStatus関数が見つかりません');
        }
        
        // ストレージタイプに応じた通知
        let storageText = '';
        switch (currentStorage) {
            case 'firebase':
                storageText = 'Firebase同期';
                break;
            case 'google-drive':
                storageText = 'Google Drive同期';
                break;
            case 'local':
            default:
                storageText = 'ローカル保存';
                break;
        }
        console.log('showMainApp - 通知用storageText:', storageText, 'currentStorage:', currentStorage);
        
        // データを読み込み
        loadRoutines();
        
        // 今日のルーティンを表示
        displayTodayRoutines();
        
        console.log('showMainApp completed');
        
    } catch (error) {
        console.error('showMainApp エラー:', error);
        showNotification('アプリの表示中にエラーが発生しました', 'error');
    }
}

// 画面を切り替え
function showScreen(screenName) {
    console.log('画面切り替え開始:', screenName);
    
    const mainScreen = document.getElementById('app');
    const addScreen = document.getElementById('addRoutineScreen');
    
    console.log('mainScreen要素:', mainScreen);
    console.log('addScreen要素:', addScreen);
    
    if (screenName === 'main') {
        console.log('メイン画面を表示');
        if (mainScreen) mainScreen.style.display = 'block';
        if (addScreen) addScreen.style.display = 'none';
        
        // 今日のルーティンを表示
        displayTodayRoutines();
    } else if (screenName === 'add') {
        console.log('ルーティン追加画面を表示');
        if (mainScreen) mainScreen.style.display = 'none';
        if (addScreen) addScreen.style.display = 'block';
        
        // デフォルトで毎日ボタンを選択
        const dailyButton = addScreen.querySelector('.frequency-btn[data-frequency="daily"]');
        if (dailyButton) {
            dailyButton.classList.add('active');
            document.getElementById('addRoutineFrequency').value = 'daily';
            console.log('毎日ボタンを選択状態にしました');
        }
        
        // 全ルーティンを表示
        displayAllRoutines();
    }
    
    console.log('画面切り替え完了');
}

// ログイン処理
async function login(email, password) {
    console.log('ログイン処理開始:', email);
    
    try {
        // Firebase認証を試行
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                currentUserInfo = {
                    id: user.uid,
                    email: user.email,
                    displayName: user.displayName
                };
                
                // ローカルストレージに保存
                localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
                
                // Firebaseストレージを自動選択
                currentStorage = 'firebase';
                localStorage.setItem('storageType', 'firebase');
                
                console.log('Firebaseログイン成功:', currentUserInfo);
                return true;
            } catch (firebaseError) {
                console.log('Firebaseログイン失敗:', firebaseError.message);
            }
        }
        
        // ローカル認証を試行
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUserInfo = {
                id: user.id,
                email: user.email,
                displayName: user.displayName || user.email
            };
            
            // ローカルストレージに保存
            localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
            
            // ローカルストレージを自動選択
            currentStorage = 'local';
            localStorage.setItem('storageType', 'local');
            
            console.log('ローカルログイン成功:', currentUserInfo);
            return true;
        }
        
        console.log('ログイン失敗: 認証情報が正しくありません');
        return false;
    } catch (error) {
        console.error('ログイン処理エラー:', error);
        return false;
    }
}

// 登録処理
async function register(email, password) {
    console.log('登録処理開始:', email);
    
    try {
        // Firebase登録を試行
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                currentUserInfo = {
                    id: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email
                };
                
                // ローカルストレージに保存
                localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
                
                // Firebaseストレージを自動選択
                currentStorage = 'firebase';
                localStorage.setItem('storageType', 'firebase');
                
                console.log('Firebase登録成功:', currentUserInfo);
                return true;
            } catch (firebaseError) {
                console.log('Firebase登録失敗:', firebaseError.message);
            }
        }
        
        // ローカル登録を試行
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 既存ユーザーチェック
        if (users.find(u => u.email === email)) {
            console.log('登録失敗: 既に存在するユーザーです');
            return false;
        }
        
        const newUser = {
            id: Date.now().toString(),
            email: email,
            password: password,
            displayName: email,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUserInfo = {
            id: newUser.id,
            email: newUser.email,
            displayName: newUser.displayName
        };
        
        // ローカルストレージに保存
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        
        // ローカルストレージを自動選択
        currentStorage = 'local';
        localStorage.setItem('storageType', 'local');
        
        console.log('ローカル登録成功:', currentUserInfo);
        return true;
    } catch (error) {
        console.error('登録処理エラー:', error);
        return false;
    }
}

window.showMainApp = showMainApp;
window.showScreen = showScreen;
window.login = login;
window.register = register;
window.handleLogin = handleLogin;
window.updateSyncStatus = updateSyncStatus;
window.initializeData = initializeData;

// ログインフォーム処理
async function handleLogin(event) {
    event.preventDefault();
    console.log('ログインフォーム処理開始');
    
    try {
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        console.log('ログイン試行:', email);
        
        // ログインボタンを無効化
        const loginBtn = event.target.querySelector('button[type="submit"]');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'ログイン中...';
        }
        
        // ログイン処理
        const success = await login(email, password);
        
        if (success) {
            console.log('ログイン成功');
            showNotification('ログインしました', 'success');
            
            // メインアプリを表示
            showMainApp();
            
            // アプリを初期化
            initializeApp();
        } else {
            console.log('ログイン失敗');
            showNotification('ログインに失敗しました', 'error');
        }
    } catch (error) {
        console.error('ログインフォーム処理エラー:', error);
        showNotification('ログイン処理中にエラーが発生しました', 'error');
    } finally {
        // ログインボタンを再有効化
        const loginBtn = event.target.querySelector('button[type="submit"]');
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'ログイン';
        }
    }
}

// 同期状態を更新
function updateSyncStatus(status, message = '') {
    console.log('同期状態更新:', status, message);
    
    const syncStatusElement = document.getElementById('syncStatus');
    if (!syncStatusElement) {
        console.warn('syncStatus要素が見つかりません');
        return;
    }
    
    let statusText = '';
    let statusClass = '';
    
    switch (status) {
        case 'syncing':
            statusText = '🔄 同期中...';
            statusClass = 'syncing';
            break;
        case 'success':
            statusText = '✅ 同期完了';
            statusClass = 'success';
            break;
        case 'error':
            statusText = '❌ 同期エラー';
            statusClass = 'error';
            break;
        case 'offline':
            statusText = '📱 オフライン';
            statusClass = 'offline';
            break;
        case 'firebase':
            statusText = '☁️ Firebase';
            statusClass = 'firebase';
            break;
        case 'local':
            statusText = '💾 ローカル';
            statusClass = 'local';
            break;
        case 'google-drive':
            statusText = '📁 Google Drive';
            statusClass = 'google-drive';
            break;
        default:
            statusText = '🟡 準備中...';
            statusClass = 'default';
    }
    
    if (message) {
        statusText += ` - ${message}`;
    }
    
    syncStatusElement.textContent = statusText;
    syncStatusElement.className = `sync-status ${statusClass}`;
    
    console.log('同期状態更新完了:', statusText);
}

// Googleログイン処理
async function handleGoogleLogin() {
    console.log('Googleログイン処理開始');
    
    try {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.error('Firebaseが利用できません');
            showNotification('Firebaseが利用できません', 'error');
            return;
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        currentUserInfo = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || user.email,
            isGoogleUser: true
        };
        
        // ローカルストレージに保存
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        
        // Firebaseストレージを自動選択
        currentStorage = 'firebase';
        localStorage.setItem('storageType', 'firebase');
        
        console.log('Googleログイン成功:', currentUserInfo);
        showNotification('Googleログインしました', 'success');
        
        // メインアプリを表示
        showMainApp();
        
        // アプリを初期化
        initializeApp();
        
    } catch (error) {
        console.error('Googleログインエラー:', error);
        showNotification('Googleログインに失敗しました', 'error');
    }
}

// ページ読み込み時の初期化