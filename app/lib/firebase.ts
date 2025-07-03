import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBYBNysq-wY0LMsrvAgjnail9md2NJdYUo",
  authDomain: "my-routine-app-a0708.firebaseapp.com",
  projectId: "my-routine-app-a0708",
  storageBucket: "my-routine-app-a0708.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:47e91a320afba0459e558d"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app 