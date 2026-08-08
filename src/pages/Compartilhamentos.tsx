import { useMemo, useState } from 'react'
import { useStore } from '../data/store'
import type { Anexo, Compartilhamento } from '../types'
import { formatarData } from '../lib/dates'
import { Badge, Campo, EmptyState } from '../components/ui'
import { IconLixeira, IconPlus } from '../components/icons'

const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function linkDoShare(id: string) {
  // Hash route so it works on any static host / inside the artifact iframe.
  return `${location.origin}${location.pathname}#/c/${id}`
}

/** Full-page "Novo/Editar compartilhamento" form, mirroring the reference screen. */
function ShareForm({
  registro,
  onClose,
}: {
  registro?: Compartilhamento | null
  onClose: () => void
}) {
  const { projetos, clientes, criarCompartilhamento, atualizarCompartilhamento } = useStore()
  const [projetoId, setProjetoId] = useState(registro?.projetoId ?? '')
  const [titulo, setTitulo] = useState(registro?.titulo ?? '')
  const [mensagem, setMensagem] = useState(registro?.mensagem ?? '')
  const [destinatarios, setDestinatarios] = useState((registro?.destinatarios ?? []).join(', '))
  const [qualquerComLink, setQualquerComLink] = useState(registro?.qualquerComLink ?? false)
  const [protegido, setProtegido] = useState(registro?.protegido ?? false)
  const [senha, setSenha] = useState(registro?.senha ?? '')
  const [solicitarAprovacao, setSolicitarAprovacao] = useState(registro?.solicitarAprovacao ?? false)
  const [anexos, setAnexos] = useState<Anexo[]>(registro?.anexos ?? [])

  const clienteNome = (pid: string) => {
    const proj = projetos.find((p) => p.id === pid)
    return clientes.find((c) => c.id === proj?.clienteId)?.nome
  }

  function addAnexo() {
    setAnexos((a) => [...a, { id: novoId(), nome: '', url: '' }])
  }
  function setAnexo(id: string, patch: Partial<Anexo>) {
    setAnexos((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }
  function rmAnexo(id: string) {
    setAnexos((a) => a.filter((x) => x.id !== id))
  }

  const destinatariosLista = destinatarios
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const podeSalvar =
    !!projetoId && !!titulo.trim() && (qualquerComLink || destinatariosLista.length > 0)

  function compartilhar() {
    if (!podeSalvar) return
    const payload = {
      projetoId,
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      destinatarios: destinatariosLista,
      qualquerComLink,
      protegido,
      senha: protegido ? senha : '',
      solicitarAprovacao,
      anexos: anexos.filter((a) => a.nome.trim() || a.url.trim()),
    }
    if (registro) {
      atualizarCompartilhamento(registro.id, payload)
      onClose()
    } else {
      const id = criarCompartilhamento(payload)
      const link = linkDoShare(id)
      navigator.clipboard?.writeText(link).catch(() => {})
      alert(`Compartilhamento criado!\n\nLink (copiado):\n${link}`)
      onClose()
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button className="text-brand-600 hover:underline" onClick={onClose} aria-label="Voltar">
          ‹
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {registro ? 'Editar compartilhamento' : 'Novo compartilhamento'}
        </h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Coluna esquerda */}
        <div className="space-y-4">
          <Campo label="Projeto *">
            <select className="input" value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
              <option value="">Selecione um projeto</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                  {clienteNome(p.id) ? ` — ${clienteNome(p.id)}` : ''}
                </option>
              ))}
            </select>
          </Campo>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="label mb-0">Título do compartilhamento *</span>
              <span className="text-xs text-slate-400">{titulo.length}/100</span>
            </div>
            <input
              className="input"
              maxLength={100}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Relatórios financeiros do trimestre"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="label mb-0">Mensagem</span>
              <span className="text-xs text-slate-400">{mensagem.length}/4000</span>
            </div>
            <textarea
              className="input min-h-[140px] resize-y"
              maxLength={4000}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Escreva uma mensagem para o cliente…"
            />
          </div>

          <Campo label="Destinatários *">
            <input
              className="input"
              value={destinatarios}
              onChange={(e) => setDestinatarios(e.target.value)}
              placeholder="email@cliente.com, outro@cliente.com"
            />
            <label className="mt-2 flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={qualquerComLink}
                onChange={(e) => setQualquerComLink(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600"
              />
              <span>
                Qualquer um com o link{' '}
                <span className="text-brand-600">O link é gerado ao clicar em “Compartilhar”.</span>
              </span>
            </label>
          </Campo>

          <div>
            <span className="label">Deseja proteger a página com senha?</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-sm text-slate-600">
                <input type="radio" name="senha" checked={protegido} onChange={() => setProtegido(true)} className="accent-brand-600" />
                Sim
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-600">
                <input type="radio" name="senha" checked={!protegido} onChange={() => setProtegido(false)} className="accent-brand-600" />
                Não
              </label>
            </div>
            {protegido && (
              <input
                className="input mt-2 max-w-[240px]"
                type="text"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Defina uma senha"
              />
            )}
          </div>
        </div>

        {/* Coluna direita — anexos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label mb-0">Anexos</span>
            <button className="btn-ghost text-sm text-brand-600" onClick={addAnexo}>
              <IconPlus width={16} height={16} /> Adicionar anexo
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Cole o link do <strong>Google Drive</strong> (ou outro) de cada arquivo do cliente.
          </p>

          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={solicitarAprovacao}
              onChange={(e) => setSolicitarAprovacao(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-brand-600"
            />
            Solicitar aprovação
          </label>

          <div className="min-h-[280px] space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {anexos.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">
                Nenhum anexo. Clique em “Adicionar anexo” para incluir um link do Drive.
              </p>
            )}
            {anexos.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-md bg-white p-2">
                <div className="flex-1 space-y-1">
                  <input
                    className="input py-1.5 text-sm"
                    value={a.nome}
                    onChange={(e) => setAnexo(a.id, { nome: e.target.value })}
                    placeholder="Nome do arquivo"
                  />
                  <input
                    className="input py-1.5 text-sm"
                    value={a.url}
                    onChange={(e) => setAnexo(a.id, { url: e.target.value })}
                    placeholder="https://drive.google.com/…"
                  />
                </div>
                <button
                  className="text-slate-300 hover:text-rose-600"
                  onClick={() => rmAnexo(a.id)}
                  aria-label="Remover anexo"
                >
                  <IconLixeira width={16} height={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn-primary" onClick={compartilhar} disabled={!podeSalvar}>
          {registro ? 'Salvar' : 'Compartilhar'}
        </button>
      </div>
    </div>
  )
}

export default function Compartilhamentos() {
  const { compartilhamentos, projetos, clientes, removerCompartilhamento } = useStore()
  const [form, setForm] = useState<{ open: boolean; registro?: Compartilhamento | null }>({ open: false })

  const lista = useMemo(
    () => [...compartilhamentos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    [compartilhamentos],
  )
  const nomeProjeto = (id: string) => projetos.find((p) => p.id === id)?.nome ?? '—'
  const nomeCliente = (pid: string) => {
    const proj = projetos.find((p) => p.id === pid)
    return clientes.find((c) => c.id === proj?.clienteId)?.nome
  }

  function copiarLink(id: string) {
    const link = linkDoShare(id)
    navigator.clipboard?.writeText(link).catch(() => {})
    alert(`Link copiado:\n${link}`)
  }

  if (form.open) {
    return <ShareForm registro={form.registro} onClose={() => setForm({ open: false })} />
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Compartilhamentos</h1>
          <p className="text-sm text-slate-500">
            Páginas com arquivos do cliente — anexe links do Google Drive e envie por um link seguro.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setForm({ open: true, registro: null })}>
          <IconPlus width={16} height={16} />
          Novo compartilhamento
        </button>
      </header>

      {lista.length === 0 ? (
        <EmptyState
          titulo="Nenhum compartilhamento"
          descricao="Crie um compartilhamento para enviar relatórios e arquivos do Drive ao cliente."
          acao={
            <button className="btn-primary" onClick={() => setForm({ open: true, registro: null })}>
              <IconPlus width={16} height={16} /> Novo compartilhamento
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lista.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{s.titulo}</p>
                  <p className="truncate text-xs text-slate-500">
                    {nomeProjeto(s.projetoId)}
                    {nomeCliente(s.projetoId) ? ` · ${nomeCliente(s.projetoId)}` : ''}
                  </p>
                </div>
                <button
                  className="text-slate-300 hover:text-rose-600"
                  onClick={() => confirm('Excluir este compartilhamento?') && removerCompartilhamento(s.id)}
                  aria-label="Excluir"
                >
                  <IconLixeira width={16} height={16} />
                </button>
              </div>

              {s.mensagem && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{s.mensagem}</p>}

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge className="bg-slate-100 text-slate-600">{s.anexos.length} anexo(s)</Badge>
                {s.qualquerComLink ? (
                  <Badge className="bg-sky-100 text-sky-700">Qualquer com o link</Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600">{s.destinatarios.length} destinatário(s)</Badge>
                )}
                {s.protegido && <Badge className="bg-amber-100 text-amber-700">Com senha</Badge>}
                {s.solicitarAprovacao && <Badge className="bg-violet-100 text-violet-700">Aprovação</Badge>}
              </div>

              <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-sm">
                <a href={linkDoShare(s.id)} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                  Abrir página
                </a>
                <button className="text-brand-600 hover:underline" onClick={() => copiarLink(s.id)}>
                  Copiar link
                </button>
                <button className="text-slate-500 hover:underline" onClick={() => setForm({ open: true, registro: s })}>
                  Editar
                </button>
                <span className="ml-auto text-xs text-slate-400">{formatarData(s.criadoEm.slice(0, 10))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
