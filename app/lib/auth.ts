import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface JWTPayload {
  userId: string
  username: string
  iat: number
  exp: number
}

// JWTトークンを検証
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

// リクエストからトークンを取得
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

// リクエストからユーザー情報を取得
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

// 認証が必要なAPIルート用のミドルウェア
export function requireAuth(request: NextRequest): JWTPayload {
  const user = getUserFromRequest(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
} 