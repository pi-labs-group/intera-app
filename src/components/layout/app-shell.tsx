import { BottomNav } from "./bottom-nav";
import { Header } from "./header";
import type { NavItem } from "./nav-items";

type AppShellProps = {
  children: React.ReactNode;
  /** Destinos da BottomNav; sem itens, a navegação inferior não é exibida. */
  navItems?: NavItem[];
  /** Ação à direita do Header (ex.: botão de sair). */
  headerAction?: React.ReactNode;
};

/**
 * Moldura mobile centralizada (`max-w-md`) com Header e BottomNav. Server
 * Component: a interatividade fica isolada no Header e na BottomNav.
 */
export function AppShell({ children, navItems, headerAction }: AppShellProps) {
  const hasNav = navItems !== undefined && navItems.length > 0;

  return (
    <div className="flex flex-1 justify-center bg-neutral-50">
      <div className="relative flex min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-background shadow-2xl">
        <Header action={headerAction} />
        <main className={`flex-1 px-4 pt-20 ${hasNav ? "pb-24" : "pb-8"}`}>
          {children}
        </main>
        {hasNav && <BottomNav items={navItems} />}
      </div>
    </div>
  );
}
