import { redirect } from "next/navigation";
import { requireParent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TaskManager } from "./TaskManager";

export default async function TasksPage() {
  const session = await requireParent();
  if (!session) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { familyId: session.familyId },
    orderBy: { points: "desc" },
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>任务</h1>
          <p>设置完成后可获得的积分，例如象棋赢一盘 +10</p>
        </div>
      </div>
      <TaskManager initialTasks={tasks} />
    </>
  );
}
