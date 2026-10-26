"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [inviteShown, setInviteShown] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          displayName,
          username,
          password,
          familyName,
          inviteCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }
      if (mode === "create" && data.inviteCode) {
        setInviteShown(data.inviteCode);
        return;
      }
      router.replace("/parent/score");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  if (inviteShown) {
    return (
      <main className="app-shell auth">
        <div className="brand">
          Kids<span>Credit</span>
        </div>
        <div className="panel mt-16 stack">
          <h2 className="section-title">家庭创建成功</h2>
          <p className="muted">把邀请码分享给其他家长，他们可以加入同一家庭：</p>
          <div className="invite" style={{ textAlign: "center" }}>
            {inviteShown}
          </div>
          <button
            className="btn btn-primary btn-block"
            type="button"
            onClick={() => {
              router.replace("/parent/score");
              router.refresh();
            }}
          >
            开始记分
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell auth">
      <div className="brand">
        Kids<span>Credit</span>
      </div>
      <p className="lead">创建家庭或加入已有家庭，开始管理小朋友积分。</p>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${mode === "create" ? "active" : ""}`}
          onClick={() => setMode("create")}
        >
          新建家庭
        </button>
        <button
          type="button"
          className={`tab ${mode === "join" ? "active" : ""}`}
          onClick={() => setMode("join")}
        >
          加入家庭
        </button>
      </div>

      <form className="panel stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="displayName">家长昵称</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="例如 妈妈"
          />
        </div>
        <div className="field">
          <label htmlFor="username">登录用户名</label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="例如 mom"
          />
        </div>
        <div className="field">
          <label htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 4 位"
          />
        </div>
        {mode === "create" ? (
          <div className="field">
            <label htmlFor="familyName">家庭名称</label>
            <input
              id="familyName"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="例如 小明家"
            />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="inviteCode">家庭邀请码</label>
            <input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="6 位邀请码"
            />
          </div>
        )}
        {error ? <div className="error">{error}</div> : null}
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? "提交中…" : mode === "create" ? "创建并注册" : "加入并注册"}
        </button>
      </form>

      <p className="muted mt-16" style={{ textAlign: "center" }}>
        已有账号？ <Link href="/login">去登录</Link>
      </p>
    </main>
  );
}
