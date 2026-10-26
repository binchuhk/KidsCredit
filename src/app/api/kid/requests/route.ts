import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKid } from "@/lib/session";

export async function GET() {
  const session = await requireKid();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const requests = await prisma.redeemRequest.findMany({
    where: { kidUserId: session.userId },
    include: { reward: true },
    orderBy: { at: "desc" },
    take: 50,
  });

  return NextResponse.json({
    requests: requests.map((r) => ({
      id: r.id,
      status: r.status,
      at: r.at,
      reviewedAt: r.reviewedAt,
      reward: { id: r.reward.id, title: r.reward.title, cost: r.reward.cost },
    })),
  });
}
