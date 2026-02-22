import crypto from "crypto";

export async function generateInstanceHash() {
  const instance = crypto.randomUUID().toString();
  return instance as string;
}

export async function hashPasscode(passcode: string) {
  const data = new TextEncoder().encode(passcode);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function deriveKey(passcode: string, salt: Uint8Array) {
  const enc = new TextEncoder();

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passcode),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  // Ensure salt uses a regular ArrayBuffer, not SharedArrayBuffer
  const normalizedSalt = new Uint8Array(salt);

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: normalizedSalt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function generateSalt(byteLength = 16): Buffer {
  return crypto.randomBytes(byteLength);
}

export async function fromBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export async function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

export async function encryptMessage(key: CryptoKey, plaintext: string) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  return { ciphertext: new Uint8Array(ciphertext), iv };
}

export async function decryptMessage(
  key: CryptoKey,
  ciphertextBase64: string,
  ivBase64: string,
) {
  const ciphertext = await fromBase64(ciphertextBase64);
  const iv = await fromBase64(ivBase64);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(decrypted);
}

export async function encryptFile(file: File, key: CryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    fileBuffer,
  );

  return {
    encryptedBlob: new Blob([encryptedBuffer]),
    iv: iv,
  };
}

export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  key: CryptoKey,
  ivBase64: string,
) {
  const iv = await fromBase64(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encryptedBuffer,
  );

  return new Blob([decryptedBuffer]);
}
