'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { setCookie, deleteCookie, getCookie } from 'cookies-next'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ページ読み込み時にトークンをチェック
    const savedToken = getCookie('token') as string
    if (savedToken) {
      setToken(savedToken)
      // トークンからユーザー情報を復元（簡易版）
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]))
        setUser({
          id: payload.userId,
          username: payload.username,
          email: '', // トークンには含まれていない
          createdAt: ''
        })
      } catch (error) {
        console.error('Invalid token:', error)
        deleteCookie('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(data.token)
        setCookie('token', data.token, { maxAge: 7 * 24 * 60 * 60 }) // 7日間
        return true
      } else {
        const error = await response.json()
        console.error('Login error:', error)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(data.token)
        setCookie('token', data.token, { maxAge: 7 * 24 * 60 * 60 }) // 7日間
        return true
      } else {
        const error = await response.json()
        console.error('Registration error:', error)
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    deleteCookie('token')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
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