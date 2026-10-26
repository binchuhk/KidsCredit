import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json({ error: "请填写用户名和密码" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const session = await getSession();
    session.userId = user.id;
    session.role = user.role;
    session.familyId = user.familyId;
    session.displayName = user.displayName;
    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true, role: user.role });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
