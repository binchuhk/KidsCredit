import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

export async function GET() {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const rewards = await prisma.reward.findMany({
    where: { familyId: session.familyId },
    orderBy: { cost: "asc" },
  });
  return NextResponse.json({ rewards });
}

export async function POST(request: Request) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const body = await request.json();
  const title = String(body.title || "").trim();
  const cost = Number(body.cost);

  if (!title || !Number.isFinite(cost) || cost <= 0) {
    return NextResponse.json({ error: "请填写有效的兑换项和积分" }, { status: 400 });
  }

  const reward = await prisma.reward.create({
    data: { familyId: session.familyId, title, cost: Math.floor(cost) },
  });
  return NextResponse.json({ reward });
}
