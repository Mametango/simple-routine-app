// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "my-routine-app-xxxxx.firebaseapp.com",
    projectId: "my-routine-app-xxxxx",
    storageBucket: "my-routine-app-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// FirestoreとAuthの初期化
const db = firebase.firestore();
const auth = firebase.auth(); 