# Design system do Intera

Este documento registra a paleta de cores e as regras visuais do Intera. Ele é a
referência versionada: os tokens descritos aqui estão definidos no bloco `@theme` de
[`src/app/globals.css`](../src/app/globals.css), que é a única fonte dos valores no
código.

Direção visual: **petróleo com neutros frios**, light-first. O modo escuro está fora
do escopo do MVP.

## Princípios

1. **O Intera é o produto; a escola entra como conteúdo.** O logo e o nome da escola
   aparecem sobre superfície neutra. No MVP, a interface não é recolorida por escola.
2. **Uma única cor de marca (petróleo)**, restrita a ação primária, navegação ativa e
   foco. Não existe cor `secondary`.
3. **Neutros tingidos com o matiz da marca:** uma única família de cinzas, do fundo ao
   texto.
4. **Verde, âmbar e vermelho só comunicam estado.** Nunca são usados como decoração.
5. **Não existe `info` azul:** informação neutra usa os neutros ou os tons claros da
   marca.
6. **Cor nunca é o único sinal:** todo estado tem rótulo em texto (acessibilidade e
   daltonismo).

### Por que a paleta anterior foi descartada

- 12 dos cerca de 20 valores eram cores padrão do Tailwind, o que dava aparência de
  dashboard genérico.
- Os neutros tinham três temperaturas diferentes (cinza azulado, superfície lilás,
  texto azul-marinho).
- Havia dois verdes e dois azuis com significados diferentes (`secondary` × `success`,
  `primary` × `info`).
- Era só uma lista de tokens, sem regra de uso nem proporção.

## Tokens

No Tailwind v4, cada token `--color-<nome>` gera as utilities correspondentes, por
exemplo `bg-primary`, `text-neutral-900`, `border-danger-border`.

### Marca

| Token            | HEX       | Uso                                                          |
| ---------------- | --------- | ------------------------------------------------------------ |
| `primary`        | `#0B4A54` | Botão primário, navegação ativa, links, anel de foco, splash |
| `primary-hover`  | `#07363E` | Hover / pressionado do primário                              |
| `primary-soft`   | `#D8EAEA` | Fundo de ícone / badge de marca                              |
| `primary-softer` | `#EDF5F4` | Fundo de destaque sutil                                      |
| `primary-border` | `#BCDADA` | Borda de elementos de marca                                  |

### Superfícies e neutros

| Token         | HEX       | Uso                                                                        |
| ------------- | --------- | -------------------------------------------------------------------------- |
| `background`  | `#F6F8F8` | Fundo do app                                                               |
| `surface`     | `#FFFFFF` | Cards                                                                      |
| `neutral-50`  | `#F7F9F9` | Superfície alternativa (drawer)                                            |
| `neutral-100` | `#EDF1F1` | Chips, trilho de barra de progresso, borda sutil de card                   |
| `neutral-200` | `#DFE5E5` | Bordas e divisores                                                         |
| `neutral-300` | `#C8D0D1` | Borda de input                                                             |
| `neutral-400` | `#98A3A5` | Desabilitado / ícone decorativo. **Não usar em texto informativo** (2,6:1) |
| `neutral-500` | `#5F6B6E` | Texto terciário (datas, legendas)                                          |
| `neutral-600` | `#4C5759` | Texto secundário                                                           |
| `neutral-700` | `#394244` | Texto de apoio forte                                                       |
| `neutral-800` | `#242B2D` | Títulos de card                                                            |
| `neutral-900` | `#151A1B` | Texto principal                                                            |

### Estado

Usados no app inteiro: avisos, prazos e badges.

| Token            | HEX       | Uso                                    |
| ---------------- | --------- | -------------------------------------- |
| `danger`         | `#C0472E` | Base (fundo de badge com texto branco) |
| `danger-text`    | `#A63A23` | Texto de erro / urgência               |
| `danger-strong`  | `#872E1B` | Texto forte sobre fundo soft           |
| `danger-soft`    | `#F6DDD6` | Fundo                                  |
| `danger-softer`  | `#FBF0EC` | Fundo mais claro                       |
| `danger-border`  | `#EBBFB4` | Borda                                  |
| `warning`        | `#C48610` | Base (nunca com texto branco)          |
| `warning-text`   | `#9C6808` | Texto de alerta                        |
| `warning-strong` | `#684504` | Texto forte sobre fundo soft           |
| `warning-soft`   | `#F6E7C4` | Fundo                                  |
| `success`        | `#3F6A20` | Base e texto de sucesso                |
| `success-strong` | `#31541A` | Texto forte sobre fundo soft           |
| `success-soft`   | `#E2EDD4` | Fundo                                  |

### Escala de notas

Usada **somente nas telas de desempenho**. As cores são mais vivas que as de estado,
de propósito, e ficam restritas às notas.

| Faixa        | Regra         | Rótulo          | Barra     | Texto (número e rótulo) |
| ------------ | ------------- | --------------- | --------- | ----------------------- |
| `grade-low`  | média < 5     | ABAIXO DA MÉDIA | `#E5392B` | `#C22A1E`               |
| `grade-mid`  | 5 ≤ média < 7 | ATENÇÃO         | `#F0A91A` | `#9A6700`               |
| `grade-high` | média ≥ 7     | ÓTIMO           | `#2FA84F` | `#1E7F3C`               |

Os tokens de barra são `grade-low`, `grade-mid` e `grade-high`; os de texto são
`grade-low-text`, `grade-mid-text` e `grade-high-text`.

> Os cortes 5 e 7 ainda precisam ser confirmados com a média de aprovação da escola.

## Tipografia e ícones

- **Fonte:** Inter, carregada com `next/font/google` (auto-hospedada pelo Next.js).
- **Ícones:** Material Symbols Outlined, carregados pela folha de estilos do Google
  Fonts e usados com a classe `material-symbols-outlined`.

## Regras de uso

- **Botão primário:** fundo `primary`, texto branco. **Secundário:** contorno
  `primary` sobre `surface`.
- **Foco:** anel em `primary`.
- **Nunca** texto branco sobre `warning` (`#C48610`, 3,1:1) nem sobre as barras
  `grade-*`.
- As cores de barra `grade-*` servem só para preenchimento; texto usa sempre a
  variante `-text`.
- Texto informativo usa no mínimo `neutral-500`.

## Contraste (WCAG)

O mínimo AA para texto normal é 4,5:1.

| Par                                               | Razão                                                    |
| ------------------------------------------------- | -------------------------------------------------------- |
| branco sobre `primary`                            | 9,9:1                                                    |
| `primary` sobre `background`                      | ~9:1                                                     |
| `neutral-900` sobre `background`                  | ~16:1                                                    |
| `neutral-600` sobre branco                        | 7,5:1                                                    |
| `neutral-500` sobre branco / `neutral-100`        | 5,5:1 / 4,8:1                                            |
| `neutral-400` sobre branco                        | 2,6:1 (reprova para texto)                               |
| `danger-text` (`#A63A23`) sobre branco            | 6,5:1                                                    |
| branco sobre `danger` (`#C0472E`)                 | 5,0:1                                                    |
| `warning-strong` (`#684504`) sobre `warning-soft` | 7,0:1                                                    |
| `success-strong` (`#31541A`) sobre `success-soft` | 7,2:1                                                    |
| `grade-*-text` sobre branco                       | estimado entre 4,9:1 e 5,7:1 (a conferir com ferramenta) |
