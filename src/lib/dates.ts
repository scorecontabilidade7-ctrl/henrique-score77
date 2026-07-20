// Date helpers. All task deadlines are stored as plain yyyy-mm-dd strings so we
// avoid timezone drift — we compare against "today" at local midnight.

export function hoje(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Parse a yyyy-mm-dd string into a local Date at midnight. */
export function parseData(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole days between today and the given deadline (negative = overdue). */
export function diasRestantes(prazo: string): number {
  const alvo = parseData(prazo)
  const base = hoje()
  return Math.round((alvo.getTime() - base.getTime()) / 86400000)
}

export function estaAtrasada(prazo: string | null): boolean {
  if (!prazo) return false
  return diasRestantes(prazo) < 0
}

/** True when the deadline falls within the next 7 days (including today). */
export function venceEstaSemana(prazo: string | null): boolean {
  if (!prazo) return false
  const d = diasRestantes(prazo)
  return d >= 0 && d <= 7
}

export function formatarData(iso: string | null): string {
  if (!iso) return '—'
  const d = parseData(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatarDataCurta(iso: string | null): string {
  if (!iso) return '—'
  const d = parseData(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/** Human friendly relative deadline, e.g. "Vence hoje", "Atrasada 3 dias". */
export function prazoRelativo(prazo: string | null): string {
  if (!prazo) return 'Sem prazo'
  const d = diasRestantes(prazo)
  if (d < 0) return `Atrasada ${Math.abs(d)} ${Math.abs(d) === 1 ? 'dia' : 'dias'}`
  if (d === 0) return 'Vence hoje'
  if (d === 1) return 'Vence amanhã'
  return `Vence em ${d} dias`
}

/** yyyy-mm-dd for a date `dias` from today. Useful for seed data. */
export function isoRelativo(dias: number): string {
  const d = hoje()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}
