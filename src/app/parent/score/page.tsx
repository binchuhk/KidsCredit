import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ScoreBoard } from "./ScoreBoard";

type Props = { searchParams: Promise<{ kid?: string }> };

export default async function ScorePage({ searchParams }: Props) {
  const session = await requireParent();
  if (!session) redirect("/login");

  const { kid: kidParam } = await searchParams;

  const kids = await prisma.user.findMany({
    where: { familyId: session.familyId, role: "kid" },
    include: { kidProfile: true },
    orderBy: { createdAt: "asc" },
  });

  const tasks = await prisma.task.findMany({
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
          <h1>记分</h1>
          <p>点下面的项目，立刻给小朋友加分</p>
        </div>
        <Link href="/parent/tasks" className="btn btn-ghost">
          管理任务
        </Link>
      </div>

      {kids.length === 0 ? (
        <section className="panel">
          <p className="empty">
            还没有孩子账号，先去 <Link href="/parent">首页</Link> 添加
          </p>
        </section>
      ) : (
        <ScoreBoard
          kids={kids.map((k) => ({
            id: k.id,
            displayName: k.displayName,
            balance: k.kidProfile?.balance ?? 0,
          }))}
          tasks={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            icon: t.icon || "⭐",
            points: t.points,
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
