import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.reward.findFirst({
    where: { id, familyId: session.familyId },
  });
  if (!existing) return NextResponse.json({ error: "兑换项不存在" }, { status: 404 });

  const body = await request.json();
  const title = body.title !== undefined ? String(body.title).trim() : existing.title;
  const cost = body.cost !== undefined ? Math.floor(Number(body.cost)) : existing.cost;

  if (!title || !Number.isFinite(cost) || cost <= 0) {
    return NextResponse.json({ error: "请填写有效的兑换项和积分" }, { status: 400 });
  }

  const reward = await prisma.reward.update({
    where: { id },
    data: { title, cost },
  });
  return NextResponse.json({ reward });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.reward.findFirst({
    where: { id, familyId: session.familyId },
  });
  if (!existing) return NextResponse.json({ error: "兑换项不存在" }, { status: 404 });

  await prisma.reward.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
