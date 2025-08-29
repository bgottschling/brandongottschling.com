import React from 'react';

type Props = {
  title: string;
  href: string;
  children?: React.ReactNode;
};

export default function CTA({ title, href, children }: Props) {
  return (
    <a
      href={href}
      className="group block rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/60">
      <div className="text-xl font-semibold tracking-tight">{title}</div>
      {children && <div className="mt-2 text-sm text-white/80">{children}</div>}
      <div className="mt-4 inline-flex items-center text-sm font-medium text-amber-300 group-hover:translate-x-0.5 transition">
        Start
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-4 w-4">
          <path d="M13.5 4.5l6 6-6 6m-9-6h15" />
        </svg>
      </div>
    </a>
  );
}
