import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function POST(req: NextRequest){
  const body = await req.json()
  const { name, methodology, start, finish } = body
  let portfolio = await prisma.portfolio.findFirst()
  if (!portfolio) portfolio = await prisma.portfolio.create({ data: { name: 'Default' } })
  let program = await prisma.program.findFirst({ where: { portfolioId: portfolio.id } })
  if (!program) program = await prisma.program.create({ data: { name: 'General', portfolioId: portfolio.id } })
  const project = await prisma.project.create({
    data: { name, methodology, programId: program.id, start: new Date(start), finish: new Date(finish) }
  })
  return NextResponse.json({ id: project.id })
}
