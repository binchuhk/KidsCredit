"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPicker } from "@/components/IconPicker";

type Reward = { id: string; title: string; icon: string; cost: number };

export function RewardManager({ initialRewards }: { initialRewards: Reward[] }) {
  const router = useRouter();
  const [rewards, setRewards] = useState(initialRewards);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("🎁");
  const [cost, setCost] = useState("30");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createReward(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/parent/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, icon, cost: Number(cost) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "添加失败");
        return;
      }
      setRewards((prev) => [...prev, data.reward].sort((a, b) => a.cost - b.cost));
      setTitle("");
      setIcon("🎁");
      setCost("30");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function removeReward(id: string) {
    const res = await fetch(`/api/parent/rewards/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "删除失败");
      return;
    }
    setRewards((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  return (
    <>
      <section className="panel">
        <h2 className="section-title">添加兑换项</h2>
        <form className="form-grid" onSubmit={createReward}>
          <IconPicker value={icon} onChange={setIcon} />
          <div className="field">
            <label htmlFor="rewardTitle">名称</label>
            <input
              id="rewardTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如 看一集动画片"
            />
          </div>
          <div className="field">
            <label htmlFor="rewardCost">所需积分</label>
            <input
              id="rewardCost"
              type="number"
              min={1}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          {error ? <div className="error">{error}</div> : null}
          <button className="btn btn-primary btn-block" disabled={loading} type="submit">
            {loading ? "添加中…" : "添加"}
          </button>
        </form>
      </section>

      <section className="panel mt-12">
        <h2 className="section-title">兑换列表</h2>
        {rewards.length === 0 ? (
          <p className="empty">暂无兑换项</p>
        ) : (
          rewards.map((reward) => (
            <div className="list-item" key={reward.id}>
              <div className="row" style={{ justifyContent: "flex-start", gap: 10 }}>
                <span className="item-icon">{reward.icon || "🎁"}</span>
                <div>
                  <div className="item-title">{reward.title}</div>
                  <div className="item-meta">{reward.cost} 分</div>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => removeReward(reward.id)}
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