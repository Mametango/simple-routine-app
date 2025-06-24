// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyBYBNysq-wY0LMsrvAgjnail9md2NJdYUo",
    authDomain: "my-routine-app-a0708.firebaseapp.com",
    projectId: "my-routine-app-a0708",
    storageBucket: "my-routine-app-a0708.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "47e91a320afba0459e558d"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// FirestoreとAuthの初期化
const db = firebase.firestore();
const auth = firebase.auth();
