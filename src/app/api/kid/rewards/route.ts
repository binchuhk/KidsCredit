import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKid } from "@/lib/session";

export async function GET() {
  const session = await requireKid();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const rewards = await prisma.reward.findMany({
    where: { familyId: session.familyId },
    orderBy: { cost: "asc" },
  });
  return NextResponse.json({ rewards });
}
