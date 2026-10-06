import { BottomNav } from "./bottom-nav";
import { Header } from "./header";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Moldura mobile centralizada (`max-w-md`) com Header e BottomNav. Server
 * Component: a interatividade fica isolada no Header e na BottomNav.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-1 justify-center bg-neutral-50">
      <div className="relative flex min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-background shadow-2xl">
        <Header />
        <main className="flex-1 px-4 pt-20 pb-24">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
