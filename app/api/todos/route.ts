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

// GET /api/todos
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const user = requireAuth(request)
    
    const todos = loadTodos()
    // ユーザー固有のTodoのみを返す
    const userTodos = todos.filter((todo: any) => todo.userId === user.userId)
    
    return NextResponse.json(userTodos)
  } catch (error) {
    console.error('Failed to load todos:', error)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
}

// POST /api/todos
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const user = requireAuth(request)
    
    const body = await request.json()
    const { title, description, priority, dueDate } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const todos = loadTodos()
    const newTodo = {
      id: Date.now().toString(),
      userId: user.userId,
      title: title.trim(),
      description: description || '',
      priority: priority || 'low',
      dueDate: dueDate || null,
      completed: false,
      createdAt: new Date().toISOString()
    }

    todos.push(newTodo)
    saveTodos(todos)

    return NextResponse.json(newTodo, { status: 201 })
  } catch (error) {
    console.error('Failed to create todo:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
} 