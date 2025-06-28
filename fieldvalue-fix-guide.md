# 🔧 FieldValue.serverTimestamp()問題解決ガイド

## 問題の概要
```
FirebaseError: Function DocumentReference.update() called with invalid data. 
FieldValue.serverTimestamp() is not currently supported inside arrays
```

このエラーは、Firestoreの配列内で`FieldValue.serverTimestamp()`を使用しようとした際に発生します。

## 🔍 原因
- 配列内のオブジェクトで`FieldValue.serverTimestamp()`を使用している
- Firestoreは配列内での`FieldValue.serverTimestamp()`をサポートしていない
- データ保存時に配列内のタイムスタンプが適切に処理されていない

## ✅ 実装した修正

### 1. データ保存時の修正
```javascript
// 配列内のFieldValue.serverTimestamp()を完全に除去
const cleanRoutines = routines.map(routine => {
    const cleanRoutine = { ...routine };
    
    // createdAtフィールドを確実にISO文字列に変換
    if (cleanRoutine.createdAt) {
        if (typeof cleanRoutine.createdAt === 'object' && cleanRoutine.createdAt.toDate) {
            // Firestore Timestampの場合
            cleanRoutine.createdAt = cleanRoutine.createdAt.toDate().toISOString();
        } else if (typeof cleanRoutine.createdAt === 'string') {
            // 既に文字列の場合
            cleanRoutine.createdAt = cleanRoutine.createdAt;
        } else {
            // その他の場合
            cleanRoutine.createdAt = new Date().toISOString();
        }
    } else {
        cleanRoutine.createdAt = new Date().toISOString();
    }
    
    // FieldValue.serverTimestamp()が含まれている場合は除去
    if (cleanRoutine.createdAt && typeof cleanRoutine.createdAt === 'object' && cleanRoutine.createdAt._methodName === 'serverTimestamp') {
        cleanRoutine.createdAt = new Date().toISOString();
    }
    
    return cleanRoutine;
});
```

### 2. データ読み込み時の修正
```javascript
// 読み込み時にもFieldValue.serverTimestamp()を処理
const cleanRoutines = newRoutines.map(routine => {
    const cleanRoutine = { ...routine };
    
    // createdAtフィールドを確実にISO文字列に変換
    if (cleanRoutine.createdAt) {
        if (typeof cleanRoutine.createdAt === 'object' && cleanRoutine.createdAt.toDate) {
            // Firestore Timestampの場合
            cleanRoutine.createdAt = cleanRoutine.createdAt.toDate().toISOString();
        } else if (typeof cleanRoutine.createdAt === 'string') {
            // 既に文字列の場合
            cleanRoutine.createdAt = cleanRoutine.createdAt;
        } else {
            // その他の場合
            cleanRoutine.createdAt = new Date().toISOString();
        }
    } else {
        cleanRoutine.createdAt = new Date().toISOString();
    }
    
    return cleanRoutine;
});
```

### 3. データリセット機能
```javascript
// データリセット機能（問題の根本的解決用）
async function resetUserData() {
    if (!currentUser) return;
    
    try {
        // ローカルデータをクリア
        routines = [];
        completions = [];
        
        // Firestoreのデータを初期化
        await db.collection('users').doc(currentUser.uid).set({
            email: currentUser.email,
            routines: [],
            completions: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSyncDevice: navigator.userAgent,
            lastSyncTimestamp: new Date().toISOString()
        });
        
        console.log('✅ データリセット完了');
        showMessage('データをリセットしました', 'success');
        
    } catch (error) {
        console.error('❌ データリセットエラー:', error);
        showMessage('データのリセットに失敗しました', 'error');
    }
}
```

## 🚀 解決手順

### 手順1: アプリを再読み込み
1. **ブラウザキャッシュクリア**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

2. **ページを完全にリロード**

### 手順2: データリセット（必要に応じて）
1. **リセットボタンをクリック**
   - メイン画面に「🔄 データリセット」ボタンが表示されます

2. **確認ダイアログで「OK」をクリック**
   - すべてのデータがクリアされます

### 手順3: 毎日ルーティンを追加
1. **「+」ボタンをクリック**
2. **タイトルを入力**
3. **頻度を「毎日」に設定**
4. **「追加」をクリック**

## 🔍 確認ポイント

### 成功のサイン
- ✅ コンソールに「データ保存成功」が表示される
- ✅ ルーティンが画面に表示される
- ✅ FieldValue.serverTimestamp()エラーが表示されない

### エラーが続く場合
- ❌ 「FieldValue.serverTimestamp()」エラーが表示される
- ❌ データ保存が失敗する

## 🛠️ 追加のトラブルシューティング

### 1. 手動でデータをクリア
Firebase Consoleで直接データを削除：
1. Firestore Database > データ
2. `users/{userId}`ドキュメントを削除
3. アプリを再読み込み

### 2. ブラウザのローカルストレージをクリア
1. 開発者ツール > Application
2. Local Storage > すべてクリア
3. アプリを再読み込み

### 3. シークレットモードでテスト
1. シークレットモード/プライベートブラウジングで開く
2. ログインしてテスト

## 📊 データ構造の確認

### 正しいデータ構造
```javascript
{
  email: "user@example.com",
  routines: [
    {
      id: "1234567890",
      title: "毎日のルーティン",
      description: "説明",
      frequency: "daily",
      frequencyDetails: {},
      createdAt: "2024-12-XXTXX:XX:XX.XXXZ", // ISO文字列
      userId: "user-id"
    }
  ],
  completions: [
    {
      id: "routine-id_2024-12-XX",
      routineId: "routine-id",
      completedAt: "2024-12-XXTXX:XX:XX.XXXZ", // ISO文字列
      userId: "user-id"
    }
  ],
  updatedAt: Timestamp, // Firestore Timestamp（配列外）
  lastSyncDevice: "user-agent",
  lastSyncTimestamp: "2024-12-XXTXX:XX:XX.XXXZ"
}
```

### 問題のあるデータ構造
```javascript
{
  routines: [
    {
      createdAt: FieldValue.serverTimestamp() // ❌ 配列内で使用不可
    }
  ]
}
```

## 🚨 重要な注意点

1. **配列内では`FieldValue.serverTimestamp()`を使用しない**
2. **タイムスタンプは必ずISO文字列に変換する**
3. **データ読み込み時も適切に処理する**
4. **必要に応じてデータリセットを行う**

---

**最終更新:** 2024年12月
**重要:** この修正により、FieldValue.serverTimestamp()エラーが解決されるはずです。 