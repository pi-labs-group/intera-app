/**
 * Destinos principais do app. Fonte única para BottomNav e o título da tela no
 * Header, para que rota, rótulo e ícone não divirjam entre eles.
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
