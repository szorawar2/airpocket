import "server-only";
import bcrypt from "bcryptjs";

export async function hashPasscodeAgain(passcode: string) {
  return bcrypt.hash(passcode, 10);
}
