"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/parent/score", label: "记分", icon: "分" },
  { href: "/parent/penalty", label: "惩罚", icon: "罚" },
  { href: "/parent/rewards", label: "兑换", icon: "兑" },
  { href: "/parent", label: "首页", icon: "家" },
];

export function ParentNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const active =
          item.href === "/parent"
            ? pathname === "/parent" ||
              pathname.startsWith("/parent/kids") ||
              pathname.startsWith("/parent/requests") ||
              pathname.startsWith("/parent/tasks")
            : item.href === "/parent/rewards"
              ? pathname === "/parent/rewards" ||
                pathname.startsWith("/parent/rewards/")
              : item.href === "/parent/penalty"
                ? pathname.startsWith("/parent/penalty")
                : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? "active" : ""}>
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.href === "/parent" && pendingCount > 0 ? (
              <span className="badge nav-badge">{pendingCount}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
