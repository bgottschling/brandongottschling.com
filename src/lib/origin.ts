export function getOriginFromRequest(reqUrl: string) {
  const u = new URL(reqUrl);
  return `${u.protocol}//${u.host}`;
}

export function getSiteOriginFallback(reqUrl: string) {
  return process.env.NEXT_PUBLIC_SITE_ORIGIN || getOriginFromRequest(reqUrl);
}
