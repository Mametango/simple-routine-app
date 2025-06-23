// アプリケーションの状態管理
let routines = [];
let currentUser = null;
let currentFilter = 'all';
let settings = {
    enableNotifications: true,
    defaultNotificationTime: '08:00',
    notificationSound: 'default',
    notificationDuration: 10,
    theme: 'light',
    language: 'ja'
};
let isComposing = false; // 日本語入力の状態管理

// --- DOM要素のキャッシュ ---
// DOM要素を一度だけ取得し、再利用することでパフォーマンスを向上させます。
const dom = {
    authContainer: document.getElementById('authContainer'),
    mainApp: document.getElementById('mainApp'),
    authForm: document.getElementById('authForm'),
    authError: document.getElementById('authError'),
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    currentUserSpan: document.getElementById('currentUser'),
    logoutButton: document.getElementById('logoutButton'),
    addButton: document.getElementById('addButton'),
    formContainer: document.getElementById('formContainer'),
    titleInput: document.getElementById('titleInput'),
    descriptionInput: document.getElementById('descriptionInput'),
    frequencyInput: document.getElementById('frequencyInput'),
    timeInput: document.getElementById('timeInput'),
    weeklyDaysRow: document.getElementById('weeklyDaysRow'),
    weekdayInputs: document.querySelectorAll('.weekday-input'),
    monthlyDateRow: document.getElementById('monthlyDateRow'),
    monthlyDateInput: document.getElementById('monthlyDateInput'),
    saveButton: document.getElementById('saveButton'),
    routinesList: document.getElementById('routinesList'),
    emptyState: document.getElementById('emptyState'),
    totalCount: document.getElementById('totalCount'),
    completedCount: document.getElementById('completedCount'),
    completionRate: document.getElementById('completionRate'),
    modalOverlay: document.getElementById('modalOverlay'),
    editTitleInput: document.getElementById('editTitleInput'),
    editDescriptionInput: document.getElementById('editDescriptionInput'),
    editFrequencyInput: document.getElementById('editFrequencyInput'),
    editTimeInput: document.getElementById('editTimeInput'),
    editWeeklyDaysRow: document.getElementById('editWeeklyDaysRow'),
    editWeekdayInputs: document.querySelectorAll('#editWeeklyDaysRow .weekday-input'),
    editMonthlyDateRow: document.getElementById('editMonthlyDateRow'),
    editMonthlyDateInput: document.getElementById('editMonthlyDateInput'),
    editSaveButton: document.getElementById('editSaveButton'),
    editCancelButton: document.getElementById('editCancelButton'),
    tabButtons: document.querySelectorAll('.tab-button'),
    notificationButton: document.getElementById('notificationButton'),
    togglePassword: document.getElementById('togglePassword'),
    toggleConfirmPassword: document.getElementById('toggleConfirmPassword')
};

// --- 初期化処理 ---

/**
 * DOMContentLoadedイベント発火時にアプリケーションの初期化を実行します。
 * - Firebaseの認証状態を監視し、UIの表示を切り替えます。
 * - ログイン/登録フォームのイベントリスナーを設定します。
 */
document.addEventListener('DOMContentLoaded', () => {
    // 認証状態の変更を監視するリスナーを一度だけ設定
    auth.onAuthStateChanged(user => {
        handleAuthStateChange(user);
    });

    // ログイン・登録フォームの送信イベント
    if (dom.authForm) {
        dom.authForm.addEventListener('submit', handleAuthFormSubmit);
    }

    // その他の汎用イベントリスナーを設定
    setupEventListeners();
    
    lucide.createIcons();
});

/**
 * 認証状態の変更に応じてUIを更新します。
 * @param {firebase.User | null} user - Firebaseのユーザーオブジェクトまたはnull
 */
function handleAuthStateChange(user) {
    const onAuthPage = window.location.pathname.includes('register.html') || window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

    if (user) {
        currentUser = {
            id: user.uid,
            username: user.displayName || user.email,
            email: user.email
        };
        if (onAuthPage) {
            // 認証ページにいる場合は、メインアプリ画面に切り替える
            showMainApp();
            initializeApp();
        } else if (window.location.pathname.includes('register.html')) {
            // 登録ページからリダイレクト
            window.location.href = 'index.html';
        } else {
            // ログイン済みでアプリページを直接開いた場合
            initializeApp();
        }
    } else {
        currentUser = null;
        routines = []; // ログアウトしたらルーチンをクリア
        if (!onAuthPage) {
            // アプリページにいてログアウトされたら、認証ページにリダイレクト
            window.location.href = 'index.html';
        } else {
            // 認証ページでログアウト状態の場合、認証フォームを表示
            showAuthScreen();
        }
    }
}

/**
 * ログイン・登録フォームの送信を処理します。
 * @param {Event} e - フォーム送信イベント
 */
async function handleAuthFormSubmit(e) {
    e.preventDefault();
    if (dom.authError) dom.authError.style.display = 'none';

    const isRegisterPage = window.location.pathname.includes('register.html');
    const email = dom.emailInput.value;
    const password = dom.passwordInput.value;

    try {
        if (isRegisterPage) {
            // --- 新規登録 ---
            const usernameInput = document.getElementById('username');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const username = usernameInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (password !== confirmPassword) throw { code: 'auth/password-mismatch' };
            if (!username) throw { code: 'auth/username-required' };
            
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: username });
            
            // Firestoreにユーザー情報を保存
            await db.collection('users').doc(userCredential.user.uid).set({
                username: username,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            // 成功後の画面遷移は onAuthStateChanged に任せる

        } else {
            // --- ログイン ---
            await auth.signInWithEmailAndPassword(email, password);
            // 成功後の画面遷移は onAuthStateChanged に任せる
        }
    } catch (error) {
        console.error("Authentication error:", error);
        if (dom.authError) {
            dom.authError.textContent = getFirebaseAuthErrorMessage(error.code);
            dom.authError.style.display = 'block';
        }
    }
}

/**
 * ログイン成功後に、アプリケーションの主要機能を初期化します。
 */
function initializeApp() {
    if (!currentUser) return;
    console.log("Initializing app for user:", currentUser.username);
    loadSettings();
    loadRoutines();
    initializeNotifications();
    setupJapaneseInput();
    updateTheme();
}

/**
 * 汎用のイベントリスナーをまとめて設定します。
 */
function setupEventListeners() {
    if (dom.logoutButton) dom.logoutButton.addEventListener('click', logout);
    if (dom.addButton) dom.addButton.addEventListener('click', showAddForm);
    if (dom.saveButton) dom.saveButton.addEventListener('click', saveRoutine);
    if (dom.frequencyInput) dom.frequencyInput.addEventListener('change', handleFrequencyChange);
    if (dom.editFrequencyInput) dom.editFrequencyInput.addEventListener('change', handleEditFrequencyChange);
    if (dom.editSaveButton) dom.editSaveButton.addEventListener('click', saveEditRoutine);
    if (dom.editCancelButton) dom.editCancelButton.addEventListener('click', hideModal);
    if (dom.notificationButton) dom.notificationButton.addEventListener('click', requestNotificationPermission);

    if (dom.togglePassword) dom.togglePassword.addEventListener('click', () => togglePasswordVisibility('password'));
    if (dom.toggleConfirmPassword) dom.toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility('confirmPassword'));

    dom.tabButtons.forEach(button => {
        button.addEventListener('click', () => filterRoutines(button.dataset.frequency));
    });

    if (dom.modalOverlay) {
        dom.modalOverlay.addEventListener('click', (e) => {
            if (e.target === dom.modalOverlay) hideModal();
        });
    }
    
    // 設定モーダル関連
    document.querySelectorAll('.settings-button').forEach(btn => btn.addEventListener('click', openSettings));
    document.querySelectorAll('.close').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal').style.display = 'none'));
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) event.target.style.display = 'none';
    });
}


// --- UI表示切り替え ---

function showAuthScreen() {
    if (dom.authContainer) dom.authContainer.style.display = 'flex';
    if (dom.mainApp) dom.mainApp.style.display = 'none';
}

function showMainApp() {
    if (dom.authContainer) dom.authContainer.style.display = 'none';
    if (dom.mainApp) dom.mainApp.style.display = 'block';
    if (dom.currentUserSpan && currentUser) {
        dom.currentUserSpan.textContent = currentUser.username;
    }
}

function logout() {
    auth.signOut().catch(error => console.error('Logout error:', error));
}


// --- ルーティン管理 (CRUD) ---

function loadRoutines() {
    if (!currentUser) return;
    db.collection('users').doc(currentUser.id).collection('routines')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            routines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            displayRoutines();
        }, (error) => {
            console.error('Error loading routines:', error);
        });
}

function saveRoutine() {
    const title = dom.titleInput.value.trim();
    if (!title) {
        alert('タイトルを入力してください。');
        return;
    }

    const newRoutine = {
        title: title,
        description: dom.descriptionInput.value.trim(),
        frequency: dom.frequencyInput.value,
        time: dom.timeInput.value,
        weekdays: dom.frequencyInput.value === 'weekly' ? getSelectedWeekdays(dom.weekdayInputs) : null,
        monthDay: dom.frequencyInput.value === 'monthly' ? parseInt(dom.monthlyDateInput.value) : null,
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if ((newRoutine.frequency === 'weekly' && !newRoutine.weekdays.length) ||
        (newRoutine.frequency === 'monthly' && !newRoutine.monthDay)) {
        alert('頻度の詳細（曜日または日付）を選択してください。');
        return;
    }

    db.collection('users').doc(currentUser.id).collection('routines').add(newRoutine)
        .then(() => hideAddForm())
        .catch(err => console.error("Error adding routine: ", err));
}

function editRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        dom.modalOverlay.setAttribute('data-edit-id', id);
        dom.editTitleInput.value = routine.title;
        dom.editDescriptionInput.value = routine.description || '';
        dom.editFrequencyInput.value = routine.frequency;
        handleEditFrequencyChange(); // UIを更新
        dom.editTimeInput.value = routine.time || '';

        // 曜日・日付を設定
        dom.editWeekdayInputs.forEach(cb => cb.checked = false);
        if (routine.frequency === 'weekly' && routine.weekdays) {
            routine.weekdays.forEach(day => {
                const checkbox = document.querySelector(`#editWeeklyDaysRow .weekday-input[value="${day}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        if (routine.frequency === 'monthly') {
            dom.editMonthlyDateInput.value = routine.monthDay || '';
        }
        
        showModal();
    }
}

function saveEditRoutine() {
    const editId = dom.modalOverlay.getAttribute('data-edit-id');
    if (!editId) return;

    const updatedData = {
        title: dom.editTitleInput.value.trim(),
        description: dom.editDescriptionInput.value.trim(),
        frequency: dom.editFrequencyInput.value,
        time: dom.editTimeInput.value,
        weekdays: dom.editFrequencyInput.value === 'weekly' ? getSelectedWeekdays(dom.editWeekdayInputs) : null,
        monthDay: dom.editFrequencyInput.value === 'monthly' ? parseInt(dom.editMonthlyDateInput.value) : null,
    };

    db.collection('users').doc(currentUser.id).collection('routines').doc(editId).update(updatedData)
        .then(() => hideModal())
        .catch(err => console.error("Error updating routine: ", err));
}

function toggleRoutine(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        db.collection('users').doc(currentUser.id).collection('routines').doc(id)
            .update({ completed: !routine.completed })
            .catch(err => console.error("Error toggling routine: ", err));
    }
}

function deleteRoutine(id) {
    if (confirm('このルーティンを削除しますか？')) {
        db.collection('users').doc(currentUser.id).collection('routines').doc(id)
            .delete()
            .catch(err => console.error("Error deleting routine: ", err));
    }
}


// --- UI更新 / ヘルパー関数 ---

function displayRoutines() {
    const filteredRoutines = currentFilter === 'all'
        ? routines
        : routines.filter(r => r.frequency === currentFilter);

    if (!dom.routinesList) return;
    dom.routinesList.innerHTML = '';

    if (filteredRoutines.length === 0) {
        dom.emptyState.style.display = 'block';
        dom.routinesList.style.display = 'none';
    } else {
        dom.emptyState.style.display = 'none';
        dom.routinesList.style.display = 'block';
        filteredRoutines.forEach(routine => {
            const routineEl = document.createElement('div');
            routineEl.className = `routine-item ${routine.completed ? 'completed' : ''}`;
            routineEl.innerHTML = createRoutineHTML(routine);
            dom.routinesList.appendChild(routineEl);
        });
        lucide.createIcons();
    }
    updateStats();
}

function createRoutineHTML(routine) {
    const frequencyText = getFrequencyText(routine);
    const timeText = routine.time ? `<span class="routine-time">${routine.time}</span>` : '';
    const descriptionText = routine.description ? `<p class="routine-description">${routine.description}</p>` : '';
    const toggleIcon = routine.completed ? 'check-circle' : 'circle';
    const toggleText = routine.completed ? '完了' : '未完了';

    return `
        <div class="routine-content">
            <div class="routine-header">
                <h3 class="routine-title">${routine.title}</h3>
                <div class="routine-meta">
                    <span class="routine-frequency">${frequencyText}</span>
                    ${timeText}
                </div>
            </div>
            ${descriptionText}
            <div class="routine-actions">
                <button class="toggle-btn" onclick="toggleRoutine('${routine.id}')">
                    <i data-lucide="${toggleIcon}"></i> ${toggleText}
                </button>
                <button class="edit-btn" onclick="editRoutine('${routine.id}')"><i data-lucide="edit-3"></i></button>
                <button class="delete-btn" onclick="deleteRoutine('${routine.id}')"><i data-lucide="trash-2"></i></button>
            </div>
        </div>`;
}

function updateStats() {
    const total = routines.length;
    const completed = routines.filter(r => r.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (dom.totalCount) dom.totalCount.textContent = total;
    if (dom.completedCount) dom.completedCount.textContent = completed;
    if (dom.completionRate) dom.completionRate.textContent = `${rate}%`;
}

function getFrequencyText(routine) {
    switch (routine.frequency) {
        case 'daily': return '毎日';
        case 'weekly':
            const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
            const selectedDays = routine.weekdays?.map(day => dayNames[day]).join('・') || '';
            return `毎週${selectedDays}`;
        case 'monthly': return `毎月${routine.monthDay}日`;
        default: return '';
    }
}

function filterRoutines(frequency) {
    currentFilter = frequency;
    dom.tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.frequency === frequency);
    });
    displayRoutines();
}

function getSelectedWeekdays(inputs) {
    return Array.from(inputs)
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value));
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = document.querySelector(`#toggle${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)} i`);
    if (field.type === 'password') {
        field.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        field.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

function getFirebaseAuthErrorMessage(errorCode) {
    const messages = {
        'auth/user-not-found': 'メールアドレスまたはパスワードが正しくありません。',
        'auth/wrong-password': 'メールアドレスまたはパスワードが正しくありません。',
        'auth/invalid-email': 'メールアドレスの形式が正しくありません。',
        'auth/weak-password': 'パスワードは6文字以上で入力してください。',
        'auth/email-already-in-use': 'このメールアドレスは既に使用されています。',
        'auth/too-many-requests': '試行回数が多すぎます。後でもう一度お試しください。',
        'auth/network-request-failed': 'ネットワークエラー。接続を確認してください。',
        'auth/password-mismatch': 'パスワードが一致しません。',
        'auth/username-required': 'ユーザー名を入力してください。',
        'auth/invalid-credential': '認証情報が無効です。',
        'default': 'エラーが発生しました。設定を確認してください。'
    };
    return messages[errorCode] || messages['default'];
}

// --- フォーム / モーダル制御 ---

function showAddForm() {
    dom.formContainer.style.display = 'block';
    dom.titleInput.focus();
}

function hideAddForm() {
    dom.formContainer.style.display = 'none';
    dom.authForm.reset(); // フォームをリセット
    handleFrequencyChange(); // 頻度選択UIをリセット
}

function showModal() {
    dom.modalOverlay.style.display = 'flex';
}

function hideModal() {
    dom.modalOverlay.style.display = 'none';
    dom.modalOverlay.removeAttribute('data-edit-id');
}

function handleFrequencyChange() {
    const isWeekly = dom.frequencyInput.value === 'weekly';
    const isMonthly = dom.frequencyInput.value === 'monthly';
    dom.weeklyDaysRow.style.display = isWeekly ? 'flex' : 'none';
    dom.monthlyDateRow.style.display = isMonthly ? 'flex' : 'none';
}

function handleEditFrequencyChange() {
    const isWeekly = dom.editFrequencyInput.value === 'weekly';
    const isMonthly = dom.editFrequencyInput.value === 'monthly';
    dom.editWeeklyDaysRow.style.display = isWeekly ? 'flex' : 'none';
    dom.editMonthlyDateRow.style.display = isMonthly ? 'flex' : 'none';
}


// --- 設定関連 ---

function loadSettings() {
    // ログイン状態に関わらずローカルからまず読み込む
    const localSettings = localStorage.getItem('settings');
    if (localSettings) {
        settings = { ...settings, ...JSON.parse(localSettings) };
    }

    if (currentUser) {
        // ログインしていればFirestoreから読み込んで上書き
        db.collection('users').doc(currentUser.id).get().then(doc => {
            if (doc.exists && doc.data().settings) {
                settings = { ...settings, ...doc.data().settings };
                applySettings();
            }
        }).catch(err => console.error("Error loading settings: ", err));
    }
    applySettings();
}

function saveSettings() {
    settings.enableNotifications = document.getElementById('enableNotifications').checked;
    settings.defaultNotificationTime = document.getElementById('defaultNotificationTime').value;
    settings.theme = document.getElementById('themeSelect').value;

    localStorage.setItem('settings', JSON.stringify(settings)); // オフラインでも保存

    if (currentUser) {
        db.collection('users').doc(currentUser.id).set({ settings: settings }, { merge: true })
            .then(() => {
                alert('設定を保存しました。');
                applySettings();
                closeSettings();
            })
            .catch(err => alert('設定の保存に失敗しました。'));
    } else {
        alert('設定を保存しました。');
        applySettings();
        closeSettings();
    }
}

function applySettings() {
    document.getElementById('enableNotifications').checked = settings.enableNotifications;
    document.getElementById('defaultNotificationTime').value = settings.defaultNotificationTime;
    document.getElementById('themeSelect').value = settings.theme;
    updateTheme();
}

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function updateTheme() {
    document.body.className = settings.theme === 'dark' ? 'dark-theme' : '';
}

// --- 通知機能 ---

function initializeNotifications() {
    if (!settings.enableNotifications || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        startNotificationCheck();
    }
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                startNotificationCheck();
            }
        });
    }
}

function startNotificationCheck() {
    // 1分ごとに通知をチェック
    setInterval(checkNotifications, 60000);
}

function checkNotifications() {
    if (!settings.enableNotifications || Notification.permission !== 'granted') return;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    routines.forEach(routine => {
        if (!routine.completed && routine.time === currentTime) {
            let shouldNotify = false;
            const day = now.getDay();
            const date = now.getDate();

            if (routine.frequency === 'daily') shouldNotify = true;
            if (routine.frequency === 'weekly' && routine.weekdays.includes(day)) shouldNotify = true;
            if (routine.frequency === 'monthly' && routine.monthDay === date) shouldNotify = true;

            if (shouldNotify) {
                showNotification(routine.title, routine.description);
            }
        }
    });
}

function showNotification(title, body) {
    const notificationKey = `notif_${title}_${new Date().toDateString()}`;
    if (localStorage.getItem(notificationKey)) return; // 今日は既に通知済み

    new Notification(title, {
        body: body || '今日のタスクの時間です！',
        icon: '/favicon.ico'
    });
    localStorage.setItem(notificationKey, 'true');
}

// --- 日本語入力対応 ---

function setupJapaneseInput() {
    const inputs = [dom.titleInput, dom.descriptionInput, dom.editTitleInput, dom.editDescriptionInput];
    inputs.forEach(input => {
        if(input) {
            input.addEventListener('compositionstart', () => isComposing = true);
            input.addEventListener('compositionend', () => isComposing = false);
        }
    });
} 