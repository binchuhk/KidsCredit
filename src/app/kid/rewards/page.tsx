import { redirect } from "next/navigation";
import { requireKid } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RedeemList } from "./RedeemList";

export default async function KidRewardsPage() {
  const session = await requireKid();
  if (!session) redirect("/login");

  const profile = await prisma.kidProfile.findUnique({
    where: { userId: session.userId },
  });

  const rewards = await prisma.reward.findMany({
    where: { familyId: session.familyId },
    orderBy: { cost: "asc" },
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>兑换商店</h1>
          <p>当前积分 {profile?.balance ?? 0} · 提交后等家长批准</p>
        </div>
      </div>
      <RedeemList
        balance={profile?.balance ?? 0}
        rewards={rewards.map((r) => ({
          id: r.id,
          title: r.title,
          icon: r.icon || "🎁",
          cost: r.cost,
        }))}
      />
    </>
  );
}
