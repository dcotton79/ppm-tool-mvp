import Link from 'next/link'
import { prisma } from '@/lib/db'
export default async function ProjectPage({ params }:{ params:{ id:string } }){
  const p = await prisma.project.findUnique({ where: { id: params.id } })
  if (!p) return <div>Not found</div>
  return (
    <div>
      <p><Link href="/projects">← Back</Link></p>
      <h1>{p.name}</h1>
      <p>Methodology: <b>{p.methodology}</b></p>
      <p><Link href={`/projects/${p.id}/agile`}>Agile Board →</Link></p>
    </div>
  )
}
