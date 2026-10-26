import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getSession } from "@/lib/session";
import { makeInviteCode, seedFamilyDefaults } from "@/lib/seed-family";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const displayName = String(body.displayName || "").trim();
    const familyName = String(body.familyName || "").trim();
    const inviteCode = String(body.inviteCode || "").trim().toUpperCase();
    const mode = body.mode === "join" ? "join" : "create";

    if (!username || !password || !displayName) {
      return NextResponse.json({ error: "请填写用户名、密码和显示名" }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: "密码至少 4 位" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 });
    }

    let family;
    if (mode === "join") {
      if (!inviteCode) {
        return NextResponse.json({ error: "请输入家庭邀请码" }, { status: 400 });
      }
      family = await prisma.family.findUnique({ where: { inviteCode } });
      if (!family) {
        return NextResponse.json({ error: "邀请码无效" }, { status: 400 });
      }
    } else {
      if (!familyName) {
        return NextResponse.json({ error: "请填写家庭名称" }, { status: 400 });
      }
      let code = makeInviteCode();
      while (await prisma.family.findUnique({ where: { inviteCode: code } })) {
        code = makeInviteCode();
      }
      family = await prisma.family.create({
        data: { name: familyName, inviteCode: code },
      });
      await seedFamilyDefaults(family.id);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        familyId: family.id,
        role: "parent",
        username,
        passwordHash,
        displayName,
      },
    });

    const session = await getSession();
    session.userId = user.id;
    session.role = user.role;
    session.familyId = user.familyId;
    session.displayName = user.displayName;
    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      ok: true,
      role: user.role,
      inviteCode: family.inviteCode,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
