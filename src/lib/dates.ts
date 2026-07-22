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
  return toIso(d)
}

/** yyyy-mm-dd in local time (avoids the UTC shift of toISOString). */
export function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dia}`
}

export function hojeIso(): string {
  return toIso(hoje())
}

/** Sunday that starts the week containing `base`. */
export function inicioSemana(base: Date): Date {
  const d = new Date(base)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

/** The 7 dates (Sun..Sat) of the week containing `base`, as yyyy-mm-dd. */
export function diasDaSemana(base: Date): string[] {
  const ini = inicioSemana(base)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ini)
    d.setDate(ini.getDate() + i)
    return toIso(d)
  })
}

const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export function nomeDiaCurto(iso: string): string {
  return DIAS_CURTOS[parseData(iso).getDay()]
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})
/** Format a number as Brazilian Reais, e.g. 1500 -> "R$ 1.500". */
export function formatarBRL(valor: number): string {
  return BRL.format(valor || 0)
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
export function nomeMesAno(d: Date): string {
  return `${MESES[d.getMonth()]} de ${d.getFullYear()}`
}
