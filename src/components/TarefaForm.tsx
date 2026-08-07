import { useState } from 'react'
import { useStore } from '../data/store'
import type { Prioridade, StatusTarefa, Tarefa, TipoTarefa } from '../types'
import { PRIORIDADES, STATUS_TAREFA, TIPOS_TAREFA } from '../lib/labels'
import { Avatar, Campo, Modal } from './ui'

interface Props {
  tarefa?: Tarefa | null
  /** Pre-select a status when creating from a Kanban column. */
  statusInicial?: StatusTarefa
  /** Pre-fill project/stage when creating from a project detail. */
  projetoInicial?: string
  etapaInicial?: string
  /** Pre-fill scheduling when creating from the calendar. */
  dataInicial?: string
  tipoInicial?: TipoTarefa
  onClose: () => void
}

export default function TarefaForm({
  tarefa,
  statusInicial,
  projetoInicial,
  etapaInicial,
  dataInicial,
  tipoInicial,
  onClose,
}: Props) {
  const {
    clientes,
    membros,
    projetos,
    etapas,
    tags,
    criarTarefa,
    atualizarTarefa,
    removerTarefa,
  } = useStore()
  const edicao = Boolean(tarefa)

  const [titulo, setTitulo] = useState(tarefa?.titulo ?? '')
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? '')
  const [clienteId, setClienteId] = useState(tarefa?.clienteId ?? '')
  const [projetoId, setProjetoId] = useState(tarefa?.projetoId ?? projetoInicial ?? '')
  const [etapaId, setEtapaId] = useState(tarefa?.etapaId ?? etapaInicial ?? '')
  const [responsaveisIds, setResponsaveisIds] = useState<string[]>(
    tarefa?.responsaveisIds ?? [],
  )
  const [tipo, setTipo] = useState<TipoTarefa>(tarefa?.tipo ?? tipoInicial ?? 'tarefa')
  const [orientacao, setOrientacao] = useState(tarefa?.orientacao ?? '')
  const [prioridade, setPrioridade] = useState<Prioridade>(tarefa?.prioridade ?? 'media')
  const [status, setStatus] = useState<StatusTarefa>(
    tarefa?.status ?? statusInicial ?? 'a_fazer',
  )
  const [prazo, setPrazo] = useState(tarefa?.prazo ?? '')
  const [estimativaHoras, setEstimativaHoras] = useState(
    tarefa?.estimativaHoras ? String(tarefa.estimativaHoras) : '',
  )
  const [data, setData] = useState(tarefa?.data ?? dataInicial ?? '')
  const [horaInicio, setHoraInicio] = useState(tarefa?.horaInicio ?? '')
  const [horaFim, setHoraFim] = useState(tarefa?.horaFim ?? '')
  const [tagsIds, setTagsIds] = useState<string[]>(tarefa?.tagsIds ?? [])

  const etapasDoProjeto = etapas
    .filter((e) => e.projetoId === projetoId)
    .sort((a, b) => a.ordem - b.ordem)

  const tagReuniao = tags.find((t) => t.ehReuniao)

  function toggleResponsavel(id: string) {
    setResponsaveisIds((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    )
  }

  function toggleTag(id: string) {
    setTagsIds((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))
  }

  function salvar() {
    if (!titulo.trim()) return
    // Automation: meetings always carry the "Reunião" tag.
    let finalTags = tagsIds
    if (tipo === 'reuniao' && tagReuniao && !finalTags.includes(tagReuniao.id)) {
      finalTags = [...finalTags, tagReuniao.id]
    }
    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      clienteId: clienteId || null,
      projetoId: projetoId || null,
      etapaId: projetoId ? etapaId || null : null,
      responsaveisIds,
      tipo,
      orientacao: tipo === 'tarefa' ? orientacao.trim() : '',
      prioridade,
      status,
      prazo: prazo || null,
      estimativaHoras: Number(estimativaHoras) || 0,
      data: data || null,
      horaInicio: data ? horaInicio || null : null,
      horaFim: data ? horaFim || null : null,
      tagsIds: finalTags,
    }
    // Editing preserves existing checklists/comments/ata; new tasks start empty.
    if (tarefa) atualizarTarefa(tarefa.id, payload)
    else
      criarTarefa({
        ...payload,
        checklists: [],
        comentarios: [],
        ata: { participantesEmpresa: '', resumo: '', deveresDeCasa: '', observacoes: '' },
        gravacaoUrl: '',
        gravacaoAudio: '',
      })
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
        <Campo label="Título *">
          <input
            className="input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Apurar DAS do Simples Nacional"
            autoFocus
          />
        </Campo>

        <Campo label="Descrição">
          <textarea
            className="input min-h-[64px] resize-y"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Detalhes, observações, o que precisa ser feito…"
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Cliente">
            <select
              className="input"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">— Sem cliente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Projeto">
            <select
              className="input"
              value={projetoId}
              onChange={(e) => {
                setProjetoId(e.target.value)
                setEtapaId('')
              }}
            >
              <option value="">— Sem projeto —</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {projetoId && etapasDoProjeto.length > 0 && (
          <Campo label="Etapa do projeto">
            <select className="input" value={etapaId} onChange={(e) => setEtapaId(e.target.value)}>
              <option value="">— Sem etapa —</option>
              {etapasDoProjeto.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.ordem}. {e.nome}
                </option>
              ))}
            </select>
          </Campo>
        )}

        <div>
          <span className="label">Responsáveis</span>
          <div className="flex flex-wrap gap-2">
            {membros.map((m) => {
              const sel = responsaveisIds.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleResponsavel(m.id)}
                  aria-pressed={sel}
                  className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-sm transition-colors ${
                    sel
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Avatar membro={m} size="sm" />
                  {m.nome.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Campo label="Tipo">
            <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as TipoTarefa)}>
              {TIPOS_TAREFA.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] leading-tight text-slate-400">
              {TIPOS_TAREFA.find((t) => t.id === tipo)?.descricao}
            </p>
          </Campo>
          <Campo label="Prioridade">
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
          </Campo>
          <Campo label="Status">
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
          </Campo>
        </div>

        {/* Tarefa: como a demanda deve ser feita (orientação/briefing) */}
        {tipo === 'tarefa' && (
          <Campo label="Como deve ser feita a demanda">
            <textarea
              className="input min-h-[80px] resize-y"
              value={orientacao}
              onChange={(e) => setOrientacao(e.target.value)}
              placeholder="Explique o passo a passo, critérios e o que se espera da entrega…"
            />
          </Campo>
        )}

        {/* Lembrete: vinculado ao responsável, aparece como notificação dele */}
        {tipo === 'lembrete' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">Lembrete pessoal</p>
            <p className="text-amber-700">
              {responsaveisIds.length === 0
                ? 'Escolha o responsável acima — ele receberá este lembrete nas notificações.'
                : 'Aparecerá nas notificações do(s) responsável(is) selecionado(s) acima.'}
            </p>
          </div>
        )}

        {/* Reunião: a ata e o gravador de voz ficam no detalhe do cartão */}
        {tipo === 'reuniao' && (
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800">
            <p className="font-medium">Reunião</p>
            <p className="text-cyan-700">
              Após salvar, abra o cartão para gravar o áudio pelo microfone e preencher a ata.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Prazo">
            <input
              type="date"
              className="input"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
            />
          </Campo>
          <Campo label="Estimativa (horas)">
            <input
              type="number"
              min="0"
              step="0.5"
              className="input"
              value={estimativaHoras}
              onChange={(e) => setEstimativaHoras(e.target.value)}
              placeholder="0"
            />
          </Campo>
        </div>

        {/* Agendamento — quando preenchido, aparece no Calendário */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-medium text-slate-700">
            Agendar na agenda <span className="font-normal text-slate-400">(opcional)</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Campo label="Data">
              <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} />
            </Campo>
            <Campo label="Início">
              <input
                type="time"
                className="input"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                disabled={!data}
              />
            </Campo>
            <Campo label="Fim">
              <input
                type="time"
                className="input"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                disabled={!data}
              />
            </Campo>
          </div>
          {responsaveisIds.length > 1 && data && (
            <p className="mt-2 text-xs text-slate-500">
              Aparecerá na agenda dos {responsaveisIds.length} responsáveis.
            </p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <span className="label">Tags</span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tg) => {
                const sel = tagsIds.includes(tg.id) || (tipo === 'reuniao' && tg.ehReuniao)
                return (
                  <button
                    key={tg.id}
                    type="button"
                    onClick={() => toggleTag(tg.id)}
                    aria-pressed={sel}
                    className={`badge border ${
                      sel ? `${tg.cor} border-transparent` : 'border-slate-300 bg-white text-slate-500'
                    }`}
                    title={tg.ehReuniao ? 'Tag de reunião (automática em reuniões)' : undefined}
                  >
                    {tg.nome}
                    {tg.ehReuniao && ' ●'}
                  </button>
                )
              })}
            </div>
            {tipo === 'reuniao' && tagReuniao && (
              <p className="mt-1 text-xs text-slate-400">A tag “{tagReuniao.nome}” é aplicada automaticamente.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
