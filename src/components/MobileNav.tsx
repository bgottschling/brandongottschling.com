'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, ExternalLink, BookOpen, FlaskConical, Hammer, FileText, IdCard, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

type NavItem = { label: string; href: string; icon?: React.ComponentType<{ className?: string }>; external?: boolean };

const MAIN: NavItem[] = [
  { label: 'Research', href: '/research', icon: FlaskConical },
  { label: 'Projects', href: '/projects', icon: Hammer },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'CV', href: '/cv', icon: IdCard },
  { label: 'About', href: '/about', icon: Info },
];

const TRUST: NavItem[] = [
  { label: 'Contact', href: '/contact', icon: Search }, // icon as placeholder
  { label: 'Privacy Policy', href: '/privacy', icon: FileText },
  { label: 'Terms of Use', href: '/terms', icon: FileText },
];

const EXTERNAL: NavItem[] = [
  { label: 'GitHub', href: 'https://github.com/bgottschling', external: true, icon: ExternalLink },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bgottschling/', external: true, icon: ExternalLink },
  { label: 'Twitter/X', href: 'https://twitter.com/brandon_afk', external: true, icon: ExternalLink },
];

export default function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  // Keyboard shortcuts: ⌘K / Ctrl+K, and '/' to open
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isModK = (e.key.toLowerCase() === 'k') && (e.metaKey || e.ctrlKey);
      const isSlash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (isModK || isSlash) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const go = (item: NavItem) => {
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(item.href);
    }
    setOpen(false);
  };

  const renderGroup = (title: string, items: NavItem[]) => (
    <CommandGroup heading={title} key={title}>
      {items.map((item) => {
        const Icon = item.icon ?? ExternalLink;
        return (
          <CommandItem
            key={item.href}
            value={`${title} ${item.label}`}
            onSelect={() => go(item)}
            className="flex items-center gap-2"
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.external && <ExternalLink className="ml-auto size-3.5 opacity-60" />}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="rounded-xl"
      >
        <Menu className="size-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search… (⌘K)" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {renderGroup('Main', MAIN)}
          <CommandSeparator />
          {renderGroup('Trust & Legal', TRUST)}
          <CommandSeparator />
          {renderGroup('External', EXTERNAL)}
        </CommandList>
      </CommandDialog>
    </>
  );
}
