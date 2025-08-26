export default function ProjectHeader({
  status,
  live,
  repo,
}: { status?: string; live?: string; repo?: string }) {
  return (
    <div className="not-prose mb-4 flex flex-wrap items-center gap-3">
      {status && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">{status}</span>}
      {live && <a className="text-sm underline underline-offset-4" href={live} target="_blank" rel="noreferrer">View live</a>}
      {repo && <a className="text-sm underline underline-offset-4" href={repo} target="_blank" rel="noreferrer">Repo</a>}
    </div>
  )
}