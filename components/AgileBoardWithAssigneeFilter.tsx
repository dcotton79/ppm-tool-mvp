'use client'
import { useEffect, useMemo, useState } from 'react'
import AgileBoardDnD from '@/components/AgileBoardDnD'

type Item = { id: string, title: string, type: string, storyPoints: number, resourceId?: string|null }
type Lanes = Record<string, Item[]>
type Board = Record<'TODO'|'DOING'|'DONE', Lanes>
type LaneMeta = { id: string, label: string }

export default function AgileBoardWithAssigneeFilter({ projectId, initial, lanes, currentUserResourceId }: { projectId: string, initial: Board, lanes: LaneMeta[], currentUserResourceId?: string | null }) {
  const storageKey = (k: string) => `ppm:agile:${projectId}:${k}`
  const [assignee, setAssignee] = useState<string>('all')
  const [onlyMine, setOnlyMine] = useState<boolean>(false)
  const [loaded, setLoaded] = useState(false)

  const pushUrl = (a:string, om:boolean) => {
    const url = new URL(window.location.href)
    url.searchParams.set('assignee', a)
    url.searchParams.set('onlyMine', om ? '1':'0')
    window.history.replaceState({}, '', url.toString())
  }

  useEffect(()=>{(async()=>{
    try{
      const url = new URL(window.location.href)
      const uA = url.searchParams.get('assignee')
      const uM = url.searchParams.get('onlyMine')
      if (uA || uM){ setAssignee(uA ?? 'all'); setOnlyMine(uM==='1'); setLoaded(true); return }
      if (currentUserResourceId){
        const res = await fetch(`/api/prefs/agile/${projectId}`)
        const data = await res.json().catch(()=>null)
        if (data?.pref){ setAssignee(data.pref.assignee ?? 'all'); setOnlyMine(!!data.pref.onlyMine); setLoaded(true); return }
      }
      const sM = localStorage.getItem(storageKey('onlyMine'))
      const sA = localStorage.getItem(storageKey('assignee'))
      if (sM!==null) setOnlyMine(sM==='1')
      if (sA) setAssignee(sA)
    } finally { setLoaded(true) }
  })()},[projectId, currentUserResourceId])

  useEffect(()=>{ if (onlyMine && currentUserResourceId){ setAssignee(currentUserResourceId) } },[onlyMine, currentUserResourceId])

  useEffect(()=>{
    if(!loaded) return
    try{
      localStorage.setItem(storageKey('onlyMine'), onlyMine ? '1':'0')
      localStorage.setItem(storageKey('assignee'), assignee)
      pushUrl(assignee, onlyMine)
      if(currentUserResourceId){
        fetch(`/api/prefs/agile/${projectId}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ assignee, onlyMine }) }).catch(()=>{})
      }
    }catch{}
  },[assignee, onlyMine, loaded, projectId, currentUserResourceId])

  const filteredLanes = useMemo(()=>{
    const target = (onlyMine && currentUserResourceId) ? currentUserResourceId : assignee
    if (target==='all') return lanes
    const exists = lanes.some(l=>l.id===target)
    return exists ? lanes.filter(l=>l.id===target) : lanes
  },[assignee, onlyMine, currentUserResourceId, lanes])

  return (
    <div>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <label style={{fontSize:14, opacity:.8}}>Assignee:&nbsp;
          <select value={(onlyMine && currentUserResourceId) ? currentUserResourceId : assignee} onChange={e=>setAssignee(e.target.value)} disabled={onlyMine && !!currentUserResourceId}>
            <option value="all">All</option>
            {lanes.map(l=> <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </label>
        <label style={{fontSize:14, opacity:.8, display:'flex', alignItems:'center', gap:6}}>
          <input type="checkbox" checked={onlyMine} onChange={e=>setOnlyMine(e.target.checked)} disabled={!currentUserResourceId} />
          Only mine
        </label>
        {!currentUserResourceId && <span style={{fontSize:12, opacity:.6}}>(No logged-in user—toggle disabled)</span>}
      </div>
      <AgileBoardDnD projectId={projectId} initial={initial as any} lanes={filteredLanes as any} />
    </div>
  )
}
