import { redirect } from "next/navigation";
import { requireKid } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const statusLabel = {
  pending: "待审批",
  approved: "已通过",
  rejected: "已拒绝",
} as const;

export default async function KidRequestsPage() {
  const session = await requireKid();
  if (!session) redirect("/login");

  const requests = await prisma.redeemRequest.findMany({
    where: { kidUserId: session.userId },
    include: { reward: true },
    orderBy: { at: "desc" },
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>我的申请</h1>
          <p>看看兑换申请有没有被批准</p>
        </div>
      </div>
      <section className="panel">
        {requests.length === 0 ? (
          <p className="empty">还没有申请记录</p>
        ) : (
          requests.map((item) => (
            <div className="list-item" key={item.id}>
              <div>
                <div className="item-title">
                  {item.reward.icon || "🎁"} {item.reward.title}
                </div>
                <div className="item-meta">
                  {item.reward.cost} 分 ·{" "}
                  {new Date(item.at).toLocaleString("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className={`status ${item.status}`}>{statusLabel[item.status]}</div>
            </div>
          ))
        )}
      </section>
    </>
  );
}
