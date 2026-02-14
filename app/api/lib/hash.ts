import crypto from "crypto";

export function generateInstanceHash() {
  return crypto.randomUUID();
}

export async function hashPasscode(passcode: string) {
  const data = new TextEncoder().encode(passcode);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
