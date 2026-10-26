import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

export async function POST(request: Request) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  try {
    const body = await request.json();
    const kidUserId = String(body.kidUserId || "");
    const taskId = String(body.taskId || "");

    const kid = await prisma.user.findFirst({
      where: { id: kidUserId, familyId: session.familyId, role: "kid" },
      include: { kidProfile: true },
    });
    if (!kid || !kid.kidProfile) {
      return NextResponse.json({ error: "孩子不存在" }, { status: 404 });
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, familyId: session.familyId },
    });
    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    const [profile, ledger] = await prisma.$transaction([
      prisma.kidProfile.update({
        where: { userId: kidUserId },
        data: { balance: { increment: task.points } },
      }),
      prisma.ledger.create({
        data: {
          kidUserId,
          type: "earn",
          title: task.title,
          icon: task.icon,
          points: task.points,
          byUserId: session.userId,
        },
      }),
    ]);

    return NextResponse.json({
      balance: profile.balance,
      ledger,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "加分失败" }, { status: 500 });
  }
}
