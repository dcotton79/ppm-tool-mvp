/* eslint-disable */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main(){
  const portfolio = await prisma.portfolio.create({ data: { name: 'Corporate' } })
  const program = await prisma.program.create({ data: { name: 'Digital', portfolioId: portfolio.id } })
  const project = await prisma.project.create({ data: { name: 'Website Revamp', methodology: 'AGILE', programId: program.id, start: new Date(), finish: new Date(Date.now()+28*86400000) } })
  const res1 = await prisma.resource.create({ data: { name: 'Alex Dev', role: 'Frontend' } })
  const res2 = await prisma.resource.create({ data: { name: 'Sam QA', role: 'QA' } })
  const sprint = await prisma.sprint.create({ data: { projectId: project.id, name: 'Sprint 1', start: new Date(), end: new Date(Date.now()+14*86400000), capacitySP: 30 } })
  await prisma.backlogItem.createMany({ data: [
    { projectId: project.id, sprintId: sprint.id, title: 'Dashboard', type: 'story', status: 'TODO', storyPoints: 5, resourceId: res1.id },
    { projectId: project.id, sprintId: sprint.id, title: 'Drag/Drop Gantt', type: 'story', status: 'DOING', storyPoints: 8, resourceId: res1.id },
    { projectId: project.id, sprintId: sprint.id, title: 'Fix resize bug', type: 'bug', status: 'TODO', storyPoints: 3, resourceId: res2.id }
  ]})
  // scope change on next day
  await prisma.backlogItem.create({ data: { projectId: project.id, sprintId: sprint.id, title: 'Settings page', type: 'story', status: 'TODO', storyPoints: 5, createdAt: new Date(Date.now()+1*86400000) } })
  console.log('Seed done')
}
main().finally(()=>prisma.$disconnect())
