"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, type NavItem } from "./nav-items";

type BottomNavProps = {
  /** Destinos da área atual (aluno/responsável ou professor). */
  items: NavItem[];
};

/** Navegação inferior fixa com os destinos principais; destaca a rota ativa. */
export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed right-0 bottom-0 left-0 z-30 mx-auto flex h-16 max-w-md items-center justify-around border-t border-neutral-200 bg-surface/95 backdrop-blur-md"
    >
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href, items);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 focus-visible:outline-2 focus-visible:outline-primary ${
              isActive ? "font-bold text-primary" : "text-neutral-500"
            }`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {item.icon}
            </span>
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
