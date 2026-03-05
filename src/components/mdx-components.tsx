// src/components/mdx-components.tsx
import Link from "next/link";
import * as React from "react";
import ProjectHeader from "@/components/ProjectHeader";
import CTA from "./CTA";

type AProps = React.ComponentProps<"a">;
type PreProps = React.ComponentProps<"pre">;

// Import CTA's Props type
type CTAProps = React.ComponentProps<typeof CTA>;

/** Only the elements you override; no global JSX namespace needed. */
export type MDXComponentsMap = {
  a?: React.FC<AProps>;
  pre?: React.FC<PreProps>;
  ProjectHeader?: React.FC<{ status?: string; live?: string; repo?: string }>;
  CTA?: React.FC<CTAProps>;

  // ✅ add this
  Mermaid?: React.FC<MermaidProps>;
};

function cls(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const A: React.FC<AProps> = ({ href, className, ...rest }) => {
  const hrefStr = href ?? "#";
  const isExternal =
    /^https?:\/\//i.test(hrefStr) || hrefStr.startsWith("mailto:");
  const classes = cls("underline underline-offset-4", className);

  return isExternal ? (
    <a href={hrefStr} className={classes} {...rest} />
  ) : (
    <Link href={hrefStr} className={classes} {...rest} />
  );
};

const Pre: React.FC<PreProps> = ({ className, ...rest }) => (
  <pre
    className={cls(
      "not-prose overflow-x-auto rounded-lg p-4 bg-zinc-900 text-zinc-100",
      className
    )}
    {...rest}
  />
);

type MermaidProps = { children: string };

const Mermaid: React.FC<MermaidProps> = ({ children }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const mermaid = (await import("mermaid")).default;

      // Initialize once (safe to call multiple times)
      mermaid.initialize({
        startOnLoad: false,
      });

      if (!ref.current || cancelled) return;

      // Render to SVG and inject
      const id = `m-${Math.random().toString(16).slice(2)}`;
      const { svg } = await mermaid.render(id, children);

      if (!cancelled && ref.current) {
        ref.current.innerHTML = svg;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [children]);

  return <div ref={ref} />;
};

// (Optional) I'd remove this in production:
// console.log("ProjectHeader:", ProjectHeader);

export const mdxComponents: MDXComponentsMap = {
  a: A,
  pre: Pre,
  ProjectHeader,
  CTA,
  Mermaid,
};