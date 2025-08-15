import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function POST(req: NextRequest){
  const form=await req.formData()
  const projectId=String(form.get('projectId'))
  const name=String(form.get('name')||'Sprint')
  const start=new Date(String(form.get('start')||new Date().toISOString().slice(0,10)))
  const end=new Date(String(form.get('end')||new Date(Date.now()+14*86400000).toISOString().slice(0,10)))
  const goal=String(form.get('goal')||'Deliver value')
  const capacitySP=parseInt(String(form.get('capacitySP')||'30'),10)
  await prisma.sprint.create({ data:{ projectId, name, start, end, goal, capacitySP } })
  return NextResponse.redirect(new URL(`/projects/${projectId}/agile`, req.url))
}
