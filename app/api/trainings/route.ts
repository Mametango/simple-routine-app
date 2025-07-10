import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { verifyToken } from '@/app/lib/auth'

interface Training {
  id: string
  title: string
  description: string
  date: string
  duration: string
  exercises: Exercise[]
  completed: boolean
  createdAt: string
  userId: string
}

interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number
  completed: boolean
}

const dataPath = path.join(process.cwd(), 'data', 'trainings.json')

// データファイルの初期化
const initializeDataFile = () => {
  const dir = path.dirname(dataPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]))
  }
}

// GET: トレーニング記録を取得
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 401 })
    }

    initializeDataFile()
    const data = fs.readFileSync(dataPath, 'utf-8')
    const trainings: Training[] = JSON.parse(data)
    
    // ユーザーIDでフィルタリング
    const userTrainings = trainings.filter(training => training.userId === decoded.userId)
    
    return NextResponse.json(userTrainings)
  } catch (error) {
    console.error('トレーニング記録の取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// POST: 新しいトレーニング記録を作成
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, duration, exercises } = body

    if (!title || !date) {
      return NextResponse.json({ error: 'タイトルと日付は必須です' }, { status: 400 })
    }

    initializeDataFile()
    const data = fs.readFileSync(dataPath, 'utf-8')
    const trainings: Training[] = JSON.parse(data)

    const newTraining: Training = {
      id: Date.now().toString(),
      title,
      description: description || '',
      date,
      duration: duration || '',
      exercises: exercises || [],
      completed: false,
      createdAt: new Date().toISOString(),
      userId: decoded.userId
    }

    trainings.push(newTraining)
    fs.writeFileSync(dataPath, JSON.stringify(trainings, null, 2))

    return NextResponse.json(newTraining, { status: 201 })
  } catch (error) {
    console.error('トレーニング記録の作成エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
} 