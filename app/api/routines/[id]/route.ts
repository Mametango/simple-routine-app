import { NextRequest, NextResponse } from 'next/server'
import { adminDb, verifyToken } from '../../../lib/firebase-admin'

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
    const { title, description, frequency, time, completed, checklist } = body

    const routineRef = adminDb.collection('users').doc(user.uid).collection('routines').doc(params.id)
    const routineDoc = await routineRef.get()

    if (!routineDoc.exists) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (frequency !== undefined) updateData.frequency = frequency
    if (time !== undefined) updateData.time = time
    if (completed !== undefined) updateData.completed = completed
    if (checklist !== undefined) updateData.checklist = checklist

    await routineRef.update(updateData)
    
    const updatedDoc = await routineRef.get()
    const updatedRoutine = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    }

    return NextResponse.json(updatedRoutine)
  } catch (error) {
    console.error('Error updating routine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const routineRef = adminDb.collection('users').doc(user.uid).collection('routines').doc(params.id)
    const routineDoc = await routineRef.get()

    if (!routineDoc.exists) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    await routineRef.delete()

    return NextResponse.json({ message: 'Routine deleted successfully' })
  } catch (error) {
    console.error('Error deleting routine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 