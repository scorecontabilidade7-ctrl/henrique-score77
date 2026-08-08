import { useMemo, useState } from 'react'
import { useStore } from '../data/store'
import type { FrequenciaRecorrencia, Recorrencia } from '../types'
import { formatarData } from '../lib/dates'
import { Avatar, Campo, EmptyState, Modal } from '../components/ui'
import { IconPlus } from '../components/icons'

const DIAS = [
  { n: 0, curto: 'DOM', label: 'Domingo' },
  { n: 1, curto: 'SEG', label: 'Segunda' },
  { n: 2, curto: 'TER', label: 'Terça' },
  { n: 3, curto: 'QUA', label: 'Quarta' },
  { n: 4, curto: 'QUI', label: 'Quinta' },
  { n: 5, curto: 'SEX', label: 'Sexta' },
  { n: 6, curto: 'SAB', label: 'Sábado' },
]

function ChipsRepeticao({ r }: { r: Recorrencia }) {
  if (r.frequencia === 'semanalmente') {
    return <span className="badge bg-brand-100 text-brand-700">SEMANALMENTE</span>
  }
  return (
    <div className="flex max-w-[180px] flex-wrap gap-1">
      {DIAS.filter((d) => r.dias.includes(d.n)).map((d) => (
        <span key={d.n} className="badge bg-sky-500 text-white">
          {d.curto}
        </span>
      ))}
    </div>
  )
}

function RecorrenciaForm({
  registro,
  onClose,
}: {
  registro?: Recorrencia | null
  onClose: () => void
}) {
  const { projetos, etapas, membros, criarRecorrencia, atualizarRecorrencia, removerRecorrencia } = useStore()
  const [titulo, setTitulo] = useState(registro?.titulo ?? '')
  const [projetoId, setProjetoId] = useState(registro?.projetoId ?? '')
  const [etapaId, setEtapaId] = useState(registro?.etapaId ?? '')
  const [responsaveisIds, setResponsaveisIds] = useState<string[]>(registro?.responsaveisIds ?? [])
  const [frequencia, setFrequencia] = useState<FrequenciaRecorrencia>(registro?.frequencia ?? 'dias_semana')
  const [dias, setDias] = useState<number[]>(registro?.dias ?? [1, 2, 3, 4, 5])
  const [semTermino, setSemTermino] = useState(registro ? registro.termino === null : true)
  const [termino, setTermino] = useState(registro?.termino ?? '')

  const etapasDoProjeto = etapas
    .filter((e) => e.projetoId === projetoId)
    .sort((a, b) => a.ordem - b.ordem)

  function toggleDia(n: number) {
    setDias((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n].sort()))
  }
  function toggleResp(id: string) {
    setResponsaveisIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))
  }

  function salvar() {
    if (!titulo.trim()) return
    const payload = {
      titulo: titulo.trim(),
      projetoId: projetoId || null,
      etapaId: projetoId ? etapaId || null : null,
      responsaveisIds,
      frequencia,
      dias: frequencia === 'dias_semana' ? dias : [],
      ativa: registro?.ativa ?? true,
      termino: semTermino ? null : termino || null,
    }
    if (registro) atualizarRecorrencia(registro.id, payload)
    else criarRecorrencia(payload)
    onClose()
  }

  return (
    <Modal
      titulo={registro ? 'Editar recorrência' : 'Nova recorrência'}
      onClose={onClose}
      footer={
        <>
          {registro && (
            <button
              className="btn-ghost mr-auto text-rose-600 hover:bg-rose-50"
              onClick={() => {
                if (confirm('Excluir esta recorrência?')) {
                  removerRecorrencia(registro.id)
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
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Campo label="Tarefa (título) *">
          <input
            className="input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Alinhamento diário consultoria"
            autoFocus
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Projeto">
            <select className="input" value={projetoId} onChange={(e) => { setProjetoId(e.target.value); setEtapaId('') }}>
              <option value="">— Sem projeto —</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Etapa">
            <select className="input" value={etapaId} onChange={(e) => setEtapaId(e.target.value)} disabled={!projetoId}>
              <option value="">— Sem etapa —</option>
              {etapasDoProjeto.map((e) => (
                <option key={e.id} value={e.id}>{e.ordem}. {e.nome}</option>
              ))}
            </select>
          </Campo>
        </div>

        <div>
          <span className="label">Responsáveis</span>
          <div className="flex flex-wrap gap-2">
            {membros.map((m) => {
              const sel = responsaveisIds.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleResp(m.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-sm transition-colors ${
                    sel ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Avatar membro={m} size="sm" />
                  {m.nome.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span className="label">Repetição</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="radio" name="freq" checked={frequencia === 'dias_semana'} onChange={() => setFrequencia('dias_semana')} className="accent-brand-600" />
              Dias da semana
            </label>
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="radio" name="freq" checked={frequencia === 'semanalmente'} onChange={() => setFrequencia('semanalmente')} className="accent-brand-600" />
              Semanalmente
            </label>
          </div>
          {frequencia === 'dias_semana' && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DIAS.map((d) => {
                const sel = dias.includes(d.n)
                return (
                  <button
                    key={d.n}
                    type="button"
                    onClick={() => toggleDia(d.n)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      sel ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {d.curto}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <span className="label">Término</span>
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input type="checkbox" checked={semTermino} onChange={(e) => setSemTermino(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
            Nunca
          </label>
          {!semTermino && (
            <input type="date" className="input mt-2 max-w-[200px]" value={termino} onChange={(e) => setTermino(e.target.value)} />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default function Recorrencias() {
  const { recorrencias, projetos, etapas, atualizarRecorrencia } = useStore()
  const [exibirInativos, setExibirInativos] = useState(false)
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState<{ open: boolean; registro?: Recorrencia | null }>({ open: false })

  const lista = useMemo(() => {
    return recorrencias
      .filter((r) => (exibirInativos ? true : r.ativa))
      .filter((r) => r.titulo.toLowerCase().includes(busca.toLowerCase().trim()))
      .sort((a, b) => Number(b.ativa) - Number(a.ativa) || a.titulo.localeCompare(b.titulo))
  }, [recorrencias, exibirInativos, busca])

  const nomeProjeto = (id: string | null) => (id ? projetos.find((p) => p.id === id)?.nome ?? '—' : '—')
  const nomeEtapa = (id: string | null) => (id ? etapas.find((e) => e.id === id)?.nome : null)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recorrência de tarefas</h1>
          <p className="text-sm text-slate-500">Listando {lista.length} tarefa(s) recorrente(s).</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={exibirInativos}
              onChange={(e) => setExibirInativos(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-brand-600"
            />
            Exibir inativos
          </label>
          <button className="btn-primary" onClick={() => setForm({ open: true, registro: null })}>
            <IconPlus width={16} height={16} />
            Nova recorrência
          </button>
        </div>
      </header>

      <input
        className="input max-w-sm"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por tarefa…"
      />

      {lista.length === 0 ? (
        <EmptyState
          titulo="Nenhuma recorrência"
          descricao="Crie tarefas que se repetem sempre (diárias, semanais) para não esquecer nada."
          acao={
            <button className="btn-primary" onClick={() => setForm({ open: true, registro: null })}>
              <IconPlus width={16} height={16} /> Nova recorrência
            </button>
          }
        />
      ) : (
        <div className="card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium">Tarefa</th>
                <th className="px-4 py-3 font-medium">Repetição</th>
                <th className="px-4 py-3 font-medium">Término</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => atualizarRecorrencia(r.id, { ativa: !r.ativa })}
                      className={`rounded-full px-3 py-1 text-xs font-bold text-white ${r.ativa ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      title="Ativar/desativar"
                    >
                      {r.ativa ? 'ATIVA' : 'INATIVA'}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{r.id.slice(-4).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-brand-600">{nomeProjeto(r.projetoId)}</p>
                    {nomeEtapa(r.etapaId) && <p className="text-xs font-medium text-slate-500">{nomeEtapa(r.etapaId)}</p>}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.titulo}</td>
                  <td className="px-4 py-3"><ChipsRepeticao r={r} /></td>
                  <td className="px-4 py-3 text-slate-600">{r.termino ? formatarData(r.termino) : 'Nunca'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-slate-500 hover:underline" onClick={() => setForm({ open: true, registro: r })}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form.open && <RecorrenciaForm registro={form.registro} onClose={() => setForm({ open: false })} />}
    </div>
  )
}
