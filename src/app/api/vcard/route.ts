import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // deny if no auth cookie (middleware handles main flow, this is defense-in-depth)
  const cookie = (req.headers.get("cookie") || "").includes("card_auth=1");
  if (!cookie) return new NextResponse("Unauthorized", { status: 401 });

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

  const vcf = [
    "BEGIN:VCARD","VERSION:3.0",
    `N:${contact.last};${contact.first};;;`,
    `FN:${contact.first} ${contact.last}`,
    `ORG:${contact.org}`,
    `TITLE:${contact.title}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    `EMAIL;TYPE=INTERNET:${contact.email}`,
    `URL:${contact.url}`,
    `ADR;TYPE=WORK:;;${contact.address};;;;`,
    "END:VCARD",
  ].join("\r\n");

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="brandon.vcf"`,
      "Cache-Control": "no-store",
    },
  });
}
