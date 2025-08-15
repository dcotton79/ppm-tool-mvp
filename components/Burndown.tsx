'use client'
import useSWR from 'swr'
import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  ResponsiveContainer, AreaChart, Area, Scatter
} from 'recharts'

const fetcher = (u: string) => fetch(u).then(r=>r.json())

function ScopeTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0].payload
  const inc = p.delta > 0
  return (
    <div style={{background:'white', border:'1px solid #eee', borderRadius:8, padding:8}}>
      <div style={{fontWeight:700, color: inc ? '#137333' : '#b00020'}}>Scope {inc ? 'increase' : 'decrease'}</div>
      <div>Date: {p.date}</div>
      <div>Before: {p.before} SP</div>
      <div>After: {p.after} SP</div>
      <div>Delta: {p.delta > 0 ? '+' : ''}{p.delta} SP</div>
    </div>
  )
}

function MarkerShape(props: any) {
  const { cx, cy, payload } = props
  const inc = (payload.delta || 0) > 0
  const size = 8
  const points = inc
    ? `${cx},${cy-size} ${cx-size},${cy+size} ${cx+size},${cy+size}`
    : `${cx},${cy+size} ${cx-size},${cy-size} ${cx+size},${cy-size}`
  return <polygon points={points} fill={inc ? '#137333' : '#b00020'} opacity={0.9} />
}

export function BurndownChart({ sprintId }: { sprintId: string }) {
  const { data } = useSWR(`/api/agile/burndown/${sprintId}`, fetcher, { refreshInterval: 5000 })
  const points = data?.points || []
  const changes = (data?.scopeChanges || []).map((c: any) => ({ ...c, x: c.date, y: c.after }))

  const [showIdeal, setShowIdeal] = useState(true)
  const [showMarkers, setShowMarkers] = useState(true)
  useEffect(() => {
    try {
      const si = localStorage.getItem('ppm:burndown:showIdeal')
      const sm = localStorage.getItem('ppm:burndown:showMarkers')
      if (si !== null) setShowIdeal(si === '1')
      if (sm !== null) setShowMarkers(sm === '1')
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('ppm:burndown:showIdeal', showIdeal ? '1':'0')
      localStorage.setItem('ppm:burndown:showMarkers', showMarkers ? '1':'0')
    } catch {}
  }, [showIdeal, showMarkers])

  return (
    <div style={{height:340}}>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:8}}>
        <label style={{fontSize:14}}><input type="checkbox" checked={showIdeal} onChange={e=>setShowIdeal(e.target.checked)} /> Ideal line</label>
        <label style={{fontSize:14}}><input type="checkbox" checked={showMarkers} onChange={e=>setShowMarkers(e.target.checked)} /> Scope markers</label>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line isAnimationActive animationDuration={400} type="monotone" dataKey="remaining" />
          {showIdeal && <Line isAnimationActive animationDuration={400} type="monotone" dataKey="idealRemaining" />}
          {showMarkers && (
            <Scatter
              data={changes}
              name="Scope change"
              shape={<MarkerShape />}
              isAnimationActive
              animationDuration={400}
            />
          )}
          {showMarkers && <Tooltip content={<ScopeTooltip />} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BurnupChart({ sprintId }: { sprintId: string }) {
  const { data } = useSWR(`/api/agile/burndown/${sprintId}`, fetcher, { refreshInterval: 5000 })
  const points = data?.points || []
  const changes = (data?.scopeChanges || []).map((c: any) => ({ ...c, x: c.date, y: c.after }))

  const [showMarkers, setShowMarkers] = useState(true)
  useEffect(() => {
    try {
      const sm = localStorage.getItem('ppm:burnup:showMarkers')
      if (sm !== null) setShowMarkers(sm === '1')
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('ppm:burnup:showMarkers', showMarkers ? '1':'0') } catch {}
  }, [showMarkers])

  return (
    <div style={{height:340}}>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:8}}>
        <label style={{fontSize:14}}><input type="checkbox" checked={showMarkers} onChange={e=>setShowMarkers(e.target.checked)} /> Scope markers</label>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area isAnimationActive animationDuration={400} type="monotone" dataKey="completed" />
          <Area isAnimationActive animationDuration={400} type="monotone" dataKey="total" />
          {showMarkers && (
            <Scatter
              data={changes}
              name="Scope change"
              shape={<MarkerShape />}
              isAnimationActive
              animationDuration={400}
            />
          )}
          {showMarkers && <Tooltip content={<ScopeTooltip />} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
