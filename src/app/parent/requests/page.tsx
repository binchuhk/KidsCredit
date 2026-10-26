import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RequestList } from "./RequestList";

export default async function RequestsPage() {
  const session = await requireParent();
  if (!session) redirect("/login");

  const requests = await prisma.redeemRequest.findMany({
    where: { kid: { familyId: session.familyId } },
    include: {
      kid: { select: { id: true, displayName: true } },
      reward: true,
    },
    orderBy: [{ status: "asc" }, { at: "desc" }],
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>审批兑换</h1>
          <p>孩子申请后，由家长批准或拒绝</p>
        </div>
      </div>
      <RequestList
        initialRequests={requests.map((r) => ({
          id: r.id,
          status: r.status,
          at: r.at.toISOString(),
          kid: r.kid,
          reward: {
            id: r.reward.id,
            title: r.reward.title,
            icon: r.reward.icon || "🎁",
            cost: r.reward.cost,
          },
        }))}
      />
    </>
  );
}
