import type { Membro, Tarefa } from '../types'
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

/** Aggregate open workload per team member, heaviest first. */
export function cargaPorMembro(membros: Membro[], tarefas: Tarefa[]): CargaMembro[] {
  const cargas = membros.map((membro) => {
    const minhas = tarefas.filter((t) => t.responsavelId === membro.id)
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
    semResponsavel: abertas.filter((t) => !t.responsavelId).length,
  }
}

/** Open tasks due soon or already overdue, most urgent first. */
export function gargalos(tarefas: Tarefa[]): Tarefa[] {
  return tarefas
    .filter((t) => ABERTA(t) && (estaAtrasada(t.prazo) || venceEstaSemana(t.prazo)))
    .sort((a, b) => {
      // Overdue and nearer deadlines bubble up; no deadline sinks.
      const pa = a.prazo ?? '9999-12-31'
      const pb = b.prazo ?? '9999-12-31'
      return pa.localeCompare(pb)
    })
}
