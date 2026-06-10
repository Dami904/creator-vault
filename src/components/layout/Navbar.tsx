"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "@/hooks/useWallet";

export function Navbar() {
  const { profileType } = useWallet();

  const dashboardHref =
    profileType === "organization"
      ? "/organization/dashboard"
      : "/creator/dashboard";

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950 flex items-center px-6 justify-between">
      <Link href={dashboardHref} className="font-bold text-lg tracking-tight">
        Creator<span className="text-brand-500">Vault</span>
      </Link>

      <div className="flex items-center gap-4">
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>
    </header>
  );
}
