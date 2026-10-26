"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Penalty = { id: string; title: string; points: number };

export function PenaltyManager({
  initialPenalties,
}: {
  initialPenalties: Penalty[];
}) {
  const router = useRouter();
  const [penalties, setPenalties] = useState(initialPenalties);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("5");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createPenalty(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/parent/penalties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, points: Number(points) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "添加失败");
        return;
      }
      setPenalties((prev) =>
        [data.penalty, ...prev].sort((a, b) => b.points - a.points)
      );
      setTitle("");
      setPoints("5");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function removePenalty(id: string) {
    const res = await fetch(`/api/parent/penalties/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "删除失败");
      return;
    }
    setPenalties((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  return (
    <>
      <section className="panel">
        <h2 className="section-title">添加惩罚项</h2>
        <form className="form-grid" onSubmit={createPenalty}>
          <div className="field">
            <label htmlFor="penaltyTitle">名称</label>
            <input
              id="penaltyTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如 不听话"
            />
          </div>
          <div className="field">
            <label htmlFor="penaltyPoints">扣分</label>
            <input
              id="penaltyPoints"
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
        <h2 className="section-title">惩罚列表</h2>
        {penalties.length === 0 ? (
          <p className="empty">暂无惩罚项</p>
        ) : (
          penalties.map((penalty) => (
            <div className="list-item" key={penalty.id}>
              <div>
                <div className="item-title">{penalty.title}</div>
                <div className="item-meta points spend">-{penalty.points} 分</div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => removePenalty(penalty.id)}
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
