'use client'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

type Item = { id: string, title: string, type: string, storyPoints: number, resourceId?: string|null }
type Lanes = Record<string, Item[]>
type Board = Record<'TODO'|'DOING'|'DONE', Lanes>
type LaneMeta = { id: string, label: string }

function Card({ id, title, type, storyPoints }: Item) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, border:'1px solid #eee', borderRadius:8, padding:8, marginBottom:8, background:'white' } as React.CSSProperties
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}><b>{title}</b> <span style={{fontSize:12,opacity:.7}}>({type}, {storyPoints} SP)</span></div>
}

export default function AgileBoardDnD({ projectId, initial, lanes }: { projectId: string, initial: Board, lanes: LaneMeta[] }) {
  const [board, setBoard] = useState<Board>(initial)
  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over) return
    const t = String(over.id||'')
    const m = t.match(/^col-(TODO|DOING|DONE):(.+)$/)
    if (!m) return
    const toStatus = m[1] as 'TODO'|'DOING'|'DONE'
    const toLane = m[2]

    let fromStatus: 'TODO'|'DOING'|'DONE'|null=null, fromLane: string|null=null
    for (const s of ['TODO','DOING','DONE'] as const) {
      for (const ln of Object.keys(board[s])) {
        if (board[s][ln].some(it=>it.id===active.id)) { fromStatus=s; fromLane=ln; break }
      }
      if (fromStatus) break
    }
    if (!fromStatus || !fromLane) return
    if (fromStatus===toStatus && fromLane===toLane) return
    const item = board[fromStatus][fromLane].find(it=>it.id===active.id)!
    const next: Board = JSON.parse(JSON.stringify(board))
    next[fromStatus][fromLane]=next[fromStatus][fromLane].filter(it=>it.id!==active.id)
    next[toStatus][toLane]=[item,...next[toStatus][toLane]]
    setBoard(next)

    const resourceId = (toLane==='unassigned') ? null : toLane
    await fetch('/api/agile/status-json',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: item.id, status: toStatus, resourceId }) })
  }

  const Column = (status: 'TODO'|'DOING'|'DONE') => (
    <div style={{flex:1}}>
      <h3>{status}</h3>
      <div style={{display:'grid', gap:12}}>
        {lanes.map(l => (
          <div key={l.id}>
            <div style={{fontSize:12, opacity:.7, margin:'4px 0'}}>{l.label}</div>
            <div id={`col-${status}:${l.id}`} style={{border:'1px solid #eee', borderRadius:8, padding:8, minHeight:220}}>
              <SortableContext items={ (initial as any)[status][l.id] || [] } strategy={rectSortingStrategy}>
                {( ( (board as any)[status][l.id] ) || [] ).map((i: Item) => <Card key={i.id} {...i} />)}
              </SortableContext>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
    <div style={{display:'flex', gap:16}}>{Column('TODO')}{Column('DOING')}{Column('DONE')}</div>
  </DndContext>
}
