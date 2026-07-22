import type { Apontamento, Cliente, Membro, Tarefa } from '../types'
import { estaAtrasada, venceEstaSemana } from './dates'
import { prioridade } from './labels'

export interface CargaMembro {
  membro: Membro
  abertas: number
  atrasadas: number
  venceSemana: number
  concluidas: number
  /** Weighted score (priority-aware) used to spot who is overloaded. */
  pontos: number
}

const ABERTA = (t: Tarefa) => t.status !== 'concluido'
const responsavelPor = (t: Tarefa, membroId: string) =>
  t.responsaveisIds.includes(membroId)

/** Aggregate open workload per team member, heaviest first. */
export function cargaPorMembro(membros: Membro[], tarefas: Tarefa[]): CargaMembro[] {
  const cargas = membros.map((membro) => {
    const minhas = tarefas.filter((t) => responsavelPor(t, membro.id))
    const abertas = minhas.filter(ABERTA)
    return {
      membro,
      abertas: abertas.length,
      atrasadas: abertas.filter((t) => estaAtrasada(t.prazo)).length,
      venceSemana: abertas.filter((t) => venceEstaSemana(t.prazo)).length,
      concluidas: minhas.filter((t) => t.status === 'concluido').length,
      pontos: abertas.reduce((soma, t) => soma + prioridade(t.prioridade).peso, 0),
    }
  })
  return cargas.sort((a, b) => b.pontos - a.pontos)
}

export interface ResumoGeral {
  abertas: number
  atrasadas: number
  venceSemana: number
  concluidas: number
  semResponsavel: number
}

export function resumoGeral(tarefas: Tarefa[]): ResumoGeral {
  const abertas = tarefas.filter(ABERTA)
  return {
    abertas: abertas.length,
    atrasadas: abertas.filter((t) => estaAtrasada(t.prazo)).length,
    venceSemana: abertas.filter((t) => venceEstaSemana(t.prazo)).length,
    concluidas: tarefas.filter((t) => t.status === 'concluido').length,
    semResponsavel: abertas.filter((t) => t.responsaveisIds.length === 0).length,
  }
}

/** Open tasks due soon or already overdue, most urgent first. */
export function gargalos(tarefas: Tarefa[]): Tarefa[] {
  return tarefas
    .filter((t) => ABERTA(t) && (estaAtrasada(t.prazo) || venceEstaSemana(t.prazo)))
    .sort((a, b) => {
      const pa = a.prazo ?? '9999-12-31'
      const pb = b.prazo ?? '9999-12-31'
      return pa.localeCompare(pb)
    })
}

// ---------------------------------------------------------------------------
// Hours (apontamento de horas)
// ---------------------------------------------------------------------------

/** Total logged hours for a task across everyone. */
export function horasDaTarefa(tarefaId: string, apontamentos: Apontamento[]): number {
  return apontamentos
    .filter((a) => a.tarefaId === tarefaId)
    .reduce((s, a) => s + a.horas, 0)
}

export interface HorasMembro {
  membro: Membro
  apontadas: number
  /** Weekly capacity from the member's profile. */
  capacidade: number
  /** apontadas / capacidade, capped for the bar width. */
  percentual: number
}

// ---------------------------------------------------------------------------
// Financial return per consultant
// ---------------------------------------------------------------------------

export interface ConsultorResumo {
  membro: Membro
  /** Active clients where this member is the lead (responsável). */
  carteira: Cliente[]
  /** Active clients where this member assists (not the lead). */
  assiste: Cliente[]
  /** Monthly recurring revenue from that carteira. */
  mrr: number
  ticketMedio: number
  /** Share of the office's total MRR (0..1). */
  percentualReceita: number
  abertas: number
  atrasadas: number
  horasApontadas: number
  capacidade: number
}

/**
 * Per-consultant summary: their client portfolio, financial return (MRR),
 * workload and logged hours. Revenue is attributed to the client's lead
 * consultant (responsável), mirroring the source spreadsheet.
 */
export function resumoPorConsultor(
  membros: Membro[],
  clientes: Cliente[],
  tarefas: Tarefa[],
  apontamentos: Apontamento[],
): ConsultorResumo[] {
  const mrrTotal = clientes
    .filter((c) => c.ativo)
    .reduce((s, c) => s + (c.valorMensal || 0), 0)

  return membros
    .map((membro) => {
      const carteira = clientes.filter((c) => c.ativo && c.responsavelId === membro.id)
      const assiste = clientes.filter(
        (c) => c.ativo && c.assistentesIds.includes(membro.id),
      )
      const mrr = carteira.reduce((s, c) => s + (c.valorMensal || 0), 0)
      const abertas = tarefas.filter(
        (t) => t.responsaveisIds.includes(membro.id) && t.status !== 'concluido',
      )
      return {
        membro,
        carteira,
        assiste,
        mrr,
        ticketMedio: carteira.length ? Math.round(mrr / carteira.length) : 0,
        percentualReceita: mrrTotal > 0 ? mrr / mrrTotal : 0,
        abertas: abertas.length,
        atrasadas: abertas.filter((t) => estaAtrasada(t.prazo)).length,
        horasApontadas: apontamentos
          .filter((a) => a.membroId === membro.id)
          .reduce((s, a) => s + a.horas, 0),
        capacidade: membro.cargaHorariaSemanal || 0,
      }
    })
    .sort((a, b) => b.mrr - a.mrr)
}

/**
 * Logged hours per member within an optional [de, ate] date window (inclusive,
 * yyyy-mm-dd), compared against their weekly capacity.
 */
export function horasPorMembro(
  membros: Membro[],
  apontamentos: Apontamento[],
  de?: string,
  ate?: string,
): HorasMembro[] {
  return membros
    .map((membro) => {
      const apontadas = apontamentos
        .filter(
          (a) =>
            a.membroId === membro.id &&
            (!de || a.data >= de) &&
            (!ate || a.data <= ate),
        )
        .reduce((s, a) => s + a.horas, 0)
      const capacidade = membro.cargaHorariaSemanal || 0
      const percentual = capacidade > 0 ? Math.round((apontadas / capacidade) * 100) : 0
      return { membro, apontadas, capacidade, percentual }
    })
    .sort((a, b) => b.apontadas - a.apontadas)
}
