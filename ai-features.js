// AI機能モジュール
class RoutineAI {
    constructor() {
        this.userPatterns = {};
        this.suggestions = [];
        this.analysisData = {};
    }

    // ユーザーのパターンを分析
    analyzeUserPatterns(routines) {
        const patterns = {
            completionRate: this.calculateCompletionRate(routines),
            preferredTimes: this.analyzePreferredTimes(routines),
            frequencyPatterns: this.analyzeFrequencyPatterns(routines),
            difficultyLevel: this.assessDifficultyLevel(routines),
            consistencyScore: this.calculateConsistencyScore(routines)
        };

        this.userPatterns = patterns;
        return patterns;
    }

    // 完了率の計算
    calculateCompletionRate(routines) {
        if (routines.length === 0) return 0;
        
        const totalCompletions = routines.reduce((sum, routine) => {
            return sum + (routine.completed ? 1 : 0);
        }, 0);
        
        return (totalCompletions / routines.length) * 100;
    }

    // 好ましい時間帯の分析
    analyzePreferredTimes(routines) {
        const timeSlots = {
            morning: 0,    // 6-12
            afternoon: 0,  // 12-18
            evening: 0,    // 18-24
            night: 0       // 0-6
        };

        routines.forEach(routine => {
            if (routine.time) {
                const hour = parseInt(routine.time.split(':')[0]);
                if (hour >= 6 && hour < 12) timeSlots.morning++;
                else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
                else if (hour >= 18 && hour < 24) timeSlots.evening++;
                else timeSlots.night++;
            }
        });

        return timeSlots;
    }

    // 頻度パターンの分析
    analyzeFrequencyPatterns(routines) {
        const frequencies = {
            daily: 0,
            weekly: 0,
            monthly: 0
        };

        routines.forEach(routine => {
            frequencies[routine.frequency]++;
        });

        return frequencies;
    }

    // 難易度レベルの評価
    assessDifficultyLevel(routines) {
        let totalDifficulty = 0;
        let count = 0;

        routines.forEach(routine => {
            let difficulty = 1; // 基本難易度
            
            // 頻度による難易度調整
            if (routine.frequency === 'daily') difficulty += 2;
            else if (routine.frequency === 'weekly') difficulty += 1;
            
            // 時間指定がある場合
            if (routine.time) difficulty += 1;
            
            // 複雑な設定がある場合
            if (routine.weekdays && routine.weekdays.length > 0) difficulty += 1;
            if (routine.monthDay) difficulty += 1;

            totalDifficulty += difficulty;
            count++;
        });

        const averageDifficulty = count > 0 ? totalDifficulty / count : 0;
        
        if (averageDifficulty <= 2) return '初級';
        else if (averageDifficulty <= 4) return '中級';
        else return '上級';
    }

    // 一貫性スコアの計算
    calculateConsistencyScore(routines) {
        if (routines.length === 0) return 0;

        const consistencyFactors = routines.map(routine => {
            let score = 0;
            
            // 完了済みのルーティン
            if (routine.completed) score += 1;
            
            // 時間指定があるルーティン
            if (routine.time) score += 0.5;
            
            // 詳細な設定があるルーティン
            if (routine.description) score += 0.3;
            
            return score;
        });

        const totalScore = consistencyFactors.reduce((sum, score) => sum + score, 0);
        return (totalScore / routines.length) * 100;
    }

    // スマート提案の生成
    generateSuggestions(routines) {
        const patterns = this.analyzeUserPatterns(routines);
        const suggestions = [];

        // 完了率が低い場合の提案
        if (patterns.completionRate < 50) {
            suggestions.push({
                type: 'completion',
                title: '完了率を向上させる提案',
                message: '完了率が低いようです。より簡単なルーティンから始めてみませんか？',
                action: '簡単なルーティンを提案する',
                priority: 'high'
            });
        }

        // 時間帯の偏りの提案
        const timeSlots = patterns.preferredTimes;
        const totalTimeSlots = Object.values(timeSlots).reduce((sum, count) => sum + count, 0);
        
        if (totalTimeSlots > 0) {
            const maxTimeSlot = Object.keys(timeSlots).reduce((a, b) => 
                timeSlots[a] > timeSlots[b] ? a : b
            );
            
            if (timeSlots[maxTimeSlot] / totalTimeSlots > 0.7) {
                suggestions.push({
                    type: 'time_distribution',
                    title: '時間帯の分散',
                    message: `${this.getTimeSlotName(maxTimeSlot)}に集中しています。他の時間帯も試してみませんか？`,
                    action: '時間帯を分散する',
                    priority: 'medium'
                });
            }
        }

        // 頻度の提案
        const frequencies = patterns.frequencyPatterns;
        if (frequencies.daily > frequencies.weekly + frequencies.monthly) {
            suggestions.push({
                type: 'frequency_balance',
                title: '頻度のバランス',
                message: '毎日のルーティンが多いようです。週次・月次のルーティンも取り入れてみませんか？',
                action: '頻度を調整する',
                priority: 'medium'
            });
        }

        // 新しいルーティンの提案
        if (routines.length < 5) {
            suggestions.push({
                type: 'new_routine',
                title: '新しい習慣の提案',
                message: 'より多くの習慣を取り入れて、充実した生活を送りませんか？',
                action: '新しいルーティンを提案する',
                priority: 'low'
            });
        }

        this.suggestions = suggestions;
        return suggestions;
    }

    // 時間帯名の取得
    getTimeSlotName(timeSlot) {
        const names = {
            morning: '朝',
            afternoon: '午後',
            evening: '夕方',
            night: '夜'
        };
        return names[timeSlot] || timeSlot;
    }

    // 最適な通知時間の提案
    suggestOptimalNotificationTime(routines) {
        const timeSlots = this.analyzePreferredTimes(routines);
        const totalRoutines = Object.values(timeSlots).reduce((sum, count) => sum + count, 0);
        
        if (totalRoutines === 0) return '08:00'; // デフォルト時間

        // 最も多い時間帯の1時間前に通知
        const maxTimeSlot = Object.keys(timeSlots).reduce((a, b) => 
            timeSlots[a] > timeSlots[b] ? a : b
        );

        const notificationTimes = {
            morning: '07:00',
            afternoon: '11:00',
            evening: '17:00',
            night: '23:00'
        };

        return notificationTimes[maxTimeSlot] || '08:00';
    }

    // 習慣の成功予測
    predictSuccess(routine) {
        const patterns = this.userPatterns;
        let successProbability = 50; // 基本確率

        // 完了率による調整
        if (patterns.completionRate > 70) successProbability += 20;
        else if (patterns.completionRate < 30) successProbability -= 20;

        // 頻度による調整
        if (routine.frequency === 'daily' && patterns.frequencyPatterns.daily > 0) {
            successProbability += 10;
        } else if (routine.frequency === 'weekly' && patterns.frequencyPatterns.weekly > 0) {
            successProbability += 15;
        }

        // 時間指定による調整
        if (routine.time) {
            const hour = parseInt(routine.time.split(':')[0]);
            const preferredTimes = patterns.preferredTimes;
            
            if (hour >= 6 && hour < 12 && preferredTimes.morning > 0) successProbability += 10;
            else if (hour >= 12 && hour < 18 && preferredTimes.afternoon > 0) successProbability += 10;
            else if (hour >= 18 && hour < 24 && preferredTimes.evening > 0) successProbability += 10;
        }

        return Math.min(100, Math.max(0, successProbability));
    }

    // 自然言語でのルーティン作成
    parseNaturalLanguage(text) {
        const routine = {
            title: '',
            description: '',
            frequency: 'daily',
            time: '',
            weekdays: null,
            monthDay: null
        };

        // タイトルの抽出
        routine.title = text.replace(/[毎日|毎週|毎月|時|分|曜日|日付].*/g, '').trim();

        // 頻度の抽出
        if (text.includes('毎日')) routine.frequency = 'daily';
        else if (text.includes('毎週')) routine.frequency = 'weekly';
        else if (text.includes('毎月')) routine.frequency = 'monthly';

        // 時間の抽出
        const timeMatch = text.match(/(\d{1,2})時(\d{1,2})?分?/);
        if (timeMatch) {
            const hour = timeMatch[1].padStart(2, '0');
            const minute = timeMatch[2] ? timeMatch[2].padStart(2, '0') : '00';
            routine.time = `${hour}:${minute}`;
        }

        // 曜日の抽出
        const weekdayMap = {
            '月': 1, '火': 2, '水': 3, '木': 4, '金': 5, '土': 6, '日': 0
        };
        
        const weekdays = [];
        Object.keys(weekdayMap).forEach(day => {
            if (text.includes(day)) {
                weekdays.push(weekdayMap[day]);
            }
        });
        
        if (weekdays.length > 0) {
            routine.weekdays = weekdays;
            routine.frequency = 'weekly';
        }

        // 日付の抽出
        const dateMatch = text.match(/(\d{1,2})日/);
        if (dateMatch) {
            routine.monthDay = parseInt(dateMatch[1]);
            routine.frequency = 'monthly';
        }

        return routine;
    }

    // AI分析レポートの生成
    generateAnalysisReport(routines) {
        const patterns = this.analyzeUserPatterns(routines);
        const suggestions = this.generateSuggestions(routines);

        return {
            summary: {
                totalRoutines: routines.length,
                completionRate: patterns.completionRate,
                difficultyLevel: patterns.difficultyLevel,
                consistencyScore: patterns.consistencyScore
            },
            patterns: patterns,
            suggestions: suggestions,
            recommendations: this.generateRecommendations(patterns, routines)
        };
    }

    // 推奨事項の生成
    generateRecommendations(patterns, routines) {
        const recommendations = [];

        if (patterns.completionRate < 50) {
            recommendations.push({
                type: 'improvement',
                title: '完了率の向上',
                description: 'より簡単で継続しやすいルーティンから始めましょう',
                actions: [
                    '短時間のルーティンを追加する',
                    '既存のルーティンを簡単にする',
                    '時間を柔軟に設定する'
                ]
            });
        }

        if (patterns.consistencyScore < 60) {
            recommendations.push({
                type: 'consistency',
                title: '一貫性の向上',
                description: 'ルーティンの一貫性を高めることで、より良い習慣を身につけられます',
                actions: [
                    '時間を固定する',
                    '詳細な説明を追加する',
                    '関連するルーティンをグループ化する'
                ]
            });
        }

        return recommendations;
    }
}

// グローバルAIインスタンス
const routineAI = new RoutineAI();

// AI機能の初期化
function initializeAI() {
    console.log('AI機能を初期化中...');
    
    // 既存のルーティンでAIを学習
    if (routines.length > 0) {
        routineAI.analyzeUserPatterns(routines);
        routineAI.generateSuggestions(routines);
    }
}

// AI提案の表示
function showAISuggestions() {
    const suggestions = routineAI.generateSuggestions(routines);
    
    if (suggestions.length === 0) {
        showAINotification('素晴らしいです！現在のルーティンは完璧です。', 'success');
        return;
    }

    let message = '🤖 AIからの提案:\n\n';
    suggestions.forEach((suggestion, index) => {
        message += `${index + 1}. ${suggestion.title}\n`;
        message += `   ${suggestion.message}\n\n`;
    });

    showAINotification(message, 'info');
}

// AI分析レポートの表示
function showAIAnalysis() {
    const report = routineAI.generateAnalysisReport(routines);
    
    let message = '📊 AI分析レポート\n\n';
    message += `総ルーティン数: ${report.summary.totalRoutines}\n`;
    message += `完了率: ${report.summary.completionRate.toFixed(1)}%\n`;
    message += `難易度レベル: ${report.summary.difficultyLevel}\n`;
    message += `一貫性スコア: ${report.summary.consistencyScore.toFixed(1)}%\n\n`;
    
    if (report.recommendations.length > 0) {
        message += '💡 推奨事項:\n';
        report.recommendations.forEach((rec, index) => {
            message += `${index + 1}. ${rec.title}\n`;
            message += `   ${rec.description}\n\n`;
        });
    }

    showAINotification(message, 'analysis');
}

// AI通知の表示
function showAINotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `ai-notification ai-${type}`;
    notification.innerHTML = `
        <div class="ai-notification-content">
            <div class="ai-notification-header">
                <span class="ai-icon">🤖</span>
                <span class="ai-title">AI アシスタント</span>
                <button class="ai-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="ai-message">${message.replace(/\n/g, '<br>')}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 5秒後に自動で消える
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// 自然言語入力の処理
function processNaturalLanguageInput(text) {
    const routine = routineAI.parseNaturalLanguage(text);
    
    if (routine.title) {
        // フォームに自動入力
        titleInput.value = routine.title;
        frequencyInput.value = routine.frequency;
        if (routine.time) timeInput.value = routine.time;
        if (routine.description) descriptionInput.value = routine.description;
        
        // 頻度に応じてフォームを更新
        handleFrequencyChange();
        
        // 曜日の設定
        if (routine.weekdays) {
            routine.weekdays.forEach(day => {
                const checkbox = document.querySelector(`.weekday-input[value="${day}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // 月の日付の設定
        if (routine.monthDay) {
            monthlyDateInput.value = routine.monthDay;
        }
        
        showAINotification(`ルーティン「${routine.title}」を解析しました！`, 'success');
    } else {
        showAINotification('ルーティンの解析に失敗しました。もう一度試してください。', 'error');
    }
} 