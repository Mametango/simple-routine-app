import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { requireAuth } from '@/app/lib/auth'

const dataFilePath = path.join(process.cwd(), 'data', 'routines.json')

// データディレクトリとファイルが存在しない場合は作成
function ensureDataFile() {
  const dataDir = path.dirname(dataFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]))
  }
}

// ルーティンデータを読み込み
function loadRoutines() {
  ensureDataFile()
  const data = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(data)
}

// ルーティンデータを保存
function saveRoutines(routines: any[]) {
  ensureDataFile()
  fs.writeFileSync(dataFilePath, JSON.stringify(routines, null, 2))
}

// GET /api/routines
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const user = requireAuth(request)
    
    const routines = loadRoutines()
    // ユーザー固有のルーティンのみを返す
    const userRoutines = routines.filter((routine: any) => routine.userId === user.userId)
    
    return NextResponse.json(userRoutines)
  } catch (error) {
    console.error('Failed to load routines:', error)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
}

// POST /api/routines
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const user = requireAuth(request)
    
    const body = await request.json()
    const { title, description, frequency, time } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const routines = loadRoutines()
    const newRoutine = {
      id: Date.now().toString(),
      userId: user.userId, // ユーザーIDを追加
      title: title.trim(),
      description: description || '',
      frequency: frequency || 'daily',
      time: time || '',
      completed: false,
      createdAt: new Date().toISOString()
    }

    routines.push(newRoutine)
    saveRoutines(routines)

    return NextResponse.json(newRoutine, { status: 201 })
  } catch (error) {
    console.error('Failed to create routine:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 })
  }
} 