"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const CREATOR_NAV: NavItem[] = [
  { href: "/creator/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/creator/jobs", label: "Browse Jobs", icon: "🔍" },
  { href: "/creator/profile", label: "Profile", icon: "👤" },
  { href: "/creator/wallet", label: "Wallet", icon: "💳" },
  { href: "/creator/reputation", label: "Reputation", icon: "⭐" },
];

const ORG_NAV: NavItem[] = [
  { href: "/organization/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/organization/jobs", label: "My Jobs", icon: "📋" },
  { href: "/organization/jobs/new", label: "Post a Deal", icon: "+" },
  { href: "/organization/profile", label: "Profile", icon: "🏢" },
  { href: "/organization/wallet", label: "Wallet", icon: "💳" },
];

interface SidebarProps {
  role: "creator" | "organization";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const nav = role === "creator" ? CREATOR_NAV : ORG_NAV;

  return (
    <aside className="w-56 min-h-screen border-r border-gray-800 bg-gray-950 py-6 px-3 flex flex-col gap-1">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active
                ? "bg-brand-600/20 text-brand-400 font-medium"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
