import type { Metadata, Viewport } from "next";
import { EXPERIENCES, SKILLS } from "@/data/cv";
import { Suspense } from "react";
import CvClientShell from "@/components/cv/CvClientShell"; // ← normal import (client component)

export const metadata: Metadata = {
  title: "CV",
  description: "Brandon Gottschling — CV / Résumé",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default async function CVPage() {
  // Server component can pass plain data (serializable) to client component
  return (
    <main className="py-10">
      <Suspense fallback={<div>Loading CV...</div>}>
        <CvClientShell
          experiences={EXPERIENCES}
          skills={SKILLS}
          headline="Proposal and product development grounded in incident leadership. I work through ambiguity, bring the right people together, and deliver clear, dependable results."
        />
      </Suspense>
    </main>
  );
}
