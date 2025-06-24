function handleAuthStateChange(user) {
    console.log('認証状態が変更されました:', user ? `ユーザー: ${user.email}` : 'ログアウト状態');
    const onAuthPage = window.location.pathname.includes('register.html') || window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

    if (user) {
        console.log('ユーザーがログインしました。UIを更新します。');
        currentUser = {
            id: user.uid,
            username: user.displayName || user.email,
            email: user.email
        };
        if (onAuthPage) {
            // 認証ページにいる場合は、メインアプリ画面に切り替える
            console.log('認証ページからメインアプリに切り替えます。');
            showMainApp();
            initializeApp();
        } else if (window.location.pathname.includes('register.html')) {
            // 登録ページからリダイレクト
            console.log('登録ページからリダイレクトします。');
            window.location.href = 'index.html';
        } else {
            // ログイン済みでアプリページを直接開いた場合
            console.log('アプリページを直接開いた場合の初期化を行います。');
            initializeApp();
        }
    } else {
        console.log('ユーザーがログアウトしました。');
        currentUser = null;
        routines = []; // ログアウトしたらルーチンをクリア
        if (!onAuthPage) {
            // アプリページにいてログアウトされたら、認証ページにリダイレクト
            console.log('アプリページから認証ページにリダイレクトします。');
            window.location.href = 'index.html';
        } else {
            // 認証ページでログアウト状態の場合、認証フォームを表示
            console.log('認証ページでログアウト状態です。認証フォームを表示します。');
            showAuthScreen();
        }
    }
}

// グローバル変数
let currentUser = null;
let routines = [];
let completions = [];
let currentEditId = null;

// アプリ初期化
function initializeApp() {
    console.log('アプリを初期化しています...');
    loadRoutines();
    setupEventListeners();
    updateStats();
    renderRoutines();
}

// メインアプリを表示
function showMainApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
}

// 認証画面を表示
function showAuthScreen() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

// ルーティンを読み込み
function loadRoutines() {
    const savedRoutines = localStorage.getItem('routines');
    if (savedRoutines) {
        routines = JSON.parse(savedRoutines);
    }
    
    const savedCompletions = localStorage.getItem('completions');
    if (savedCompletions) {
        completions = JSON.parse(savedCompletions);
    }
}

// ルーティンを保存
function saveRoutines() {
    localStorage.setItem('routines', JSON.stringify(routines));
    localStorage.setItem('completions', JSON.stringify(completions));
}

// イベントリスナーを設定
function setupEventListeners() {
    // 追加ボタン
    document.getElementById('addButton').addEventListener('click', showAddForm);
    
    // 保存ボタン
    document.getElementById('saveButton').addEventListener('click', saveRoutine);
    
    // 頻度選択
    document.getElementById('frequencyInput').addEventListener('change', handleFrequencyChange);
    
    // 編集用頻度選択
    document.getElementById('editFrequencyInput').addEventListener('change', handleEditFrequencyChange);
    
    // タブボタン
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterRoutines(button.dataset.frequency);
        });
    });
    
    // パスワード表示切り替え
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
    
    // 認証フォーム
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    
    // 編集モーダル
    document.getElementById('editCancelButton').addEventListener('click', hideModal);
    document.getElementById('editSaveButton').addEventListener('click', saveEdit);
}

// 追加フォームを表示
function showAddForm() {
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('titleInput').focus();
}

// ルーティンを保存
function saveRoutine() {
    const title = document.getElementById('titleInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    const frequency = document.getElementById('frequencyInput').value;
    const time = document.getElementById('timeInput').value;
    
    if (!title) {
        alert('タイトルを入力してください');
        return;
    }
    
    const routine = {
        id: Date.now().toString(),
        title: title,
        description: description,
        frequency: frequency,
        time: time,
        weeklyDays: getSelectedWeekdays(),
        monthlyDate: document.getElementById('monthlyDateInput').value,
        createdAt: new Date().toISOString(),
        completed: false
    };
    
    routines.push(routine);
    saveRoutines();
    updateStats();
    renderRoutines();
    
    // フォームをリセット
    document.getElementById('titleInput').value = '';
    document.getElementById('descriptionInput').value = '';
    document.getElementById('timeInput').value = '';
    document.getElementById('formContainer').style.display = 'none';
}

// 選択された曜日を取得
function getSelectedWeekdays() {
    const checkboxes = document.querySelectorAll('.weekday-input:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

// 頻度変更時の処理
function handleFrequencyChange() {
    const frequency = document.getElementById('frequencyInput').value;
    document.getElementById('weeklyDaysRow').style.display = frequency === 'weekly' ? 'block' : 'none';
    document.getElementById('monthlyDateRow').style.display = frequency === 'monthly' ? 'block' : 'none';
}

// 編集用頻度変更時の処理
function handleEditFrequencyChange() {
    const frequency = document.getElementById('editFrequencyInput').value;
    document.getElementById('editWeeklyDaysRow').style.display = frequency === 'weekly' ? 'block' : 'none';
    document.getElementById('editMonthlyDateRow').style.display = frequency === 'monthly' ? 'block' : 'none';
}

// ルーティンを表示
function renderRoutines() {
    const container = document.getElementById('routinesList');
    const emptyState = document.getElementById('emptyState');
    
    if (routines.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const activeTab = document.querySelector('.tab-button.active');
    const frequency = activeTab ? activeTab.dataset.frequency : 'all';
    
    const filteredRoutines = frequency === 'all' ? routines : routines.filter(r => r.frequency === frequency);
    
    container.innerHTML = filteredRoutines.map(routine => `
        <div class="routine-card ${routine.completed ? 'completed' : ''}" data-id="${routine.id}">
            <div class="routine-header">
                <h3 class="routine-title">${routine.title}</h3>
                <div class="routine-actions">
                    <button class="toggle-button ${routine.completed ? 'completed' : ''}" onclick="toggleRoutine('${routine.id}')">
                        <i data-lucide="${routine.completed ? 'check-circle' : 'circle'}"></i>
                    </button>
                    <button class="edit-button" onclick="editRoutine('${routine.id}')">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="delete-button" onclick="deleteRoutine('${routine.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            ${routine.description ? `<p class="routine-description">${routine.description}</p>` : ''}
            <div class="routine-meta">
                <span class="frequency-badge ${routine.frequency}">${getFrequencyLabel(routine.frequency)}</span>
                ${routine.time ? `<span class="time-badge">${routine.time}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    // Lucideアイコンを初期化
    lucide.createIcons();
}

// 頻度ラベルを取得
function getFrequencyLabel(frequency) {
    const labels = {
        daily: '毎日',
        weekly: '毎週',
        monthly: '毎月'
    };
    return labels[frequency] || frequency;
}

// ルーティンを切り替え
function toggleRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        routine.completed = !routine.completed;
        
        if (routine.completed) {
            completions.push({
                routineId: id,
                timestamp: new Date().toISOString()
            });
        } else {
            completions = completions.filter(c => c.routineId !== id);
        }
        
        saveRoutines();
        updateStats();
        renderRoutines();
    }
}

// ルーティンを編集
function editRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;
    
    currentEditId = id; // 編集中のルーティンIDを設定
    
    document.getElementById('editTitleInput').value = routine.title;
    document.getElementById('editDescriptionInput').value = routine.description || '';
    document.getElementById('editFrequencyInput').value = routine.frequency;
    document.getElementById('editTimeInput').value = routine.time || '';
    
    if (routine.frequency === 'weekly') {
        document.getElementById('editWeeklyDaysRow').style.display = 'block';
        // 曜日チェックボックスを設定
        routine.weeklyDays.forEach(day => {
            const checkbox = document.querySelector(`#editWeeklyDaysRow input[value="${day}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    if (routine.frequency === 'monthly') {
        document.getElementById('editMonthlyDateRow').style.display = 'block';
        document.getElementById('editMonthlyDateInput').value = routine.monthlyDate || '';
    }
    
    document.getElementById('modalOverlay').style.display = 'flex';
    document.getElementById('editTitleInput').focus();
}

// 編集を保存
function saveEdit() {
    const routine = routines.find(r => r.id === currentEditId);
    if (!routine) return;
    
    routine.title = document.getElementById('editTitleInput').value.trim();
    routine.description = document.getElementById('editDescriptionInput').value.trim();
    routine.frequency = document.getElementById('editFrequencyInput').value;
    routine.time = document.getElementById('editTimeInput').value;
    
    if (routine.frequency === 'weekly') {
        routine.weeklyDays = getSelectedEditWeekdays();
    }
    
    if (routine.frequency === 'monthly') {
        routine.monthlyDate = document.getElementById('editMonthlyDateInput').value;
    }
    
    saveRoutines();
    renderRoutines();
    hideModal();
}

// 編集用の選択された曜日を取得
function getSelectedEditWeekdays() {
    const checkboxes = document.querySelectorAll('#editWeeklyDaysRow .weekday-input:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

// ルーティンを削除
function deleteRoutine(id) {
    if (confirm('このルーティンを削除しますか？')) {
        routines = routines.filter(r => r.id !== id);
        completions = completions.filter(c => c.routineId !== id);
        saveRoutines();
        updateStats();
        renderRoutines();
    }
}

// モーダルを隠す
function hideModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// ルーティンをフィルタリング
function filterRoutines(frequency) {
    renderRoutines();
}

// 統計を更新
function updateStats() {
    document.getElementById('totalCount').textContent = routines.length;
    
    const completedToday = completions.filter(c => {
        const completionDate = new Date(c.timestamp).toDateString();
        const today = new Date().toDateString();
        return completionDate === today;
    }).length;
    
    document.getElementById('completedCount').textContent = completedToday;
    
    const completionRate = routines.length > 0 ? Math.round((completedToday / routines.length) * 100) : 0;
    document.getElementById('completionRate').textContent = completionRate + '%';
}

// パスワード表示切り替え
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('togglePassword');
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        passwordInput.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    
    lucide.createIcons();
}

// 認証処理
async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('authError');
    const button = document.getElementById('authButton');
    
    try {
        button.disabled = true;
        button.textContent = 'ログイン中...';
        errorElement.style.display = 'none';
        
        // Firebase認証を使用
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('ログイン成功:', userCredential.user);
        
    } catch (error) {
        console.error('ログインエラー:', error);
        errorElement.textContent = getAuthErrorMessage(error.code);
        errorElement.style.display = 'block';
    } finally {
        button.disabled = false;
        button.textContent = 'ログイン';
    }
}

// 認証エラーメッセージを取得
function getAuthErrorMessage(errorCode) {
    const messages = {
        'auth/user-not-found': 'ユーザーが見つかりません',
        'auth/wrong-password': 'パスワードが間違っています',
        'auth/invalid-email': 'メールアドレスの形式が正しくありません',
        'auth/too-many-requests': '試行回数が多すぎます。しばらく待ってから再試行してください'
    };
    return messages[errorCode] || 'ログインに失敗しました';
}

// ログアウト
function logout() {
    auth.signOut().then(() => {
        console.log('ログアウトしました');
    }).catch((error) => {
        console.error('ログアウトエラー:', error);
    });
}

// 通知許可を要求
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                alert('通知が有効になりました！');
            }
        });
    }
}

// 設定を開く
function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

// 設定を閉じる
function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

// 設定を保存
function saveSettings() {
    const notifications = document.getElementById('enableNotifications').checked;
    const notificationTime = document.getElementById('defaultNotificationTime').value;
    const theme = document.getElementById('themeSelect').value;
    
    localStorage.setItem('settings', JSON.stringify({
        notifications,
        notificationTime,
        theme
    }));
    
    closeSettings();
    alert('設定を保存しました');
}

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
    
    // スタイルを追加
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // アニメーション用のCSSを追加
    if (!document.querySelector('#ai-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'ai-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .ai-notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .ai-notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // 5秒後に自動削除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('ページが読み込まれました');
    
    // シンプルモードチェック
    if (typeof checkSimpleMode === 'function' && checkSimpleMode()) {
        console.log('シンプルモードが有効です');
    }
    
    // 認証状態を監視
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(handleAuthStateChange);
    } else {
        console.log('Firebase認証が利用できません');
        showAuthScreen();
    }
});