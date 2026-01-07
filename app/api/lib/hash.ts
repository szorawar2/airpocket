import bcrypt from "bcryptjs";
import crypto from "crypto";

export function generateInstanceHash() {
  return crypto.randomUUID();
}

export async function hashPasscode(passcode: string) {
  return bcrypt.hash(passcode, 10);
}
