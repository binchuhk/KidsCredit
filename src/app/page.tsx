import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

export default async function Home() {
  const session = await requireSession();
  if (!session) redirect("/login");
  redirect(session.role === "parent" ? "/parent/score" : "/kid");
}
