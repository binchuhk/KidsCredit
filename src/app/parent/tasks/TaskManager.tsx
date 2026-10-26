"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPicker } from "@/components/IconPicker";

type Task = { id: string; title: string; icon: string; points: number };

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [points, setPoints] = useState("10");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createTask(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/parent/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, icon, points: Number(points) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "添加失败");
        return;
      }
      setTasks((prev) => [data.task, ...prev].sort((a, b) => b.points - a.points));
      setTitle("");
      setIcon("⭐");
      setPoints("10");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function removeTask(id: string) {
    const res = await fetch(`/api/parent/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "删除失败");
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }

  return (
    <>
      <section className="panel">
        <h2 className="section-title">添加任务</h2>
        <form className="form-grid" onSubmit={createTask}>
          <IconPicker value={icon} onChange={setIcon} />
          <div className="field">
            <label htmlFor="taskTitle">任务名</label>
            <input
              id="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如 游泳一次"
            />
          </div>
          <div className="field">
            <label htmlFor="taskPoints">积分</label>
            <input
              id="taskPoints"
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
          {error ? <div className="error">{error}</div> : null}
          <button className="btn btn-primary btn-block" disabled={loading} type="submit">
            {loading ? "添加中…" : "添加"}
          </button>
        </form>
      </section>

      <section className="panel mt-12">
        <h2 className="section-title">任务列表</h2>
        {tasks.length === 0 ? (
          <p className="empty">暂无任务</p>
        ) : (
          tasks.map((task) => (
            <div className="list-item" key={task.id}>
              <div className="row" style={{ justifyContent: "flex-start", gap: 10 }}>
                <span className="item-icon">{task.icon || "⭐"}</span>
                <div>
                  <div className="item-title">{task.title}</div>
                  <div className="item-meta">+{task.points} 分</div>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => removeTask(task.id)}
              >
                删除
              </button>
            </div>
          ))
        )}
      </section>
    </>
  );
}
