// /pages/api/vcard.ts  (Pages Router)
// App Router: /app/api/vcard/route.ts (shown after)
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = (req.query.profile as string) || "brandon";
  // In production, load from env/DB:
  const contact = {
    first: "Brandon",
    last: "Gottschling",
    org: "—",
    title: "Technical Marketing & Builder",
    phone: "+1-555-555-5555",
    email: "hello@brandongottschling.com",
    url: "https://brandongottschling.com",
    address: "Georgia, USA",
  };

  const vcf = [
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
    "END:VCARD",
  ].join("\r\n");

  res.setHeader("Content-Type", "text/vcard; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${profile}.vcf"`);
  res.status(200).send(vcf);
}
