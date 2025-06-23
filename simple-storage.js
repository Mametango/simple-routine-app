// シンプルストレージシステム
class SimpleStorage {
    constructor() {
        this.isInitialized = false;
    }

    // 初期化
    init() {
        if (this.isInitialized) return;
        
        // 既存のFirestoreを無効化
        this.disableFirestore();
        
        // シンプルストレージを有効化
        this.enableSimpleStorage();
        
        this.isInitialized = true;
        console.log('SimpleStorage initialized');
    }

    // Firestoreを無効化
    disableFirestore() {
        if (typeof db !== 'undefined') {
            // Firestoreの代わりにシンプルストレージを使用
            db.collection = (collectionName) => {
                return new SimpleCollection(collectionName);
            };
        }
    }

    // シンプルストレージを有効化
    enableSimpleStorage() {
        // グローバルなdbオブジェクトを作成
        window.db = {
            collection: (collectionName) => {
                return new SimpleCollection(collectionName);
            }
        };
    }

    // データを取得
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    }

    // データを保存
    setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error setting data:', error);
            return false;
        }
    }

    // データを削除
    deleteData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            return false;
        }
    }

    // 全データをエクスポート
    exportAllData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                data[key] = this.getData(key);
            }
        }
        return data;
    }

    // 全データをインポート
    importAllData(data) {
        try {
            for (const key in data) {
                this.setData(key, data[key]);
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // 全データをクリア
    clearAllData() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
}

// シンプルコレクションクラス
class SimpleCollection {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.storageKey = `collection_${collectionName}`;
    }

    // ドキュメント参照を作成
    doc(docId) {
        return new SimpleDocument(this.collectionName, docId);
    }

    // ドキュメントを追加
    async add(data) {
        const docId = this.generateDocId();
        const doc = this.doc(docId);
        await doc.set(data);
        return { id: docId };
    }

    // ドキュメントID生成
    generateDocId() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // コレクション内の全ドキュメントを取得
    async get() {
        const collectionData = this.getCollectionData();
        const docs = [];
        
        for (const docId in collectionData) {
            docs.push({
                id: docId,
                data: () => collectionData[docId],
                exists: true
            });
        }
        
        return {
            docs: docs,
            empty: docs.length === 0,
            size: docs.length
        };
    }

    // コレクションデータを取得
    getCollectionData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    // コレクションデータを保存
    setCollectionData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
}

// シンプルドキュメントクラス
class SimpleDocument {
    constructor(collectionName, docId) {
        this.collectionName = collectionName;
        this.docId = docId;
        this.storageKey = `collection_${collectionName}`;
    }

    // ドキュメントを取得
    async get() {
        const collectionData = this.getCollectionData();
        const docData = collectionData[this.docId];
        
        if (docData) {
            return {
                id: this.docId,
                data: () => docData,
                exists: true
            };
        } else {
            return {
                id: this.docId,
                data: () => null,
                exists: false
            };
        }
    }

    // ドキュメントを設定
    async set(data) {
        const collectionData = this.getCollectionData();
        collectionData[this.docId] = {
            ...data,
            _updatedAt: new Date().toISOString()
        };
        this.setCollectionData(collectionData);
        return Promise.resolve();
    }

    // ドキュメントを更新
    async update(data) {
        const collectionData = this.getCollectionData();
        if (collectionData[this.docId]) {
            collectionData[this.docId] = {
                ...collectionData[this.docId],
                ...data,
                _updatedAt: new Date().toISOString()
            };
            this.setCollectionData(collectionData);
        }
        return Promise.resolve();
    }

    // ドキュメントを削除
    async delete() {
        const collectionData = this.getCollectionData();
        delete collectionData[this.docId];
        this.setCollectionData(collectionData);
        return Promise.resolve();
    }

    // コレクションデータを取得
    getCollectionData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    // コレクションデータを保存
    setCollectionData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
}

// グローバルインスタンス
const simpleStorage = new SimpleStorage();

// シンプルストレージを開始
function startSimpleStorage() {
    simpleStorage.init();
    return simpleStorage;
}

// ユーザー固有のデータを取得
function getUserRoutines(userId) {
    const key = `user_${userId}_routines`;
    return simpleStorage.getData(key) || [];
}

// ユーザー固有のデータを保存
function saveUserRoutines(userId, routines) {
    const key = `user_${userId}_routines`;
    return simpleStorage.setData(key, routines);
}

// ユーザー設定を取得
function getUserSettings(userId) {
    const key = `user_${userId}_settings`;
    return simpleStorage.getData(key) || {};
}

// ユーザー設定を保存
function saveUserSettings(userId, settings) {
    const key = `user_${userId}_settings`;
    return simpleStorage.setData(key, settings);
} 