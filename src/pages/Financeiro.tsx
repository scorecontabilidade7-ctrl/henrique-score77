import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/store'
import { analiseFinanceira } from '../lib/financeiro'
import { formatarBRL } from '../lib/dates'
import { Avatar, Badge } from '../components/ui'
import { IconLixeira, IconPlus } from '../components/icons'

function pct(v: number) {
  return `${Math.round(v * 100)}%`
}

export default function Financeiro() {
  const {
    membros, clientes, projetos, apontamentos, despesas, custosArea,
    criarCustoArea, atualizarCustoArea, removerCustoArea,
  } = useStore()

  const [novaArea, setNovaArea] = useState('')
  const [novoValor, setNovoValor] = useState('')

  const a = useMemo(
    () => analiseFinanceira(membros, clientes, projetos, apontamentos, despesas, custosArea),
    [membros, clientes, projetos, apontamentos, despesas, custosArea],
  )

  const custoTotal = a.custoEquipe + a.custoAreas + a.despesasTotal

  function adicionarArea() {
    const nome = novaArea.trim()
    const valor = Number(novoValor)
    if (!nome || !valor) return
    criarCustoArea({ area: nome, valorMensal: valor })
    setNovaArea('')
    setNovoValor('')
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Financeiro</h1>
        <p className="text-sm text-slate-500">
          Custos, lucro e produtividade — visão administrativa do escritório.
        </p>
      </header>

      {/* Resultado do escritório */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="card p-4">
          <p className="text-xl font-bold leading-none text-slate-800">{formatarBRL(a.receitaTotal)}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Receita mensal</p>
        </div>
        <div className="card p-4">
          <p className="text-xl font-bold leading-none text-slate-800">{formatarBRL(a.custoEquipe)}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Custo da equipe</p>
        </div>
        <div className="card p-4">
          <p className="text-xl font-bold leading-none text-slate-800">{formatarBRL(a.custoAreas)}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Custos por área</p>
        </div>
        <div className="card p-4">
          <p className="text-xl font-bold leading-none text-slate-800">{formatarBRL(a.despesasTotal)}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Despesas de projetos</p>
        </div>
        <div className="card p-4">
          <p className={`text-xl font-bold leading-none ${a.lucroEscritorio >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatarBRL(a.lucroEscritorio)}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">Lucro ({pct(a.margemEscritorio)})</p>
        </div>
      </div>

      {/* Custos diretos por área */}
      <section className="card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Custos diretos por área</h2>
          <p className="text-xs text-slate-500">
            Custos fixos mensais de cada área (consultoria, contabilidade, etc.).
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {custosArea.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-2.5">
              <span className="flex-1 text-sm font-medium text-slate-700">{c.area}</span>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                R$
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={c.valorMensal}
                  onChange={(e) => atualizarCustoArea(c.id, { valorMensal: Number(e.target.value) || 0 })}
                  className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-sm"
                />
                /mês
              </div>
              <button
                className="btn-ghost h-8 w-8 !p-0 text-slate-400 hover:text-rose-600"
                onClick={() => confirm(`Remover a área "${c.area}"?`) && removerCustoArea(c.id)}
                aria-label="Remover área"
              >
                <IconLixeira width={15} height={15} />
              </button>
            </div>
          ))}
          {custosArea.length === 0 && (
            <p className="px-5 py-4 text-sm text-slate-400">Nenhuma área cadastrada.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
          <input
            className="input max-w-[240px]"
            placeholder="Nova área (ex.: Marketing)"
            value={novaArea}
            onChange={(e) => setNovaArea(e.target.value)}
          />
          <input
            type="number"
            min="0"
            step="100"
            className="input max-w-[140px]"
            placeholder="Valor/mês"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
          />
          <button className="btn-secondary" onClick={adicionarArea}>
            <IconPlus width={16} height={16} />
            Adicionar área
          </button>
        </div>
      </section>

      {/* Lucro e produtividade por consultor */}
      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Lucro por consultor</h2>
          <p className="text-xs text-slate-500">
            Receita da carteira menos o custo do consultor e as despesas dos projetos que ele lidera.
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Consultor</th>
                <th className="px-5 py-3 font-medium text-right">Receita</th>
                <th className="px-5 py-3 font-medium text-right">Custo</th>
                <th className="px-5 py-3 font-medium text-right">Despesas</th>
                <th className="px-5 py-3 font-medium text-right">Lucro</th>
                <th className="px-5 py-3 font-medium text-right">Margem</th>
                <th className="px-5 py-3 font-medium text-right">R$/hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {a.consultores.map((c) => (
                <tr key={c.membro.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <Avatar membro={c.membro} size="sm" />
                      <span className="font-medium text-slate-800">{c.membro.nome}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatarBRL(c.receita)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatarBRL(c.custoPessoal)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatarBRL(c.despesas)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${c.lucro >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatarBRL(c.lucro)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Badge
                      className={
                        c.margem >= 0.4
                          ? 'bg-emerald-100 text-emerald-700'
                          : c.margem >= 0
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                      }
                    >
                      {pct(c.margem)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">
                    {c.receitaPorHora > 0 ? formatarBRL(c.receitaPorHora) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Indicadores de produtividade */}
      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-slate-800">Indicadores de produtividade</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Indicador
            titulo="Custo total mensal"
            valor={formatarBRL(custoTotal)}
            detalhe="Equipe + áreas + despesas"
          />
          <Indicador
            titulo="Receita por real de custo"
            valor={custoTotal > 0 ? (a.receitaTotal / custoTotal).toFixed(2) + 'x' : '—'}
            detalhe="Quanto a carteira gera por R$ de custo"
          />
          <Indicador
            titulo="Margem do escritório"
            valor={pct(a.margemEscritorio)}
            detalhe="Lucro sobre a receita mensal"
          />
        </div>
      </section>

      <p className="text-xs text-slate-400">
        O custo de cada consultor é definido no cadastro em{' '}
        <Link to="/equipe" className="text-brand-600 hover:underline">
          Equipe
        </Link>
        . As despesas vêm de cada projeto.
      </p>
    </div>
  )
}

function Indicador({ titulo, valor, detalhe }: { titulo: string; valor: string; detalhe: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{valor}</p>
      <p className="mt-0.5 text-xs text-slate-400">{detalhe}</p>
    </div>
  )
}
