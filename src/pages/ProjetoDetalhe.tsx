import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../data/store'
import type { Etapa, Tarefa } from '../types'
import { statusLabel, statusProjeto, STATUS_TAREFA, CORES_ETAPA } from '../lib/labels'
import { formatarData, prazoRelativo, estaAtrasada } from '../lib/dates'
import { horasDaTarefa } from '../lib/workload'
import { AvatarGroup, Badge, EmptyState, Modal } from '../components/ui'
import { IconPlus } from '../components/icons'
import TarefaForm from '../components/TarefaForm'

function progresso(tarefas: Tarefa[]) {
  if (tarefas.length === 0) return 0
  const feitas = tarefas.filter((t) => t.status === 'concluido').length
  return Math.round((feitas / tarefas.length) * 100)
}

function EtapaForm({
  projetoId,
  etapa,
  proximaOrdem,
  onClose,
}: {
  projetoId: string
  etapa?: Etapa | null
  proximaOrdem: number
  onClose: () => void
}) {
  const { criarEtapa, atualizarEtapa, removerEtapa } = useStore()
  const [nome, setNome] = useState(etapa?.nome ?? '')

  function salvar() {
    if (!nome.trim()) return
    if (etapa) {
      atualizarEtapa(etapa.id, { nome: nome.trim() })
    } else {
      criarEtapa({
        projetoId,
        nome: nome.trim(),
        ordem: proximaOrdem,
        cor: CORES_ETAPA[(proximaOrdem - 1) % CORES_ETAPA.length],
      })
    }
    onClose()
  }

  return (
    <Modal
      titulo={etapa ? 'Editar etapa' : 'Nova etapa'}
      onClose={onClose}
      footer={
        <>
          {etapa && (
            <button
              className="btn-ghost mr-auto text-rose-600 hover:bg-rose-50"
              onClick={() => {
                if (confirm('Excluir esta etapa? As tarefas dela ficarão sem etapa.')) {
                  removerEtapa(etapa.id)
                  onClose()
                }
              }}
            >
              Excluir
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={salvar} disabled={!nome.trim()}>
            Salvar
          </button>
        </>
      }
    >
      <label className="block">
        <span className="label">Nome da etapa *</span>
        <input
          className="input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Organização"
          autoFocus
        />
      </label>
    </Modal>
  )
}

function LinhaTarefa({ tarefa, onClick }: { tarefa: Tarefa; onClick: () => void }) {
  const { membros, apontamentos } = useStore()
  const responsaveis = membros.filter((m) => tarefa.responsaveisIds.includes(m.id))
  const status = STATUS_TAREFA.find((s) => s.id === tarefa.status)
  const horas = horasDaTarefa(tarefa.id, apontamentos)
  const atrasada = tarefa.status !== 'concluido' && estaAtrasada(tarefa.prazo)

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-2.5 text-left last:border-0 hover:bg-slate-50"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${status?.cor ?? 'bg-slate-300'}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{tarefa.titulo}</p>
        <p className="text-xs text-slate-400">{statusLabel(tarefa.status)}</p>
      </div>
      {tarefa.prazo && (
        <span className={`shrink-0 text-xs ${atrasada ? 'font-medium text-rose-600' : 'text-slate-400'}`}>
          {atrasada ? prazoRelativo(tarefa.prazo) : formatarData(tarefa.prazo)}
        </span>
      )}
      <span className="shrink-0 text-xs text-slate-400">
        {horas > 0 || tarefa.estimativaHoras > 0
          ? `${horas}h${tarefa.estimativaHoras > 0 ? `/${tarefa.estimativaHoras}h` : ''}`
          : ''}
      </span>
      <AvatarGroup membros={responsaveis} size="sm" />
    </button>
  )
}

export default function ProjetoDetalhe() {
  const { id } = useParams()
  const { projetos, clientes, etapas, tarefas } = useStore()

  const projeto = projetos.find((p) => p.id === id)
  const [etapaForm, setEtapaForm] = useState<{ open: boolean; etapa?: Etapa | null }>({ open: false })
  const [tarefaForm, setTarefaForm] = useState<{ open: boolean; tarefa?: Tarefa | null; etapaId?: string }>({ open: false })

  const etapasDoProjeto = useMemo(
    () => etapas.filter((e) => e.projetoId === id).sort((a, b) => a.ordem - b.ordem),
    [etapas, id],
  )
  const tarefasDoProjeto = useMemo(() => tarefas.filter((t) => t.projetoId === id), [tarefas, id])

  if (!projeto) {
    return (
      <EmptyState
        titulo="Projeto não encontrado"
        descricao="Ele pode ter sido removido."
        acao={
          <Link to="/projetos" className="btn-primary">
            Voltar para projetos
          </Link>
        }
      />
    )
  }

  const cliente = clientes.find((c) => c.id === projeto.clienteId)
  const st = statusProjeto(projeto.status)
  const semEtapa = tarefasDoProjeto.filter((t) => !t.etapaId)
  const progGeral = progresso(tarefasDoProjeto)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <Link to="/projetos" className="text-sm text-brand-600 hover:underline">
          ← Projetos
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{projeto.nome}</h1>
            <p className="text-sm text-slate-500">
              {cliente?.nome ?? 'Sem cliente'} · {formatarData(projeto.inicio)} → {formatarData(projeto.fim)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={st.badge}>{st.label}</Badge>
            <button
              className="btn-secondary"
              onClick={() => setEtapaForm({ open: true, etapa: null })}
            >
              <IconPlus width={16} height={16} />
              Nova etapa
            </button>
          </div>
        </div>
      </div>

      {/* Fluxo de etapas */}
      {etapasDoProjeto.length > 0 && (
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Fluxo do projeto</h2>
            <span className="text-sm text-slate-500">{progGeral}% concluído</span>
          </div>
          <div className="flex items-stretch gap-1 overflow-x-auto scrollbar-thin pb-1">
            {etapasDoProjeto.map((etapa, i) => {
              const tEtapa = tarefasDoProjeto.filter((t) => t.etapaId === etapa.id)
              const prog = progresso(tEtapa)
              return (
                <div key={etapa.id} className="flex items-center">
                  <div className="min-w-[150px] rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${etapa.cor}`}>
                        {etapa.ordem}
                      </span>
                      <span className="truncate text-sm font-medium text-slate-700">{etapa.nome}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${etapa.cor}`} style={{ width: `${prog}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {tEtapa.length} {tEtapa.length === 1 ? 'atividade' : 'atividades'} · {prog}%
                    </p>
                  </div>
                  {i < etapasDoProjeto.length - 1 && (
                    <span className="px-1 text-slate-300">→</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Atividades por etapa */}
      {etapasDoProjeto.map((etapa) => {
        const tEtapa = tarefasDoProjeto.filter((t) => t.etapaId === etapa.id)
        return (
          <section key={etapa.id} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${etapa.cor}`}>
                  {etapa.ordem}
                </span>
                <button
                  className="font-semibold text-slate-800 hover:underline"
                  onClick={() => setEtapaForm({ open: true, etapa })}
                >
                  {etapa.nome}
                </button>
                <span className="text-xs text-slate-400">({tEtapa.length})</span>
              </div>
              <button
                className="btn-ghost text-sm"
                onClick={() => setTarefaForm({ open: true, tarefa: null, etapaId: etapa.id })}
              >
                <IconPlus width={14} height={14} />
                Atividade
              </button>
            </div>
            {tEtapa.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Nenhuma atividade nesta etapa ainda.
              </p>
            ) : (
              <div>
                {tEtapa.map((t) => (
                  <LinhaTarefa key={t.id} tarefa={t} onClick={() => setTarefaForm({ open: true, tarefa: t })} />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {/* Atividades sem etapa */}
      {semEtapa.length > 0 && (
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <span className="font-semibold text-slate-800">Sem etapa</span>
            <span className="ml-2 text-xs text-slate-400">({semEtapa.length})</span>
          </div>
          <div>
            {semEtapa.map((t) => (
              <LinhaTarefa key={t.id} tarefa={t} onClick={() => setTarefaForm({ open: true, tarefa: t })} />
            ))}
          </div>
        </section>
      )}

      {etapasDoProjeto.length === 0 && semEtapa.length === 0 && (
        <EmptyState
          titulo="Projeto sem etapas ou atividades"
          descricao="Crie a primeira etapa do fluxo e comece a distribuir as atividades."
          acao={
            <button className="btn-primary" onClick={() => setEtapaForm({ open: true, etapa: null })}>
              <IconPlus width={16} height={16} />
              Nova etapa
            </button>
          }
        />
      )}

      {etapaForm.open && (
        <EtapaForm
          projetoId={projeto.id}
          etapa={etapaForm.etapa}
          proximaOrdem={etapasDoProjeto.length + 1}
          onClose={() => setEtapaForm({ open: false })}
        />
      )}
      {tarefaForm.open && (
        <TarefaForm
          tarefa={tarefaForm.tarefa}
          projetoInicial={projeto.id}
          etapaInicial={tarefaForm.etapaId}
          onClose={() => setTarefaForm({ open: false })}
        />
      )}
    </div>
  )
}
