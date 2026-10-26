import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PenaltyManager } from "./PenaltyManager";

export default async function PenaltyManagePage() {
  const session = await requireParent();
  if (!session) redirect("/login");

  const penalties = await prisma.penalty.findMany({
    where: { familyId: session.familyId },
    orderBy: { points: "desc" },
  });

  return (
    <>
      <div className="topbar">
        <div>
          <p>
            <Link href="/parent/penalty" className="muted">
              ← 返回惩罚
            </Link>
          </p>
          <h1>管理惩罚项</h1>
          <p>设置扣分项目，例如不听话 -5</p>
        </div>
      </div>
      <PenaltyManager initialPenalties={penalties} />
    </>
  );
}
