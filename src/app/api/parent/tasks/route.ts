import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

export async function GET() {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { familyId: session.familyId },
    orderBy: { points: "desc" },
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const body = await request.json();
  const title = String(body.title || "").trim();
  const points = Number(body.points);

  if (!title || !Number.isFinite(points) || points <= 0) {
    return NextResponse.json({ error: "请填写有效的任务名和积分" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: { familyId: session.familyId, title, points: Math.floor(points) },
  });
  return NextResponse.json({ task });
}
