import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

export async function GET() {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const family = await prisma.family.findUnique({
    where: { id: session.familyId },
  });
  if (!family) return NextResponse.json({ error: "家庭不存在" }, { status: 404 });

  const pendingCount = await prisma.redeemRequest.count({
    where: {
      status: "pending",
      kid: { familyId: session.familyId },
    },
  });

  return NextResponse.json({
    family: {
      id: family.id,
      name: family.name,
      inviteCode: family.inviteCode,
    },
    pendingCount,
    displayName: session.displayName,
  });
}
