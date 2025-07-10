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

// PATCH: トレーニング記録の完了状態を切り替え
export async function PATCH(
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

    // 完了状態を切り替え
    trainings[trainingIndex].completed = !trainings[trainingIndex].completed

    // 完了時は全てのエクササイズも完了にする
    if (trainings[trainingIndex].completed) {
      trainings[trainingIndex].exercises.forEach(exercise => {
        exercise.completed = true
      })
    }

    fs.writeFileSync(dataPath, JSON.stringify(trainings, null, 2))

    return NextResponse.json(trainings[trainingIndex])
  } catch (error) {
    console.error('トレーニング記録の完了状態切り替えエラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
} 