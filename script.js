// アプリケーションの状態管理
let routines = [];
let currentUser = null;
let isRegistering = false;
let currentFilter = 'all';

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
    initializeApp();
    setupEventListeners();
    setupJapaneseInput();
    lucide.createIcons();
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

function initializeApp() {
    // ユーザーの認証状態をチェック
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
        loadUserRoutines();
    } else {
        showAuthScreen();
    }
}

function setupEventListeners() {
    // 認証関連
    authForm.addEventListener('submit', handleAuthSubmit);
    toggleAuth.addEventListener('click', toggleAuthMode);
    logoutButton.addEventListener('click', handleLogout);
    togglePassword.addEventListener('click', () => togglePasswordVisibility('password'));
    toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility('confirmPassword'));

    // ルーティン関連
    addButton.addEventListener('click', showAddForm);
    saveButton.addEventListener('click', saveRoutine);
    
    // 頻度変更時の処理
    frequencyInput.addEventListener('change', handleFrequencyChange);
    editFrequencyInput.addEventListener('change', handleEditFrequencyChange);

    // モーダル関連
    editSaveButton.addEventListener('click', saveEditRoutine);
    editCancelButton.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModal();
    });

    // フィルター関連
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const frequency = button.dataset.frequency;
            setActiveTab(frequency);
            filterRoutines(frequency);
        });
    });
}

// 頻度変更時の処理
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

// 認証機能
function showAuthScreen() {
    authContainer.style.display = 'flex';
    mainApp.style.display = 'none';
}

function showMainApp() {
    authContainer.style.display = 'none';
    mainApp.style.display = 'block';
    currentUserSpan.textContent = currentUser.username;
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
        loadUserRoutines();
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
    authError.textContent = message;
    authError.style.display = 'block';
}

function hideAuthError() {
    authError.style.display = 'none';
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
    saveUserRoutines();
    updateDisplay();
}

function loadUserRoutines() {
    const userRoutines = localStorage.getItem(`routines_${currentUser.id}`);
    routines = userRoutines ? JSON.parse(userRoutines) : [];
    updateDisplay();
}

function saveUserRoutines() {
    localStorage.setItem(`routines_${currentUser.id}`, JSON.stringify(routines));
}

// ルーティン管理機能
function showAddForm() {
    formContainer.style.display = 'block';
    titleInput.focus();
    addButton.style.display = 'none';
    
    // 現在選択されているタブに基づいて頻度を自動設定
    if (currentFilter !== 'all') {
        frequencyInput.value = currentFilter;
    } else {
        frequencyInput.value = 'daily'; // デフォルトは毎日
    }
    
    // 頻度に応じて日付フィールドの表示を制御
    handleFrequencyChange();
}

function hideAddForm() {
    formContainer.style.display = 'none';
    addButton.style.display = 'flex';
    titleInput.value = '';
    descriptionInput.value = '';
    
    // 現在選択されているタブに基づいて頻度をリセット
    if (currentFilter !== 'all') {
        frequencyInput.value = currentFilter;
    } else {
        frequencyInput.value = 'daily';
    }
    
    timeInput.value = '';
    monthlyDateInput.value = '';
    monthlyDateRow.style.display = 'none';
    
    // 曜日選択をリセット
    weekdayInputs.forEach(input => input.checked = false);
    weeklyDaysRow.style.display = 'none';
}

function saveRoutine() {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const frequency = frequencyInput.value;
    const time = timeInput.value;
    const monthlyDate = frequency === 'monthly' ? monthlyDateInput.value : null;
    
    // 曜日選択の取得
    let weeklyDays = null;
    if (frequency === 'weekly') {
        weeklyDays = Array.from(weekdayInputs)
            .filter(input => input.checked)
            .map(input => parseInt(input.value))
            .sort((a, b) => a - b);
    }
    
    if (!title) {
        alert('タイトルを入力してください');
        return;
    }
    
    if (frequency === 'weekly' && (!weeklyDays || weeklyDays.length === 0)) {
        alert('曜日を選択してください');
        return;
    }
    
    if (frequency === 'monthly' && (!monthlyDate || monthlyDate < 1 || monthlyDate > 31)) {
        alert('毎月の日付は1-31の間で入力してください');
        return;
    }
    
    const routine = {
        id: Date.now().toString(),
        title,
        description,
        frequency,
        time,
        monthlyDate,
        weeklyDays,
        completed: false,
        createdAt: new Date().toISOString(),
        lastCompleted: null
    };
    
    routines.push(routine);
    saveUserRoutines();
    updateDisplay();
    hideAddForm();
}

function toggleRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        routine.completed = !routine.completed;
        routine.lastCompleted = routine.completed ? new Date().toISOString() : null;
        saveUserRoutines();
        updateDisplay();
    }
}

function editRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        editTitleInput.value = routine.title;
        editDescriptionInput.value = routine.description;
        editFrequencyInput.value = routine.frequency;
        editTimeInput.value = routine.time;
        editMonthlyDateInput.value = routine.monthlyDate || '';
        
        // 曜日選択を設定
        editWeekdayInputs.forEach(input => {
            input.checked = routine.weeklyDays && routine.weeklyDays.includes(parseInt(input.value));
        });
        
        editSaveButton.dataset.routineId = id;
        
        // 頻度に応じて日付フィールドの表示を制御
        handleEditFrequencyChange();
        
        showModal();
    }
}

function saveEditRoutine() {
    const id = editSaveButton.dataset.routineId;
    const routine = routines.find(r => r.id === id);
    
    if (routine) {
        routine.title = editTitleInput.value.trim();
        routine.description = editDescriptionInput.value.trim();
        routine.frequency = editFrequencyInput.value;
        routine.time = editTimeInput.value;
        routine.monthlyDate = editFrequencyInput.value === 'monthly' ? editMonthlyDateInput.value : null;
        
        // 曜日選択の更新
        if (editFrequencyInput.value === 'weekly') {
            routine.weeklyDays = Array.from(editWeekdayInputs)
                .filter(input => input.checked)
                .map(input => parseInt(input.value))
                .sort((a, b) => a - b);
        } else {
            routine.weeklyDays = null;
        }
        
        if (!routine.title) {
            alert('タイトルを入力してください');
            return;
        }
        
        if (routine.frequency === 'weekly' && (!routine.weeklyDays || routine.weeklyDays.length === 0)) {
            alert('曜日を選択してください');
            return;
        }
        
        if (routine.frequency === 'monthly' && (!routine.monthlyDate || routine.monthlyDate < 1 || routine.monthlyDate > 31)) {
            alert('毎月の日付は1-31の間で入力してください');
            return;
        }
        
        saveUserRoutines();
        updateDisplay();
        hideModal();
    }
}

function deleteRoutine(id) {
    if (confirm('このルーティンを削除しますか？')) {
        routines = routines.filter(r => r.id !== id);
        saveUserRoutines();
        updateDisplay();
    }
}

function showModal() {
    modalOverlay.style.display = 'flex';
}

function hideModal() {
    modalOverlay.style.display = 'none';
}

// フィルター機能
function setActiveTab(frequency) {
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.frequency === frequency) {
            button.classList.add('active');
        }
    });
    currentFilter = frequency;
    
    // フォームが開いている場合は頻度も更新
    if (formContainer.style.display === 'block' && frequency !== 'all') {
        frequencyInput.value = frequency;
        handleFrequencyChange();
    }
}

function filterRoutines(frequency) {
    const filteredRoutines = frequency === 'all' 
        ? routines 
        : routines.filter(routine => routine.frequency === frequency);
    
    displayRoutines(filteredRoutines);
}

// 表示更新
function updateDisplay() {
    updateStats();
    filterRoutines(currentFilter);
}

function updateStats() {
    const total = routines.length;
    const completed = routines.filter(r => r.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    completionRate.textContent = `${rate}%`;
}

function displayRoutines(routinesToShow) {
    if (routinesToShow.length === 0) {
        routinesList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    routinesList.style.display = 'block';
    emptyState.style.display = 'none';
    
    routinesList.innerHTML = routinesToShow.map(routine => `
        <div class="routine-item ${routine.completed ? 'completed' : ''}">
            <div class="routine-header">
                <div class="routine-main">
                    <h3 class="routine-title">${routine.title}</h3>
                    <div class="routine-meta-compact">
                        ${routine.frequency === 'monthly' && routine.monthlyDate ? `
                            <span class="meta-item">
                                <i data-lucide="calendar"></i>
                                毎月${routine.monthlyDate}日
                            </span>
                        ` : routine.frequency === 'weekly' && routine.weeklyDays ? `
                            <span class="meta-item">
                                <i data-lucide="calendar-days"></i>
                                毎週${getWeekdayText(routine.weeklyDays)}
                            </span>
                        ` : `
                            <span class="meta-item">
                                <i data-lucide="${getFrequencyIcon(routine.frequency)}"></i>
                                ${getFrequencyText(routine.frequency)}
                            </span>
                        `}
                        ${routine.time ? `
                            <span class="meta-item">
                                <i data-lucide="clock"></i>
                                ${routine.time}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="routine-actions">
                    <button class="routine-toggle" onclick="toggleRoutine('${routine.id}')">
                        <i data-lucide="${routine.completed ? 'check' : 'circle'}"></i>
                    </button>
                    <button class="routine-edit" onclick="editRoutine('${routine.id}')">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="routine-delete" onclick="deleteRoutine('${routine.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            ${routine.description ? `<p class="routine-description">${routine.description}</p>` : ''}
        </div>
    `).join('');
    
    lucide.createIcons();
}

function getFrequencyIcon(frequency) {
    const icons = {
        daily: 'sun',
        weekly: 'calendar-days',
        monthly: 'calendar'
    };
    return icons[frequency] || 'circle';
}

function getFrequencyText(frequency) {
    const texts = {
        daily: '毎日',
        weekly: '毎週',
        monthly: '毎月'
    };
    return texts[frequency] || frequency;
}

function getWeekdayText(weekdays) {
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays.map(day => dayNames[day]).join('・');
} 