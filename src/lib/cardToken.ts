// HMAC-signed, URL-safe token: "<b64url(payload)>.<b64url(hmac)>"
function b64url(data: Uint8Array | string) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToU8(b64url: string) {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  if (b64.length % 4) b64 += "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomJti(len = 16) {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return b64url(a);
}

async function hmacSHA256(keyRaw: string, msg: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(keyRaw), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return new Uint8Array(sig);
}

export async function signCardToken(ttlSeconds: number) {
  const now = Date.now();
  const payload = {
    sub: "card",
    scope: "vcard",
    exp: now + ttlSeconds * 1000,
    ver: Number(process.env.CARD_AUTH_VERSION || "1"),
    jti: randomJti(16),
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = b64url(payloadStr);
  const sig = await hmacSHA256(process.env.CARD_TOKEN_SECRET || "", payloadB64);
  return `${payloadB64}.${b64url(sig)}`;
}

export async function verifyCardToken(t: string) {
  try {
    const [payloadB64, sigB64] = t.split(".");
    if (!payloadB64 || !sigB64) return null;
    const expected = await hmacSHA256(process.env.CARD_TOKEN_SECRET || "", payloadB64);
    if (b64url(expected) !== sigB64) return null;
    const json = new TextDecoder().decode(b64urlToU8(payloadB64));
    const payload = JSON.parse(json) as {
      sub: string; scope: string; exp: number; ver: number; jti: string;
    };
    if (payload.sub !== "card" || payload.scope !== "vcard") return null;
    if (typeof payload.exp !== "number" || Date.now() >= payload.exp) return null;
    if (!payload.jti) return null;
    return payload;
  } catch { return null; }
}
