import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

export async function POST(request: Request) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  try {
    const body = await request.json();
    const kidUserId = String(body.kidUserId || "");
    const penaltyId = String(body.penaltyId || "");

    const kid = await prisma.user.findFirst({
      where: { id: kidUserId, familyId: session.familyId, role: "kid" },
      include: { kidProfile: true },
    });
    if (!kid || !kid.kidProfile) {
      return NextResponse.json({ error: "孩子不存在" }, { status: 404 });
    }

    const penalty = await prisma.penalty.findFirst({
      where: { id: penaltyId, familyId: session.familyId },
    });
    if (!penalty) {
      return NextResponse.json({ error: "惩罚项不存在" }, { status: 404 });
    }

    const [profile, ledger] = await prisma.$transaction([
      prisma.kidProfile.update({
        where: { userId: kidUserId },
        data: { balance: { decrement: penalty.points } },
      }),
      prisma.ledger.create({
        data: {
          kidUserId,
          type: "spend",
          title: `惩罚：${penalty.title}`,
          points: penalty.points,
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
    return NextResponse.json({ error: "扣分失败" }, { status: 500 });
  }
}
