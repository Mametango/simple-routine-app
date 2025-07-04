'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { auth } from '../lib/firebase'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, username?: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener')
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          console.log('AuthProvider: Firebase user detected:', firebaseUser.email, 'UID:', firebaseUser.uid)
          // Get the ID token
          const idToken = await firebaseUser.getIdToken()
          console.log('AuthProvider: Got ID token:', idToken.substring(0, 20) + '...')
          
          // Convert Firebase user to our User interface
          const userData: User = {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
          }
          
          setUser(userData)
          setToken(idToken)
          console.log('AuthProvider: User logged in:', userData.email, 'Token set')
        } else {
          console.log('AuthProvider: No Firebase user, logging out')
          setUser(null)
          setToken(null)
          console.log('AuthProvider: User logged out')
        }
      } catch (error) {
        console.error('AuthProvider: Auth state change error:', error)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      setToken(idToken)
      console.log('Login successful for:', email)
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'ログインに失敗しました'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'ユーザーが見つかりません'
          break
        case 'auth/wrong-password':
          errorMessage = 'パスワードが正しくありません'
          break
        case 'auth/invalid-email':
          errorMessage = '無効なメールアドレスです'
          break
        case 'auth/user-disabled':
          errorMessage = 'アカウントが無効になっています'
          break
        case 'auth/too-many-requests':
          errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください'
          break
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました'
          break
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email: string, password: string, username?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting registration for:', email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with username if provided
      if (username && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: username
        })
      }
      
      const idToken = await userCredential.user.getIdToken()
      setToken(idToken)
      console.log('Registration successful for:', email)
      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      let errorMessage = '登録に失敗しました'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'このメールアドレスは既に使用されています'
          break
        case 'auth/weak-password':
          errorMessage = 'パスワードが弱すぎます（6文字以上で入力してください）'
          break
        case 'auth/invalid-email':
          errorMessage = '無効なメールアドレスです'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'メール/パスワード認証が有効になっていません'
          break
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました'
          break
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting Google login')
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const userCredential = await signInWithPopup(auth, provider)
      const idToken = await userCredential.user.getIdToken()
      setToken(idToken)
      console.log('Google login successful for:', userCredential.user.email)
      return { success: true }
    } catch (error: any) {
      console.error('Google login error:', error)
      let errorMessage = 'Googleログインに失敗しました'
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'ログインがキャンセルされました'
          break
        case 'auth/popup-blocked':
          errorMessage = 'ポップアップがブロックされました。ポップアップを許可してください'
          break
        case 'auth/cancelled-popup-request':
          errorMessage = 'ログインがキャンセルされました'
          break
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'このメールアドレスは別の方法で登録されています'
          break
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました'
          break
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting logout')
      await signOut(auth)
      setUser(null)
      setToken(null)
      console.log('Logout successful')
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: 'ログアウトに失敗しました' }
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    loginWithGoogle,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 