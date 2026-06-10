"use client";

import { createContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { ProfileType } from "@/types";

interface WalletContextValue {
  address: string | undefined;
  isConnected: boolean;
  profileType: ProfileType | null;
  setProfileType: (type: ProfileType) => void;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [profileType, setProfileTypeState] = useState<ProfileType | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("profile_type") as ProfileType | null;
    if (stored) setProfileTypeState(stored);
  }, []);

  function setProfileType(type: ProfileType) {
    localStorage.setItem("profile_type", type);
    setProfileTypeState(type);
  }

  return (
    <WalletContext.Provider
      value={{ address, isConnected, profileType, setProfileType }}
    >
      {children}
    </WalletContext.Provider>
  );
}
