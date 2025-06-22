// ルーティンデータの管理
class RoutineManager {
    constructor() {
        this.routines = this.loadRoutines();
        this.editingId = null;
        this.currentFilter = 'all';
        this.init();
    }

    // ローカルストレージからルーティンを読み込み
    loadRoutines() {
        const saved = localStorage.getItem('myRoutines');
        return saved ? JSON.parse(saved) : [];
    }

    // ローカルストレージにルーティンを保存
    saveRoutines() {
        localStorage.setItem('myRoutines', JSON.stringify(this.routines));
    }

    // ルーティンを追加
    addRoutine(title, description, frequency, time) {
        const routine = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description || '',
            frequency: frequency || 'daily',
            time: time || '',
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.routines.push(routine);
        this.saveRoutines();
        this.renderRoutines();
        this.updateStats();
    }

    // ルーティンを更新
    updateRoutine(id, title, description, frequency, time) {
        const index = this.routines.findIndex(r => r.id === id);
        if (index !== -1) {
            this.routines[index] = {
                ...this.routines[index],
                title: title.trim(),
                description: description || '',
                frequency: frequency || 'daily',
                time: time || ''
            };
            this.saveRoutines();
            this.renderRoutines();
        }
    }

    // ルーティンを削除
    deleteRoutine(id) {
        this.routines = this.routines.filter(r => r.id !== id);
        this.saveRoutines();
        this.renderRoutines();
        this.updateStats();
    }

    // ルーティンの完了状態を切り替え
    toggleRoutine(id) {
        const routine = this.routines.find(r => r.id === id);
        if (routine) {
            routine.completed = !routine.completed;
            this.saveRoutines();
            this.renderRoutines();
            this.updateStats();
        }
    }

    // 頻度フィルターを適用
    filterRoutines(frequency) {
        this.currentFilter = frequency;
        this.renderRoutines();
        this.updateTabButtons();
    }

    // フィルターされたルーティンを取得
    getFilteredRoutines() {
        if (this.currentFilter === 'all') {
            return this.routines;
        }
        return this.routines.filter(routine => routine.frequency === this.currentFilter);
    }

    // 統計情報を更新
    updateStats() {
        const filteredRoutines = this.getFilteredRoutines();
        const totalCount = filteredRoutines.length;
        const completedCount = filteredRoutines.filter(r => r.completed).length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('completionRate').textContent = completionRate + '%';
    }

    // 頻度の日本語表示を取得
    getFrequencyLabel(frequency) {
        const labels = {
            'daily': '毎日',
            'weekly': '毎週',
            'monthly': '毎月'
        };
        return labels[frequency] || frequency;
    }

    // 頻度のアイコンを取得
    getFrequencyIcon(frequency) {
        const icons = {
            'daily': 'sun',
            'weekly': 'calendar-days',
            'monthly': 'calendar'
        };
        return icons[frequency] || 'clock';
    }

    // ルーティンリストを表示
    renderRoutines() {
        const routinesList = document.getElementById('routinesList');
        const emptyState = document.getElementById('emptyState');
        const filteredRoutines = this.getFilteredRoutines();

        if (filteredRoutines.length === 0) {
            routinesList.style.display = 'none';
            emptyState.style.display = 'block';
            
            // 空の状態メッセージを更新
            const emptyMessage = this.currentFilter === 'all' 
                ? 'まだルーティンがありません'
                : `${this.getFrequencyLabel(this.currentFilter)}のルーティンがありません`;
            const emptyDescription = this.currentFilter === 'all'
                ? '新しいルーティンを追加して、毎日の習慣を始めましょう！'
                : `${this.getFrequencyLabel(this.currentFilter)}のルーティンを追加してみましょう！`;
            
            emptyState.querySelector('h3').textContent = emptyMessage;
            emptyState.querySelector('p').textContent = emptyDescription;
            return;
        }

        emptyState.style.display = 'none';
        routinesList.style.display = 'flex';

        routinesList.innerHTML = filteredRoutines.map(routine => `
            <div class="routine-card ${routine.completed ? 'completed' : ''}" data-id="${routine.id}">
                <div class="routine-content">
                    <div class="routine-header">
                        <h3 class="routine-title">${routine.title}</h3>
                        <div class="routine-actions">
                            <button class="action-button edit" onclick="routineManager.startEditing('${routine.id}')" title="編集">
                                <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="action-button delete" onclick="routineManager.deleteRoutine('${routine.id}')" title="削除">
                                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${routine.description ? `<p class="routine-description">${routine.description}</p>` : ''}
                    
                    <div class="routine-meta">
                        <div class="routine-frequency">
                            <i data-lucide="${this.getFrequencyIcon(routine.frequency)}" style="width: 14px; height: 14px;"></i>
                            <span>${this.getFrequencyLabel(routine.frequency)}</span>
                        </div>
                        ${routine.time ? `
                            <div class="routine-time">
                                <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                                <span>${routine.time}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="routine-date">
                        作成日: ${new Date(routine.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                </div>
                
                <button class="complete-button ${routine.completed ? 'completed' : ''}" onclick="routineManager.toggleRoutine('${routine.id}')">
                    <i data-lucide="check" style="width: 20px; height: 20px;"></i>
                    ${routine.completed ? '完了済み' : '完了にする'}
                </button>
            </div>
        `).join('');

        // Lucideアイコンを再初期化
        lucide.createIcons();
    }

    // タブボタンの状態を更新
    updateTabButtons() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.dataset.frequency === this.currentFilter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // 編集モードを開始
    startEditing(id) {
        const routine = this.routines.find(r => r.id === id);
        if (routine) {
            this.editingId = id;
            document.getElementById('editTitleInput').value = routine.title;
            document.getElementById('editDescriptionInput').value = routine.description;
            document.getElementById('editFrequencyInput').value = routine.frequency;
            document.getElementById('editTimeInput').value = routine.time;
            document.getElementById('modalOverlay').style.display = 'flex';
        }
    }

    // 編集を保存
    saveEdit() {
        if (!this.editingId) return;

        const title = document.getElementById('editTitleInput').value;
        const description = document.getElementById('editDescriptionInput').value;
        const frequency = document.getElementById('editFrequencyInput').value;
        const time = document.getElementById('editTimeInput').value;

        if (!title.trim()) return;

        this.updateRoutine(this.editingId, title, description, frequency, time);
        this.cancelEdit();
    }

    // 編集をキャンセル
    cancelEdit() {
        this.editingId = null;
        document.getElementById('modalOverlay').style.display = 'none';
        document.getElementById('editTitleInput').value = '';
        document.getElementById('editDescriptionInput').value = '';
        document.getElementById('editFrequencyInput').value = 'daily';
        document.getElementById('editTimeInput').value = '';
    }

    // 初期化
    init() {
        this.renderRoutines();
        this.updateStats();
        this.updateTabButtons();
        this.setupEventListeners();
        lucide.createIcons();
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // 頻度タブボタン
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.filterRoutines(button.dataset.frequency);
            });
        });

        // 追加ボタン
        document.getElementById('addButton').addEventListener('click', () => {
            const formContainer = document.getElementById('formContainer');
            const isVisible = formContainer.style.display !== 'none';
            
            if (isVisible) {
                formContainer.style.display = 'none';
                document.getElementById('addButton').innerHTML = '<i data-lucide="plus" class="button-icon"></i>新しいルーティンを追加';
            } else {
                formContainer.style.display = 'block';
                document.getElementById('addButton').innerHTML = '<i data-lucide="x" class="button-icon"></i>キャンセル';
            }
            lucide.createIcons();
        });

        // 保存ボタン
        document.getElementById('saveButton').addEventListener('click', () => {
            const title = document.getElementById('titleInput').value;
            const description = document.getElementById('descriptionInput').value;
            const frequency = document.getElementById('frequencyInput').value;
            const time = document.getElementById('timeInput').value;

            if (!title.trim()) return;

            this.addRoutine(title, description, frequency, time);

            // フォームをリセット
            document.getElementById('titleInput').value = '';
            document.getElementById('descriptionInput').value = '';
            document.getElementById('frequencyInput').value = 'daily';
            document.getElementById('timeInput').value = '';
            document.getElementById('formContainer').style.display = 'none';
            document.getElementById('addButton').innerHTML = '<i data-lucide="plus" class="button-icon"></i>新しいルーティンを追加';
            lucide.createIcons();
        });

        // 編集保存ボタン
        document.getElementById('editSaveButton').addEventListener('click', () => {
            this.saveEdit();
        });

        // 編集キャンセルボタン
        document.getElementById('editCancelButton').addEventListener('click', () => {
            this.cancelEdit();
        });

        // モーダル外クリックでキャンセル
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') {
                this.cancelEdit();
            }
        });

        // Enterキーで保存
        document.getElementById('titleInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('saveButton').click();
            }
        });

        document.getElementById('editTitleInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('editSaveButton').click();
            }
        });
    }
}

// アプリケーションを初期化
let routineManager;

document.addEventListener('DOMContentLoaded', () => {
    routineManager = new RoutineManager();
}); 