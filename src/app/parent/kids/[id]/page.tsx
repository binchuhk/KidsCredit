import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EarnPanel } from "./EarnPanel";

type Props = { params: Promise<{ id: string }> };

export default async function KidDetailPage({ params }: Props) {
  const session = await requireParent();
  if (!session) redirect("/login");
  const { id } = await params;

  const kid = await prisma.user.findFirst({
    where: { id, familyId: session.familyId, role: "kid" },
    include: { kidProfile: true },
  });
  if (!kid) notFound();

  const tasks = await prisma.task.findMany({
    where: { familyId: session.familyId },
    orderBy: { points: "desc" },
  });

  const ledger = await prisma.ledger.findMany({
    where: { kidUserId: kid.id },
    orderBy: { at: "desc" },
    take: 20,
  });

  return (
    <>
      <div className="topbar">
        <div>
          <p>
            <Link href="/parent" className="muted">
              ← 返回
            </Link>
          </p>
          <h1>{kid.displayName}</h1>
          <p>@{kid.username}</p>
        </div>
      </div>

      <section className="panel">
        <div className="balance">
          {kid.kidProfile?.balance ?? 0}
          <small>当前积分</small>
        </div>
      </section>

      <section className="panel mt-12">
        <h2 className="section-title">完成任务加分</h2>
        <EarnPanel kidUserId={kid.id} tasks={tasks} />
      </section>

      <section className="panel mt-12">
        <h2 className="section-title">最近流水</h2>
        {ledger.length === 0 ? (
          <p className="empty">还没有记录</p>
        ) : (
          ledger.map((item) => (
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
