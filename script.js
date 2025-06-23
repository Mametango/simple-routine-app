// アプリケーションの状態管理
let routines = [];
let currentUser = null;
let isRegistering = false;
let currentFilter = 'all';
let notificationPermission = false;
let settings = {
    enableNotifications: true,
    defaultNotificationTime: '08:00',
    notificationSound: 'default',
    notificationDuration: 10,
    theme: 'light',
    language: 'ja'
};

// 日本語入力の状態管理
let isComposing = false;

// DOM要素の取得
const authContainer = document.getElementById('authContainer');
const mainApp = document.getElementById('mainApp');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authButton = document.getElementById('authButton');
const toggleAuth = document.getElementById('toggleAuth');
const toggleText = document.getElementById('toggleText');
const authError = document.getElementById('authError');
const emailGroup = document.getElementById('emailGroup');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const currentUserSpan = document.getElementById('currentUser');
const notificationButton = document.getElementById('notificationButton');
const logoutButton = document.getElementById('logoutButton');
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

// ルーティン関連のDOM要素
const addButton = document.getElementById('addButton');
const formContainer = document.getElementById('formContainer');
const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const frequencyInput = document.getElementById('frequencyInput');
const timeInput = document.getElementById('timeInput');
const weeklyDaysRow = document.getElementById('weeklyDaysRow');
const weekdayInputs = document.querySelectorAll('.weekday-input');
const monthlyDateRow = document.getElementById('monthlyDateRow');
const monthlyDateInput = document.getElementById('monthlyDateInput');
const saveButton = document.getElementById('saveButton');
const routinesList = document.getElementById('routinesList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const completionRate = document.getElementById('completionRate');

// モーダル関連のDOM要素
const modalOverlay = document.getElementById('modalOverlay');
const editTitleInput = document.getElementById('editTitleInput');
const editDescriptionInput = document.getElementById('editDescriptionInput');
const editFrequencyInput = document.getElementById('editFrequencyInput');
const editTimeInput = document.getElementById('editTimeInput');
const editWeeklyDaysRow = document.getElementById('editWeeklyDaysRow');
const editWeekdayInputs = document.querySelectorAll('#editWeeklyDaysRow .weekday-input');
const editMonthlyDateRow = document.getElementById('editMonthlyDateRow');
const editMonthlyDateInput = document.getElementById('editMonthlyDateInput');
const editSaveButton = document.getElementById('editSaveButton');
const editCancelButton = document.getElementById('editCancelButton');

// フィルター関連のDOM要素
const tabButtons = document.querySelectorAll('.tab-button');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    checkAuth();
    setupEventListeners();
    setupJapaneseInput();
    updateTheme();
    lucide.createIcons();
    
    // ファイルインポートのイベントリスナーを追加
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', handleFileImport);
    }
    
    // モーダルの閉じるボタンのイベントリスナーを追加
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});

// 日本語入力の設定
function setupJapaneseInput() {
    const textInputs = [titleInput, descriptionInput, editTitleInput, editDescriptionInput];
    
    textInputs.forEach(input => {
        if (input) {
            // IME入力開始
            input.addEventListener('compositionstart', function() {
                isComposing = true;
            });
            
            // IME入力中
            input.addEventListener('compositionupdate', function() {
                isComposing = true;
            });
            
            // IME入力完了
            input.addEventListener('compositionend', function() {
                isComposing = false;
            });
            
            // キー入力（日本語入力中は無視）
            input.addEventListener('keydown', function(e) {
                if (isComposing) {
                    return;
                }
                
                // Enterキーで保存
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input === titleInput || input === editTitleInput) {
                        if (input === titleInput) {
                            saveRoutine();
                        } else {
                            saveEditRoutine();
                        }
                    }
                }
            });
            
            // 入力値の正規化
            input.addEventListener('input', function() {
                if (!isComposing) {
                    // 入力値を正規化（全角スペースを半角に変換など）
                    this.value = this.value.replace(/　/g, ' '); // 全角スペースを半角に
                }
            });
        }
    });
}

// 通知機能
function initializeNotifications() {
    if (!settings.enableNotifications) return;
    
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            // 通知許可を求めるボタンを表示
            showNotificationPermissionButton();
        } else if (Notification.permission === 'granted') {
            startNotificationCheck();
        }
    }
}

function showNotificationPermissionButton() {
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.style.backgroundColor = '#ffc107';
        notificationBtn.title = '通知を許可してください';
    }
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                const notificationBtn = document.getElementById('notificationBtn');
                if (notificationBtn) {
                    notificationBtn.style.backgroundColor = '#28a745';
                    notificationBtn.title = '通知が有効です';
                }
                startNotificationCheck();
            }
        });
    }
}

function startNotificationCheck() {
    if (!settings.enableNotifications) return;
    
    setInterval(() => {
        checkNotifications();
    }, 60000); // 1分ごとにチェック
}

function checkNotifications() {
    if (!settings.enableNotifications || Notification.permission !== 'granted') return;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();
    const currentDate = now.getDate();
    
    routines.forEach(routine => {
        if (routine.completed) return;
        
        let shouldNotify = false;
        
        // 頻度に基づいて通知判定
        if (routine.frequency === 'daily') {
            shouldNotify = true;
        } else if (routine.frequency === 'weekly' && routine.weekdays && routine.weekdays.includes(currentDay)) {
            shouldNotify = true;
        } else if (routine.frequency === 'monthly' && routine.monthDay === currentDate) {
            shouldNotify = true;
        }
        
        if (shouldNotify) {
            if (routine.time) {
                // 時間が設定されている場合
                const [hours, minutes] = routine.time.split(':').map(Number);
                const routineTime = hours * 60 + minutes;
                
                if (currentTime >= routineTime && currentTime < routineTime + 60) {
                    const notificationKey = `notification_${routine.id}_${now.toDateString()}`;
                    if (!localStorage.getItem(notificationKey)) {
                        showNotification(routine.title, `今日のルーティンです！${routine.description ? routine.description : ''}`);
                        localStorage.setItem(notificationKey, 'true');
                    }
                }
            } else {
                // 時間が設定されていない場合は設定されたデフォルト時刻に通知
                const [hours, minutes] = settings.defaultNotificationTime.split(':').map(Number);
                const defaultTime = hours * 60 + minutes;
                
                if (currentTime >= defaultTime && currentTime < defaultTime + 60) {
                    const notificationKey = `notification_${routine.id}_${now.toDateString()}`;
                    if (!localStorage.getItem(notificationKey)) {
                        showNotification(routine.title, `今日のルーティンです！${routine.description ? routine.description : ''}`);
                        localStorage.setItem(notificationKey, 'true');
                    }
                }
            }
        }
    });
}

function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'routine-notification',
            requireInteraction: settings.notificationDuration > 0
        });
        
        // 通知音の再生
        if (settings.notificationSound !== 'none') {
            playNotificationSound();
        }
        
        // 自動で閉じる
        if (settings.notificationDuration > 0) {
            setTimeout(() => {
                notification.close();
            }, settings.notificationDuration * 1000);
        }
    }
}

function playNotificationSound() {
    // 簡単な通知音を生成
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// 認証関連
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showMainApp();
        loadRoutines();
        displayRoutines();
        initializeNotifications();
    } else {
        showAuthScreen();
    }
}

function showAuthScreen() {
    // 認証画面を表示し、他の画面を非表示
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('settingsModal').style.display = 'none';
}

function showMainApp() {
    // メインアプリを表示し、他の画面を非表示
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('settingsModal').style.display = 'none';
    
    if (currentUser) {
        document.getElementById('currentUser').textContent = currentUser.username;
    }
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('ユーザー名とパスワードを入力してください。');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username);
    
    if (user && user.password === password) {
        currentUser = { username: user.username };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
        loadRoutines();
        displayRoutines();
    } else {
        alert('ユーザー名またはパスワードが正しくありません。');
    }
}

function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        alert('すべての項目を入力してください。');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('パスワードが一致しません。');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.username === username)) {
        alert('このユーザー名は既に使用されています。');
        return;
    }
    
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = { username };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMainApp();
    loadRoutines();
    displayRoutines();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // すべての画面を非表示にして認証画面を表示
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('settingsModal').style.display = 'none';
    
    routines = [];
    hideAuthError();
}

// 設定関連
function loadSettings() {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
    applySettings();
}

function saveSettings() {
    settings.enableNotifications = document.getElementById('enableNotifications').checked;
    settings.defaultNotificationTime = document.getElementById('defaultNotificationTime').value;
    settings.notificationSound = document.getElementById('notificationSound').value;
    settings.notificationDuration = parseInt(document.getElementById('notificationDuration').value);
    settings.theme = document.getElementById('themeSelect').value;
    settings.language = document.getElementById('languageSelect').value;
    
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings();
    closeSettings();
    alert('設定を保存しました。');
}

function applySettings() {
    if (document.getElementById('enableNotifications')) {
        document.getElementById('enableNotifications').checked = settings.enableNotifications;
        document.getElementById('defaultNotificationTime').value = settings.defaultNotificationTime;
        document.getElementById('notificationSound').value = settings.notificationSound;
        document.getElementById('notificationDuration').value = settings.notificationDuration;
        document.getElementById('themeSelect').value = settings.theme;
        document.getElementById('languageSelect').value = settings.language;
    }
    
    updateTheme();
}

function openSettings() {
    // 設定モーダルを表示し、他のモーダルを非表示
    document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('authModal').style.display = 'none';
    
    if (document.getElementById('currentUsername') && currentUser) {
        document.getElementById('currentUsername').textContent = currentUser.username;
    }
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function updateTheme() {
    const theme = settings.theme;
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
}

// アカウント管理
function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmNewPassword) {
        alert('新しいパスワードを入力してください。');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('パスワードが一致しません。');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        alert('パスワードを変更しました。');
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    }
}

function deleteAccount() {
    if (confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(u => u.username !== currentUser.username);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        // ユーザーのデータも削除
        localStorage.removeItem(`routines_${currentUser.username}`);
        localStorage.removeItem('currentUser');
        
        alert('アカウントを削除しました。');
        currentUser = null;
        showAuthScreen();
    }
}

// データ管理
function exportData() {
    const data = {
        routines: routines,
        settings: settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-routine-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById('importFile').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.routines) {
                routines = data.routines;
                saveRoutines();
                displayRoutines();
            }
            
            if (data.settings) {
                settings = { ...settings, ...data.settings };
                localStorage.setItem('settings', JSON.stringify(settings));
                applySettings();
            }
            
            alert('データをインポートしました。');
        } catch (error) {
            alert('ファイルの読み込みに失敗しました。');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function clearAllData() {
    if (confirm('本当にすべてのデータを削除しますか？この操作は取り消せません。')) {
        localStorage.removeItem(`routines_${currentUser.username}`);
        routines = [];
        displayRoutines();
        alert('すべてのデータを削除しました。');
    }
}

// ルーティン管理
function loadRoutines() {
    if (!currentUser) return;
    const saved = localStorage.getItem(`routines_${currentUser.username}`);
    routines = saved ? JSON.parse(saved) : [];
}

function saveRoutines() {
    if (!currentUser) return;
    localStorage.setItem(`routines_${currentUser.username}`, JSON.stringify(routines));
}

function showAddForm() {
    formContainer.style.display = 'block';
    titleInput.focus();
}

function hideAddForm() {
    formContainer.style.display = 'none';
    titleInput.value = '';
    descriptionInput.value = '';
    frequencyInput.value = 'daily';
    timeInput.value = '';
    monthlyDateInput.value = '';
    weekdayInputs.forEach(input => input.checked = false);
    weeklyDaysRow.style.display = 'none';
    monthlyDateRow.style.display = 'none';
}

function saveRoutine() {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const frequency = frequencyInput.value;
    const time = timeInput.value;
    const monthDay = monthlyDateInput.value;
    const weekdays = getSelectedWeekdays();
    
    if (!title) {
        alert('タイトルを入力してください。');
        return;
    }
    
    if (frequency === 'monthly' && (!monthDay || monthDay < 1 || monthDay > 31)) {
        alert('月の日付を1-31の間で入力してください。');
        return;
    }
    
    if (frequency === 'weekly' && weekdays.length === 0) {
        alert('曜日を選択してください。');
        return;
    }
    
    const routine = {
        id: Date.now(),
        title,
        description,
        frequency,
        time,
        monthDay: frequency === 'monthly' ? parseInt(monthDay) : null,
        weekdays: frequency === 'weekly' ? weekdays : null,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    routines.push(routine);
    saveRoutines();
    displayRoutines();
    hideAddForm();
}

function getSelectedWeekdays() {
    const checkboxes = document.querySelectorAll('.weekday-input:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function toggleRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        routine.completed = !routine.completed;
        
        // 完了時に通知をリセット
        if (routine.completed) {
            const today = new Date().toDateString();
            localStorage.removeItem(`notification_${routine.id}_${today}`);
        }
        
        saveRoutines();
        displayRoutines();
    }
}

function editRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        editTitleInput.value = routine.title;
        editDescriptionInput.value = routine.description || '';
        editFrequencyInput.value = routine.frequency;
        editTimeInput.value = routine.time || '';
        editMonthlyDateInput.value = routine.monthDay || '';
        
        // 曜日の選択をリセット
        editWeekdayInputs.forEach(cb => cb.checked = false);
        if (routine.weekdays) {
            routine.weekdays.forEach(day => {
                const checkbox = document.querySelector(`#editWeeklyDaysRow .weekday-input[value="${day}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // 編集モードに設定
        modalOverlay.setAttribute('data-edit-id', id);
        showModal();
    }
}

function saveEditRoutine() {
    const editId = parseInt(modalOverlay.getAttribute('data-edit-id'));
    const routine = routines.find(r => r.id === editId);
    
    if (routine) {
        routine.title = editTitleInput.value.trim();
        routine.description = editDescriptionInput.value.trim();
        routine.frequency = editFrequencyInput.value;
        routine.time = editTimeInput.value;
        routine.monthDay = routine.frequency === 'monthly' ? parseInt(editMonthlyDateInput.value) : null;
        routine.weekdays = routine.frequency === 'weekly' ? getSelectedEditWeekdays() : null;
        
        saveRoutines();
        displayRoutines();
        hideModal();
    }
}

function getSelectedEditWeekdays() {
    const checkboxes = document.querySelectorAll('#editWeeklyDaysRow .weekday-input:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function deleteRoutine(id) {
    if (confirm('このルーティンを削除しますか？')) {
        routines = routines.filter(r => r.id !== id);
        saveRoutines();
        displayRoutines();
    }
}

function showModal() {
    modalOverlay.style.display = 'flex';
}

function hideModal() {
    modalOverlay.style.display = 'none';
    modalOverlay.removeAttribute('data-edit-id');
}

function setActiveTab(frequency) {
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.frequency === frequency) {
            button.classList.add('active');
        }
    });
    currentFilter = frequency;
}

function filterRoutines(frequency) {
    setActiveTab(frequency);
    displayRoutines();
}

function updateDisplay() {
    displayRoutines();
}

function updateStats() {
    const total = routines.length;
    const completed = routines.filter(r => r.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    completionRate.textContent = rate + '%';
}

function displayRoutines() {
    const filter = currentFilter;
    
    let filteredRoutines = routines;
    if (filter !== 'all') {
        filteredRoutines = routines.filter(r => r.frequency === filter);
    }
    
    if (routinesList) {
        routinesList.innerHTML = '';
        
        if (filteredRoutines.length === 0) {
            emptyState.style.display = 'block';
            routinesList.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        routinesList.style.display = 'block';
        
        filteredRoutines.forEach(routine => {
            const routineElement = document.createElement('div');
            routineElement.className = `routine-item ${routine.completed ? 'completed' : ''}`;
            
            const frequencyText = getFrequencyText(routine);
            
            routineElement.innerHTML = `
                <div class="routine-content">
                    <div class="routine-header">
                        <h3 class="routine-title">${routine.title}</h3>
                        <div class="routine-meta">
                            <span class="routine-frequency">${frequencyText}</span>
                            ${routine.time ? `<span class="routine-time">${routine.time}</span>` : ''}
                        </div>
                    </div>
                    ${routine.description ? `<p class="routine-description">${routine.description}</p>` : ''}
                    <div class="routine-actions">
                        <button class="toggle-btn ${routine.completed ? 'completed' : ''}" onclick="toggleRoutine(${routine.id})">
                            <i data-lucide="${routine.completed ? 'check-circle' : 'circle'}"></i>
                            ${routine.completed ? '完了' : '未完了'}
                        </button>
                        <button class="edit-btn" onclick="editRoutine(${routine.id})">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteRoutine(${routine.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;
            
            routinesList.appendChild(routineElement);
        });
        
        // Lucideアイコンを更新
        lucide.createIcons();
    }
    
    updateStats();
}

function getFrequencyText(routine) {
    if (routine.frequency === 'daily') {
        return '毎日';
    } else if (routine.frequency === 'weekly') {
        if (routine.weekdays && routine.weekdays.length > 0) {
            const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
            const selectedDays = routine.weekdays.map(day => dayNames[day]).join('・');
            return `毎週${selectedDays}`;
        }
        return '毎週';
    } else if (routine.frequency === 'monthly') {
        return `毎月${routine.monthDay}日`;
    }
    return '';
}

function handleFrequencyChange() {
    const frequency = frequencyInput.value;
    
    // 全ての追加フィールドを非表示
    weeklyDaysRow.style.display = 'none';
    monthlyDateRow.style.display = 'none';
    
    // 頻度に応じてフィールドを表示
    if (frequency === 'weekly') {
        weeklyDaysRow.style.display = 'block';
    } else if (frequency === 'monthly') {
        monthlyDateRow.style.display = 'block';
    }
    
    // 入力値をクリア
    if (frequency !== 'weekly') {
        weekdayInputs.forEach(input => input.checked = false);
    }
    if (frequency !== 'monthly') {
        monthlyDateInput.value = '';
    }
}

function handleEditFrequencyChange() {
    const frequency = editFrequencyInput.value;
    
    // 全ての追加フィールドを非表示
    editWeeklyDaysRow.style.display = 'none';
    editMonthlyDateRow.style.display = 'none';
    
    // 頻度に応じてフィールドを表示
    if (frequency === 'weekly') {
        editWeeklyDaysRow.style.display = 'block';
    } else if (frequency === 'monthly') {
        editMonthlyDateRow.style.display = 'block';
    }
    
    // 入力値をクリア
    if (frequency !== 'weekly') {
        editWeekdayInputs.forEach(input => input.checked = false);
    }
    if (frequency !== 'monthly') {
        editMonthlyDateInput.value = '';
    }
}

function setupEventListeners() {
    // 認証関連
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }
    if (toggleAuth) {
        toggleAuth.addEventListener('click', toggleAuthMode);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    if (togglePassword) {
        togglePassword.addEventListener('click', () => togglePasswordVisibility('password'));
    }
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility('confirmPassword'));
    }

    // 通知関連
    if (notificationButton) {
        notificationButton.addEventListener('click', requestNotificationPermission);
    }

    // ルーティン関連
    if (addButton) {
        addButton.addEventListener('click', showAddForm);
    }
    if (saveButton) {
        saveButton.addEventListener('click', saveRoutine);
    }
    
    // 頻度変更時の処理
    if (frequencyInput) {
        frequencyInput.addEventListener('change', handleFrequencyChange);
    }
    if (editFrequencyInput) {
        editFrequencyInput.addEventListener('change', handleEditFrequencyChange);
    }

    // モーダル関連
    if (editSaveButton) {
        editSaveButton.addEventListener('click', saveEditRoutine);
    }
    if (editCancelButton) {
        editCancelButton.addEventListener('click', hideModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) hideModal();
        });
    }

    // フィルター関連
    if (tabButtons) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const frequency = button.dataset.frequency;
                setActiveTab(frequency);
                filterRoutines(frequency);
            });
        });
    }

    // 設定モーダル関連
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // 設定ボタン
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // ファイルインポート
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', handleFileImport);
    }
}

function toggleAuthMode() {
    isRegistering = !isRegistering;
    
    if (isRegistering) {
        authTitle.textContent = '会員登録';
        authSubtitle.textContent = '新しいアカウントを作成してください';
        authButton.textContent = '登録';
        toggleText.textContent = 'すでにアカウントをお持ちの方は';
        toggleAuth.textContent = 'ログイン';
        emailGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
        document.getElementById('email').required = true;
        document.getElementById('confirmPassword').required = true;
    } else {
        authTitle.textContent = 'ログイン';
        authSubtitle.textContent = 'アカウントにログインしてください';
        authButton.textContent = 'ログイン';
        toggleText.textContent = 'アカウントをお持ちでない方は';
        toggleAuth.textContent = '会員登録';
        emailGroup.style.display = 'none';
        confirmPasswordGroup.style.display = 'none';
        document.getElementById('email').required = false;
        document.getElementById('confirmPassword').required = false;
    }
    
    hideAuthError();
}

function handleAuthSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(authForm);
    const username = formData.get('username');
    const password = formData.get('password');
    const email = formData.get('email');
    const confirmPassword = formData.get('confirmPassword');
    
    if (isRegistering) {
        // 会員登録
        if (password !== confirmPassword) {
            showAuthError('パスワードが一致しません');
            return;
        }
        
        if (password.length < 6) {
            showAuthError('パスワードは6文字以上で入力してください');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(user => user.username === username);
        
        if (existingUser) {
            showAuthError('このユーザー名は既に使用されています');
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: btoa(password), // 簡単な暗号化（実際のアプリではbcrypt等を使用）
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // 自動ログイン
        currentUser = { id: newUser.id, username: newUser.username };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showMainApp();
        initializeUserData();
        
    } else {
        // ログイン
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && btoa(password) === u.password);
        
        if (!user) {
            showAuthError('ユーザー名またはパスワードが正しくありません');
            return;
        }
        
        currentUser = { id: user.id, username: user.username };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showMainApp();
        loadRoutines();
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    routines = [];
    showAuthScreen();
    hideAuthError();
}

function showAuthError(message) {
    if (authError) {
        authError.textContent = message;
        authError.style.display = 'block';
    }
}

function hideAuthError() {
    if (authError) {
        authError.style.display = 'none';
    }
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = document.getElementById(`toggle${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
    const icon = toggle.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        field.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    
    lucide.createIcons();
}

// ユーザーデータ管理
function initializeUserData() {
    routines = [];
    saveRoutines();
    updateDisplay();
}

// タブクリック時の頻度設定
function setFrequencyFromTab(frequency) {
    if (frequencyInput) {
        frequencyInput.value = frequency;
        handleFrequencyChange();
    }
} 