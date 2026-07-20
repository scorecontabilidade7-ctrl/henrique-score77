import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { cargaPorMembro, gargalos, resumoGeral } from '../lib/workload'
import { prazoRelativo } from '../lib/dates'
import { Avatar, Badge } from '../components/ui'
import { IconAlerta, IconCheck, IconLista, IconPlus, IconRelogio } from '../components/icons'
import TarefaForm from '../components/TarefaForm'
import { prioridade } from '../lib/labels'

function CardMetrica({
  titulo,
  valor,
  Icon,
  cor,
}: {
  titulo: string
  valor: number
  Icon: typeof IconLista
  cor: string
}) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${cor}`}>
        <Icon />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-slate-800">{valor}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">{titulo}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { tarefas, membros, clientes } = useStore()
  const navigate = useNavigate()
  const [novaTarefa, setNovaTarefa] = useState(false)

  const resumo = useMemo(() => resumoGeral(tarefas), [tarefas])
  const cargas = useMemo(() => cargaPorMembro(membros, tarefas), [membros, tarefas])
  const pendencias = useMemo(() => gargalos(tarefas), [tarefas])
  const maxPontos = Math.max(1, ...cargas.map((c) => c.pontos))

  const clienteNome = (id: string | null) =>
    clientes.find((c) => c.id === id)?.nome ?? 'Sem cliente'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel</h1>
          <p className="text-sm text-slate-500">
            Quem está fazendo o quê, o que vence e onde estão os gargalos.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setNovaTarefa(true)}>
          <IconPlus width={16} height={16} />
          Nova tarefa
        </button>
      </header>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CardMetrica titulo="Tarefas abertas" valor={resumo.abertas} Icon={IconLista} cor="bg-brand-100 text-brand-700" />
        <CardMetrica titulo="Atrasadas" valor={resumo.atrasadas} Icon={IconAlerta} cor="bg-rose-100 text-rose-700" />
        <CardMetrica titulo="Vencem esta semana" valor={resumo.venceSemana} Icon={IconRelogio} cor="bg-amber-100 text-amber-700" />
        <CardMetrica titulo="Concluídas" valor={resumo.concluidas} Icon={IconCheck} cor="bg-emerald-100 text-emerald-700" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Carga por responsável */}
        <section className="card lg:col-span-3">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-800">Carga por responsável</h2>
            <p className="text-xs text-slate-500">Ordenado do mais sobrecarregado ao mais livre.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {cargas.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                Cadastre membros na aba Equipe para ver a distribuição.
              </p>
            )}
            {cargas.map(({ membro, abertas, atrasadas, venceSemana, pontos }) => (
              <div key={membro.id} className="flex items-center gap-4 px-5 py-3">
                <Avatar membro={membro} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-800">{membro.nome}</p>
                    <span className="shrink-0 text-xs font-medium text-slate-500">
                      {abertas} {abertas === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(pontos / maxPontos) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-slate-400">
                    {atrasadas > 0 && <span className="text-rose-600">{atrasadas} atrasada(s)</span>}
                    {venceSemana > 0 && <span className="text-amber-600">{venceSemana} esta semana</span>}
                    {atrasadas === 0 && venceSemana === 0 && <span>Em dia</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gargalos / prazos */}
        <section className="card lg:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-800">Atenção imediata</h2>
            <p className="text-xs text-slate-500">Atrasadas e vencendo nos próximos 7 dias.</p>
          </div>
          <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto scrollbar-thin">
            {pendencias.length === 0 && (
              <div className="flex flex-col items-center gap-1 px-5 py-10 text-center">
                <span className="text-emerald-500">
                  <IconCheck width={28} height={28} />
                </span>
                <p className="text-sm font-medium text-slate-600">Tudo sob controle</p>
                <p className="text-xs text-slate-400">Nenhuma tarefa atrasada ou vencendo.</p>
              </div>
            )}
            {pendencias.map((t) => {
              const responsavel = membros.find((m) => m.id === t.responsavelId)
              const prio = prioridade(t.prioridade)
              return (
                <button
                  key={t.id}
                  onClick={() => navigate('/tarefas')}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50"
                >
                  <Avatar membro={responsavel} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{t.titulo}</p>
                    <p className="truncate text-xs text-slate-500">{clienteNome(t.clienteId)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge className={prio.badge}>{prio.label}</Badge>
                    <span className="text-xs font-medium text-rose-600">{prazoRelativo(t.prazo)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {novaTarefa && <TarefaForm onClose={() => setNovaTarefa(false)} />}
    </div>
  )
}
