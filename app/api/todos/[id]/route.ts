import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { requireAuth } from '@/app/lib/auth'

const dataFilePath = path.join(process.cwd(), 'data', 'todos.json')

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

// Todoデータを読み込み
function loadTodos() {
  ensureDataFile()
  const data = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(data)
}

// Todoデータを保存
function saveTodos(todos: any[]) {
  ensureDataFile()
  fs.writeFileSync(dataFilePath, JSON.stringify(todos, null, 2))
}

// PUT /api/todos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const user = requireAuth(request)
    
    const body = await request.json()
    const { title, description, priority, dueDate, completed } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const todos = loadTodos()
    const todoIndex = todos.findIndex((todo: any) => todo.id === params.id && todo.userId === user.userId)

    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    todos[todoIndex] = {
      ...todos[todoIndex],
      title: title.trim(),
      description: description || '',
      priority: priority || 'low',
      dueDate: dueDate || null,
      completed: completed !== undefined ? completed : todos[todoIndex].completed
    }

    saveTodos(todos)

    return NextResponse.json(todos[todoIndex])
  } catch (error) {
    console.error('Failed to update todo:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

// DELETE /api/todos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const user = requireAuth(request)
    
    const todos = loadTodos()
    const todoIndex = todos.findIndex((todo: any) => todo.id === params.id && todo.userId === user.userId)

    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    todos.splice(todoIndex, 1)
    saveTodos(todos)

    return NextResponse.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    console.error('Failed to delete todo:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
} 