import { NextResponse } from "next/server";

// Fold long lines to ~73 chars per vCard spec (soft wrap with CRLF + space)
function foldLine(input: string, max = 73) {
  const out: string[] = [];
  for (let i = 0; i < input.length; i += max) {
    out.push(input.slice(i, i + max));
  }
  return out.join("\r\n ");
}

function originFromReq(reqUrl: string) {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  const u = new URL(reqUrl);
  return `${u.protocol}//${u.host}`;
}

export async function GET(req: Request) {
  // IMPORTANT: Access is enforced by middleware; do not re-check here.
  const origin = originFromReq(req.url);

  // Fetch avatar as binary and base64-encode
  const avatarUrl = `${origin}/images/avatar.jpg`;
  const imgRes = await fetch(avatarUrl, { cache: "no-store" });
  let photoLine = ""; // Optional if fetch fails
  if (imgRes.ok) {
    const ab = await imgRes.arrayBuffer();
    const b64 = Buffer.from(ab).toString("base64");
    // vCard 3.0 inline JPEG
    photoLine = foldLine(`PHOTO;ENCODING=b;TYPE=JPEG:${b64}`);
  }

  const contact = {
    first: "Brandon",
    last: "Gottschling",
    org: "—",
    title: "Technical Marketing & Builder",
    phone: "+1-770-480-7979",
    email: "hello@brandongottschling.com",
    url: "https://brandongottschling.com",
    address: "Georgia, USA",
  };

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${contact.last};${contact.first};;;`,
    `FN:${contact.first} ${contact.last}`,
    `ORG:${contact.org}`,
    `TITLE:${contact.title}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    `EMAIL;TYPE=INTERNET:${contact.email}`,
    `URL:${contact.url}`,
    `ADR;TYPE=WORK:;;${contact.address};;;;`,
    photoLine, // may be empty string if fetch failed
    "END:VCARD",
  ].filter(Boolean);

  const vcf = lines.join("\r\n");

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Brandon-Gottschling.vcf"',
      "Cache-Control": "no-store",
    },
  });
}
