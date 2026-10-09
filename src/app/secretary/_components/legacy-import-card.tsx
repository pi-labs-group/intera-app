"use client";

import { useState } from "react";

type LegacyImportCardProps = {
  /** Data/hora da última carga, já formatada. */
  lastImport: string;
};

/**
 * Destaque "Importar dados legados" (carga única da planilha do diário, Seção 6.2).
 * Por enquanto o botão só simula a importação.
 *
 * TODO (fase E): enviar o .xlsx para POST /api/admin/importar-legado (ImportacaoService).
 */
export function LegacyImportCard({ lastImport }: LegacyImportCardProps) {
  const [status, setStatus] = useState("");

  return (
    <section className="space-y-3 rounded-2xl bg-primary p-4 text-white">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <span className="material-symbols-outlined" aria-hidden="true">
            database
          </span>
        </div>
        <div>
          <h2 className="text-base font-bold">Importar dados legados</h2>
          <p className="text-xs text-primary-soft">
            Carga inicial a partir da planilha do diário de classe (.xlsx).
            Última importação: {lastImport}.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() =>
          setStatus(
            "Importação simulada: nenhum arquivo foi enviado, pois ainda não há banco de dados.",
          )
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface py-2.5 text-sm font-bold text-primary hover:bg-primary-softer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          upload_file
        </span>
        Selecionar planilha
      </button>
      <div role="status" aria-live="polite">
        {status && <p className="text-xs text-primary-soft">{status}</p>}
      </div>
    </section>
  );
}
