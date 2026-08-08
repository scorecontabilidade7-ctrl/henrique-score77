import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../data/store'
import type { Etapa, Projeto, Tarefa } from '../types'
import { statusLabel, statusProjeto, STATUS_TAREFA, CORES_ETAPA } from '../lib/labels'
import { formatarData, formatarBRL, hojeIso, prazoRelativo, estaAtrasada } from '../lib/dates'
import { horasDaTarefa } from '../lib/workload'
import { Avatar, AvatarGroup, Badge, Campo, EmptyState, Modal } from '../components/ui'
import { IconLixeira, IconPlus } from '../components/icons'
import TarefaForm from '../components/TarefaForm'

const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function DespesaForm({ projetoId, onClose }: { projetoId: string; onClose: () => void }) {
  const { categoriasDespesa, criarDespesa, adicionarCategoria } = useStore()
  const [categoria, setCategoria] = useState(categoriasDespesa[0] ?? '')
  const [novaCategoria, setNovaCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(hojeIso())

  function salvar() {
    let cat = categoria
    if (categoria === '__nova__') {
      cat = novaCategoria.trim()
      if (!cat) return
      adicionarCategoria(cat)
    }
    const v = Number(valor)
    if (!cat || !v) return
    criarDespesa({ projetoId, categoria: cat, descricao: descricao.trim(), valor: v, data })
    onClose()
  }

  return (
    <Modal
      titulo="Nova despesa"
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={salvar}>
            Adicionar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Campo label="Categoria *">
          <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categoriasDespesa.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__nova__">+ Nova categoria…</option>
          </select>
        </Campo>
        {categoria === '__nova__' && (
          <Campo label="Nome da nova categoria *">
            <input
              className="input"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              placeholder="Ex.: Marketing"
              autoFocus
            />
          </Campo>
        )}
        <Campo label="Descrição">
          <input className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhe da despesa" />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Valor (R$) *">
            <input type="number" min="0" step="10" className="input" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0" />
          </Campo>
          <Campo label="Data">
            <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} />
          </Campo>
        </div>
      </div>
    </Modal>
  )
}

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
        roteiro: [],
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

function RoteiroForm({ etapa, onClose }: { etapa: Etapa; onClose: () => void }) {
  const { atualizarEtapa } = useStore()
  const [passos, setPassos] = useState(etapa.roteiro)

  function add() {
    setPassos((p) => [...p, { id: novoId(), titulo: '', descricao: '', materialUrl: '' }])
  }
  function set(id: string, patch: Partial<(typeof passos)[number]>) {
    setPassos((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }
  function mover(i: number, delta: number) {
    setPassos((p) => {
      const j = i + delta
      if (j < 0 || j >= p.length) return p
      const novo = [...p]
      ;[novo[i], novo[j]] = [novo[j], novo[i]]
      return novo
    })
  }
  function salvar() {
    atualizarEtapa(etapa.id, { roteiro: passos.filter((p) => p.titulo.trim()) })
    onClose()
  }

  return (
    <Modal
      titulo={`Roteiro da etapa — ${etapa.nome}`}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={salvar}>Salvar roteiro</button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-slate-500">
          Monte um passo a passo com o material-base (links do Drive/modelos) para guiar os consultores nesta etapa.
        </p>
        {passos.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
            Nenhum passo ainda. Adicione o primeiro abaixo.
          </p>
        )}
        {passos.map((p, i) => (
          <div key={p.id} className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{i + 1}</span>
              <input
                className="input flex-1"
                placeholder="Título do passo (ex.: Briefing empresarial)"
                value={p.titulo}
                onChange={(e) => set(p.id, { titulo: e.target.value })}
              />
              <button className="btn-ghost h-8 w-8 !p-0 text-slate-400" onClick={() => mover(i, -1)} aria-label="Subir">↑</button>
              <button className="btn-ghost h-8 w-8 !p-0 text-slate-400" onClick={() => mover(i, 1)} aria-label="Descer">↓</button>
              <button className="text-slate-300 hover:text-rose-600" onClick={() => setPassos((ps) => ps.filter((x) => x.id !== p.id))} aria-label="Remover">
                <IconLixeira width={15} height={15} />
              </button>
            </div>
            <textarea
              className="input mb-2 min-h-[54px] resize-y text-sm"
              placeholder="Como fazer / o que orientar…"
              value={p.descricao}
              onChange={(e) => set(p.id, { descricao: e.target.value })}
            />
            <input
              className="input text-sm"
              placeholder="Link do material base (Drive/modelo)…"
              value={p.materialUrl}
              onChange={(e) => set(p.id, { materialUrl: e.target.value })}
            />
          </div>
        ))}
        <button className="btn-secondary" onClick={add}>
          <IconPlus width={16} height={16} /> Adicionar passo
        </button>
      </div>
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

// ------- Aba TAP (PMBOK) -------
function AbaTAP({ projeto }: { projeto: Projeto }) {
  const { clientes, membros, atualizarProjeto } = useStore()
  const cliente = clientes.find((c) => c.id === projeto.clienteId)
  const responsavel = membros.find((m) => m.id === cliente?.responsavelId)
  const tap = projeto.tap
  // Automation: default project manager to the client's lead consultant.
  const gerenteAuto = tap.gerente || responsavel?.nome || ''
  const set = (patch: Partial<typeof tap>) => atualizarProjeto(projeto.id, { tap: { ...tap, ...patch } })

  const campos: { chave: keyof typeof tap; label: string; area?: boolean }[] = [
    { chave: 'sponsor', label: 'Sponsor / Patrocinador' },
    { chave: 'orcamento', label: 'Orçamento estimado' },
    { chave: 'justificativa', label: 'Justificativa', area: true },
    { chave: 'objetivosSmart', label: 'Objetivos SMART', area: true },
    { chave: 'premissas', label: 'Premissas', area: true },
    { chave: 'restricoes', label: 'Restrições', area: true },
    { chave: 'entregas', label: 'Entregas principais', area: true },
    { chave: 'criteriosSucesso', label: 'Critérios de sucesso', area: true },
    { chave: 'riscos', label: 'Riscos iniciais', area: true },
  ]

  return (
    <section className="card p-5">
      <h2 className="font-semibold text-slate-800">Termo de Abertura do Projeto (TAP)</h2>
      <p className="text-xs text-slate-500">Documentação de iniciação conforme PMBOK.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Projeto / Cliente</p>
          <p className="text-sm font-medium text-slate-800">{projeto.nome}</p>
          <p className="text-xs text-slate-500">{cliente?.nome ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Período</p>
          <p className="text-sm font-medium text-slate-800">
            {formatarData(projeto.inicio)} → {formatarData(projeto.fim)}
          </p>
        </div>
        <label className="block rounded-lg bg-slate-50 p-3">
          <span className="text-xs text-slate-500">Gerente do projeto (auto)</span>
          <input
            className="input mt-1 bg-white"
            value={gerenteAuto}
            onChange={(e) => set({ gerente: e.target.value })}
          />
        </label>
      </div>

      <div className="mt-4 space-y-3">
        {campos.map((c) =>
          c.area ? (
            <label key={c.chave} className="block">
              <span className="label">{c.label}</span>
              <textarea
                className="input min-h-[70px] resize-y"
                value={tap[c.chave]}
                onChange={(e) => set({ [c.chave]: e.target.value } as Partial<typeof tap>)}
              />
            </label>
          ) : (
            <label key={c.chave} className="block">
              <span className="label">{c.label}</span>
              <input
                className="input"
                value={tap[c.chave]}
                onChange={(e) => set({ [c.chave]: e.target.value } as Partial<typeof tap>)}
              />
            </label>
          ),
        )}
      </div>
    </section>
  )
}

// ------- Aba 5W2H -------
function gutCor(gut: number) {
  if (gut >= 100) return 'bg-rose-100 text-rose-700'
  if (gut >= 50) return 'bg-orange-100 text-orange-700'
  if (gut >= 20) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

function Aba5W2H({ projeto }: { projeto: Projeto }) {
  const { membros, itens5w2h, criarItem5w2h, removerItem5w2h } = useStore()
  const itens = itens5w2h.filter((i) => i.projetoId === projeto.id)
  const [aberto, setAberto] = useState(false)
  const [f, setF] = useState({ oQue: '', porQue: '', onde: '', quemId: '', quando: '', como: '', quanto: '', g: '3', u: '3', t: '3' })

  function salvar() {
    if (!f.oQue.trim()) return
    criarItem5w2h({
      projetoId: projeto.id,
      oQue: f.oQue.trim(), porQue: f.porQue.trim(), onde: f.onde.trim(),
      quemId: f.quemId || null, quando: f.quando, como: f.como.trim(),
      quanto: Number(f.quanto) || 0, g: Number(f.g), u: Number(f.u), t: Number(f.t),
      status: 'a_fazer',
    })
    setF({ oQue: '', porQue: '', onde: '', quemId: '', quando: '', como: '', quanto: '', g: '3', u: '3', t: '3' })
    setAberto(false)
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-800">5W2H + Matriz GUT</h2>
          <p className="text-xs text-slate-500">Plano de ação com priorização (GUT = G × U × T).</p>
        </div>
        <button className="btn-secondary" onClick={() => setAberto(true)}>
          <IconPlus width={16} height={16} /> Nova ação
        </button>
      </div>
      {itens.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-slate-400">Nenhuma ação cadastrada.</p>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2 font-medium">O quê</th>
                <th className="px-4 py-2 font-medium">Por quê</th>
                <th className="px-4 py-2 font-medium">Quem</th>
                <th className="px-4 py-2 font-medium">Quando</th>
                <th className="px-4 py-2 font-medium text-right">Quanto</th>
                <th className="px-4 py-2 font-medium text-center">GUT</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itens.map((i) => {
                const gut = i.g * i.u * i.t
                const quem = membros.find((m) => m.id === i.quemId)
                return (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">{i.oQue}</td>
                    <td className="px-4 py-2 text-slate-600">{i.porQue || '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{quem?.nome.split(' ')[0] ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{i.quando ? formatarData(i.quando) : '—'}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{i.quanto ? formatarBRL(i.quanto) : '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge className={gutCor(gut)}>{gut}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-slate-300 hover:text-rose-600" onClick={() => confirm('Excluir ação?') && removerItem5w2h(i.id)} aria-label="Excluir">
                        <IconLixeira width={15} height={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {aberto && (
        <Modal
          titulo="Nova ação (5W2H)"
          onClose={() => setAberto(false)}
          footer={
            <>
              <button className="btn-secondary" onClick={() => setAberto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={salvar} disabled={!f.oQue.trim()}>Adicionar</button>
            </>
          }
        >
          <div className="space-y-3">
            <Campo label="O QUÊ (What) *">
              <input className="input" value={f.oQue} onChange={(e) => setF({ ...f, oQue: e.target.value })} autoFocus />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="POR QUÊ (Why)">
                <input className="input" value={f.porQue} onChange={(e) => setF({ ...f, porQue: e.target.value })} />
              </Campo>
              <Campo label="ONDE (Where)">
                <input className="input" value={f.onde} onChange={(e) => setF({ ...f, onde: e.target.value })} />
              </Campo>
              <Campo label="QUEM (Who)">
                <select className="input" value={f.quemId} onChange={(e) => setF({ ...f, quemId: e.target.value })}>
                  <option value="">—</option>
                  {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </Campo>
              <Campo label="QUANDO (When)">
                <input type="date" className="input" value={f.quando} onChange={(e) => setF({ ...f, quando: e.target.value })} />
              </Campo>
            </div>
            <Campo label="COMO (How)">
              <input className="input" value={f.como} onChange={(e) => setF({ ...f, como: e.target.value })} />
            </Campo>
            <div className="grid grid-cols-4 gap-3">
              <Campo label="QUANTO R$">
                <input type="number" min="0" className="input" value={f.quanto} onChange={(e) => setF({ ...f, quanto: e.target.value })} />
              </Campo>
              {(['g', 'u', 't'] as const).map((k) => (
                <Campo key={k} label={k.toUpperCase()}>
                  <select className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Campo>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              GUT calculado: <strong>{Number(f.g) * Number(f.u) * Number(f.t)}</strong>
            </p>
          </div>
        </Modal>
      )}
    </section>
  )
}

// ------- Aba RACI -------
const PAPEIS: { v: 'R' | 'A' | 'C' | 'I' | ''; cor: string }[] = [
  { v: '', cor: 'text-slate-300' },
  { v: 'R', cor: 'text-blue-700 bg-blue-50' },
  { v: 'A', cor: 'text-rose-700 bg-rose-50' },
  { v: 'C', cor: 'text-amber-700 bg-amber-50' },
  { v: 'I', cor: 'text-slate-600 bg-slate-100' },
]

const MAX_EQUIPE = 3

function AbaRaci({ projeto }: { projeto: Projeto }) {
  const { membros, etapas, raci, atualizarProjeto, criarItemRaci, atualizarItemRaci, removerItemRaci } = useStore()
  const linhas = raci.filter((r) => r.projetoId === projeto.id)
  const [nova, setNova] = useState('')
  const [novoEnv, setNovoEnv] = useState({ nome: '', cargo: '' })

  // Columns = project team consultants (max 3) + client-side involved people.
  const equipe = projeto.equipeIds
    .map((id) => membros.find((m) => m.id === id))
    .filter((m): m is (typeof membros)[number] => Boolean(m))
  const pessoas: { id: string; nome: string; cliente: boolean }[] = [
    ...equipe.map((m) => ({ id: m.id, nome: m.nome.split(' ')[0], cliente: false })),
    ...projeto.envolvidos.map((e) => ({ id: e.id, nome: e.nome.split(' ')[0], cliente: true })),
  ]
  const foraDaEquipe = membros.filter((m) => !projeto.equipeIds.includes(m.id))

  function addConsultor(id: string) {
    if (!id || projeto.equipeIds.length >= MAX_EQUIPE || projeto.equipeIds.includes(id)) return
    atualizarProjeto(projeto.id, { equipeIds: [...projeto.equipeIds, id] })
  }
  function rmConsultor(id: string) {
    atualizarProjeto(projeto.id, { equipeIds: projeto.equipeIds.filter((x) => x !== id) })
  }
  function addEnvolvido() {
    if (!novoEnv.nome.trim()) return
    atualizarProjeto(projeto.id, {
      envolvidos: [
        ...projeto.envolvidos,
        { id: novoId(), nome: novoEnv.nome.trim(), cargo: novoEnv.cargo.trim() },
      ],
    })
    setNovoEnv({ nome: '', cargo: '' })
  }
  function rmEnvolvido(id: string) {
    atualizarProjeto(projeto.id, { envolvidos: projeto.envolvidos.filter((e) => e.id !== id) })
  }

  function adicionar(nome: string) {
    if (!nome.trim()) return
    criarItemRaci({ projetoId: projeto.id, atividade: nome.trim(), papeis: {} })
  }
  // Automation: create RACI rows from the project stages.
  function gerarDasEtapas() {
    etapas
      .filter((e) => e.projetoId === projeto.id)
      .sort((a, b) => a.ordem - b.ordem)
      .forEach((e) => {
        if (!linhas.some((l) => l.atividade === e.nome)) {
          criarItemRaci({ projetoId: projeto.id, atividade: e.nome, papeis: {} })
        }
      })
  }
  function setPapel(id: string, pessoaId: string, valor: string) {
    const linha = linhas.find((l) => l.id === id)
    if (!linha) return
    atualizarItemRaci(id, { papeis: { ...linha.papeis, [pessoaId]: valor as never } })
  }

  return (
    <div className="space-y-5">
      {/* Equipe do projeto + envolvidos do cliente */}
      <section className="card p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Equipe do projeto <span className="font-normal text-slate-400">(máx. {MAX_EQUIPE} consultores)</span>
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {equipe.map((m) => (
                <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full border border-brand-400 bg-brand-50 py-1 pl-1 pr-2 text-sm text-brand-700">
                  <Avatar membro={m} size="sm" />
                  {m.nome.split(' ')[0]}
                  <button className="text-brand-400 hover:text-rose-600" onClick={() => rmConsultor(m.id)} aria-label={`Remover ${m.nome}`}>×</button>
                </span>
              ))}
              {equipe.length === 0 && <span className="text-sm text-slate-400">Nenhum consultor ainda.</span>}
            </div>
            {projeto.equipeIds.length < MAX_EQUIPE ? (
              <select className="input mt-3 max-w-[220px]" value="" onChange={(e) => addConsultor(e.target.value)}>
                <option value="">+ Adicionar consultor…</option>
                {foraDaEquipe.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            ) : (
              <p className="mt-3 text-xs text-slate-400">Limite de {MAX_EQUIPE} consultores atingido.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">Envolvidos do cliente</h3>
            <div className="mt-2 space-y-1.5">
              {projeto.envolvidos.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-sm">
                  <Badge className="bg-amber-100 text-amber-700">Cliente</Badge>
                  <span className="font-medium text-slate-700">{e.nome}</span>
                  {e.cargo && <span className="text-xs text-slate-400">· {e.cargo}</span>}
                  <button className="ml-auto text-slate-300 hover:text-rose-600" onClick={() => rmEnvolvido(e.id)} aria-label={`Remover ${e.nome}`}>
                    <IconLixeira width={14} height={14} />
                  </button>
                </div>
              ))}
              {projeto.envolvidos.length === 0 && <span className="text-sm text-slate-400">Nenhum envolvido do cliente.</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <input className="input max-w-[150px]" placeholder="Nome" value={novoEnv.nome} onChange={(e) => setNovoEnv({ ...novoEnv, nome: e.target.value })} />
              <input className="input max-w-[150px]" placeholder="Cargo na empresa" value={novoEnv.cargo} onChange={(e) => setNovoEnv({ ...novoEnv, cargo: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addEnvolvido()} />
              <button className="btn-secondary" onClick={addEnvolvido}>
                <IconPlus width={16} height={16} /> Adicionar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Matriz RACI */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">Matriz RACI</h2>
            <p className="text-xs text-slate-500">R responsável · A autoridade · C consultado · I informado</p>
          </div>
          {etapas.some((e) => e.projetoId === projeto.id) && (
            <button className="btn-secondary" onClick={gerarDasEtapas}>Gerar das etapas</button>
          )}
        </div>
        {pessoas.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-slate-400">
            Defina a equipe do projeto e os envolvidos do cliente acima para montar a matriz.
          </p>
        ) : linhas.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-slate-400">
            Nenhuma atividade. Adicione abaixo ou gere a partir das etapas.
          </p>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2 text-left font-medium">Atividade</th>
                  {pessoas.map((p) => (
                    <th key={p.id} className="px-2 py-2 text-center font-medium" title={p.nome}>
                      <span className={p.cliente ? 'text-amber-600' : ''}>{p.nome}</span>
                      {p.cliente && <span className="block text-[9px] font-normal text-amber-400">cliente</span>}
                    </th>
                  ))}
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {linhas.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-2 font-medium text-slate-800">{l.atividade}</td>
                    {pessoas.map((p) => (
                      <td key={p.id} className="px-1 py-1 text-center">
                        <select
                          value={l.papeis[p.id] ?? ''}
                          onChange={(e) => setPapel(l.id, p.id, e.target.value)}
                          className={`w-12 rounded border border-slate-200 px-1 py-1 text-center text-xs font-semibold ${
                            PAPEIS.find((x) => x.v === (l.papeis[p.id] ?? ''))?.cor ?? ''
                          }`}
                        >
                          {PAPEIS.map((x) => (
                            <option key={x.v} value={x.v}>{x.v || '—'}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                    <td className="px-2 py-1 text-right">
                      <button className="text-slate-300 hover:text-rose-600" onClick={() => removerItemRaci(l.id)} aria-label="Remover">
                        <IconLixeira width={15} height={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
          <input
            className="input max-w-[280px]"
            placeholder="Nova atividade / entrega"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                adicionar(nova)
                setNova('')
              }
            }}
          />
          <button className="btn-secondary" onClick={() => { adicionar(nova); setNova('') }}>
            <IconPlus width={16} height={16} /> Adicionar
          </button>
        </div>
      </section>
    </div>
  )
}

export default function ProjetoDetalhe() {
  const { id } = useParams()
  const { projetos, clientes, etapas, tarefas, despesas, removerDespesa } = useStore()

  const projeto = projetos.find((p) => p.id === id)
  const [etapaForm, setEtapaForm] = useState<{ open: boolean; etapa?: Etapa | null }>({ open: false })
  const [tarefaForm, setTarefaForm] = useState<{ open: boolean; tarefa?: Tarefa | null; etapaId?: string }>({ open: false })
  const [roteiroForm, setRoteiroForm] = useState<Etapa | null>(null)
  const [despesaForm, setDespesaForm] = useState(false)
  const [aba, setAba] = useState<'geral' | 'tap' | '5w2h' | 'raci'>('geral')

  const etapasDoProjeto = useMemo(
    () => etapas.filter((e) => e.projetoId === id).sort((a, b) => a.ordem - b.ordem),
    [etapas, id],
  )
  const tarefasDoProjeto = useMemo(() => tarefas.filter((t) => t.projetoId === id), [tarefas, id])
  const despesasDoProjeto = useMemo(
    () => despesas.filter((d) => d.projetoId === id).sort((a, b) => b.data.localeCompare(a.data)),
    [despesas, id],
  )
  const totalDespesas = despesasDoProjeto.reduce((s, d) => s + d.valor, 0)

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

      {/* Abas de gerenciamento */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {([
          ['geral', 'Visão geral'],
          ['tap', 'TAP (PMBOK)'],
          ['5w2h', '5W2H'],
          ['raci', 'RACI'],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setAba(k)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              aba === k
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'tap' && <AbaTAP projeto={projeto} />}
      {aba === '5w2h' && <Aba5W2H projeto={projeto} />}
      {aba === 'raci' && <AbaRaci projeto={projeto} />}

      {aba === 'geral' && (
        <>
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
              <div className="flex items-center gap-1">
                <button
                  className="btn-ghost text-sm"
                  onClick={() => setRoteiroForm(etapa)}
                >
                  Roteiro{etapa.roteiro.length > 0 ? ` (${etapa.roteiro.length})` : ''}
                </button>
                <button
                  className="btn-ghost text-sm"
                  onClick={() => setTarefaForm({ open: true, tarefa: null, etapaId: etapa.id })}
                >
                  <IconPlus width={14} height={14} />
                  Atividade
                </button>
              </div>
            </div>

            {/* Roteiro / material-base para guiar os consultores */}
            {etapa.roteiro.length > 0 && (
              <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Roteiro de apoio
                </p>
                <ol className="space-y-2">
                  {etapa.roteiro.map((p, i) => (
                    <li key={p.id} className="flex gap-2.5">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${etapa.cor}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700">{p.titulo}</p>
                        {p.descricao && <p className="text-xs text-slate-500">{p.descricao}</p>}
                        {p.materialUrl && (
                          <a href={p.materialUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-600 hover:underline">
                            📎 Material de apoio
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

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

      {/* Despesas */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <span className="font-semibold text-slate-800">Despesas</span>
            <span className="ml-2 text-sm text-slate-500">
              Total: <strong className="text-slate-700">{formatarBRL(totalDespesas)}</strong>
            </span>
          </div>
          <button className="btn-ghost text-sm" onClick={() => setDespesaForm(true)}>
            <IconPlus width={14} height={14} />
            Nova despesa
          </button>
        </div>
        {despesasDoProjeto.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            Nenhuma despesa lançada. Registre alimentação, transporte, hospedagem, materiais, assinaturas ou serviços.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {despesasDoProjeto.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                <Badge className="bg-slate-100 text-slate-600">{d.categoria}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700">{d.descricao || d.categoria}</p>
                  <p className="text-xs text-slate-400">{formatarData(d.data)}</p>
                </div>
                <span className="shrink-0 text-sm font-medium text-slate-700">{formatarBRL(d.valor)}</span>
                <button
                  className="btn-ghost h-8 w-8 !p-0 text-slate-400 hover:text-rose-600"
                  onClick={() => confirm('Excluir esta despesa?') && removerDespesa(d.id)}
                  aria-label="Excluir despesa"
                >
                  <IconLixeira width={15} height={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

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
        </>
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
      {despesaForm && <DespesaForm projetoId={projeto.id} onClose={() => setDespesaForm(false)} />}
      {roteiroForm && <RoteiroForm etapa={roteiroForm} onClose={() => setRoteiroForm(null)} />}
    </div>
  )
}
