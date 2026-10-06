/**
 * Destinos principais do app, exibidos na BottomNav. Rota, rótulo e ícone ficam
 * juntos para não divergirem.
 */
export type NavItem = {
  href: string;
  label: string;
  /** Nome do ícone Material Symbols Outlined. */
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Início", icon: "home" },
  { href: "/performance", label: "Desempenho", icon: "monitoring" },
  { href: "/activities", label: "Atividades", icon: "assignment" },
  { href: "/announcements", label: "Avisos", icon: "notifications" },
  { href: "/profile", label: "Perfil", icon: "person" },
];

/** Considera ativo também os sub-caminhos (ex.: `/activities/123` ativa Atividades). */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
