export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: "Contact — Private",
  robots: { index: false, follow: false },
};

export default function ContactCard() {
  const phone = "+17704807979";
  const email = "hello@brandongottschling.com";
  const vcfUrl = "/api/vcard?profile=brandon&v=1";

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <meta name="robots" content="noindex,nofollow" />
      <section className="text-center">
        <img src="/images/avatar.jpg" alt="Brandon" className="mx-auto h-24 w-24 rounded-full" />
        <h1 className="mt-4 text-2xl font-semibold">Brandon Gottschling</h1>
        <p className="text-sm text-neutral-500">Technical Marketing • Builder</p>
      </section>
      <div className="grid gap-3">
        <a className="rounded-2xl border p-3 text-center" href={`tel:${phone}`}>📞 Call</a>
        <a className="rounded-2xl border p-3 text-center" href={`sms:${phone}`}>💬 Text</a>
        <a className="rounded-2xl border p-3 text-center" href={`mailto:${email}`}>✉️ Email</a>
        <a className="rounded-2xl border p-3 text-center" href={vcfUrl}>➕ Save Contact (VCF)</a>
      </div>
      <footer className="text-center text-xs text-neutral-400">Private link. Please don’t share.</footer>
    </main>
  );
}
