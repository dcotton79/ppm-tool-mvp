import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function POST(req: NextRequest) {
  const { id, status, resourceId } = await req.json()
  const updated = await prisma.backlogItem.update({ where: { id }, data: { status, resourceId: resourceId || null, doneOn: status==='DONE' ? new Date() : null } })
  return NextResponse.json({ ok: true, updated })
}
