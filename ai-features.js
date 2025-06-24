// AI機能モジュール
class AIFeatures {
    constructor() {
        this.isEnabled = false;
        this.features = {
            smartSuggestions: true,
            autoCategorization: true,
            progressAnalysis: true
        };
    }

    // AI機能を初期化
    init() {
        this.isEnabled = true;
        console.log('AI features initialized');
    }

    // スマートなルーティン提案
    suggestRoutines(userRoutines) {
        if (!this.isEnabled || !this.features.smartSuggestions) {
            return [];
        }

        const suggestions = [
            {
                title: '朝の運動',
                description: '健康的な一日の始まりに',
                frequency: 'daily',
                time: '07:00'
            },
            {
                title: '読書時間',
                description: '知識を深める時間',
                frequency: 'daily',
                time: '20:00'
            },
            {
                title: '週末の掃除',
                description: '週末の大掃除',
                frequency: 'weekly',
                time: '10:00'
            },
            {
                title: '月次振り返り',
                description: '月の目標達成度を確認',
                frequency: 'monthly',
                time: '19:00'
            }
        ];

        return suggestions;
    }

    // 自動カテゴリ分類
    categorizeRoutine(routine) {
        if (!this.isEnabled || !this.features.autoCategorization) {
            return 'general';
        }

        const title = routine.title.toLowerCase();
        const description = (routine.description || '').toLowerCase();

        if (title.includes('運動') || title.includes('筋トレ') || title.includes('ジム')) {
            return 'health';
        } else if (title.includes('読書') || title.includes('勉強') || title.includes('学習')) {
            return 'education';
        } else if (title.includes('掃除') || title.includes('洗濯') || title.includes('料理')) {
            return 'household';
        } else if (title.includes('仕事') || title.includes('会議') || title.includes('報告')) {
            return 'work';
        } else {
            return 'general';
        }
    }

    // 進捗分析
    analyzeProgress(completions, routines) {
        if (!this.isEnabled || !this.features.progressAnalysis) {
            return null;
        }

        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const weeklyCompletions = completions.filter(c => {
            const completionDate = new Date(c.date);
            return completionDate >= lastWeek;
        });

        const monthlyCompletions = completions.filter(c => {
            const completionDate = new Date(c.date);
            return completionDate >= lastMonth;
        });

        const weeklyRate = routines.length > 0 ? (weeklyCompletions.length / (routines.length * 7)) * 100 : 0;
        const monthlyRate = routines.length > 0 ? (monthlyCompletions.length / (routines.length * 30)) * 100 : 0;

        return {
            weeklyRate: Math.round(weeklyRate),
            monthlyRate: Math.round(monthlyRate),
            totalRoutines: routines.length,
            weeklyCompletions: weeklyCompletions.length,
            monthlyCompletions: monthlyCompletions.length
        };
    }

    // モチベーション向上のメッセージを生成
    generateMotivationalMessage(progress) {
        if (!this.isEnabled) return null;

        if (progress.weeklyRate >= 80) {
            return {
                message: '素晴らしい！今週は高い達成率を維持しています。',
                type: 'success'
            };
        } else if (progress.weeklyRate >= 60) {
            return {
                message: '良い調子です！もう少し頑張れば目標達成です。',
                type: 'info'
            };
        } else if (progress.weeklyRate >= 40) {
            return {
                message: '少しペースが落ちていますが、焦らずに続けましょう。',
                type: 'warning'
            };
        } else {
            return {
                message: '今週は達成率が低めです。小さな目標から始めてみませんか？',
                type: 'warning'
            };
        }
    }

    // 機能を有効/無効にする
    toggleFeature(featureName, enabled) {
        if (this.features.hasOwnProperty(featureName)) {
            this.features[featureName] = enabled;
            console.log(`AI feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    // 設定を取得
    getSettings() {
        return {
            isEnabled: this.isEnabled,
            features: { ...this.features }
        };
    }

    // 設定を保存
    saveSettings(settings) {
        this.isEnabled = settings.isEnabled;
        this.features = { ...settings.features };
        localStorage.setItem('aiFeaturesSettings', JSON.stringify(settings));
    }
}

// グローバルAI機能インスタンス
const aiFeatures = new AIFeatures();

// シンプルモードのチェック
function checkSimpleMode() {
    const simpleMode = localStorage.getItem('simpleMode') === 'true';
    return simpleMode;
}

// シンプルモードの切り替え
function toggleSimpleMode() {
    const currentMode = checkSimpleMode();
    const newMode = !currentMode;
    localStorage.setItem('simpleMode', newMode.toString());
    
    if (typeof showAINotification === 'function') {
        showAINotification(
            newMode ? 'シンプルモードが有効になりました' : 'シンプルモードが無効になりました',
            'info'
        );
    }
    
    // ページをリロードして変更を反映
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// AI機能を初期化
function initAIFeatures() {
    aiFeatures.init();
    console.log('AI機能が初期化されました');
}

// ページ読み込み時にAI機能を初期化
document.addEventListener('DOMContentLoaded', function() {
    initAIFeatures();
    
    // シンプルモードの状態をチェック
    if (checkSimpleMode()) {
        console.log('シンプルモードが有効です');
        // シンプルモード用のUI調整
        document.body.classList.add('simple-mode');
    }
});

// エクスポート
window.AIFeatures = AIFeatures;
window.aiFeatures = aiFeatures;
window.checkSimpleMode = checkSimpleMode;
window.toggleSimpleMode = toggleSimpleMode; 