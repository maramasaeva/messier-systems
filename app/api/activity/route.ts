import { NextResponse } from 'next/server'
import { aggregateActivity } from '@/lib/activity'

export const revalidate = 3600

export async function GET() {
  try {
    const data = await aggregateActivity()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { items: [], sources: {}, lastSync: new Date().toISOString() },
      { status: 500 }
    )
  }
}
