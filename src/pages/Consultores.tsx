import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/store'
import { resumoPorConsultor } from '../lib/workload'
import { formatarBRL } from '../lib/dates'
import { regimeLabel } from '../lib/labels'
import { Avatar } from '../components/ui'
import { IconClientes, IconEquipe, IconRelogio } from '../components/icons'

export default function Consultores() {
  const { membros, clientes, tarefas, apontamentos } = useStore()

  const resumos = useMemo(
    () => resumoPorConsultor(membros, clientes, tarefas, apontamentos),
    [membros, clientes, tarefas, apontamentos],
  )

  const clientesAtivos = clientes.filter((c) => c.ativo)
  const receitaTotal = clientesAtivos.reduce((s, c) => s + (c.valorMensal || 0), 0)
  const ticketGeral = clientesAtivos.length ? Math.round(receitaTotal / clientesAtivos.length) : 0
  const maxMrr = Math.max(1, ...resumos.map((r) => r.mrr))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Consultores</h1>
        <p className="text-sm text-slate-500">
          Carteira, carga de trabalho e retorno financeiro de cada consultor.
        </p>
      </header>

      {/* Resumo do escritório */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-2xl font-bold leading-none text-slate-800">{formatarBRL(receitaTotal)}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Receita mensal (carteira ativa)</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold leading-none text-slate-800">{clientesAtivos.length}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Clientes ativos</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold leading-none text-slate-800">{membros.length}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Consultores</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold leading-none text-slate-800">{formatarBRL(ticketGeral)}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Ticket médio</p>
        </div>
      </div>

      {/* Ranking de retorno financeiro */}
      <section className="card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Retorno financeiro por consultor</h2>
          <p className="text-xs text-slate-500">
            Mensalidade da carteira de cada consultor e sua participação na receita.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {resumos.map((r) => (
            <div key={r.membro.id} className="flex items-center gap-4 px-5 py-3">
              <Avatar membro={r.membro} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-800">{r.membro.nome}</p>
                  <span className="shrink-0 text-sm font-semibold text-slate-800">
                    {formatarBRL(r.mrr)}
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      {Math.round(r.percentualReceita * 100)}%
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(r.mrr / maxMrr) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cartões por consultor */}
      <div className="grid gap-4 lg:grid-cols-2">
        {resumos.map((r) => {
          const pctHoras = r.capacidade > 0 ? Math.round((r.horasApontadas / r.capacidade) * 100) : 0
          return (
            <section key={r.membro.id} className="card p-5">
              <div className="flex items-center gap-3">
                <Avatar membro={r.membro} size="lg" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{r.membro.nome}</p>
                  <p className="text-xs text-slate-500">{r.membro.cargo}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-lg font-bold text-emerald-600">{formatarBRL(r.mrr)}</p>
                  <p className="text-[11px] text-slate-400">retorno mensal</p>
                </div>
              </div>

              {/* Indicadores */}
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="flex items-center justify-center gap-1 text-base font-bold text-slate-800">
                    <IconClientes width={14} height={14} />
                    {r.carteira.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Clientes</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="text-base font-bold text-slate-800">{formatarBRL(r.ticketMedio)}</p>
                  <p className="text-[11px] text-slate-500">Ticket médio</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="flex items-center justify-center gap-1 text-base font-bold text-slate-800">
                    <IconEquipe width={14} height={14} />
                    {r.abertas}
                  </p>
                  <p className="text-[11px] text-slate-500">Tarefas{r.atrasadas > 0 ? ` (${r.atrasadas} atr.)` : ''}</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="flex items-center justify-center gap-1 text-base font-bold text-slate-800">
                    <IconRelogio width={14} height={14} />
                    {r.horasApontadas}h
                  </p>
                  <p className="text-[11px] text-slate-500">{r.capacidade > 0 ? `${pctHoras}% carga` : 'Horas'}</p>
                </div>
              </div>

              {/* Carteira */}
              <div className="mt-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Carteira de clientes
                </p>
                {r.carteira.length === 0 ? (
                  <p className="py-3 text-sm text-slate-400">Nenhum cliente ativo sob responsabilidade.</p>
                ) : (
                  <div className="max-h-52 divide-y divide-slate-100 overflow-y-auto scrollbar-thin">
                    {r.carteira.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">{c.nome}</p>
                          <p className="truncate text-xs text-slate-400">
                            {c.segmento || regimeLabel(c.regime)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-medium text-slate-600">
                          {c.valorMensal ? formatarBRL(c.valorMensal) : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Participação como assistente */}
              {r.assiste.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Assiste em {r.assiste.length} {r.assiste.length === 1 ? 'cliente' : 'clientes'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.assiste.map((c) => (
                      <span
                        key={c.id}
                        className="badge bg-slate-100 text-slate-600"
                        title={c.segmento}
                      >
                        {c.nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      <p className="text-xs text-slate-400">
        A receita é atribuída ao consultor <strong>responsável</strong> por cada cliente. Ajuste os
        valores e responsáveis na aba{' '}
        <Link to="/clientes" className="text-brand-600 hover:underline">
          Clientes
        </Link>
        .
      </p>
    </div>
  )
}
