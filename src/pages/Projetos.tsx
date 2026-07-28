import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TAP_VAZIO, useStore } from '../data/store'
import type { Projeto, StatusProjeto } from '../types'
import { STATUS_PROJETO, statusProjeto } from '../lib/labels'
import { formatarData } from '../lib/dates'
import { Badge, Campo, EmptyState, Modal } from '../components/ui'
import { IconEditar, IconPlus } from '../components/icons'

function ProjetoForm({ projeto, onClose }: { projeto?: Projeto | null; onClose: () => void }) {
  const { clientes, criarProjeto, atualizarProjeto, removerProjeto } = useStore()
  const [nome, setNome] = useState(projeto?.nome ?? '')
  const [clienteId, setClienteId] = useState(projeto?.clienteId ?? '')
  const [descricao, setDescricao] = useState(projeto?.descricao ?? '')
  const [status, setStatus] = useState<StatusProjeto>(projeto?.status ?? 'planejado')
  const [inicio, setInicio] = useState(projeto?.inicio ?? '')
  const [fim, setFim] = useState(projeto?.fim ?? '')

  function salvar() {
    if (!nome.trim() || !clienteId) return
    const payload = {
      nome: nome.trim(),
      clienteId,
      descricao: descricao.trim(),
      status,
      inicio: inicio || new Date().toISOString().slice(0, 10),
      fim: fim || null,
    }
    if (projeto) atualizarProjeto(projeto.id, payload)
    else criarProjeto({ ...payload, tap: TAP_VAZIO })
    onClose()
  }

  return (
    <Modal
      titulo={projeto ? 'Editar projeto' : 'Novo projeto'}
      onClose={onClose}
      footer={
        <>
          {projeto && (
            <button
              className="btn-ghost mr-auto text-rose-600 hover:bg-rose-50"
              onClick={() => {
                if (confirm('Excluir este projeto? As tarefas ligadas a ele ficarão sem projeto.')) {
                  removerProjeto(projeto.id)
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
          <button className="btn-primary" onClick={salvar} disabled={!nome.trim() || !clienteId}>
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Campo label="Nome do projeto *">
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus placeholder="Ex.: Planejamento tributário 2026" />
        </Campo>
        <Campo label="Cliente *">
          <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">— Selecione —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Descrição">
          <textarea className="input min-h-[64px] resize-y" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Campo>
        <div className="grid grid-cols-3 gap-4">
          <Campo label="Status">
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as StatusProjeto)}>
              {STATUS_PROJETO.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Início">
            <input type="date" className="input" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Campo>
          <Campo label="Previsão de fim">
            <input type="date" className="input" value={fim} onChange={(e) => setFim(e.target.value)} />
          </Campo>
        </div>
      </div>
    </Modal>
  )
}

export default function Projetos() {
  const { projetos, clientes, tarefas, etapas } = useStore()
  const [form, setForm] = useState<{ open: boolean; projeto?: Projeto | null }>({ open: false })

  const clienteNome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? 'Sem cliente'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projetos</h1>
          <p className="text-sm text-slate-500">Trabalhos de consultoria com início, fim e escopo.</p>
        </div>
        <button className="btn-primary" onClick={() => setForm({ open: true, projeto: null })}>
          <IconPlus width={16} height={16} />
          Novo projeto
        </button>
      </header>

      {projetos.length === 0 ? (
        <EmptyState
          titulo="Nenhum projeto cadastrado"
          descricao="Crie projetos para agrupar as tarefas de consultoria de um cliente."
          acao={
            <button className="btn-primary" onClick={() => setForm({ open: true, projeto: null })}>
              <IconPlus width={16} height={16} />
              Novo projeto
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projetos.map((p) => {
            const doProjeto = tarefas.filter((t) => t.projetoId === p.id)
            const concluidas = doProjeto.filter((t) => t.status === 'concluido').length
            const progresso = doProjeto.length ? Math.round((concluidas / doProjeto.length) * 100) : 0
            const numEtapas = etapas.filter((e) => e.projetoId === p.id).length
            const st = statusProjeto(p.status)
            return (
              <div key={p.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/projetos/${p.id}`}
                      className="font-semibold text-slate-800 hover:text-brand-600 hover:underline"
                    >
                      {p.nome}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {clienteNome(p.clienteId)}
                      {numEtapas > 0 && ` · ${numEtapas} etapa${numEtapas > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={st.badge}>{st.label}</Badge>
                    <button
                      className="btn-ghost h-9 w-9 !p-0"
                      onClick={() => setForm({ open: true, projeto: p })}
                      aria-label="Editar"
                    >
                      <IconEditar width={16} height={16} />
                    </button>
                  </div>
                </div>

                {p.descricao && <p className="mt-2 text-sm text-slate-600">{p.descricao}</p>}

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {concluidas}/{doProjeto.length} tarefas concluídas
                    </span>
                    <span className="font-medium">{progresso}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${progresso}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {formatarData(p.inicio)} → {formatarData(p.fim)}
                  </span>
                  <Link to={`/projetos/${p.id}`} className="font-medium text-brand-600 hover:underline">
                    Ver etapas →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {form.open && <ProjetoForm projeto={form.projeto} onClose={() => setForm({ open: false })} />}
    </div>
  )
}
