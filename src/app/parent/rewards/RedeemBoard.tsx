"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Kid = { id: string; displayName: string; balance: number };
type Reward = { id: string; title: string; cost: number };
type LedgerItem = {
  id: string;
  type: "earn" | "spend";
  title: string;
  points: number;
  at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RedeemBoard({
  kids,
  rewards,
  initialKidId,
  initialLedger,
}: {
  kids: Kid[];
  rewards: Reward[];
  initialKidId: string;
  initialLedger: LedgerItem[];
}) {
  const router = useRouter();
  const [kidId, setKidId] = useState(initialKidId);
  const [balances, setBalances] = useState<Record<string, number>>(() =>
    Object.fromEntries(kids.map((k) => [k.id, k.balance]))
  );
  const [ledger, setLedger] = useState<LedgerItem[]>(initialLedger);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const [pendingCancel, setPendingCancel] = useState<LedgerItem | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");

  const balance = balances[kidId] ?? 0;
  const kidName = kids.find((k) => k.id === kidId)?.displayName ?? "";
  const busy = !!loadingId || cancelLoading;

  const loadLedger = useCallback(async (id: string) => {
    setLedgerLoading(true);
    try {
      const res = await fetch(`/api/parent/ledger?kidUserId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (res.ok) {
        setLedger(
          (data.ledger as LedgerItem[]).map((item) => ({
            ...item,
            at: typeof item.at === "string" ? item.at : new Date(item.at).toISOString(),
          }))
        );
      }
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  useEffect(() => {
    setBalances(Object.fromEntries(kids.map((k) => [k.id, k.balance])));
  }, [kids]);

  function selectKid(id: string) {
    setKidId(id);
    setFlash("");
    setError("");
    setPendingReward(null);
    setPendingCancel(null);
    setLedger([]);
    void loadLedger(id);
    router.replace(`/parent/rewards?kid=${id}`, { scroll: false });
  }

  async function confirmSpend() {
    if (!kidId || !pendingReward || loadingId) return;
    const reward = pendingReward;
    setLoadingId(reward.id);
    setFlash("");
    setError("");
    try {
      const res = await fetch("/api/parent/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kidUserId: kidId, rewardId: reward.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "兑换失败");
        return;
      }
      setBalances((prev) => ({ ...prev, [kidId]: data.balance }));
      setFlash(`已使用 · ${reward.title} -${reward.cost}`);
      setPendingReward(null);
      if (data.ledger) {
        setLedger((prev) => [
          {
            id: data.ledger.id,
            type: data.ledger.type,
            title: data.ledger.title,
            points: data.ledger.points,
            at:
              typeof data.ledger.at === "string"
                ? data.ledger.at
                : new Date(data.ledger.at).toISOString(),
          },
          ...prev,
        ]);
      } else {
        void loadLedger(kidId);
      }
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoadingId(null);
    }
  }

  async function confirmCancel() {
    if (!pendingCancel || cancelLoading) return;
    const item = pendingCancel;
    setCancelLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/parent/ledger/${item.id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "取消失败");
        return;
      }
      setBalances((prev) => ({ ...prev, [kidId]: data.balance }));
      setLedger((prev) => prev.filter((row) => row.id !== item.id));
      setFlash(
        item.type === "earn"
          ? `已取消 +${item.points} · ${item.title}`
          : `已取消 -${item.points} · ${item.title}`
      );
      setPendingCancel(null);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <>
      {kids.length > 1 ? (
        <div className="kid-chips">
          {kids.map((kid) => (
            <button
              key={kid.id}
              type="button"
              className={`kid-chip ${kid.id === kidId ? "active" : ""}`}
              onClick={() => selectKid(kid.id)}
            >
              {kid.displayName}
            </button>
          ))}
        </div>
      ) : null}

      <section className="panel score-hero">
        <div className="score-kid">{kidName} 的积分</div>
        <div className="balance score-total">
          {balance}
          <small>可用积分</small>
        </div>
        {flash ? <div className="score-flash">{flash}</div> : null}
        {error ? <div className="error mt-12">{error}</div> : null}
      </section>

      <section className="mt-12">
        <h2 className="section-title" style={{ paddingLeft: 4 }}>
          点项目使用
        </h2>
        {rewards.length === 0 ? (
          <div className="panel">
            <p className="empty">
              还没有兑换项，去 <a href="/parent/rewards/manage">管理兑换项</a> 添加
            </p>
          </div>
        ) : (
          <div className="score-grid">
            {rewards.map((reward) => {
              const enough = balance >= reward.cost;
              return (
                <button
                  key={reward.id}
                  type="button"
                  className={`score-card ${enough ? "" : "score-card-disabled"}`}
                  disabled={busy || !enough}
                  onClick={() => {
                    setError("");
                    setPendingCancel(null);
                    setPendingReward(reward);
                  }}
                >
                  <span className="score-card-title">{reward.title}</span>
                  <span className={`score-card-points spend`}>
                    {loadingId === reward.id ? "…" : `-${reward.cost}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel mt-12">
        <h2 className="section-title">历史记录</h2>
        <p className="item-meta" style={{ marginTop: -8, marginBottom: 12 }}>
          点某条记录可取消
        </p>
        {ledgerLoading && ledger.length === 0 ? (
          <p className="empty">加载中…</p>
        ) : ledger.length === 0 ? (
          <p className="empty">还没有记录</p>
        ) : (
          ledger.map((item) => (
            <button
              type="button"
              className="list-item ledger-row"
              key={item.id}
              disabled={busy}
              onClick={() => {
                setError("");
                setPendingCancel(item);
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div className="item-title">{item.title}</div>
                <div className="item-meta">{formatTime(item.at)} · 点按取消</div>
              </div>
              <div className={`points ${item.type}`}>
                {item.type === "earn" ? "+" : "-"}
                {item.points}
              </div>
            </button>
          ))
        )}
      </section>

      {pendingReward ? (
        <div
          className="confirm-mask"
          role="dialog"
          aria-modal="true"
          aria-labelledby="redeem-title"
          onClick={() => !loadingId && setPendingReward(null)}
        >
          <div className="confirm-sheet panel" onClick={(e) => e.stopPropagation()}>
            <h2 id="redeem-title" className="section-title">
              确认使用？
            </h2>
            <p className="confirm-body">
              给 <strong>{kidName}</strong> 兑换
              <br />
              <strong>{pendingReward.title}</strong>
              <span className="points spend"> -{pendingReward.cost}</span>
              <br />
              使用后剩余 {balance - pendingReward.cost} 分
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
                onClick={confirmSpend}
              >
                {loadingId ? "提交中…" : "确认使用"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingCancel ? (
        <div
          className="confirm-mask"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
          onClick={() => !cancelLoading && setPendingCancel(null)}
        >
          <div className="confirm-sheet panel" onClick={(e) => e.stopPropagation()}>
            <h2 id="cancel-title" className="section-title">
              取消这条记录？
            </h2>
            <p className="confirm-body">
              将撤销 <strong>{pendingCancel.title}</strong>
              <span className={`points ${pendingCancel.type}`}>
                {" "}
                {pendingCancel.type === "earn" ? "+" : "-"}
                {pendingCancel.points}
              </span>
            </p>
            <div className="actions mt-16">
              <button
                className="btn btn-secondary"
                type="button"
                disabled={cancelLoading}
                onClick={() => setPendingCancel(null)}
              >
                返回
              </button>
              <button
                className="btn btn-danger"
                type="button"
                disabled={cancelLoading}
                onClick={confirmCancel}
              >
                {cancelLoading ? "取消中…" : "确认取消"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
