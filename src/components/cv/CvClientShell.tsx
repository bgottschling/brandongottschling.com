"use client";

import * as React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import type { Experience, SkillGroup } from "@/data/cv";
import { EXEC_SUMMARY } from "@/data/cv";
import { getNetworkSnapshot } from "@/lib/network-snapshot";
import { cn } from "@/lib/utils";
import ExperienceView from "./ExperienceView";
import SkillsView from "./SkillsView";
import CvHeaderBar from "./CvHeaderBar";
import { ExecutiveSummary } from "./ExecutiveSummary";
import CareerTimeline from "./CareerTimeline";

type Mode = "experience" | "skills";

export default function CvClientShell({
  experiences,
  skills,
  headline,
  location,
}: {
  experiences: Experience[];
  skills: SkillGroup[];
  headline?: string;
  location?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const modeParam = (params.get("mode") as Mode) || "experience";
  const [mode, setMode] = React.useState<Mode>(modeParam);
  const [q, setQ] = React.useState("");
  const [downloading, setDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const p = new URLSearchParams(params.toString());
    p.set("mode", mode);
    router.replace(`${pathname}?${p}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // The PDF is laid out server-side with pdf-lib. We send along the geometry of
  // the background network as it is on screen right now, plus the page's accent
  // hue, so the download carries the same frame the visitor was looking at.
  async function downloadCv() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const snapshot = getNetworkSnapshot();
      const hueRaw = getComputedStyle(document.documentElement).getPropertyValue("--accent-h").trim();
      const hue = Number.parseFloat(hueRaw);

      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot, hue: Number.isFinite(hue) ? hue : undefined }),
        cache: "no-store",
      });

      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          detail = (await res.json()).error ?? detail;
        } catch {}
        throw new Error(detail);
      }

      const blob = await res.blob();
      if (!blob.size) throw new Error("The PDF came back empty.");

      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "Brandon-Gottschling-CV.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "The download failed.");
    } finally {
      setDownloading(false);
    }
  }

  const skillsFiltered = q.trim()
    ? skills
        .map((g) => ({ ...g, items: g.items.filter((i) => i.toLowerCase().includes(q.toLowerCase())) }))
        .filter((g) => g.items.length > 0)
    : skills;

  return (
    <div className={cn("mx-auto max-w-[1500px] px-4 md:px-6 lg:px-8")}>
      <div className="mx-auto w-full max-w-[52rem] lg:max-w-[56rem] xl:max-w-[60rem]">
        <CvHeaderBar
          name="Brandon Gottschling"
          headline={headline}
          location={location}
          mode={mode}
          setMode={setMode}
          onDownload={downloadCv}
          downloading={downloading}
        />

        {downloadError && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            Couldn&rsquo;t prepare the PDF: {downloadError}
          </p>
        )}

        {mode === "experience" && EXEC_SUMMARY?.length ? (
          <div className="mt-6">
            <ExecutiveSummary items={EXEC_SUMMARY} />
          </div>
        ) : null}

        {mode === "skills" && (
          <div className="mt-4">
            <Input placeholder="Filter skills…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        )}

        <div id="cv-print-root" className="mt-8 md:mt-10">
          {mode === "experience" && <CareerTimeline experiences={experiences} />}
          {mode === "experience" ? <ExperienceView items={experiences} /> : <SkillsView groups={skillsFiltered} />}
        </div>
      </div>
    </div>
  );
}
