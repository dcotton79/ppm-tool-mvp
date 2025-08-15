import Link from 'next/link'
import { prisma } from '@/lib/db'
export default async function Projects(){
  const projects = await prisma.project.findMany({ orderBy:{ createdAt:'desc' } })
  return (<div>
    <h1>Projects</h1>
    <p><a href='/projects/new'>Create</a></p>
    <ul>{projects.map(p=> <li key={p.id}><Link href={`/projects/${p.id}`}>{p.name}</Link></li>)}</ul>
  </div>)
}
