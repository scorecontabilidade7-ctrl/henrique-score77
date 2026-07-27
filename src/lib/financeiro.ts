import type { Apontamento, Cliente, CustoArea, Despesa, Membro, Projeto } from '../types'

export interface LucroConsultor {
  membro: Membro
  /** Monthly revenue from the consultant's active portfolio (as lead). */
  receita: number
  /** The consultant's monthly cost (salary/encargos). */
  custoPessoal: number
  /** Project expenses attributed to this consultant. */
  despesas: number
  lucro: number
  /** Profit margin over revenue (0..1). */
  margem: number
  /** Total logged hours (all time). */
  horas: number
  receitaPorHora: number
  lucroPorHora: number
}

export interface AnaliseFinanceira {
  consultores: LucroConsultor[]
  receitaTotal: number
  custoEquipe: number
  custoAreas: number
  despesasTotal: number
  lucroEscritorio: number
  margemEscritorio: number
}

/**
 * Office-wide financial analysis. Revenue is attributed to each client's lead
 * consultant; a consultant's profit = revenue − their cost − the expenses of
 * the projects whose client they lead. Area costs are office-level overhead.
 */
export function analiseFinanceira(
  membros: Membro[],
  clientes: Cliente[],
  projetos: Projeto[],
  apontamentos: Apontamento[],
  despesas: Despesa[],
  custosArea: CustoArea[],
): AnaliseFinanceira {
  const ativos = clientes.filter((c) => c.ativo)
  const responsavelDoProjeto = (p: Projeto) =>
    clientes.find((c) => c.id === p.clienteId)?.responsavelId ?? null

  const consultores: LucroConsultor[] = membros
    .map((m) => {
      const receita = ativos
        .filter((c) => c.responsavelId === m.id)
        .reduce((s, c) => s + (c.valorMensal || 0), 0)
      const custoPessoal = m.custoMensal || 0
      const desp = despesas
        .filter((d) => {
          const p = projetos.find((x) => x.id === d.projetoId)
          return p ? responsavelDoProjeto(p) === m.id : false
        })
        .reduce((s, d) => s + d.valor, 0)
      const lucro = receita - custoPessoal - desp
      const horas = apontamentos
        .filter((a) => a.membroId === m.id)
        .reduce((s, a) => s + a.horas, 0)
      return {
        membro: m,
        receita,
        custoPessoal,
        despesas: desp,
        lucro,
        margem: receita > 0 ? lucro / receita : 0,
        horas,
        receitaPorHora: horas > 0 ? receita / horas : 0,
        lucroPorHora: horas > 0 ? lucro / horas : 0,
      }
    })
    .sort((a, b) => b.lucro - a.lucro)

  const receitaTotal = ativos.reduce((s, c) => s + (c.valorMensal || 0), 0)
  const custoEquipe = membros.reduce((s, m) => s + (m.custoMensal || 0), 0)
  const custoAreas = custosArea.reduce((s, c) => s + c.valorMensal, 0)
  const despesasTotal = despesas.reduce((s, d) => s + d.valor, 0)
  const lucroEscritorio = receitaTotal - custoEquipe - custoAreas - despesasTotal

  return {
    consultores,
    receitaTotal,
    custoEquipe,
    custoAreas,
    despesasTotal,
    lucroEscritorio,
    margemEscritorio: receitaTotal > 0 ? lucroEscritorio / receitaTotal : 0,
  }
}
