import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const action = body.action === "reject" ? "reject" : "approve";

    const redeem = await prisma.redeemRequest.findFirst({
      where: {
        id,
        status: "pending",
        kid: { familyId: session.familyId },
      },
      include: {
        reward: true,
        kid: { include: { kidProfile: true } },
      },
    });

    if (!redeem || !redeem.kid.kidProfile) {
      return NextResponse.json({ error: "申请不存在或已处理" }, { status: 404 });
    }

    if (action === "reject") {
      const updated = await prisma.redeemRequest.update({
        where: { id },
        data: {
          status: "rejected",
          reviewedAt: new Date(),
          reviewedById: session.userId,
        },
      });
      return NextResponse.json({ request: updated });
    }

    if (redeem.kid.kidProfile.balance < redeem.reward.cost) {
      return NextResponse.json({ error: "孩子积分不足，无法批准" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.kidProfile.update({
        where: { userId: redeem.kidUserId },
        data: { balance: { decrement: redeem.reward.cost } },
      });

      if (profile.balance < 0) {
        throw new Error("INSUFFICIENT");
      }

      await tx.ledger.create({
        data: {
          kidUserId: redeem.kidUserId,
          type: "spend",
          title: redeem.reward.title,
          points: redeem.reward.cost,
          byUserId: session.userId,
        },
      });

      const updated = await tx.redeemRequest.update({
        where: { id },
        data: {
          status: "approved",
          reviewedAt: new Date(),
          reviewedById: session.userId,
        },
      });

      return { updated, balance: profile.balance };
    });

    return NextResponse.json({
      request: result.updated,
      balance: result.balance,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT") {
      return NextResponse.json({ error: "孩子积分不足，无法批准" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "审批失败" }, { status: 500 });
  }
}
