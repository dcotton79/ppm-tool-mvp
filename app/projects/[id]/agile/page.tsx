import { prisma } from '@/lib/db'
import AgileBoardWithAssigneeFilter from '@/components/AgileBoardWithAssigneeFilter'
import { BurndownChart, BurnupChart } from '@/components/Burndown'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

export default async function AgileBoard({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) return <div>Not found</div>
  const items = await prisma.backlogItem.findMany({ where: { projectId: params.id }, orderBy: { title: 'asc' } })
  const sprints = await prisma.sprint.findMany({ where: { projectId: params.id }, orderBy: { start: 'asc' } })
  const resources = await prisma.resource.findMany({ orderBy: { name: 'asc' } })

  let currentUserResourceId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      const res = await prisma.resource.findFirst({ where: { userId: user.id } });
      currentUserResourceId = res?.id || null;
    }
  }

  const lanes = [{ id: 'unassigned', label: 'Unassigned' }, ...resources.map(r => ({ id: r.id, label: r.name }))] as const
  const empty: Record<'TODO'|'DOING'|'DONE', Record<string, any[]>> = { TODO: {}, DOING: {}, DONE: {} }
  for (const status of ['TODO','DOING','DONE'] as const) for (const l of lanes) empty[status][l.id] = []
  for (const it of items) {
    const laneId = (it.resourceId ?? 'unassigned') as string
    ;(empty as any)[it.status][laneId].push({ id: it.id, title: it.title, type: it.type, storyPoints: it.storyPoints, resourceId: it.resourceId })
  }

  return (
    <div>
      <p><Link href={`/projects/${project.id}`}>← Back to Project</Link></p>
      <h2>Agile Board — {project.name}</h2>
      <AgileBoardWithAssigneeFilter projectId={project.id} initial={empty as any} lanes={lanes as any} currentUserResourceId={currentUserResourceId} />
      {sprints.length ? (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:24}}>
          <BurndownChart sprintId={sprints[0].id} />
          <BurnupChart sprintId={sprints[0].id} />
        </div>
      ) : <p style={{opacity:.7, marginTop:16}}>No sprints yet — create one below (seed adds one).</p>}
      <h4 style={{marginTop:24}}>New Backlog Item</h4>
      <form action={`/api/agile/backlog`} method="post" style={{display:'grid', gap:8, maxWidth:520}}>
        <input type="hidden" name="projectId" value={project.id} />
        <label>Title <input name="title" defaultValue="Story" /></label>
        <label>Type <input name="type" defaultValue="story" /></label>
        <label>Story Points <input type="number" name="storyPoints" defaultValue={3} /></label>
        <button type="submit">Add</button>
      </form>
    </div>
  )
}
