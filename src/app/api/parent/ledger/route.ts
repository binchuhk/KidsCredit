import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

export async function GET(request: Request) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const kidUserId = searchParams.get("kidUserId");
  if (!kidUserId) {
    return NextResponse.json({ error: "缺少 kidUserId" }, { status: 400 });
  }

  const kid = await prisma.user.findFirst({
    where: { id: kidUserId, familyId: session.familyId, role: "kid" },
  });
  if (!kid) return NextResponse.json({ error: "孩子不存在" }, { status: 404 });

  const ledger = await prisma.ledger.findMany({
    where: { kidUserId },
    orderBy: { at: "desc" },
    take: 50,
  });

  return NextResponse.json({ ledger });
}
