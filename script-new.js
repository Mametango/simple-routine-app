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
    console.log('showDataDebugInfo開始');
    
    // ローカルストレージからユーザーデータを取得
    const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    
    console.log('取得したregisteredUsers:', registeredUsers);
    console.log('取得したfriendsList:', friendsList);
    
    const debugInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        userInfo: currentUserInfo,
        storageType: currentStorage,
        routinesCount: routines.length,
        completionsCount: completions.length,
        usersData: {
            registeredUsersCount: registeredUsers.length,
            registeredUsers: registeredUsers.map(u => ({
                email: u.email,
                displayName: u.displayName,
                id: u.id,
                isGoogleLinked: u.isGoogleLinked,
                createdAt: u.createdAt
            })),
            friendsListCount: friendsList.length,
            friendsList: friendsList
        },
        localStorage: {
            appData: localStorage.getItem('appData') ? '存在' : 'なし',
            lastUpdated: localStorage.getItem('lastUpdated'),
            storageType: localStorage.getItem('storageType'),
            isLoggedIn: localStorage.getItem('isLoggedIn'),
            userInfo: localStorage.getItem('userInfo') ? '存在' : 'なし',
            users: localStorage.getItem('users') ? '存在' : 'なし',
            friendsList: localStorage.getItem('friendsList') ? '存在' : 'なし'
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
          `登録ユーザー数: ${debugInfo.usersData.registeredUsersCount}\n` +
          `友達リスト数: ${debugInfo.usersData.friendsListCount}\n` +
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