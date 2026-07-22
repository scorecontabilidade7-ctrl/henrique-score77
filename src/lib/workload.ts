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
  /** Full monthly value of the carteira (as lead). */
  mrr: number
  ticketMedio: number
  /** Revenue credited as lead, after the assistant split. */
  creditoResponsavel: number
  /** Revenue credited from clients this member assists. */
  creditoAssistente: number
  /** Total credited revenue (lead + assistant). */
  receitaCreditada: number
  /** Share of the office's total revenue, based on credited revenue (0..1). */
  percentualReceita: number
  abertas: number
  atrasadas: number
  horasApontadas: number
  capacidade: number
}

/**
 * Per-consultant summary: portfolio, financial return, workload and hours.
 *
 * Revenue is split between the lead (responsável) and the assistant(s):
 * each client's monthly value gives `pctAssistente` to the assistant(s)
 * (divided equally when there is more than one) and the rest to the lead.
 * Clients with no assistant credit the full value to the lead, so the sum
 * across consultants always equals total MRR.
 */
export function resumoPorConsultor(
  membros: Membro[],
  clientes: Cliente[],
  tarefas: Tarefa[],
  apontamentos: Apontamento[],
  pctAssistente = 0,
): ConsultorResumo[] {
  const ativos = clientes.filter((c) => c.ativo)
  const mrrTotal = ativos.reduce((s, c) => s + (c.valorMensal || 0), 0)

  return membros
    .map((membro) => {
      const carteira = ativos.filter((c) => c.responsavelId === membro.id)
      const assiste = ativos.filter((c) => c.assistentesIds.includes(membro.id))
      const mrr = carteira.reduce((s, c) => s + (c.valorMensal || 0), 0)

      const creditoResponsavel = carteira.reduce((s, c) => {
        const temAssistente = c.assistentesIds.length > 0
        const fatia = temAssistente ? 1 - pctAssistente : 1
        return s + (c.valorMensal || 0) * fatia
      }, 0)
      const creditoAssistente = assiste.reduce((s, c) => {
        const nAssist = c.assistentesIds.length || 1
        return s + ((c.valorMensal || 0) * pctAssistente) / nAssist
      }, 0)
      const receitaCreditada = creditoResponsavel + creditoAssistente

      const abertas = tarefas.filter(
        (t) => t.responsaveisIds.includes(membro.id) && t.status !== 'concluido',
      )
      return {
        membro,
        carteira,
        assiste,
        mrr,
        ticketMedio: carteira.length ? Math.round(mrr / carteira.length) : 0,
        creditoResponsavel,
        creditoAssistente,
        receitaCreditada,
        percentualReceita: mrrTotal > 0 ? receitaCreditada / mrrTotal : 0,
        abertas: abertas.length,
        atrasadas: abertas.filter((t) => estaAtrasada(t.prazo)).length,
        horasApontadas: apontamentos
          .filter((a) => a.membroId === membro.id)
          .reduce((s, a) => s + a.horas, 0),
        capacidade: membro.cargaHorariaSemanal || 0,
      }
    })
    .sort((a, b) => b.receitaCreditada - a.receitaCreditada)
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
