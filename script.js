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

// Firebase認証状態の監視
auth.onAuthStateChanged(function(user) {
    if (user) {
        // ユーザーがログインしている
        currentUser = {
            id: user.uid,
            username: user.email || user.displayName || 'ユーザー',
            email: user.email
        };
        showMainApp();
        loadRoutines();
        displayRoutines();
        initializeNotifications();
    } else {
        // ユーザーがログアウトしている
        currentUser = null;
        routines = [];
        showAuthScreen();
    }
});

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    setupJapaneseInput();
    updateTheme();
    lucide.createIcons();
    
    // シンプルモードをチェック
    checkSimpleMode();
    
    // AI機能の初期化
    initializeAI();
    
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

// 日本認入力の設定
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

// 認証関連
function showAuthScreen() {
    // 認証画面を表示し、他の画面を非表示
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('settingsModal').style.display = 'none';
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

function logout() {
    auth.signOut()
        .then(() => {
            console.log('User logged out successfully');
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
}

// 設定関連
function loadSettings() {
    if (!currentUser) {
        // ローカル設定を読み込み（デフォルト値）
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        applySettings();
        return;
    }
    
    // Firestoreから設定を読み込み
    db.collection('users').doc(currentUser.id).get()
        .then((doc) => {
            if (doc.exists && doc.data().settings) {
                settings = { ...settings, ...doc.data().settings };
            }
            applySettings();
        })
        .catch((error) => {
            console.error('Error loading settings:', error);
            // エラーの場合はローカル設定を使用
            const savedSettings = localStorage.getItem('settings');
            if (savedSettings) {
                settings = { ...settings, ...JSON.parse(savedSettings) };
            }
            applySettings();
        });
}

function saveSettings() {
    settings.enableNotifications = document.getElementById('enableNotifications').checked;
    settings.defaultNotificationTime = document.getElementById('defaultNotificationTime').value;
    settings.notificationSound = document.getElementById('notificationSound').value;
    settings.notificationDuration = parseInt(document.getElementById('notificationDuration').value);
    settings.theme = document.getElementById('themeSelect').value;
    settings.language = document.getElementById('languageSelect').value;
    
    if (currentUser) {
        // Firestoreに保存
        db.collection('users').doc(currentUser.id).set({
            settings: settings
        }, { merge: true })
        .then(() => {
            console.log('Settings saved to Firestore');
            applySettings();
            closeSettings();
            alert('設定を保存しました。');
        })
        .catch((error) => {
            console.error('Error saving settings:', error);
            alert('設定の保存に失敗しました。');
        });
    } else {
        // ローカルに保存
        localStorage.setItem('settings', JSON.stringify(settings));
        applySettings();
        closeSettings();
        alert('設定を保存しました。');
    }
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
    if (!currentUser) {
        console.log('No current user, cannot load routines');
        return;
    }
    
    console.log('Loading routines for user:', currentUser.id);
    
    // Firestoreからリアルタイムでデータを取得
    db.collection('users').doc(currentUser.id).collection('routines')
        .onSnapshot((snapshot) => {
            routines = [];
            snapshot.forEach((doc) => {
                const routine = {
                    id: doc.id,
                    ...doc.data()
                };
                routines.push(routine);
            });
            
            console.log('Loaded routines:', routines);
            displayRoutines();
            updateStats();
        }, (error) => {
            console.error('Error loading routines:', error);
        });
}

function saveRoutines() {
    if (!currentUser) {
        console.log('No current user, cannot save routines');
        return;
    }
    
    console.log('Saving routines for user:', currentUser.id);
    console.log('Routines to save:', routines);
    
    // バッチ処理で一括更新
    const batch = db.batch();
    
    // 既存のデータを削除
    db.collection('users').doc(currentUser.id).collection('routines')
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            // 新しいデータを追加
            routines.forEach((routine) => {
                const routineRef = db.collection('users').doc(currentUser.id).collection('routines').doc();
                const routineData = { ...routine };
                delete routineData.id; // FirestoreのドキュメントIDは別途管理
                batch.set(routineRef, routineData);
            });
            
            return batch.commit();
        })
        .then(() => {
            console.log('Routines saved successfully');
        })
        .catch((error) => {
            console.error('Error saving routines:', error);
        });
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
        title,
        description,
        frequency,
        time,
        monthDay: frequency === 'monthly' ? parseInt(monthDay) : null,
        weekdays: frequency === 'weekly' ? weekdays : null,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Firestoreに直接保存
    db.collection('users').doc(currentUser.id).collection('routines')
        .add(routine)
        .then((docRef) => {
            console.log('Routine saved with ID:', docRef.id);
            hideAddForm();
            learnFromNewRoutine(routine);
        })
        .catch((error) => {
            console.error('Error saving routine:', error);
            alert('ルーティンの保存に失敗しました。');
        });
}

function getSelectedWeekdays() {
    const checkboxes = document.querySelectorAll('.weekday-input:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function toggleRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        const updatedRoutine = { ...routine, completed: !routine.completed };
        
        // 完了時に通知をリセット
        if (updatedRoutine.completed) {
            const today = new Date().toDateString();
            localStorage.removeItem(`notification_${routine.id}_${today}`);
        }
        
        // Firestoreで更新
        db.collection('users').doc(currentUser.id).collection('routines').doc(id)
            .update({ completed: updatedRoutine.completed })
            .then(() => {
                console.log('Routine toggled successfully');
            })
            .catch((error) => {
                console.error('Error toggling routine:', error);
            });
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
    const editId = modalOverlay.getAttribute('data-edit-id');
    const routine = routines.find(r => r.id === editId);
    
    if (routine) {
        const updatedRoutine = {
            title: editTitleInput.value.trim(),
            description: editDescriptionInput.value.trim(),
            frequency: editFrequencyInput.value,
            time: editTimeInput.value,
            monthDay: editFrequencyInput.value === 'monthly' ? parseInt(editMonthlyDateInput.value) : null,
            weekdays: editFrequencyInput.value === 'weekly' ? getSelectedEditWeekdays() : null
        };
        
        // Firestoreで更新
        db.collection('users').doc(currentUser.id).collection('routines').doc(editId)
            .update(updatedRoutine)
            .then(() => {
                console.log('Routine updated successfully');
                hideModal();
            })
            .catch((error) => {
                console.error('Error updating routine:', error);
                alert('ルーティンの更新に失敗しました。');
            });
    }
}

function getSelectedEditWeekdays() {
    const checkboxes = document.querySelectorAll('#editWeeklyDaysRow .weekday-input:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function deleteRoutine(id) {
    if (confirm('このルーティンを削除しますか？')) {
        // Firestoreで削除
        db.collection('users').doc(currentUser.id).collection('routines').doc(id)
            .delete()
            .then(() => {
                console.log('Routine deleted successfully');
            })
            .catch((error) => {
                console.error('Error deleting routine:', error);
                alert('ルーティンの削除に失敗しました。');
            });
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
    const email = formData.get('email') || formData.get('username');
    const password = formData.get('password');
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
        
        // Firebaseでユーザー登録
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User registered successfully:', user.uid);
                
                // 初期データを作成
                initializeUserData();
            })
            .catch((error) => {
                console.error('Registration error:', error);
                let errorMessage = '登録に失敗しました';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'このメールアドレスは既に使用されています';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = '無効なメールアドレスです';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'パスワードが弱すぎます';
                        break;
                }
                
                showAuthError(errorMessage);
            });
        
    } else {
        // ログイン
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User logged in successfully:', user.uid);
            })
            .catch((error) => {
                console.error('Login error:', error);
                let errorMessage = 'ログインに失敗しました';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'ユーザーが見つかりません';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'パスワードが正しくありません';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = '無効なメールアドレスです';
                        break;
                }
                
                showAuthError(errorMessage);
            });
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
    // 新しいユーザーの初期データを作成
    routines = [];
    
    // 初期設定をFirestoreに保存
    if (currentUser) {
        db.collection('users').doc(currentUser.id).set({
            settings: settings,
            createdAt: new Date().toISOString()
        }, { merge: true })
        .then(() => {
            console.log('User data initialized in Firestore');
        })
        .catch((error) => {
            console.error('Error initializing user data:', error);
        });
    }
    
    updateDisplay();
}

// タブクリック時の頻度設定
function setFrequencyFromTab(frequency) {
    if (frequencyInput) {
        frequencyInput.value = frequency;
        handleFrequencyChange();
    }
}

// 自然言語入力の切り替え
function toggleNaturalLanguageInput() {
    const inputContainer = document.getElementById('naturalLanguageInput');
    const inputField = document.getElementById('naturalLanguageField');
    
    if (inputContainer.style.display === 'none') {
        inputContainer.style.display = 'block';
        inputField.focus();
        showAINotification('自然言語でルーティンを入力してください。例: 「毎日7時に朝の運動」', 'info');
    } else {
        inputContainer.style.display = 'none';
        inputField.value = '';
    }
}

// 自然言語入力のキー処理
function handleNaturalLanguageKeyPress(event) {
    if (event.key === 'Enter') {
        const text = event.target.value.trim();
        if (text) {
            processNaturalLanguageInput(text);
            event.target.value = '';
            document.getElementById('naturalLanguageInput').style.display = 'none';
        }
    }
}

// ルーティン保存後のAI学習
function learnFromNewRoutine(routine) {
    // AIに新しいルーティンを学習させる
    routineAI.analyzeUserPatterns(routines);
    
    // 成功予測を表示
    const successRate = routineAI.predictSuccess(routine);
    let predictionClass = 'medium';
    if (successRate >= 70) predictionClass = 'high';
    else if (successRate < 50) predictionClass = 'low';
    
    showAINotification(
        `新しいルーティン「${routine.title}」を追加しました！\n` +
        `AI予測: 成功確率 ${successRate}%`,
        'success'
    );
}

// シンプルモード切り替え
function switchToSimpleMode() {
    const modal = document.createElement('div');
    modal.className = 'simple-mode-modal';
    modal.innerHTML = `
        <div class="simple-mode-content">
            <div class="simple-mode-header">
                <h3>⚡ シンプルモードに切り替え</h3>
                <span class="simple-mode-indicator">Firebase不要</span>
            </div>
            <div class="simple-mode-body">
                <p><strong>シンプルモードの特徴:</strong></p>
                
                <h4>✅ メリット:</h4>
                <ul>
                    <li>Firebase設定が不要</li>
                    <li>すぐに使える</li>
                    <li>設定が簡単</li>
                    <li>オフラインでも動作</li>
                    <li>データはブラウザに保存</li>
                </ul>
                
                <h4>⚠️ 注意点:</h4>
                <ul>
                    <li>データはブラウザ固有（他のブラウザでは見えない）</li>
                    <li>ブラウザのデータを削除すると消える</li>
                    <li>複数デバイスでの同期は不可</li>
                </ul>
                
                <h4>🔄 切り替え手順:</h4>
                <ol>
                    <li>現在のデータをバックアップ（推奨）</li>
                    <li>シンプル認証システムに切り替え</li>
                    <li>新しいアカウントを作成</li>
                    <li>ルーティンを再登録</li>
                </ol>
                
                <div class="backup-section">
                    <h4>💾 データバックアップ:</h4>
                    <p>現在のデータをエクスポートして保存することをお勧めします。</p>
                    <button onclick="exportCurrentData()" class="btn-secondary">現在のデータをエクスポート</button>
                </div>
            </div>
            <div class="simple-mode-actions">
                <button onclick="confirmSwitchToSimpleMode()" class="btn-primary">シンプルモードに切り替え</button>
                <button onclick="closeSimpleModeModal()" class="btn-cancel">キャンセル</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// 現在のデータをエクスポート
function exportCurrentData() {
    try {
        // 現在のルーティンデータを取得
        const currentData = {
            routines: routines,
            settings: settings,
            timestamp: new Date().toISOString(),
            note: 'Firebaseモードからエクスポートしたデータ'
        };
        
        // JSONファイルとしてダウンロード
        const dataStr = JSON.stringify(currentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-routine-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        showAINotification('データのエクスポートが完了しました！', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showAINotification('データのエクスポートに失敗しました', 'error');
    }
}

// シンプルモードへの切り替えを確認
function confirmSwitchToSimpleMode() {
    const modal = document.querySelector('.simple-mode-modal');
    modal.innerHTML = `
        <div class="simple-mode-content">
            <div class="simple-mode-header">
                <h3>🔄 シンプルモードに切り替え中</h3>
                <span class="simple-mode-indicator">処理中...</span>
            </div>
            <div class="simple-mode-body">
                <p><strong>シンプルモードに切り替えています...</strong></p>
                
                <div class="switch-progress">
                    <div class="progress-step">
                        <span class="step-icon">⚡</span>
                        <span class="step-text">シンプル認証システムを初期化中...</span>
                    </div>
                    <div class="progress-step">
                        <span class="step-icon">💾</span>
                        <span class="step-text">ローカルストレージを設定中...</span>
                    </div>
                    <div class="progress-step">
                        <span class="step-icon">🔄</span>
                        <span class="step-text">アプリを再起動中...</span>
                    </div>
                </div>
                
                <div class="switch-complete" style="display: none;">
                    <h4>✅ 切り替え完了！</h4>
                    <p>シンプルモードに正常に切り替えられました。</p>
                    <p>ページを再読み込みして、新しいアカウントを作成してください。</p>
                </div>
            </div>
            <div class="simple-mode-actions">
                <button onclick="completeSimpleModeSwitch()" class="btn-primary" style="display: none;">完了</button>
                <button onclick="closeSimpleModeModal()" class="btn-secondary">閉じる</button>
            </div>
        </div>
    `;
    
    // 切り替え処理を実行
    performSimpleModeSwitch();
}

// シンプルモード切り替えを実行
function performSimpleModeSwitch() {
    setTimeout(() => {
        try {
            // シンプル認証システムを初期化
            startSimpleAuth();
            
            setTimeout(() => {
                // シンプルストレージシステムを初期化
                startSimpleStorage();
                
                setTimeout(() => {
                    // 切り替え完了を表示
                    const completeSection = document.querySelector('.switch-complete');
                    const completeButton = document.querySelector('.simple-mode-actions .btn-primary');
                    
                    if (completeSection) {
                        completeSection.style.display = 'block';
                    }
                    if (completeButton) {
                        completeButton.style.display = 'block';
                    }
                    
                    // ローカルストレージにシンプルモードフラグを設定
                    localStorage.setItem('simpleMode', 'true');
                    
                    showAINotification('シンプルモードに切り替えが完了しました！', 'success');
                }, 1000);
            }, 1000);
        } catch (error) {
            console.error('Simple mode switch error:', error);
            showAINotification('シンプルモードへの切り替えに失敗しました', 'error');
        }
    }, 1000);
}

// シンプルモード切り替え完了
function completeSimpleModeSwitch() {
    closeSimpleModeModal();
    // ページを再読み込み
    location.reload();
}

// シンプルモードモーダルを閉じる
function closeSimpleModeModal() {
    const modal = document.querySelector('.simple-mode-modal');
    if (modal) {
        modal.remove();
    }
}

// アプリ初期化時にシンプルモードをチェック
function checkSimpleMode() {
    const isSimpleMode = localStorage.getItem('simpleMode') === 'true';
    
    if (isSimpleMode) {
        // シンプルモードが有効な場合
        console.log('Simple mode is enabled');
        
        // シンプル認証とストレージを初期化
        startSimpleAuth();
        startSimpleStorage();
        
        // Firebase関連の要素を非表示
        const firebaseElements = document.querySelectorAll('.firebase-fix-section');
        firebaseElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // シンプルモード表示を追加
        showSimpleModeIndicator();
    }
}

// シンプルモード表示を追加
function showSimpleModeIndicator() {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        const indicator = document.createElement('div');
        indicator.className = 'simple-mode-indicator-display';
        indicator.innerHTML = `
            <div class="indicator-content">
                <span class="indicator-icon">⚡</span>
                <span class="indicator-text">シンプルモード</span>
            </div>
        `;
        authContainer.appendChild(indicator);
    }
} 