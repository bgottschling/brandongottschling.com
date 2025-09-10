
export const metadata = {
  robots: { index: false, follow: false },
};

export default function AccessPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const next = searchParams.next || "/card";
  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-xl font-semibold">Enter Access Code</h1>
      {searchParams.error && <p className="text-red-600 text-sm">{searchParams.error}</p>}
      <form method="POST" action={`/api/card-auth?next=${encodeURIComponent(next)}`} className="space-y-3">
        <input name="pin" type="password" inputMode="numeric" placeholder="PIN" className="w-full rounded border p-3" required />
        <button className="w-full rounded-2xl border p-3">Unlock</button>
      </form>
      <p className="text-xs text-neutral-500">This page is private. Do not share.</p>
    </main>
  );
}
