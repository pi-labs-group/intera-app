type LogoutButtonProps = {
  /** Server Action que encerra a sessão; recebida por prop para o componente não depender de `src/app`. */
  action: () => Promise<void>;
};

/** Botão compacto de sair, para o Header das áreas sem tela de Perfil. */
export function LogoutButton({ action }: LogoutButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          logout
        </span>
        Sair
      </button>
    </form>
  );
}
