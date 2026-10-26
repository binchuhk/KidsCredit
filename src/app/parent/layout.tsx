import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ParentNav } from "@/components/ParentNav";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireParent();
  if (!session) redirect("/login");

  const pendingCount = await prisma.redeemRequest.count({
    where: {
      status: "pending",
      kid: { familyId: session.familyId },
    },
  });

  return (
    <>
      <div className="app-shell">{children}</div>
      <ParentNav pendingCount={pendingCount} />
    </>
  );
}
