import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  "apiKey": "AIzaSyBmkRs7f2a6ejf-qXJZ2F-jMWGnAGdvY0Q",
  "authDomain": "simple-routine-app-33cfc.firebaseapp.com",
  "projectId": "simple-routine-app-33cfc",
  "storageBucket": "simple-routine-app-33cfc.firebasestorage.app",
  "messagingSenderId": "124814607687",
  "appId": "1:124814607687:web:d1b703506cad3ecbaa7862",
  "measurementId": "G-57M4VBMXZM"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app