import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

// PUT /api/routines/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, frequency, time } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const routines = loadRoutines()
    const index = routines.findIndex((r: any) => r.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    routines[index] = {
      ...routines[index],
      title: title.trim(),
      description: description || '',
      frequency: frequency || 'daily',
      time: time || ''
    }

    saveRoutines(routines)
    return NextResponse.json(routines[index])
  } catch (error) {
    console.error('Failed to update routine:', error)
    return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 })
  }
}

// DELETE /api/routines/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const routines = loadRoutines()
    const filteredRoutines = routines.filter((r: any) => r.id !== params.id)

    if (filteredRoutines.length === routines.length) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    saveRoutines(filteredRoutines)
    return NextResponse.json({ message: 'Routine deleted successfully' })
  } catch (error) {
    console.error('Failed to delete routine:', error)
    return NextResponse.json({ error: 'Failed to delete routine' }, { status: 500 })
  }
} 