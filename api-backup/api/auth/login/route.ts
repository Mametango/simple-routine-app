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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // バリデーション
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const users = loadUsers()

    // ユーザーを検索（ユーザー名またはメールアドレスで）
    const user = users.find(
      (u: any) => u.username === username || u.email === username
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // JWTトークンを生成
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // パスワードを除いたユーザー情報を返す
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
} 