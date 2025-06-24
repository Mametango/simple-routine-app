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
                description: '週末の整理整頓',
                frequency: 'weekly',
                time: '10:00'
            }
        ];

        return suggestions;
    }

    // 自動カテゴリ分類
    categorizeRoutine(title, description) {
        if (!this.isEnabled || !this.features.autoCategorization) {
            return 'general';
        }

        const text = (title + ' ' + description).toLowerCase();
        
        if (text.includes('運動') || text.includes('ジム') || text.includes('ランニング')) {
            return 'health';
        } else if (text.includes('読書') || text.includes('学習') || text.includes('勉強')) {
            return 'education';
        } else if (text.includes('掃除') || text.includes('整理') || text.includes('片付け')) {
            return 'household';
        } else if (text.includes('仕事') || text.includes('業務') || text.includes('会議')) {
            return 'work';
        } else {
            return 'general';
        }
    }

    // 進捗分析
    analyzeProgress(routines, completions) {
        if (!this.isEnabled || !this.features.progressAnalysis) {
            return null;
        }

        const analysis = {
            totalRoutines: routines.length,
            completedToday: 0,
            completionRate: 0,
            streak: 0,
            suggestions: []
        };

        // 今日の完了数を計算
        const today = new Date().toDateString();
        analysis.completedToday = completions.filter(c => 
            new Date(c.timestamp).toDateString() === today
        ).length;

        // 完了率を計算
        if (routines.length > 0) {
            analysis.completionRate = Math.round((analysis.completedToday / routines.length) * 100);
        }

        // 提案を生成
        if (analysis.completionRate < 50) {
            analysis.suggestions.push('今日の目標達成率が低いです。優先順位を決めて取り組みましょう。');
        } else if (analysis.completionRate >= 80) {
            analysis.suggestions.push('素晴らしい進捗です！この調子で続けましょう。');
        }

        return analysis;
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

// グローバルインスタンス
const aiFeatures = new AIFeatures();

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 保存された設定を読み込み
    const savedSettings = localStorage.getItem('aiFeaturesSettings');
    if (savedSettings) {
        aiFeatures.saveSettings(JSON.parse(savedSettings));
    }
    
    aiFeatures.init();
});

// シンプルモードチェック関数
function checkSimpleMode() {
    const simpleMode = localStorage.getItem('simpleMode') === 'true';
    return simpleMode;
}

// シンプルモードを有効/無効にする
function toggleSimpleMode() {
    const currentMode = checkSimpleMode();
    localStorage.setItem('simpleMode', (!currentMode).toString());
    location.reload(); 