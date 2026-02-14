"use client";

import { createContext, useContext, useState } from "react";

type PocketContextType = {
  contextPasscode: string | null;
  setContextPasscode: (p: string | null) => void;
};

const PocketContext = createContext<PocketContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [contextPasscode, setContextPasscode] = useState<string | null>(null);

  return (
    <PocketContext.Provider value={{ contextPasscode, setContextPasscode }}>
      {children}
    </PocketContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(PocketContext);
  if (!ctx) {
    throw new Error("usePocket must be used inside PocketProvider");
  }
  return ctx;
}
