'use client'
import { useState } from 'react'
export default function NewProject(){
  const [name,setName]=useState('New Project')
  const [start,setStart]=useState(new Date().toISOString().slice(0,10))
  const [finish,setFinish]=useState(new Date(Date.now()+14*86400000).toISOString().slice(0,10))
  const submit=async()=>{
    const res = await fetch('/api/projects',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, methodology:'AGILE', start, finish }) })
    const data = await res.json()
    window.location.href = `/projects/${data.id}`
  }
  return (<div>
    <h1>New Project</h1>
    <label>Name <input value={name} onChange={e=>setName(e.target.value)} /></label><br/>
    <label>Start <input type="date" value={start} onChange={e=>setStart(e.target.value)} /></label><br/>
    <label>Finish <input type="date" value={finish} onChange={e=>setFinish(e.target.value)} /></label><br/>
    <button onClick={submit}>Create</button>
  </div>)
}
