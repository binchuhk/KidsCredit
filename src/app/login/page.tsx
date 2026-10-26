"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }
      router.replace(data.role === "parent" ? "/parent/score" : "/kid");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell auth">
      <div className="brand">
        Kids<span>Credit</span>
      </div>
      <p className="lead">家长加分，孩子申请兑换。家庭积分，一起攒起来。</p>

      <form className="panel mt-16 stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="username">用户名</label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="例如 mom / leo"
          />
        </div>
        <div className="field">
          <label htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 4 位"
          />
        </div>
        {error ? <div className="error">{error}</div> : null}
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? "登录中…" : "登录"}
        </button>
      </form>

      <p className="muted mt-16" style={{ textAlign: "center" }}>
        还没有家长账号？ <Link href="/register">注册家庭</Link>
      </p>
    </main>
  );
}
