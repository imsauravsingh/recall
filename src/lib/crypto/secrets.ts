import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const secret =
    process.env.AI_PROVIDER_ENCRYPTION_KEY ??
    process.env.CLERK_SECRET_KEY ??
    process.env.mongodb_connection ??
    "";

  if (!secret) {
    throw new Error(
      "Missing encryption secret. Set AI_PROVIDER_ENCRYPTION_KEY or CLERK_SECRET_KEY.",
    );
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptSecret(payload: string) {
  const [ivValue, tagValue, encryptedValue] = payload.split(".");
  if (!ivValue || !tagValue || !encryptedValue) {
    throw new Error("Invalid encrypted secret payload.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function maskSecret(value?: string) {
  if (!value) {
    return "";
  }

  if (value.length <= 8) {
    return "••••";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
