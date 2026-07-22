import { useState } from 'react'
import { useStore } from '../data/store'
import type { Cliente, RegimeTributario } from '../types'
import { REGIMES, regimeLabel } from '../lib/labels'
import { formatarBRL } from '../lib/dates'
import { Avatar, Badge, Campo, EmptyState, Modal } from '../components/ui'
import { IconEditar, IconPlus } from '../components/icons'

function ClienteForm({ cliente, onClose }: { cliente?: Cliente | null; onClose: () => void }) {
  const { membros, criarCliente, atualizarCliente, removerCliente } = useStore()
  const [nome, setNome] = useState(cliente?.nome ?? '')
  const [cnpj, setCnpj] = useState(cliente?.cnpj ?? '')
  const [regime, setRegime] = useState<RegimeTributario>(cliente?.regime ?? 'simples_nacional')
  const [responsavelId, setResponsavelId] = useState(cliente?.responsavelId ?? '')
  const [ativo, setAtivo] = useState(cliente?.ativo ?? true)
  const [valorMensal, setValorMensal] = useState(
    cliente?.valorMensal ? String(cliente.valorMensal) : '',
  )
  const [segmento, setSegmento] = useState(cliente?.segmento ?? '')

  function salvar() {
    if (!nome.trim()) return
    const payload = {
      nome: nome.trim(),
      cnpj: cnpj.trim(),
      regime,
      responsavelId: responsavelId || null,
      ativo,
      valorMensal: Number(valorMensal) || 0,
      segmento: segmento.trim(),
    }
    if (cliente) atualizarCliente(cliente.id, payload)
    else criarCliente(payload)
    onClose()
  }

  return (
    <Modal
      titulo={cliente ? 'Editar cliente' : 'Novo cliente'}
      onClose={onClose}
      footer={
        <>
          {cliente && (
            <button
              className="btn-ghost mr-auto text-rose-600 hover:bg-rose-50"
              onClick={() => {
                if (confirm('Excluir este cliente? As tarefas ligadas a ele ficarão sem cliente.')) {
                  removerCliente(cliente.id)
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
      <div className="space-y-4">
        <Campo label="Nome / Razão social *">
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="CNPJ">
            <input className="input" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
          </Campo>
          <Campo label="Regime tributário">
            <select className="input" value={regime} onChange={(e) => setRegime(e.target.value as RegimeTributario)}>
              {REGIMES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Responsável">
            <select className="input" value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)}>
              <option value="">— Sem responsável —</option>
              {membros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Situação">
            <select className="input" value={ativo ? 'sim' : 'nao'} onChange={(e) => setAtivo(e.target.value === 'sim')}>
              <option value="sim">Ativo</option>
              <option value="nao">Inativo</option>
            </select>
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Valor mensal (R$)">
            <input
              type="number"
              min="0"
              step="50"
              className="input"
              value={valorMensal}
              onChange={(e) => setValorMensal(e.target.value)}
              placeholder="Ex.: 1500"
            />
          </Campo>
          <Campo label="Segmento / Nicho">
            <input
              className="input"
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              placeholder="Ex.: Saúde e Bem Estar"
            />
          </Campo>
        </div>
      </div>
    </Modal>
  )
}

export default function Clientes() {
  const { clientes, membros, tarefas } = useStore()
  const [form, setForm] = useState<{ open: boolean; cliente?: Cliente | null }>({ open: false })

  const abertasDoCliente = (id: string) =>
    tarefas.filter((t) => t.clienteId === id && t.status !== 'concluido').length

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-500">A carteira do escritório.</p>
        </div>
        <button className="btn-primary" onClick={() => setForm({ open: true, cliente: null })}>
          <IconPlus width={16} height={16} />
          Novo cliente
        </button>
      </header>

      {clientes.length === 0 ? (
        <EmptyState
          titulo="Nenhum cliente cadastrado"
          descricao="Cadastre os clientes da carteira para vincular tarefas e projetos a eles."
          acao={
            <button className="btn-primary" onClick={() => setForm({ open: true, cliente: null })}>
              <IconPlus width={16} height={16} />
              Novo cliente
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Segmento</th>
                  <th className="px-5 py-3 font-medium">Responsável</th>
                  <th className="px-5 py-3 font-medium">Valor mensal</th>
                  <th className="px-5 py-3 font-medium">Tarefas abertas</th>
                  <th className="px-5 py-3 font-medium">Situação</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientes.map((c) => {
                  const resp = membros.find((m) => m.id === c.responsavelId)
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{c.nome}</p>
                        <p className="text-xs text-slate-400">{c.cnpj || '—'}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {c.segmento || '—'}
                        <span className="block text-xs text-slate-400">{regimeLabel(c.regime)}</span>
                      </td>
                      <td className="px-5 py-3">
                        {resp ? (
                          <span className="flex items-center gap-2">
                            <Avatar membro={resp} size="sm" />
                            <span className="text-slate-600">{resp.nome}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-slate-700">
                          {c.valorMensal ? formatarBRL(c.valorMensal) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-slate-700">{abertasDoCliente(c.id)}</span>
                      </td>
                      <td className="px-5 py-3">
                        {c.ativo ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500">Inativo</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          className="btn-ghost h-9 w-9 !p-0"
                          onClick={() => setForm({ open: true, cliente: c })}
                          aria-label="Editar"
                        >
                          <IconEditar width={16} height={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {form.open && <ClienteForm cliente={form.cliente} onClose={() => setForm({ open: false })} />}
    </div>
  )
}
