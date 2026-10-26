import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKid } from "@/lib/session";

export async function GET() {
  const session = await requireKid();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const profile = await prisma.kidProfile.findUnique({
    where: { userId: session.userId },
  });

  return NextResponse.json({
    displayName: session.displayName,
    username: session.username,
    balance: profile?.balance ?? 0,
  });
}
