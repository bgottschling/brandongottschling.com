import Link from "next/link";

export default function ContentCard({
  href,
  title,
  summary,
  cover,
  meta,
}: {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:bg-white/10"
    >
      {cover && (
        <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="text-lg font-semibold leading-tight">{title}</div>
      {summary && <p className="mt-1 line-clamp-2 text-sm text-white/80">{summary}</p>}
      {meta && <div className="mt-2 text-xs text-white/60">{meta}</div>}
    </Link>
  );
}