"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Reward = { id: string; title: string; icon: string; cost: number };

export function RedeemList({
  balance,
  rewards,
}: {
  balance: number;
  rewards: Reward[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function confirmApply() {
    if (!pendingReward || loadingId) return;
    const reward = pendingReward;
    setLoadingId(reward.id);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/kid/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "申请失败");
        return;
      }
      setMessage(`已申请「${data.request.reward.title}」，等待家长批准`);
      setPendingReward(null);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      {message ? <div className="ok" style={{ marginBottom: 12 }}>{message}</div> : null}
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      {rewards.length === 0 ? (
        <section className="panel">
          <p className="empty">家长还没有设置兑换项</p>
        </section>
      ) : (
        <div className="score-grid">
          {rewards.map((reward) => {
            const enough = balance >= reward.cost;
            return (
              <button
                key={reward.id}
                type="button"
                className={`score-card ${enough ? "" : "score-card-disabled"}`}
                disabled={!!loadingId || !enough}
                onClick={() => {
                  setError("");
                  setPendingReward(reward);
                }}
              >
                <span className="score-card-main">
                  <span className="score-card-icon">{reward.icon || "🎁"}</span>
                  <span className="score-card-title">{reward.title}</span>
                </span>
                <span className="score-card-points spend">
                  {loadingId === reward.id ? "…" : `-${reward.cost}`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {pendingReward ? (
        <div
          className="confirm-mask"
          role="dialog"
          aria-modal="true"
          onClick={() => !loadingId && setPendingReward(null)}
        >
          <div className="confirm-sheet panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="section-title">确认申请兑换？</h2>
            <p className="confirm-body">
              申请{" "}
              <strong>
                {pendingReward.icon || "🎁"} {pendingReward.title}
              </strong>
              <span className="points spend"> -{pendingReward.cost}</span>
              <br />
              提交后等家长批准才会扣分
            </p>
            <div className="actions mt-16">
              <button
                className="btn btn-secondary"
                type="button"
                disabled={!!loadingId}
                onClick={() => setPendingReward(null)}
              >
                返回
              </button>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!!loadingId}
                onClick={confirmApply}
              >
                {loadingId ? "提交中…" : "确认申请"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
