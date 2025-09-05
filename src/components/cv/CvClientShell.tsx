"use client";

import * as React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import type { Experience, SkillGroup } from "@/data/cv";
import ExperienceView from "./ExperienceView";
import SkillsView from "./SkillsView";
import { EMAIL } from "@/data/cv";
import { cn } from "@/lib/utils";
import CvHeaderBar from "./CvHeaderBar";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { EXEC_SUMMARY } from "@/data/cv";

type Mode = "experience" | "skills";

export default function CvClientShell({
  experiences,
  skills,
  headline = "People-first technologist and proposal developer.",
  location = "Atlanta, GA (US)",
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
  const [pdfBusy, setPdfBusy] = React.useState(false);

  React.useEffect(() => {
    const p = new URLSearchParams(params.toString());
    p.set("mode", mode);
    router.replace(`${pathname}?${p}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function onCopyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {}
  }

  function escapeVC(s: string) {
    return s.replace(/[,;]/g, "\\$&");
  }

  function onDownloadVCard() {
    const vcard =
`BEGIN:VCARD
VERSION:3.0
N:${escapeVC("Gottschling")};${escapeVC("Brandon")};;;
FN:${escapeVC("Brandon Gottschling")}
EMAIL;TYPE=INTERNET:${EMAIL}
END:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Brandon-Gottschling.vcf";
    a.click();
    URL.revokeObjectURL(url);
  }

  // NEW: robust server-rendered PDF with loading state
  async function onDownloadPdf() {
    try {
      setPdfBusy(true);
      const current = new URL(window.location.pathname, window.location.origin);
      current.searchParams.set("mode", mode); // preserve current toggle
      const res = await fetch(`/api/pdf/render?url=${encodeURIComponent(current.toString())}`);
      if (!res.ok) {
        const text = await res.text();
        let detail = text;
        try { detail = JSON.parse(text).error || detail; } catch {}
        alert(`PDF export failed:\n${detail}`);
        return;
      }
      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        alert("PDF export returned an empty file.");
        return;
      }
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "Brandon-Gottschling-CV.pdf";
      a.click();
      URL.revokeObjectURL(href);
    } catch (e: any) {
      alert(`PDF export threw an error:\n${e?.message || e}`);
    } finally {
      setPdfBusy(false);
    }
  }

  const skillsFiltered =
    q.trim()
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
          onDownloadPdf={onDownloadPdf}
          onPrint={() => window.print()}
          onDownloadVCard={onDownloadVCard}
          onCopyEmail={onCopyEmail}
          pdfBusy={pdfBusy}
        />
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
          {mode === "experience" ? (
            <ExperienceView items={experiences} />
          ) : (
            <SkillsView groups={skillsFiltered} />
          )}
        </div>
      </div>
    </div>
  );
}
