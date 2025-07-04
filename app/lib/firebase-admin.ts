import { auth } from 'firebase-admin'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const adminAuth = auth()
export const adminDb = getFirestore()

// Verify Firebase token
export async function verifyToken(authHeader: string | null) {
  console.log('verifyToken: Checking auth header:', authHeader ? 'present' : 'missing')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('verifyToken: Invalid auth header format')
    return null
  }

  const token = authHeader.split('Bearer ')[1]
  console.log('verifyToken: Token extracted:', token.substring(0, 20) + '...')
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    console.log('verifyToken: Token verified successfully for user:', decodedToken.uid)
    return decodedToken
  } catch (error) {
    console.error('verifyToken: Token verification failed:', error)
    return null
  }
} 