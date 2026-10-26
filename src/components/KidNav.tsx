"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/kid", label: "首页", icon: "星" },
  { href: "/kid/rewards", label: "兑换", icon: "礼" },
  { href: "/kid/requests", label: "申请", icon: "单" },
  { href: "/kid/ledger", label: "流水", icon: "账" },
];

export function KidNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={active ? "active" : ""}>
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
