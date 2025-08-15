import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function POST(req: NextRequest){
  const form=await req.formData()
  const projectId=String(form.get('projectId'))
  const title=String(form.get('title')||'Item')
  const type=String(form.get('type')||'story')
  const storyPoints=parseInt(String(form.get('storyPoints')||'3'),10)
  await prisma.backlogItem.create({ data:{ projectId, title, type, storyPoints } })
  return NextResponse.redirect(new URL(`/projects/${projectId}/agile`, req.url))
}
