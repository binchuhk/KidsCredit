"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Task = { id: string; title: string; points: number };

export function EarnPanel({
  kidUserId,
  tasks,
}: {
  kidUserId: string;
  tasks: Task[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function confirmEarn() {
    if (!pendingTask || loadingId) return;
    const task = pendingTask;
    setLoadingId(task.id);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/parent/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kidUserId, taskId: task.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "加分失败");
        return;
      }
      setMessage(`已加分，当前 ${data.balance} 分`);
      setPendingTask(null);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoadingId(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="empty">
        还没有任务，先去 <a href="/parent/tasks">任务页</a> 添加
      </p>
    );
  }

  return (
    <div>
      {tasks.map((task) => (
        <div className="list-item" key={task.id}>
          <div>
            <div className="item-title">{task.title}</div>
            <div className="item-meta">完成可得 {task.points} 分</div>
          </div>
          <button
            className="btn btn-sun btn-sm"
            type="button"
            disabled={!!loadingId}
            onClick={() => {
              setError("");
              setPendingTask(task);
            }}
          >
            {loadingId === task.id ? "…" : "完成"}
          </button>
        </div>
      ))}
      {message ? <div className="ok mt-12">{message}</div> : null}
      {error ? <div className="error mt-12">{error}</div> : null}

      {pendingTask ? (
        <div
          className="confirm-mask"
          role="dialog"
          aria-modal="true"
          onClick={() => !loadingId && setPendingTask(null)}
        >
          <div className="confirm-sheet panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="section-title">确认加分？</h2>
            <p className="confirm-body">
              记上 <strong>{pendingTask.title}</strong>
              <span className="points earn"> +{pendingTask.points}</span>
            </p>
            <div className="actions mt-16">
              <button
                className="btn btn-secondary"
                type="button"
                disabled={!!loadingId}
                onClick={() => setPendingTask(null)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!!loadingId}
                onClick={confirmEarn}
              >
                {loadingId ? "提交中…" : "确认加分"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
