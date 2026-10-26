import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKid } from "@/lib/session";

export async function POST(request: Request) {
  const session = await requireKid();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  try {
    const body = await request.json();
    const rewardId = String(body.rewardId || "");

    const reward = await prisma.reward.findFirst({
      where: { id: rewardId, familyId: session.familyId },
    });
    if (!reward) {
      return NextResponse.json({ error: "兑换项不存在" }, { status: 404 });
    }

    const profile = await prisma.kidProfile.findUnique({
      where: { userId: session.userId },
    });
    if (!profile || profile.balance < reward.cost) {
      return NextResponse.json({ error: "积分不足，无法申请" }, { status: 400 });
    }

    const pending = await prisma.redeemRequest.findFirst({
      where: {
        kidUserId: session.userId,
        rewardId,
        status: "pending",
      },
    });
    if (pending) {
      return NextResponse.json({ error: "已有相同兑换申请待审批" }, { status: 400 });
    }

    const redeem = await prisma.redeemRequest.create({
      data: {
        kidUserId: session.userId,
        rewardId,
      },
      include: { reward: true },
    });

    return NextResponse.json({
      request: {
        id: redeem.id,
        status: redeem.status,
        at: redeem.at,
        reward: {
          id: redeem.reward.id,
          title: redeem.reward.title,
          cost: redeem.reward.cost,
        },
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "申请失败" }, { status: 500 });
  }
}
