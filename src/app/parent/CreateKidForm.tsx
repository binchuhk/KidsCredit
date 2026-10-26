"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CreateKidForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);
    try {
      const res = await fetch("/api/parent/kids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "创建失败");
        return;
      }
      setOk(`已创建 ${data.kid.displayName}`);
      setDisplayName("");
      setUsername("");
      setPassword("");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="kidName">显示名</label>
        <input
          id="kidName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="例如 小明"
        />
      </div>
      <div className="field">
        <label htmlFor="kidUser">登录用户名</label>
        <input
          id="kidUser"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="例如 leo"
        />
      </div>
      <div className="field">
        <label htmlFor="kidPass">初始密码</label>
        <input
          id="kidPass"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="至少 4 位"
        />
      </div>
      {error ? <div className="error">{error}</div> : null}
      {ok ? <div className="ok">{ok}</div> : null}
      <button className="btn btn-primary btn-block" disabled={loading} type="submit">
        {loading ? "创建中…" : "创建孩子账号"}
      </button>
    </form>
  );
}
