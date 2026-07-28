import { useState } from 'react'
import { useStore } from '../data/store'
import type { Checklist } from '../types'
import { prioridade, statusLabel, tipoTarefa } from '../lib/labels'
import { formatarData } from '../lib/dates'
import { progressoChecklist } from '../lib/workload'
import { Avatar, AvatarGroup, Badge, Modal } from './ui'
import { IconLixeira, IconPlus } from './icons'

const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function tempoRelativo(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  tarefaId: string
  onClose: () => void
  onEditar: () => void
}

export default function TarefaDetalhe({ tarefaId, onClose, onEditar }: Props) {
  const { tarefas, clientes, membros, tags, atualizarTarefa } = useStore()
  const tarefa = tarefas.find((t) => t.id === tarefaId)

  const [novoItem, setNovoItem] = useState<Record<string, string>>({})
  const [novoComentario, setNovoComentario] = useState('')

  if (!tarefa) return null
  const cliente = clientes.find((c) => c.id === tarefa.clienteId)
  const responsaveis = membros.filter((m) => tarefa.responsaveisIds.includes(m.id))
  const tagsDaTarefa = tags.filter((t) => tarefa.tagsIds.includes(t.id))
  const ehReuniao = tarefa.tipo === 'reuniao' || tagsDaTarefa.some((t) => t.ehReuniao)
  const prio = prioridade(tarefa.prioridade)
  const tipo = tipoTarefa(tarefa.tipo)
  const prog = progressoChecklist(tarefa)

  const setAta = (patch: Partial<typeof tarefa.ata>) =>
    atualizarTarefa(tarefa.id, { ata: { ...tarefa.ata, ...patch } })

  const setChecklists = (checklists: Checklist[]) => atualizarTarefa(tarefa.id, { checklists })

  function toggleItem(clId: string, itemId: string) {
    setChecklists(
      tarefa!.checklists.map((c) =>
        c.id === clId
          ? { ...c, itens: c.itens.map((it) => (it.id === itemId ? { ...it, feito: !it.feito } : it)) }
          : c,
      ),
    )
  }

  function addItem(clId: string) {
    const texto = (novoItem[clId] ?? '').trim()
    if (!texto) return
    setChecklists(
      tarefa!.checklists.map((c) =>
        c.id === clId ? { ...c, itens: [...c.itens, { id: novoId(), texto, feito: false }] } : c,
      ),
    )
    setNovoItem((s) => ({ ...s, [clId]: '' }))
  }

  function removeItem(clId: string, itemId: string) {
    setChecklists(
      tarefa!.checklists.map((c) =>
        c.id === clId ? { ...c, itens: c.itens.filter((it) => it.id !== itemId) } : c,
      ),
    )
  }

  function addChecklist() {
    const titulo = prompt('Nome do checklist:', 'Checklist')
    if (!titulo?.trim()) return
    setChecklists([...tarefa!.checklists, { id: novoId(), titulo: titulo.trim(), itens: [] }])
  }

  function removeChecklist(clId: string) {
    if (confirm('Excluir este checklist?')) {
      setChecklists(tarefa!.checklists.filter((c) => c.id !== clId))
    }
  }

  function addComentario() {
    const texto = novoComentario.trim()
    if (!texto) return
    atualizarTarefa(tarefa!.id, {
      comentarios: [
        ...tarefa!.comentarios,
        { id: novoId(), texto, data: new Date().toISOString(), autorId: null },
      ],
    })
    setNovoComentario('')
  }

  return (
    <Modal
      titulo={tarefa.titulo}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
          <button className="btn-primary" onClick={onEditar}>
            Editar campos
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={tipo.badge}>{tipo.label}</Badge>
          <Badge className={prio.badge}>{prio.label}</Badge>
          <Badge className="bg-slate-100 text-slate-600">{statusLabel(tarefa.status)}</Badge>
          {cliente && <span className="text-sm text-slate-500">· {cliente.nome}</span>}
          {tarefa.data && (
            <span className="text-sm text-slate-500">· {formatarData(tarefa.data)}</span>
          )}
          <span className="ml-auto">
            <AvatarGroup membros={responsaveis} size="sm" />
          </span>
        </div>

        {tagsDaTarefa.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagsDaTarefa.map((tg) => (
              <Badge key={tg.id} className={tg.cor}>
                {tg.nome}
              </Badge>
            ))}
          </div>
        )}

        {tarefa.descricao && <p className="text-sm text-slate-600">{tarefa.descricao}</p>}

        {/* Ata da reunião — só para reuniões; participantes SCORE preenchidos automaticamente */}
        {ehReuniao && (
          <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Ata da reunião</h4>
            <div className="space-y-3">
              <div className="rounded-md bg-white p-2.5 text-xs">
                <p className="font-medium text-slate-500">Participantes — Score (automático)</p>
                <p className="text-slate-700">
                  {responsaveis.map((m) => m.nome).join(', ') || '—'}
                </p>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Participantes — Empresa</span>
                <input
                  className="input mt-1"
                  value={tarefa.ata.participantesEmpresa}
                  onChange={(e) => setAta({ participantesEmpresa: e.target.value })}
                  placeholder="Ex.: Sabrina (Core Gym)"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Resumo das atividades / entregáveis realizados</span>
                <textarea
                  className="input mt-1 min-h-[70px] resize-y"
                  value={tarefa.ata.resumo}
                  onChange={(e) => setAta({ resumo: e.target.value })}
                  placeholder="O que foi discutido e entregue na reunião…"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Atividades para a próxima reunião (deveres de casa)</span>
                <textarea
                  className="input mt-1 min-h-[60px] resize-y"
                  value={tarefa.ata.deveresDeCasa}
                  onChange={(e) => setAta({ deveresDeCasa: e.target.value })}
                  placeholder="Próximas ações combinadas…"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Outras observações relevantes</span>
                <textarea
                  className="input mt-1 min-h-[50px] resize-y"
                  value={tarefa.ata.observacoes}
                  onChange={(e) => setAta({ observacoes: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Link da gravação</span>
                <input
                  className="input mt-1"
                  value={tarefa.gravacaoUrl}
                  onChange={(e) => atualizarTarefa(tarefa.id, { gravacaoUrl: e.target.value })}
                  placeholder="Cole o link (Meet/Zoom/Drive)…"
                />
                {tarefa.gravacaoUrl && (
                  <a
                    href={tarefa.gravacaoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-brand-600 hover:underline"
                  >
                    ▶ Abrir gravação
                  </a>
                )}
              </label>
            </div>
          </div>
        )}

        {/* Checklists */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">
              Checklists {prog.total > 0 && <span className="text-slate-400">({prog.feitos}/{prog.total})</span>}
            </h4>
            <button className="btn-ghost text-sm" onClick={addChecklist}>
              <IconPlus width={14} height={14} /> Checklist
            </button>
          </div>

          {tarefa.checklists.length === 0 && (
            <p className="text-sm text-slate-400">Nenhum checklist. Adicione um para dividir a tarefa em itens.</p>
          )}

          {tarefa.checklists.map((cl) => {
            const feitos = cl.itens.filter((i) => i.feito).length
            const pct = cl.itens.length ? Math.round((feitos / cl.itens.length) * 100) : 0
            return (
              <div key={cl.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">{cl.titulo}</span>
                  <button
                    className="text-xs text-slate-400 hover:text-rose-600"
                    onClick={() => removeChecklist(cl.id)}
                  >
                    Excluir
                  </button>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-9 text-right text-xs font-medium text-slate-500">{pct}%</span>
                </div>
                <div className="space-y-1">
                  {cl.itens.map((it) => (
                    <div key={it.id} className="group flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={it.feito}
                        onChange={() => toggleItem(cl.id, it.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                      />
                      <span className={`flex-1 text-sm ${it.feito ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {it.texto}
                      </span>
                      <button
                        className="text-slate-300 opacity-0 hover:text-rose-500 group-hover:opacity-100"
                        onClick={() => removeItem(cl.id, it.id)}
                        aria-label="Remover item"
                      >
                        <IconLixeira width={14} height={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    className="input py-1.5 text-sm"
                    placeholder="Adicionar um item…"
                    value={novoItem[cl.id] ?? ''}
                    onChange={(e) => setNovoItem((s) => ({ ...s, [cl.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addItem(cl.id)}
                  />
                  <button className="btn-secondary" onClick={() => addItem(cl.id)}>
                    Adicionar
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Comentários / atividade */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">Comentários e atividade</h4>
          <div className="mb-3 flex gap-2">
            <input
              className="input"
              placeholder="Escrever um comentário…"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComentario()}
            />
            <button className="btn-primary" onClick={addComentario} disabled={!novoComentario.trim()}>
              Enviar
            </button>
          </div>
          <div className="space-y-3">
            {tarefa.comentarios.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum comentário ainda.</p>
            )}
            {[...tarefa.comentarios]
              .sort((a, b) => b.data.localeCompare(a.data))
              .map((c) => {
                const autor = membros.find((m) => m.id === c.autorId)
                return (
                  <div key={c.id} className="flex gap-2.5">
                    <Avatar membro={autor} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{autor?.nome ?? 'Você'}</span>{' '}
                        <span className="text-xs text-slate-400">{tempoRelativo(c.data)}</span>
                      </p>
                      <p className="text-sm text-slate-600">{c.texto}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </Modal>
  )
}
