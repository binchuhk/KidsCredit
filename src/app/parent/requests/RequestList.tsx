"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RequestItem = {
  id: string;
  status: "pending" | "approved" | "rejected";
  at: string;
  kid: { id: string; displayName: string };
  reward: { id: string; title: string; cost: number };
};

const statusLabel = {
  pending: "待审批",
  approved: "已通过",
  rejected: "已拒绝",
};

export function RequestList({ initialRequests }: { initialRequests: RequestItem[] }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function review(id: string, action: "approve" | "reject") {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/parent/requests/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "操作失败");
        return;
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === "approve" ? "approved" : "rejected" }
            : r
        )
      );
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="panel">
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}
      {requests.length === 0 ? (
        <p className="empty">暂时没有兑换申请</p>
      ) : (
        requests.map((item) => (
          <div className="list-item" key={item.id} style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div className="item-title">
                {item.kid.displayName} · {item.reward.title}
              </div>
              <div className="item-meta">
                {item.reward.cost} 分 ·{" "}
                {new Date(item.at).toLocaleString("zh-CN", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className={`status ${item.status} mt-8`}>
                {statusLabel[item.status]}
              </div>
              {item.status === "pending" ? (
                <div className="actions mt-12">
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    disabled={loadingId === item.id}
                    onClick={() => review(item.id, "approve")}
                  >
                    批准
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    disabled={loadingId === item.id}
                    onClick={() => review(item.id, "reject")}
                  >
                    拒绝
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
