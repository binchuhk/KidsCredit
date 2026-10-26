import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { seedFamilyDefaults } from "@/lib/seed-family";
import { PenaltyBoard } from "./PenaltyBoard";

type Props = { searchParams: Promise<{ kid?: string }> };

export default async function PenaltyPage({ searchParams }: Props) {
  const session = await requireParent();
  if (!session) redirect("/login");

  await seedFamilyDefaults(session.familyId);

  const { kid: kidParam } = await searchParams;

  const kids = await prisma.user.findMany({
    where: { familyId: session.familyId, role: "kid" },
    include: { kidProfile: true },
    orderBy: { createdAt: "asc" },
  });

  const penalties = await prisma.penalty.findMany({
    where: { familyId: session.familyId },
    orderBy: { points: "desc" },
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
          <h1>惩罚</h1>
          <p>点下面的项目，给小朋友扣分</p>
        </div>
        <Link href="/parent/penalty/manage" className="btn btn-ghost">
          管理惩罚项
        </Link>
      </div>

      {kids.length === 0 ? (
        <section className="panel">
          <p className="empty">
            还没有孩子账号，先去 <Link href="/parent">首页</Link> 添加
          </p>
        </section>
      ) : (
        <PenaltyBoard
          kids={kids.map((k) => ({
            id: k.id,
            displayName: k.displayName,
            balance: k.kidProfile?.balance ?? 0,
          }))}
          penalties={penalties.map((p) => ({
            id: p.id,
            title: p.title,
            icon: p.icon || "⚠️",
            points: p.points,
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
