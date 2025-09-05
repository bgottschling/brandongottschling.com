import type { Metadata, Viewport } from "next";
import { EXPERIENCES, SKILLS } from "@/data/cv";
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
      <CvClientShell
        experiences={EXPERIENCES}
        skills={SKILLS}
        headline="Proposal & Product development with incident leadership; I turn messy asks into shipped outcomes."
      />
    </main>
  );
}
