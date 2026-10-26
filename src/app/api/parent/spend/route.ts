import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

export async function POST(request: Request) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  try {
    const body = await request.json();
    const kidUserId = String(body.kidUserId || "");
    const rewardId = String(body.rewardId || "");

    const kid = await prisma.user.findFirst({
      where: { id: kidUserId, familyId: session.familyId, role: "kid" },
      include: { kidProfile: true },
    });
    if (!kid || !kid.kidProfile) {
      return NextResponse.json({ error: "孩子不存在" }, { status: 404 });
    }

    const reward = await prisma.reward.findFirst({
      where: { id: rewardId, familyId: session.familyId },
    });
    if (!reward) {
      return NextResponse.json({ error: "兑换项不存在" }, { status: 404 });
    }

    if (kid.kidProfile.balance < reward.cost) {
      return NextResponse.json({ error: "积分不足，无法兑换" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.kidProfile.update({
        where: { userId: kidUserId },
        data: { balance: { decrement: reward.cost } },
      });

      if (profile.balance < 0) {
        throw new Error("INSUFFICIENT");
      }

      const ledger = await tx.ledger.create({
        data: {
          kidUserId,
          type: "spend",
          title: reward.title,
          icon: reward.icon,
          points: reward.cost,
          byUserId: session.userId,
        },
      });

      return { balance: profile.balance, ledger };
    });

    return NextResponse.json({
      balance: result.balance,
      ledger: result.ledger,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT") {
      return NextResponse.json({ error: "积分不足，无法兑换" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "兑换失败" }, { status: 500 });
  }
}
