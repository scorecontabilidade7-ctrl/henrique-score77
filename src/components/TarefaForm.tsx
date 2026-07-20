import { useState } from 'react'
import { useStore } from '../data/store'
import type { Prioridade, StatusTarefa, Tarefa, TipoTarefa } from '../types'
import { PRIORIDADES, STATUS_TAREFA, TIPOS_TAREFA } from '../lib/labels'
import { Modal } from './ui'

interface Props {
  tarefa?: Tarefa | null
  /** Pre-select a status when creating from a Kanban column. */
  statusInicial?: StatusTarefa
  onClose: () => void
}

export default function TarefaForm({ tarefa, statusInicial, onClose }: Props) {
  const { clientes, membros, projetos, criarTarefa, atualizarTarefa, removerTarefa } = useStore()
  const edicao = Boolean(tarefa)

  const [titulo, setTitulo] = useState(tarefa?.titulo ?? '')
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? '')
  const [clienteId, setClienteId] = useState(tarefa?.clienteId ?? '')
  const [responsavelId, setResponsavelId] = useState(tarefa?.responsavelId ?? '')
  const [projetoId, setProjetoId] = useState(tarefa?.projetoId ?? '')
  const [tipo, setTipo] = useState<TipoTarefa>(tarefa?.tipo ?? 'contabil')
  const [prioridade, setPrioridade] = useState<Prioridade>(tarefa?.prioridade ?? 'media')
  const [status, setStatus] = useState<StatusTarefa>(tarefa?.status ?? statusInicial ?? 'a_fazer')
  const [prazo, setPrazo] = useState(tarefa?.prazo ?? '')

  const projetosDoCliente = projetos.filter((p) => !clienteId || p.clienteId === clienteId)

  function salvar() {
    if (!titulo.trim()) return
    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      clienteId: clienteId || null,
      responsavelId: responsavelId || null,
      projetoId: projetoId || null,
      tipo,
      prioridade,
      status,
      prazo: prazo || null,
    }
    if (tarefa) atualizarTarefa(tarefa.id, payload)
    else criarTarefa(payload)
    onClose()
  }

  return (
    <Modal
      titulo={edicao ? 'Editar tarefa' : 'Nova tarefa'}
      onClose={onClose}
      footer={
        <>
          {edicao && (
            <button
              className="btn-ghost mr-auto text-rose-600 hover:bg-rose-50"
              onClick={() => {
                if (tarefa && confirm('Excluir esta tarefa?')) {
                  removerTarefa(tarefa.id)
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
          <button className="btn-primary" onClick={salvar} disabled={!titulo.trim()}>
            {edicao ? 'Salvar' : 'Criar tarefa'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Título *</label>
          <input
            className="input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Apurar DAS do Simples Nacional"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Descrição</label>
          <textarea
            className="input min-h-[72px] resize-y"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Detalhes, observações, o que precisa ser feito…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Cliente</label>
            <select
              className="input"
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value)
                setProjetoId('')
              }}
            >
              <option value="">— Sem cliente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Responsável</label>
            <select
              className="input"
              value={responsavelId}
              onChange={(e) => setResponsavelId(e.target.value)}
            >
              <option value="">— Sem responsável —</option>
              {membros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as TipoTarefa)}>
              {TIPOS_TAREFA.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Prioridade</label>
            <select
              className="input"
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as Prioridade)}
            >
              {PRIORIDADES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusTarefa)}
            >
              {STATUS_TAREFA.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Prazo</label>
            <input
              type="date"
              className="input"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
            />
          </div>
        </div>

        {tipo === 'consultoria' && projetosDoCliente.length > 0 && (
          <div>
            <label className="label">Projeto</label>
            <select
              className="input"
              value={projetoId}
              onChange={(e) => setProjetoId(e.target.value)}
            >
              <option value="">— Sem projeto —</option>
              {projetosDoCliente.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Modal>
  )
}
