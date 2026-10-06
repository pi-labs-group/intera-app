"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActivePath } from "./nav-items";

/**
 * Barra superior fixa com o título da tela atual, derivado da rota. O título não
 * é `<h1>`: o `<h1>` pertence a cada página.
 */
export function Header() {
  const pathname = usePathname();
  const title =
    NAV_ITEMS.find((item) => isActivePath(pathname, item.href))?.label ??
    "Intera";

  return (
    <header className="fixed top-0 right-0 left-0 z-30 mx-auto flex h-16 max-w-md items-center border-b border-neutral-100 bg-surface/90 px-4 backdrop-blur-md">
      <span className="text-base font-semibold text-neutral-800">{title}</span>
    </header>
  );
}
