import { useMemo, useState } from 'react'
import { useStore } from '../data/store'
import type { Prioridade, Tarefa } from '../types'
import { diasDaSemana, hojeIso, nomeDiaCurto, nomeMesAno, parseData } from '../lib/dates'
import { progressoChecklist } from '../lib/workload'
import { AvatarGroup } from '../components/ui'
import { IconChecklist, IconComentario, IconPlus } from '../components/icons'
import TarefaDetalhe from '../components/TarefaDetalhe'
import TarefaForm from '../components/TarefaForm'

const COR_PRIORIDADE: Record<Prioridade, string> = {
  baixa: 'bg-slate-300',
  media: 'bg-sky-400',
  alta: 'bg-orange-400',
  urgente: 'bg-rose-500',
}

function Cartao({ tarefa, onClick, onDragStart }: { tarefa: Tarefa; onClick: () => void; onDragStart: () => void }) {
  const { clientes, membros } = useStore()
  const cliente = clientes.find((c) => c.id === tarefa.clienteId)
  const responsaveis = membros.filter((m) => tarefa.responsaveisIds.includes(m.id))
  const prog = progressoChecklist(tarefa)

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      role="button"
      tabIndex={0}
      className="card cursor-pointer p-2.5 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 active:cursor-grabbing"
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-slate-800">{tarefa.titulo}</p>
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${COR_PRIORIDADE[tarefa.prioridade]}`} title={tarefa.prioridade} />
      </div>
      {cliente && <p className="mb-1.5 truncate text-xs text-slate-500">{cliente.nome}</p>}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {prog.total > 0 && (
          <span
            className={`flex items-center gap-1 rounded px-1 ${
              prog.pct === 100 ? 'bg-emerald-100 text-emerald-700' : ''
            }`}
          >
            <IconChecklist width={13} height={13} />
            {prog.feitos}/{prog.total}
          </span>
        )}
        {tarefa.comentarios.length > 0 && (
          <span className="flex items-center gap-1">
            <IconComentario width={13} height={13} />
            {tarefa.comentarios.length}
          </span>
        )}
        <span className="ml-auto">
          <AvatarGroup membros={responsaveis} size="sm" limite={3} />
        </span>
      </div>
    </article>
  )
}

export default function Semana() {
  const { tarefas, membros, atualizarTarefa } = useStore()
  const [base, setBase] = useState(() => new Date())
  const [filtroMembro, setFiltroMembro] = useState('')
  const [detalhe, setDetalhe] = useState<string | null>(null)
  const [editar, setEditar] = useState<Tarefa | null>(null)
  const [criar, setCriar] = useState<{ data: string | null } | null>(null)
  const [arrastando, setArrastando] = useState<string | null>(null)

  // Monday..Saturday of the current week (drop Sunday).
  const dias = useMemo(() => diasDaSemana(base).slice(1), [base])
  const hoje = hojeIso()

  const visiveis = useMemo(
    () => tarefas.filter((t) => !filtroMembro || t.responsaveisIds.includes(filtroMembro)),
    [tarefas, filtroMembro],
  )

  const doDia = (dia: string) => visiveis.filter((t) => t.data === dia)
  const semData = visiveis.filter((t) => !t.data && t.status !== 'concluido')

  function mover(dia: string | null) {
    if (arrastando) {
      atualizarTarefa(arrastando, { data: dia })
      setArrastando(null)
    }
  }

  function mudarSemana(delta: number) {
    setBase((b) => {
      const d = new Date(b)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  const colunas: { chave: string; titulo: string; data: string | null; ehHoje?: boolean }[] = [
    ...dias.map((dia) => ({
      chave: dia,
      titulo: nomeDiaCurto(dia),
      data: dia,
      ehHoje: dia === hoje,
    })),
    { chave: 'sem-data', titulo: 'Sem previsão', data: null },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Semana</h1>
          <p className="text-sm text-slate-500">
            Quadro por dia. Arraste os cartões entre os dias e abra para ver os checklists.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button className="btn-secondary h-9 w-9 !p-0" onClick={() => mudarSemana(-1)} aria-label="Semana anterior">
            ‹
          </button>
          <button className="btn-secondary" onClick={() => setBase(new Date())}>
            Hoje
          </button>
          <button className="btn-secondary h-9 w-9 !p-0" onClick={() => mudarSemana(1)} aria-label="Próxima semana">
            ›
          </button>
        </div>
        <span className="text-sm font-medium capitalize text-slate-700">{nomeMesAno(parseData(dias[0]))}</span>
        <select
          className="input ml-auto max-w-[220px]"
          value={filtroMembro}
          onChange={(e) => setFiltroMembro(e.target.value)}
        >
          <option value="">Todos os consultores</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Quadro */}
      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div className="flex gap-3" style={{ minWidth: `${colunas.length * 240}px` }}>
          {colunas.map((col) => {
            const itens = col.data ? doDia(col.data) : semData
            return (
              <div
                key={col.chave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => mover(col.data)}
                className="flex w-60 shrink-0 flex-col rounded-xl bg-slate-200/50 p-2"
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold capitalize ${col.ehHoje ? 'text-brand-700' : 'text-slate-700'}`}>
                      {col.titulo}
                    </span>
                    {col.data && (
                      <span className={`text-xs ${col.ehHoje ? 'font-semibold text-brand-700' : 'text-slate-400'}`}>
                        {parseData(col.data).getDate()}
                      </span>
                    )}
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                    {itens.length}
                  </span>
                </div>
                <div className="flex min-h-[60px] flex-1 flex-col gap-2 p-1">
                  {itens.map((t) => (
                    <Cartao
                      key={t.id}
                      tarefa={t}
                      onClick={() => setDetalhe(t.id)}
                      onDragStart={() => setArrastando(t.id)}
                    />
                  ))}
                  <button
                    onClick={() => setCriar({ data: col.data })}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white hover:text-brand-600"
                  >
                    <IconPlus width={14} height={14} />
                    Adicionar um cartão
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {detalhe && (
        <TarefaDetalhe
          tarefaId={detalhe}
          onClose={() => setDetalhe(null)}
          onEditar={() => {
            const t = tarefas.find((x) => x.id === detalhe) ?? null
            setDetalhe(null)
            setEditar(t)
          }}
        />
      )}
      {editar && <TarefaForm tarefa={editar} onClose={() => setEditar(null)} />}
      {criar && (
        <TarefaForm
          dataInicial={criar.data ?? undefined}
          onClose={() => setCriar(null)}
        />
      )}
    </div>
  )
}
