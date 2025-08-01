import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || "default_secret";

// base64 -> base64url
export function toBase64Url(base64: string) {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// base64url -> base64
export function fromBase64Url(base64url: string) {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return base64;
}

export function encryptId(id: string | number): string {
  const encrypted = CryptoJS.AES.encrypt(id.toString(), SECRET_KEY).toString();
  return toBase64Url(encrypted);
}

export function decryptId(cipherTextUrl: string): string {
  const base64 = fromBase64Url(cipherTextUrl);
  const bytes = CryptoJS.AES.decrypt(base64, SECRET_KEY);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  if (!originalText) throw new Error("Invalid cipher or wrong secret");
  return originalText;
}
