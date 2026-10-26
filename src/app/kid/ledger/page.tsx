import { redirect } from "next/navigation";
import { requireKid } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function KidLedgerPage() {
  const session = await requireKid();
  if (!session) redirect("/login");

  const ledger = await prisma.ledger.findMany({
    where: { kidUserId: session.userId },
    orderBy: { at: "desc" },
    take: 50,
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>积分流水</h1>
          <p>加分和兑换记录都在这里</p>
        </div>
      </div>
      <section className="panel">
        {ledger.length === 0 ? (
          <p className="empty">暂无流水</p>
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
