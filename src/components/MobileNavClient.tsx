'use client';

import dynamic from 'next/dynamic';

// Do the client-only dynamic import here
const MobileNavInner = dynamic(() => import('@/components/MobileNav.lazy'), {
  ssr: false,
  loading: () => (
    <button
      aria-label="Open menu"
      className="rounded-xl px-3 py-2 text-sm hover:text-accent"
    >
      Menu
    </button>
  ),
});

export default function MobileNavClient() {
  return <MobileNavInner />;
}