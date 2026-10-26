import { redirect } from "next/navigation";
import Link from "next/link";
import { requireKid } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";

export default async function KidHomePage() {
  const session = await requireKid();
  if (!session) redirect("/login");

  const profile = await prisma.kidProfile.findUnique({
    where: { userId: session.userId },
  });

  const pendingCount = await prisma.redeemRequest.count({
    where: { kidUserId: session.userId, status: "pending" },
  });

  const recent = await prisma.ledger.findMany({
    where: { kidUserId: session.userId },
    orderBy: { at: "desc" },
    take: 5,
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>你好，{session.displayName}</h1>
          <p>看看你的积分，去兑换喜欢的礼物吧</p>
        </div>
        <LogoutButton />
      </div>

      <section className="panel">
        <div className="balance">
          {profile?.balance ?? 0}
          <small>我的积分</small>
        </div>
      </section>

      <div className="actions mt-12">
        <Link href="/kid/rewards" className="btn btn-primary" style={{ textAlign: "center" }}>
          去兑换
        </Link>
        <Link
          href="/kid/requests"
          className="btn btn-secondary"
          style={{ textAlign: "center" }}
        >
          我的申请{pendingCount > 0 ? ` (${pendingCount})` : ""}
        </Link>
      </div>

      <section className="panel mt-12">
        <h2 className="section-title">最近流水</h2>
        {recent.length === 0 ? (
          <p className="empty">完成任务后，积分会出现在这里</p>
        ) : (
          recent.map((item) => (
            <div className="list-item" key={item.id}>
              <div>
                <div className="item-title">{item.title}</div>
                <div className="item-meta">
                  {new Date(item.at).toLocaleString("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className={`points ${item.type}`}>
                {item.type === "earn" ? "+" : "-"}
                {item.points}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}
