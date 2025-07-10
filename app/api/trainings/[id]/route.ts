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

// PUT: トレーニング記録を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const data = fs.readFileSync(dataPath, 'utf-8')
    const trainings: Training[] = JSON.parse(data)

    const trainingIndex = trainings.findIndex(
      training => training.id === params.id && training.userId === decoded.userId
    )

    if (trainingIndex === -1) {
      return NextResponse.json({ error: 'トレーニング記録が見つかりません' }, { status: 404 })
    }

    trainings[trainingIndex] = {
      ...trainings[trainingIndex],
      title,
      description: description || '',
      date,
      duration: duration || '',
      exercises: exercises || []
    }

    fs.writeFileSync(dataPath, JSON.stringify(trainings, null, 2))

    return NextResponse.json(trainings[trainingIndex])
  } catch (error) {
    console.error('トレーニング記録の更新エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// DELETE: トレーニング記録を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 401 })
    }

    const data = fs.readFileSync(dataPath, 'utf-8')
    const trainings: Training[] = JSON.parse(data)

    const trainingIndex = trainings.findIndex(
      training => training.id === params.id && training.userId === decoded.userId
    )

    if (trainingIndex === -1) {
      return NextResponse.json({ error: 'トレーニング記録が見つかりません' }, { status: 404 })
    }

    trainings.splice(trainingIndex, 1)
    fs.writeFileSync(dataPath, JSON.stringify(trainings, null, 2))

    return NextResponse.json({ message: 'トレーニング記録を削除しました' })
  } catch (error) {
    console.error('トレーニング記録の削除エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
} 