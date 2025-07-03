import { NextRequest, NextResponse } from 'next/server'
import { adminDb, verifyToken } from '../../../lib/firebase-admin'

// PUT /api/todos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await verifyToken(authHeader)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority, dueDate, completed } = body

    const todoRef = adminDb.collection('users').doc(user.uid).collection('todos').doc(params.id)
    const todoDoc = await todoRef.get()

    if (!todoDoc.exists) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate
    if (completed !== undefined) updateData.completed = completed

    await todoRef.update(updateData)
    
    const updatedDoc = await todoRef.get()
    const updatedTodo = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    }

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/todos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await verifyToken(authHeader)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const todoRef = adminDb.collection('users').doc(user.uid).collection('todos').doc(params.id)
    const todoDoc = await todoRef.get()

    if (!todoDoc.exists) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await todoRef.delete()

    return NextResponse.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 