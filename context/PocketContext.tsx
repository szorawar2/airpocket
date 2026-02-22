"use client";

import { createContext, useContext, useState, useEffect } from "react";

type PocketContextType = {
  contextPasscode: string | null;
  setContextPasscode: (p: string | null) => void;
  encryptionKey: CryptoKey | null;
  setEncryptionKey: (key: CryptoKey | null) => void;
};

const PocketContext = createContext<PocketContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [contextPasscode, setContextPasscode] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("passcode");
    if (stored) {
      setContextPasscode(stored);
    }
  }, []);

  return (
    <PocketContext.Provider
      value={{
        contextPasscode,
        setContextPasscode,
        encryptionKey,
        setEncryptionKey,
      }}
    >
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
