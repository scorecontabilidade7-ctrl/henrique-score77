import { useMemo, useState } from 'react'
import { useStore } from '../data/store'
import type { StatusTarefa, Tarefa } from '../types'
import { STATUS_TAREFA } from '../lib/labels'
import TarefaCard from '../components/TarefaCard'
import TarefaForm from '../components/TarefaForm'
import { IconPlus } from '../components/icons'

export default function Tarefas() {
  const { tarefas, membros, clientes, atualizarTarefa } = useStore()

  const [filtroResp, setFiltroResp] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [editando, setEditando] = useState<Tarefa | null>(null)
  const [criando, setCriando] = useState<StatusTarefa | null>(null)
  const [arrastando, setArrastando] = useState<string | null>(null)

  const filtradas = useMemo(
    () =>
      tarefas.filter(
        (t) =>
          (!filtroResp || t.responsaveisIds.includes(filtroResp)) &&
          (!filtroCliente || t.clienteId === filtroCliente),
      ),
    [tarefas, filtroResp, filtroCliente],
  )

  const porStatus = (status: StatusTarefa) => filtradas.filter((t) => t.status === status)

  function soltarEm(status: StatusTarefa) {
    if (arrastando) {
      atualizarTarefa(arrastando, { status })
      setArrastando(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tarefas</h1>
          <p className="text-sm text-slate-500">
            Arraste os cartões entre as colunas para mudar o status.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCriando('a_fazer')}>
          <IconPlus width={16} height={16} />
          Nova tarefa
        </button>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select
          className="input max-w-[220px]"
          value={filtroResp}
          onChange={(e) => setFiltroResp(e.target.value)}
        >
          <option value="">Todos os responsáveis</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
        <select
          className="input max-w-[220px]"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        >
          <option value="">Todos os clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {(filtroResp || filtroCliente) && (
          <button
            className="btn-ghost"
            onClick={() => {
              setFiltroResp('')
              setFiltroCliente('')
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Quadro */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATUS_TAREFA.map((coluna) => {
          const itens = porStatus(coluna.id)
          return (
            <div
              key={coluna.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => soltarEm(coluna.id)}
              className="flex flex-col rounded-xl bg-slate-200/50 p-2"
            >
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${coluna.cor}`} />
                  <span className="text-sm font-semibold text-slate-700">{coluna.label}</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                  {itens.length}
                </span>
              </div>
              <div className="flex min-h-[80px] flex-1 flex-col gap-2 p-1">
                {itens.map((t) => (
                  <TarefaCard
                    key={t.id}
                    tarefa={t}
                    draggable
                    onDragStart={() => setArrastando(t.id)}
                    onClick={() => setEditando(t)}
                  />
                ))}
                <button
                  onClick={() => setCriando(coluna.id)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-brand-400 hover:text-brand-600"
                >
                  <IconPlus width={14} height={14} />
                  Adicionar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {editando && <TarefaForm tarefa={editando} onClose={() => setEditando(null)} />}
      {criando && (
        <TarefaForm statusInicial={criando} onClose={() => setCriando(null)} />
      )}
    </div>
  )
}
