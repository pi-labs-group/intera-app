/** Identificação de uma turma no ano letivo. */
export type ClassIdentity = {
  gradeLevel: string;
  name: string;
  shift: string;
};

/**
 * Rótulo exibido da turma (ex.: "8º A"). Com `withShift`, inclui o turno
 * ("8º A · Tarde"), necessário quando a escola tem duas turmas com a mesma série
 * e letra em turnos diferentes.
 */
export function classLabel(
  { gradeLevel, name, shift }: ClassIdentity,
  { withShift }: { withShift: boolean },
): string {
  const base = `${gradeLevel} ${name}`;
  return withShift ? `${base} · ${shift}` : base;
}

/**
 * Rótulos de um conjunto de turmas do mesmo ano, por id. O turno só aparece
 * quando outra turma do conjunto tem a mesma série e letra.
 *
 * @param classes Todas as turmas do ano letivo (não só as exibidas), para a
 *   ambiguidade ser detectada mesmo quando a outra turma não aparece na tela.
 */
export function classLabels(
  classes: (ClassIdentity & { id: string })[],
): Map<string, string> {
  const countByBase = new Map<string, number>();
  for (const schoolClass of classes) {
    const base = classLabel(schoolClass, { withShift: false });
    countByBase.set(base, (countByBase.get(base) ?? 0) + 1);
  }
  return new Map(
    classes.map((schoolClass) => {
      const base = classLabel(schoolClass, { withShift: false });
      const withShift = (countByBase.get(base) ?? 0) > 1;
      return [schoolClass.id, classLabel(schoolClass, { withShift })];
    }),
  );
}
