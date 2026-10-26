import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKid } from "@/lib/session";

export async function GET() {
  const session = await requireKid();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const ledger = await prisma.ledger.findMany({
    where: { kidUserId: session.userId },
    orderBy: { at: "desc" },
    take: 50,
  });

  return NextResponse.json({ ledger });
}
