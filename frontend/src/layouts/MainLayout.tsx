'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ContentWrapper } from '@/components/layout/ContentWrapper';
import { useSidebarWidth } from '@/store/useSidebarStore';
import { useAuth } from '@/features/auth/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  currentPath?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showTopbar?: boolean;
}

type PageChrome = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showTopbar: boolean;
};

type MainLayoutContextValue = {
  setChrome: (chrome: Partial<PageChrome> | null) => void;
};

const MainLayoutContext = createContext<MainLayoutContextValue | null>(null);

function toNavRole(role?: string | null): 'owner' | 'admin' | 'employee' {
  const r = (role || '').toUpperCase();
  if (r === 'OWNER' || r === 'SUPER_ADMIN') return 'owner';
  if (r === 'ADMIN') return 'admin';
  return 'employee';
}

/**
 * Nested MainLayout (page-level) becomes a chrome passthrough so the shell
 * from dashboard/layout stays mounted across navigations and loading branches.
 */
function NestedMainLayout({
  children,
  title = '',
  subtitle,
  showBackButton,
  onBackClick,
  showTopbar = true,
}: MainLayoutProps) {
  const ctx = useContext(MainLayoutContext);
  const onBackClickRef = useRef(onBackClick);
  onBackClickRef.current = onBackClick;

  useEffect(() => {
    if (!ctx) return;
    ctx.setChrome({
      title,
      subtitle,
      showBackButton,
      // Stable wrapper — avoids effect loops from inline onBackClick props
      onBackClick: onBackClickRef.current ? () => onBackClickRef.current?.() : undefined,
      showTopbar,
    });
    // Do not clear chrome on unmount — next page overwrites; clearing races Strict Mode remounts
  }, [ctx, title, subtitle, showBackButton, showTopbar]);

  return <>{children}</>;
}

export const MainLayout = function MainLayout({
  children,
  title = '',
  subtitle,
  currentPath,
  showBackButton,
  onBackClick,
  showTopbar = true,
}: MainLayoutProps) {
  const parent = useContext(MainLayoutContext);
  if (parent) {
    return (
      <NestedMainLayout
        title={title}
        subtitle={subtitle}
        currentPath={currentPath}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
        showTopbar={showTopbar}
      >
        {children}
      </NestedMainLayout>
    );
  }

  return (
    <ShellMainLayout
      title={title}
      subtitle={subtitle}
      currentPath={currentPath}
      showBackButton={showBackButton}
      onBackClick={onBackClick}
      showTopbar={showTopbar}
    >
      {children}
    </ShellMainLayout>
  );
};

function ShellMainLayout({
  children,
  title = '',
  subtitle,
  currentPath,
  showBackButton,
  onBackClick,
  showTopbar = true,
}: MainLayoutProps) {
  const sidebarWidth = useSidebarWidth();
  const { user } = useAuth();
  const [chrome, setChromeState] = useState<PageChrome>({
    title,
    subtitle,
    showBackButton,
    onBackClick,
    showTopbar,
  });

  const setChrome = useCallback((next: Partial<PageChrome> | null) => {
    if (next === null) return;
    setChromeState((prev) => {
      if (
        prev.title === (next.title ?? prev.title) &&
        prev.subtitle === (next.subtitle !== undefined ? next.subtitle : prev.subtitle) &&
        prev.showBackButton === (next.showBackButton !== undefined ? next.showBackButton : prev.showBackButton) &&
        prev.showTopbar === (next.showTopbar !== undefined ? next.showTopbar : prev.showTopbar) &&
        next.onBackClick === undefined
      ) {
        return prev;
      }
      return { ...prev, ...next };
    });
  }, []);

  const ctxValue = useMemo(() => ({ setChrome }), [setChrome]);

  const effectiveTitle = chrome.title || title;
  const effectiveSubtitle = chrome.subtitle ?? subtitle;
  const effectiveShowBack = chrome.showBackButton ?? showBackButton;
  const effectiveOnBack = chrome.onBackClick ?? onBackClick;
  const effectiveShowTopbar = chrome.showTopbar ?? showTopbar;

  return (
    <MainLayoutContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Sidebar currentPath={currentPath} userRole={toNavRole(user?.role)} />

        <main style={{ marginLeft: sidebarWidth }} className="transition-all duration-300 min-h-screen">
          {effectiveShowTopbar && (
            <Topbar
              title={effectiveTitle}
              subtitle={effectiveSubtitle}
              showBackButton={effectiveShowBack}
              onBackClick={effectiveOnBack}
            />
          )}

          <ContentWrapper>{children}</ContentWrapper>
        </main>
      </div>
    </MainLayoutContext.Provider>
  );
};
