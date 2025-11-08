// src/scenes/SAID/creditsDomain.ts

export interface CreditEntry {
  role: string;
  names: string[];
}

/**
 * Devuelve la data de créditos (pura, sin tocar DOM ni storage).
 * Puedes cambiar, ordenar, filtrar o internacionalizar aquí sin efectos colaterales.
 */
export function getCredits(): CreditEntry[] {
  return [
    { role: "Dirección", names: ["UNIVERSIDAD ESTATAL PENINSULA DE SANTA ELENA"] },
    { role: "Producción", names: ["PROGRAMACION FUNCIONAL"] },
    { role: "Programación", names: ["SAID PINTO", "DIANA MELENA", "CARLOS PATIÑO", "ANGEL VILLON", "PAULO ORRALA"] },
    { role: "Arte", names: ["PAULO ORRALA"] },
    { role: "Música", names: ["ANGEL VILLON"] },
    { role: "QA / Testing", names: ["Pepe"] },
    { role: "Agradecimientos", names: ["Docente", "Colaboradores", "Comunidad"] },
  ];
}

/** Filtra créditos por término (para búsqueda opcional). */
export function filterCredits(list: CreditEntry[], term: string): CreditEntry[] {
  const t = term.trim().toLowerCase();
  if (!t) return list;
  return list
    .map(entry => ({
      ...entry,
      names: entry.names.filter(n => n.toLowerCase().includes(t)) 
    }))
    .filter(entry => entry.role.toLowerCase().includes(t) || entry.names.length > 0);
}
