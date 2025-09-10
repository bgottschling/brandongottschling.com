import crypto from "crypto";

export function signCardToken(ttlSeconds: number) {
  const exp = Date.now() + ttlSeconds * 1000;
  const payload = Buffer.from(JSON.stringify({ sub: "card", exp }), "utf8").toString("base64url");
  const h = crypto.createHmac("sha256", process.env.CARD_TOKEN_SECRET!);
  h.update(payload);
  const sig = h.digest("base64url");
  return `${payload}.${sig}`;
}
