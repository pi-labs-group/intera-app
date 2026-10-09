"use client";

import { useId, useRef, useState } from "react";

export type TabItem = {
  id: string;
  label: string;
  /** Conteúdo do painel; pode vir já renderizado de um Server Component. */
  content: React.ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  /** Nome acessível do grupo de abas. */
  ariaLabel: string;
  /** Aba aberta inicialmente (ex.: vinda de um atalho); padrão: a primeira. */
  defaultTabId?: string;
};

/**
 * Controle segmentado acessível (padrão WAI-ARIA Tabs). Só a aba ativa entra na
 * ordem do Tab; setas esquerda/direita, Home e End trocam de aba e movem o foco.
 * Só o painel ativo é renderizado.
 */
export function Tabs({ tabs, ariaLabel, defaultTabId }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      tabs.findIndex((tab) => tab.id === defaultTabId),
    ),
  );
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const activeTab = tabs[activeIndex];

  function selectTab(index: number) {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const last = tabs.length - 1;
    const next: Record<string, number> = {
      ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    };
    const target = next[event.key];
    if (target === undefined) return;
    event.preventDefault();
    selectTab(target);
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="flex gap-1 rounded-xl bg-neutral-200 p-1"
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-primary ${
                isActive
                  ? "bg-surface text-primary shadow-xs"
                  : "text-neutral-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeTab.id}`}
          aria-labelledby={`${baseId}-tab-${activeTab.id}`}
          tabIndex={0}
          className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
