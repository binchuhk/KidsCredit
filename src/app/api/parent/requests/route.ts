import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

export async function GET() {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const requests = await prisma.redeemRequest.findMany({
    where: {
      kid: { familyId: session.familyId },
    },
    include: {
      kid: { select: { id: true, displayName: true } },
      reward: true,
    },
    orderBy: [{ status: "asc" }, { at: "desc" }],
  });

  return NextResponse.json({
    requests: requests.map((r) => ({
      id: r.id,
      status: r.status,
      at: r.at,
      reviewedAt: r.reviewedAt,
      kid: r.kid,
      reward: { id: r.reward.id, title: r.reward.title, cost: r.reward.cost },
    })),
  });
}
