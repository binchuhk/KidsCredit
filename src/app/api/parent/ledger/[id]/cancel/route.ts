import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;

  try {
    const entry = await prisma.ledger.findFirst({
      where: {
        id,
        kid: { familyId: session.familyId, role: "kid" },
      },
      include: {
        kid: { include: { kidProfile: true } },
      },
    });

    if (!entry || !entry.kid.kidProfile) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    if (entry.type === "earn" && entry.kid.kidProfile.balance < entry.points) {
      return NextResponse.json(
        { error: "当前积分不足，无法取消这笔加分" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.kidProfile.update({
        where: { userId: entry.kidUserId },
        data:
          entry.type === "earn"
            ? { balance: { decrement: entry.points } }
            : { balance: { increment: entry.points } },
      });

      if (profile.balance < 0) {
        throw new Error("INSUFFICIENT");
      }

      await tx.ledger.delete({ where: { id: entry.id } });
      return { balance: profile.balance };
    });

    return NextResponse.json({
      ok: true,
      balance: result.balance,
      kidUserId: entry.kidUserId,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT") {
      return NextResponse.json(
        { error: "当前积分不足，无法取消这笔加分" },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "取消失败" }, { status: 500 });
  }
}
