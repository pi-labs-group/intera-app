import { Logo } from "@/components/ui/logo";

type HeaderProps = {
  /** Ação opcional à direita (ex.: botão de sair nas áreas sem tela de Perfil). */
  action?: React.ReactNode;
};

/**
 * Barra superior fixa com a marca da escola (logo, nome e slogan), igual em todas
 * as telas. O título de cada tela fica no `<h1>` da própria página.
 */
export function Header({ action }: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-30 mx-auto flex h-16 max-w-md items-center gap-3 border-b border-neutral-100 bg-surface/90 px-4 backdrop-blur-md">
      <Logo className="h-9 w-9 shrink-0" />
      <div className="flex-1 leading-tight">
        <p className="text-base font-bold text-neutral-800">Escola Interação</p>
        <p className="text-xs text-neutral-500">Aprender. Crescer. Conectar.</p>
      </div>
      {action}
    </header>
  );
}
