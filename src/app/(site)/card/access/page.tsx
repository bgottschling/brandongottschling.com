export const metadata = { robots: { index: false, follow: false } };

export default function AccessPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  const next = (searchParams?.next && decodeURIComponent(searchParams.next)) || "/card";

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold">Enter access code</h1>
      {searchParams?.error && (
        <p className="mt-2 text-sm text-red-600">{searchParams.error}</p>
      )}
      <form method="post" action="/api/card-auth" className="mt-4 space-y-3">
        <input type="password" name="pin" required className="w-full rounded border p-2" />
        {/* Preserve destination */}
        <input type="hidden" name="next" value={next} />
        <button type="submit" className="w-full rounded bg-black text-white py-2">Unlock</button>
      </form>
    </main>
  );
}
