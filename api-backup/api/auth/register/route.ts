import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// データディレクトリとファイルが存在しない場合は作成
function ensureDataFile() {
  const dataDir = path.dirname(usersFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]))
  }
}

// ユーザーデータを読み込み
function loadUsers() {
  ensureDataFile()
  const data = fs.readFileSync(usersFilePath, 'utf-8')
  return JSON.parse(data)
}

// ユーザーデータを保存
function saveUsers(users: any[]) {
  ensureDataFile()
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // バリデーション
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const users = loadUsers()

    // ユーザー名とメールアドレスの重複チェック
    const existingUser = users.find(
      (user: any) => user.username === username || user.email === email
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // 新しいユーザーを作成
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    saveUsers(users)

    // JWTトークンを生成
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // パスワードを除いたユーザー情報を返す
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
} 