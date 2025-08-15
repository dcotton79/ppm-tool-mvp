import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
function d0(x: Date){ const d=new Date(x); d.setHours(0,0,0,0); return d }
export async function GET(_:NextRequest,{ params }:{ params:{ sprintId:string } }){
  const sprint=await prisma.sprint.findUnique({ where:{ id: params.sprintId } })
  if(!sprint) return NextResponse.json({ points: [], scopeChanges: [] })
  const items=await prisma.backlogItem.findMany({ where:{ sprintId: sprint.id } })
  const start=d0(sprint.start as unknown as Date)
  const end=d0(sprint.end as unknown as Date)
  const daysTotal=Math.max(1, Math.round((end.getTime()-start.getTime())/86400000)+1)
  const today=d0(new Date())
  const viewEnd=d0(new Date(Math.min(today.getTime(), end.getTime())))
  const days=Math.max(1, Math.round((viewEnd.getTime()-start.getTime())/86400000)+1)
  const series:any[]=[]; const scopeChanges:any[]=[]
  let prevTotal=0
  const idealStartTotal = items.filter(it=> it.createdAt && d0(it.createdAt as unknown as Date).getTime() <= start.getTime())
                               .reduce((a,it)=>a+(it.storyPoints||0),0)
  for(let i=0;i<days;i++){
    const day=new Date(start.getTime()+i*86400000); const dayISO=day.toISOString().slice(0,10)
    const total=items.filter(it=> it.createdAt && d0(it.createdAt as unknown as Date).getTime() <= day.getTime())
                     .reduce((a,it)=>a+(it.storyPoints||0),0)
    const done=items.filter(it=> it.doneOn && d0(it.doneOn as unknown as Date).getTime() <= day.getTime())
                    .reduce((a,it)=>a+(it.storyPoints||0),0)
    const remaining=Math.max(0,total-done)
    const ratio=daysTotal>1? (i/(daysTotal-1)) : 1
    const idealRemaining=Math.max(0, idealStartTotal * (1 - ratio))
    if(i>0 && total!==prevTotal){ scopeChanges.push({ date: dayISO, before: prevTotal, after: total, delta: total - prevTotal }) }
    prevTotal=total
    series.push({ date: dayISO, remaining, completed: done, total, idealRemaining })
  }
  return NextResponse.json({ points: series, scopeChanges })
}
