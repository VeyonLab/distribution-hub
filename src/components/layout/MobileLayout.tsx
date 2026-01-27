import { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  bottomNav?: ReactNode;
}

export function MobileLayout({ children, header, bottomNav }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {header && (
        <header className="sticky top-0 z-40 border-b bg-card shadow-sm">
          {header}
        </header>
      )}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      {bottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card safe-bottom shadow-lg">
          {bottomNav}
        </nav>
      )}
    </div>
  );
}
