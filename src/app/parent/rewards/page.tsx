import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RedeemBoard } from "./RedeemBoard";

type Props = { searchParams: Promise<{ kid?: string }> };

export default async function RewardsPage({ searchParams }: Props) {
  const session = await requireParent();
  if (!session) redirect("/login");

  const { kid: kidParam } = await searchParams;

  const kids = await prisma.user.findMany({
    where: { familyId: session.familyId, role: "kid" },
    include: { kidProfile: true },
    orderBy: { createdAt: "asc" },
  });

  const rewards = await prisma.reward.findMany({
    where: { familyId: session.familyId },
    orderBy: { cost: "asc" },
  });

  const selectedId =
    (kidParam && kids.some((k) => k.id === kidParam) && kidParam) ||
    kids[0]?.id ||
    "";

  const ledger = selectedId
    ? await prisma.ledger.findMany({
        where: { kidUserId: selectedId },
        orderBy: { at: "desc" },
        take: 30,
      })
    : [];

  return (
    <>
      <div className="topbar">
        <div>
          <h1>兑换</h1>
          <p>点下面的项目，用积分兑换礼物或权利</p>
        </div>
        <Link href="/parent/rewards/manage" className="btn btn-ghost">
          管理兑换项
        </Link>
      </div>

      {kids.length === 0 ? (
        <section className="panel">
          <p className="empty">
            还没有孩子账号，先去 <Link href="/parent">首页</Link> 添加
          </p>
        </section>
      ) : (
        <RedeemBoard
          kids={kids.map((k) => ({
            id: k.id,
            displayName: k.displayName,
            balance: k.kidProfile?.balance ?? 0,
          }))}
          rewards={rewards.map((r) => ({
            id: r.id,
            title: r.title,
            icon: r.icon || "🎁",
            cost: r.cost,
          }))}
          initialKidId={selectedId}
          initialLedger={ledger.map((item) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            icon: item.icon || "",
            points: item.points,
            at: item.at.toISOString(),
          }))}
        />
      )}
    </>
  );
}
