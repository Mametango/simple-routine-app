import { NextRequest, NextResponse } from 'next/server'
import { adminDb, verifyToken } from '../../lib/firebase-admin'

// GET /api/todos
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await verifyToken(authHeader)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const todosRef = adminDb.collection('users').doc(user.uid).collection('todos')
    const snapshot = await todosRef.get()
    
    const todos = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/todos
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await verifyToken(authHeader)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority, dueDate } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const todoData = {
      title,
      description: description || '',
      priority: priority || 'low',
      dueDate: dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }

    const todosRef = adminDb.collection('users').doc(user.uid).collection('todos')
    const docRef = await todosRef.add(todoData)
    
    const newTodo = {
      id: docRef.id,
      ...todoData
    }

    return NextResponse.json(newTodo, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 