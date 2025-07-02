import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'routines.json')

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(dataFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read routines from file
const readRoutines = () => {
  try {
    ensureDataDirectory()
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading routines:', error)
  }
  return []
}

// Write routines to file
const writeRoutines = (routines: any[]) => {
  try {
    ensureDataDirectory()
    fs.writeFileSync(dataFilePath, JSON.stringify(routines, null, 2))
  } catch (error) {
    console.error('Error writing routines:', error)
  }
}

// PATCH /api/routines/[id]/toggle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const routines = readRoutines()
    const routineIndex = routines.findIndex((r: any) => r.id === params.id)

    if (routineIndex === -1) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      )
    }

    routines[routineIndex].completed = !routines[routineIndex].completed
    writeRoutines(routines)

    return NextResponse.json(routines[routineIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to toggle routine' },
      { status: 500 }
    )
  }
} 