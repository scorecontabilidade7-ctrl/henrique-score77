import { useMemo, useState } from 'react'
import { useStore } from '../data/store'
import { diasDaSemana, formatarData, hojeIso, toIso } from '../lib/dates'
import { horasPorMembro } from '../lib/workload'
import { Avatar, Campo, EmptyState, Modal } from '../components/ui'
import { IconLixeira, IconPlus } from '../components/icons'

type Periodo = 'semana' | 'mes' | 'tudo'

function intervalo(periodo: Periodo): { de?: string; ate?: string; label: string } {
  const hoje = new Date()
  if (periodo === 'semana') {
    const dias = diasDaSemana(hoje)
    return { de: dias[0], ate: dias[6], label: 'esta semana' }
  }
  if (periodo === 'mes') {
    const de = toIso(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
    const ate = toIso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0))
    return { de, ate, label: 'este mês' }
  }
  return { label: 'todo o período' }
}

function ApontamentoForm({ onClose }: { onClose: () => void }) {
  const { membros, tarefas, clientes, criarApontamento } = useStore()
  const [membroId, setMembroId] = useState(membros[0]?.id ?? '')
  const [tarefaId, setTarefaId] = useState('')
  const [data, setData] = useState(hojeIso())
  const [horas, setHoras] = useState('')
  const [comentario, setComentario] = useState('')

  const clienteNome = (id: string | null) => clientes.find((c) => c.id === id)?.nome

  function salvar() {
    const h = Number(horas)
    if (!membroId || !tarefaId || !h) return
    criarApontamento({ membroId, tarefaId, data, horas: h, comentario: comentario.trim() })
    onClose()
  }

  return (
    <Modal
      titulo="Novo apontamento"
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={salvar}
            disabled={!membroId || !tarefaId || !Number(horas)}
          >
            Apontar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Consultor *">
            <select className="input" value={membroId} onChange={(e) => setMembroId(e.target.value)}>
              {membros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Data *">
            <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} />
          </Campo>
        </div>
        <Campo label="Tarefa *">
          <select className="input" value={tarefaId} onChange={(e) => setTarefaId(e.target.value)}>
            <option value="">— Selecione a tarefa —</option>
            {tarefas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.titulo}
                {clienteNome(t.clienteId) ? ` — ${clienteNome(t.clienteId)}` : ''}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Horas trabalhadas *">
          <input
            type="number"
            min="0"
            step="0.25"
            className="input"
            value={horas}
            onChange={(e) => setHoras(e.target.value)}
            placeholder="Ex.: 2.5"
          />
        </Campo>
        <Campo label="Comentário">
          <input
            className="input"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="O que foi feito"
          />
        </Campo>
      </div>
    </Modal>
  )
}

export default function Horas() {
  const { membros, tarefas, apontamentos, removerApontamento } = useStore()
  const [periodo, setPeriodo] = useState<Periodo>('semana')
  const [novo, setNovo] = useState(false)

  const { de, ate, label } = useMemo(() => intervalo(periodo), [periodo])

  const cargas = useMemo(
    () => horasPorMembro(membros, apontamentos, de, ate),
    [membros, apontamentos, de, ate],
  )

  const lancamentos = useMemo(
    () =>
      apontamentos
        .filter((a) => (!de || a.data >= de) && (!ate || a.data <= ate))
        .sort((a, b) => b.data.localeCompare(a.data)),
    [apontamentos, de, ate],
  )

  const totalHoras = cargas.reduce((s, c) => s + c.apontadas, 0)
  const nomeTarefa = (id: string) => tarefas.find((t) => t.id === id)?.titulo ?? 'Tarefa removida'
  const membro = (id: string) => membros.find((m) => m.id === id)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Horas</h1>
          <p className="text-sm text-slate-500">
            Apontamento de horas por consultor e comparação com a carga horária.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setNovo(true)}>
          <IconPlus width={16} height={16} />
          Novo apontamento
        </button>
      </header>

      {/* Seletor de período */}
      <div className="flex items-center gap-2">
        {(['semana', 'mes', 'tudo'] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`btn text-sm ${
              periodo === p ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {p === 'semana' ? 'Esta semana' : p === 'mes' ? 'Este mês' : 'Tudo'}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">
          Total apontado {label}: <strong className="text-slate-800">{totalHoras}h</strong>
        </span>
      </div>

      {/* Dashboard de carga horária */}
      <section className="card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Horas apontadas × carga horária</h2>
          <p className="text-xs text-slate-500">
            Comparação com a carga horária semanal cadastrada de cada consultor.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {cargas.map(({ membro: m, apontadas, capacidade, percentual }) => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-3">
              <Avatar membro={m} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-800">{m.nome}</p>
                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {apontadas}h {capacidade > 0 && <span className="text-slate-400">/ {capacidade}h</span>}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      percentual > 100 ? 'bg-rose-500' : percentual >= 70 ? 'bg-emerald-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(percentual, 100)}%` }}
                  />
                </div>
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-500">
                {capacidade > 0 ? `${percentual}%` : '—'}
              </span>
            </div>
          ))}
          {cargas.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">Cadastre a equipe para ver a carga horária.</p>
          )}
        </div>
      </section>

      {/* Lançamentos */}
      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Apontamentos</h2>
        </div>
        {lancamentos.length === 0 ? (
          <EmptyState
            titulo="Nenhum apontamento no período"
            descricao="Registre as horas trabalhadas nas tarefas para acompanhar a produtividade."
            acao={
              <button className="btn-primary" onClick={() => setNovo(true)}>
                <IconPlus width={16} height={16} />
                Novo apontamento
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {lancamentos.map((a) => {
              const m = membro(a.membroId)
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar membro={m} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{nomeTarefa(a.tarefaId)}</p>
                    <p className="truncate text-xs text-slate-500">
                      {m?.nome ?? '—'} · {formatarData(a.data)}
                      {a.comentario ? ` · ${a.comentario}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-700">{a.horas}h</span>
                  <button
                    className="btn-ghost h-9 w-9 !p-0 text-slate-400 hover:text-rose-600"
                    onClick={() => {
                      if (confirm('Excluir este apontamento?')) removerApontamento(a.id)
                    }}
                    aria-label="Excluir apontamento"
                  >
                    <IconLixeira width={16} height={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {novo && <ApontamentoForm onClose={() => setNovo(false)} />}
    </div>
  )
}
