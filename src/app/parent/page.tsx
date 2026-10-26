import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import { CreateKidForm } from "./CreateKidForm";

export default async function ParentHomePage() {
  const session = await requireParent();
  if (!session) redirect("/login");

  const family = await prisma.family.findUnique({
    where: { id: session.familyId },
  });

  const kids = await prisma.user.findMany({
    where: { familyId: session.familyId, role: "kid" },
    include: { kidProfile: true },
    orderBy: { createdAt: "asc" },
  });

  const pendingCount = await prisma.redeemRequest.count({
    where: {
      status: "pending",
      kid: { familyId: session.familyId },
    },
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>你好，{session.displayName}</h1>
          <p>
            {family?.name} · 邀请码 <strong>{family?.inviteCode}</strong>
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="stack" style={{ marginBottom: 12 }}>
        {pendingCount > 0 ? (
          <Link href="/parent/requests" className="panel" style={{ display: "block" }}>
            <div className="row">
              <div>
                <div className="item-title">待审批兑换</div>
                <div className="item-meta">有孩子在等你确认</div>
              </div>
              <span className="badge">{pendingCount}</span>
            </div>
          </Link>
        ) : (
          <Link href="/parent/requests" className="panel" style={{ display: "block" }}>
            <div className="row">
              <div>
                <div className="item-title">兑换审批</div>
                <div className="item-meta">查看孩子的兑换申请</div>
              </div>
            </div>
          </Link>
        )}
        <Link href="/parent/tasks" className="panel" style={{ display: "block" }}>
          <div className="row">
            <div>
              <div className="item-title">管理任务</div>
              <div className="item-meta">设置记分项目，如象棋、游泳</div>
            </div>
          </div>
        </Link>
      </div>

      <section className="panel mt-12">
        <h2 className="section-title">小朋友</h2>
        {kids.length === 0 ? (
          <p className="empty">还没有孩子账号，先创建一个吧</p>
        ) : (
          <div className="stack">
            {kids.map((kid) => (
              <Link
                key={kid.id}
                href={`/parent/score?kid=${kid.id}`}
                className="kid-card"
              >
                <div className="row">
                  <div>
                    <strong>{kid.displayName}</strong>
                    <div className="item-meta">@{kid.username} · 去记分</div>
                  </div>
                  <div className="points">{kid.kidProfile?.balance ?? 0} 分</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="panel mt-12">
        <h2 className="section-title">添加孩子账号</h2>
        <CreateKidForm />
      </section>
    </>
  );
}
