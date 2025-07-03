import { NextRequest, NextResponse } from 'next/server'
import { adminDb, verifyToken } from '../../lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await verifyToken(authHeader)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const routinesRef = adminDb.collection('users').doc(user.uid).collection('routines')
    const snapshot = await routinesRef.get()
    
    const routines = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(routines)
  } catch (error) {
    console.error('Error fetching routines:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = await verifyToken(authHeader)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, frequency, time, checklist } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const routineData = {
      title,
      description: description || '',
      frequency: frequency || 'daily',
      time: time || '',
      weekdays: [],
      completed: false,
      createdAt: new Date().toISOString(),
      userId: user.uid,
      checklist: checklist || []
    }

    const routinesRef = adminDb.collection('users').doc(user.uid).collection('routines')
    const docRef = await routinesRef.add(routineData)
    
    const newRoutine = {
      id: docRef.id,
      ...routineData
    }

    return NextResponse.json(newRoutine, { status: 201 })
  } catch (error) {
    console.error('Error creating routine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 