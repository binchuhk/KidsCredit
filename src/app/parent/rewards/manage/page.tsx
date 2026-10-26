import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RewardManager } from "../RewardManager";

export default async function RewardsManagePage() {
  const session = await requireParent();
  if (!session) redirect("/login");

  const rewards = await prisma.reward.findMany({
    where: { familyId: session.familyId },
    orderBy: { cost: "asc" },
  });

  return (
    <>
      <div className="topbar">
        <div>
          <p>
            <Link href="/parent/rewards" className="muted">
              ← 返回兑换
            </Link>
          </p>
          <h1>管理兑换项</h1>
          <p>设置礼物或权利所需积分，例如小礼物 30 分</p>
        </div>
      </div>
      <RewardManager initialRewards={rewards} />
    </>
  );
}
