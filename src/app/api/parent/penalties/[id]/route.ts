import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.penalty.findFirst({
    where: { id, familyId: session.familyId },
  });
  if (!existing) return NextResponse.json({ error: "惩罚项不存在" }, { status: 404 });

  await prisma.penalty.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
