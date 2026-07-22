import { useMemo, useState } from 'react'
import { useStore } from '../data/store'
import type { Tarefa } from '../types'
import { diasDaSemana, hojeIso, nomeDiaCurto, nomeMesAno, parseData } from '../lib/dates'
import { tipoTarefa } from '../lib/labels'
import { Avatar } from '../components/ui'
import { IconPlus } from '../components/icons'
import TarefaForm from '../components/TarefaForm'

function horaLabel(t: Tarefa) {
  if (!t.horaInicio) return 'Dia todo'
  return t.horaFim ? `${t.horaInicio}–${t.horaFim}` : t.horaInicio
}

export default function Agenda() {
  const { membros, tarefas, clientes } = useStore()
  const [base, setBase] = useState(() => new Date())
  const [filtroMembro, setFiltroMembro] = useState('')
  const [form, setForm] = useState<{ open: boolean; tarefa?: Tarefa | null; data?: string }>({ open: false })

  const dias = useMemo(() => diasDaSemana(base), [base])
  const hoje = hojeIso()

  // Only scheduled items (those with a date) show on the calendar.
  const agendados = useMemo(() => tarefas.filter((t) => t.data), [tarefas])

  const membrosVisiveis = filtroMembro ? membros.filter((m) => m.id === filtroMembro) : membros

  const clienteNome = (id: string | null) => clientes.find((c) => c.id === id)?.nome

  function itensDe(membroId: string, dia: string) {
    return agendados
      .filter((t) => t.data === dia && t.responsaveisIds.includes(membroId))
      .sort((a, b) => (a.horaInicio ?? '').localeCompare(b.horaInicio ?? ''))
  }

  function mudarSemana(delta: number) {
    setBase((b) => {
      const d = new Date(b)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
          <p className="text-sm text-slate-500">
            Reuniões e compromissos de cada consultor na semana.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setForm({ open: true, tarefa: null, data: hoje })}
        >
          <IconPlus width={16} height={16} />
          Nova reunião
        </button>
      </header>

      {/* Controles */}
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

      {/* Grade semanal */}
      <div className="card overflow-x-auto scrollbar-thin">
        <div className="min-w-[860px]">
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-[160px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50">
            <div className="px-3 py-2 text-xs font-medium text-slate-400">Consultor</div>
            {dias.map((dia) => {
              const d = parseData(dia)
              const ehHoje = dia === hoje
              return (
                <div
                  key={dia}
                  className={`px-2 py-2 text-center text-xs font-medium ${ehHoje ? 'text-brand-700' : 'text-slate-500'}`}
                >
                  <div className="capitalize">{nomeDiaCurto(dia)}</div>
                  <div className={`mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${ehHoje ? 'bg-brand-600 text-white' : ''}`}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Linhas por consultor */}
          {membrosVisiveis.map((membro) => (
            <div key={membro.id} className="grid grid-cols-[160px_repeat(7,1fr)] border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2 px-3 py-3">
                <Avatar membro={membro} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{membro.nome.split(' ')[0]}</p>
                  <p className="truncate text-[11px] text-slate-400">{membro.cargo}</p>
                </div>
              </div>
              {dias.map((dia) => {
                const itens = itensDe(membro.id, dia)
                return (
                  <div key={dia} className="min-h-[64px] border-l border-slate-100 p-1">
                    <div className="flex flex-col gap-1">
                      {itens.map((t) => {
                        const tipo = tipoTarefa(t.tipo)
                        return (
                          <button
                            key={t.id}
                            onClick={() => setForm({ open: true, tarefa: t })}
                            className="rounded-md border-l-2 border-brand-500 bg-brand-50 px-1.5 py-1 text-left hover:bg-brand-100"
                          >
                            <p className="text-[11px] font-semibold text-slate-700">{horaLabel(t)}</p>
                            <p className="truncate text-[11px] leading-tight text-slate-600">{t.titulo}</p>
                            {clienteNome(t.clienteId) && (
                              <p className="truncate text-[10px] text-slate-400">{clienteNome(t.clienteId)}</p>
                            )}
                            <span className={`badge mt-0.5 ${tipo.badge}`}>{tipo.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {form.open && (
        <TarefaForm
          tarefa={form.tarefa}
          tipoInicial="reuniao"
          dataInicial={form.data}
          onClose={() => setForm({ open: false })}
        />
      )}
    </div>
  )
}
