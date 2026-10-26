import { redirect } from "next/navigation";
import { requireKid } from "@/lib/session";
import { KidNav } from "@/components/KidNav";

export default async function KidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireKid();
  if (!session) redirect("/login");

  return (
    <>
      <div className="app-shell">{children}</div>
      <KidNav />
    </>
  );
}
