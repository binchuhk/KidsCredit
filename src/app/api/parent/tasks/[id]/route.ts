import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.task.findFirst({
    where: { id, familyId: session.familyId },
  });
  if (!existing) return NextResponse.json({ error: "任务不存在" }, { status: 404 });

  const body = await request.json();
  const title = body.title !== undefined ? String(body.title).trim() : existing.title;
  const points =
    body.points !== undefined ? Math.floor(Number(body.points)) : existing.points;

  if (!title || !Number.isFinite(points) || points <= 0) {
    return NextResponse.json({ error: "请填写有效的任务名和积分" }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id },
    data: { title, points },
  });
  return NextResponse.json({ task });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.task.findFirst({
    where: { id, familyId: session.familyId },
  });
  if (!existing) return NextResponse.json({ error: "任务不存在" }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
