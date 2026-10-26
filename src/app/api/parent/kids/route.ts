import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireParent } from "@/lib/session";

export async function GET() {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const kids = await prisma.user.findMany({
    where: { familyId: session.familyId, role: "kid" },
    include: { kidProfile: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    kids: kids.map((k) => ({
      id: k.id,
      username: k.username,
      displayName: k.displayName,
      balance: k.kidProfile?.balance ?? 0,
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireParent();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const displayName = String(body.displayName || "").trim();

    if (!username || !password || !displayName) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: "密码至少 4 位" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 });
    }

    const kid = await prisma.user.create({
      data: {
        familyId: session.familyId,
        role: "kid",
        username,
        passwordHash: await hashPassword(password),
        displayName,
        kidProfile: { create: { balance: 0 } },
      },
      include: { kidProfile: true },
    });

    return NextResponse.json({
      kid: {
        id: kid.id,
        username: kid.username,
        displayName: kid.displayName,
        balance: kid.kidProfile?.balance ?? 0,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
