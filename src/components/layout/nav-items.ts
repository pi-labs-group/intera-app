/**
 * Destinos principais de cada área do app, exibidos na BottomNav. Rota, rótulo e
 * ícone ficam juntos para não divergirem.
 */
export type NavItem = {
  href: string;
  label: string;
  /** Nome do ícone Material Symbols Outlined. */
  icon: string;
};

/** Área de aluno e responsável: os dois perfis veem as mesmas telas. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Início", icon: "home" },
  { href: "/performance", label: "Desempenho", icon: "monitoring" },
  { href: "/activities", label: "Atividades", icon: "assignment" },
  { href: "/announcements", label: "Avisos", icon: "notifications" },
  { href: "/profile", label: "Perfil", icon: "person" },
];

export const TEACHER_NAV_ITEMS: NavItem[] = [
  { href: "/teacher", label: "Início", icon: "home" },
  { href: "/teacher/gradebook", label: "Lançamentos", icon: "edit_note" },
  { href: "/teacher/notices", label: "Avisos", icon: "campaign" },
];

/**
 * Considera ativo também os sub-caminhos (ex.: `/activities/123` ativa Atividades).
 * Um item raiz de área (como `/teacher`) só fica ativo na própria rota, para não
 * acender junto com os itens filhos.
 */
export function isActivePath(
  pathname: string,
  href: string,
  items: NavItem[],
): boolean {
  if (pathname === href) return true;
  const isAreaRoot = items.some(
    (item) => item.href !== href && item.href.startsWith(`${href}/`),
  );
  return !isAreaRoot && pathname.startsWith(`${href}/`);
}
