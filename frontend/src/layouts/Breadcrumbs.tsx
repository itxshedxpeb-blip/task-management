'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Crumb {
  label: string;
  href?: string;
}

/** Friendly labels matching the consolidated information architecture. */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'task-management': 'Task Management',
  settings: 'Settings',
};

/** Non-routable group context for grouped module routes (exact + nested paths). */
const GROUP_PREFIXES: ReadonlyArray<{ prefix: string; group: string }> = [];

const resolveGroupContext = (pathname: string): string | undefined =>
  GROUP_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )?.group;

const isIdSegment = (segment: string) =>
  /^\d+$/.test(segment) || /^[0-9a-fA-F-]{8,}$/.test(segment);

const humanize = (segment: string) =>
  segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const buildTrail = (pathname: string): Crumb[] => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [];

  const crumbs: Crumb[] = [];
  let acc = '';
  parts.forEach((part) => {
    acc += `/${part}`;
    const label = isIdSegment(part) ? 'Details' : SEGMENT_LABELS[part] ?? humanize(part);
    crumbs.push({ label, href: acc });
  });

  // Inject the group for grouped routes, after Dashboard.
  const group = resolveGroupContext(pathname);
  if (group && crumbs.length >= 1 && !crumbs.some((crumb) => crumb.label === group)) {
    crumbs.splice(1, 0, { label: group });
  }

  // The last crumb represents the current page — not a link.
  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1] = { label: crumbs[crumbs.length - 1].label };
  }

  return crumbs;
};

export const Breadcrumbs = memo(function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const crumbs = useMemo(() => buildTrail(pathname ?? ''), [pathname]);

  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1 min-w-0">
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="hover:text-foreground transition-colors truncate">
                {crumb.label}
              </Link>
            ) : (
              <span className={cn('truncate', isLast ? 'text-foreground font-medium' : undefined)}>
                {crumb.label}
              </span>
            )}
            {!isLast && <ChevronRight size={14} className="flex-shrink-0 opacity-60" />}
          </span>
        );
      })}
    </nav>
  );
});
