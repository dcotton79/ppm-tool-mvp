import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ pref: null });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ pref: null });
  const res = await prisma.resource.findFirst({ where: { userId: user.id } });
  if (!res) return NextResponse.json({ pref: null });
  const pref = await prisma.pref.findUnique({ where: { projectId_resourceId: { projectId: params.projectId, resourceId: res.id } } });
  return NextResponse.json({ pref });
}

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: 'No user' }, { status: 400 });
  const resrc = await prisma.resource.findFirst({ where: { userId: user.id } });
  if (!resrc) return NextResponse.json({ ok: false, error: 'No resource' }, { status: 400 });

  const body = await req.json().catch(()=>({}));
  const update: any = {};
  if (typeof body.assignee === 'string') update.assignee = body.assignee;
  if (typeof body.onlyMine === 'boolean') update.onlyMine = body.onlyMine;
  if (typeof body.showIdealBurndown === 'boolean') update.showIdealBurndown = body.showIdealBurndown;
  if (typeof body.showMarkersBurndown === 'boolean') update.showMarkersBurndown = body.showMarkersBurndown;
  if (typeof body.showMarkersBurnup === 'boolean') update.showMarkersBurnup = body.showMarkersBurnup;

  const pref = await prisma.pref.upsert({
    where: { projectId_resourceId: { projectId: params.projectId, resourceId: resrc.id } },
    create: { projectId: params.projectId, resourceId: resrc.id, assignee: 'all', onlyMine: false, ...update },
    update: update
  });
  return NextResponse.json({ ok: true, pref });
}
