import { useMemo, useState } from 'react'
import { useStore } from '../data/store'
import { formatarData, hojeIso } from '../lib/dates'
import { Avatar, Campo, EmptyState, Modal } from '../components/ui'
import { IconLixeira, IconPlus } from '../components/icons'

// Training-hours goal per person used by the indicator.
const META_HORAS = 20

function TreinamentoForm({ onClose }: { onClose: () => void }) {
  const { membros, criarTreinamento } = useStore()
  const [membroId, setMembroId] = useState(membros[0]?.id ?? '')
  const [tema, setTema] = useState('')
  const [horas, setHoras] = useState('')
  const [data, setData] = useState(hojeIso())

  function salvar() {
    const h = Number(horas)
    if (!membroId || !tema.trim() || !h) return
    criarTreinamento({ membroId, tema: tema.trim(), horas: h, data })
    onClose()
  }

  return (
    <Modal
      titulo="Novo treinamento"
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={salvar} disabled={!tema.trim() || !Number(horas)}>
            Registrar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Colaborador *">
            <select className="input" value={membroId} onChange={(e) => setMembroId(e.target.value)}>
              {membros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Data">
            <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} />
          </Campo>
        </div>
        <Campo label="Tema do treinamento *">
          <input className="input" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: Reforma tributária 2026" autoFocus />
        </Campo>
        <Campo label="Carga horária (h) *">
          <input type="number" min="0" step="0.5" className="input" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="Ex.: 8" />
        </Campo>
      </div>
    </Modal>
  )
}

export default function Treinamentos() {
  const { membros, treinamentos, removerTreinamento } = useStore()
  const [novo, setNovo] = useState(false)

  const porMembro = useMemo(
    () =>
      membros
        .map((m) => ({
          membro: m,
          horas: treinamentos.filter((t) => t.membroId === m.id).reduce((s, t) => s + t.horas, 0),
        }))
        .sort((a, b) => b.horas - a.horas),
    [membros, treinamentos],
  )

  const lancamentos = useMemo(
    () => [...treinamentos].sort((a, b) => b.data.localeCompare(a.data)),
    [treinamentos],
  )

  const totalHoras = porMembro.reduce((s, x) => s + x.horas, 0)
  const treinados = porMembro.filter((x) => x.horas > 0).length
  const media = membros.length ? Math.round((totalHoras / membros.length) * 10) / 10 : 0
  const nomeMembro = (id: string) => membros.find((m) => m.id === id)?.nome ?? '—'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Treinamentos</h1>
          <p className="text-sm text-slate-500">
            Horas de treinamento por colaborador e evolução da capacitação.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setNovo(true)}>
          <IconPlus width={16} height={16} />
          Novo treinamento
        </button>
      </header>

      {/* Indicadores gerais */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-bold leading-none text-slate-800">{totalHoras}h</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Total de horas</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold leading-none text-slate-800">{treinados}/{membros.length}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Colaboradores treinados</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold leading-none text-slate-800">{media}h</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Média por colaborador</p>
        </div>
      </div>

      {/* Indicador por colaborador (vs meta) */}
      <section className="card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Horas de treinamento por colaborador</h2>
          <p className="text-xs text-slate-500">Meta de referência: {META_HORAS}h por colaborador.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {porMembro.map(({ membro, horas }) => {
            const pct = Math.min(Math.round((horas / META_HORAS) * 100), 100)
            const atingiu = horas >= META_HORAS
            return (
              <div key={membro.id} className="flex items-center gap-4 px-5 py-3">
                <Avatar membro={membro} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-800">{membro.nome}</p>
                    <span className="shrink-0 text-xs font-medium text-slate-500">
                      {horas}h <span className="text-slate-400">/ {META_HORAS}h</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${atingiu ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-500">{pct}%</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Lançamentos */}
      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Registros</h2>
        </div>
        {lancamentos.length === 0 ? (
          <EmptyState
            titulo="Nenhum treinamento registrado"
            descricao="Registre as capacitações da equipe para acompanhar o indicador."
            acao={
              <button className="btn-primary" onClick={() => setNovo(true)}>
                <IconPlus width={16} height={16} />
                Novo treinamento
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {lancamentos.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar membro={membros.find((m) => m.id === t.membroId)} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{t.tema}</p>
                  <p className="truncate text-xs text-slate-500">
                    {nomeMembro(t.membroId)} · {formatarData(t.data)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-700">{t.horas}h</span>
                <button
                  className="btn-ghost h-9 w-9 !p-0 text-slate-400 hover:text-rose-600"
                  onClick={() => confirm('Excluir este registro?') && removerTreinamento(t.id)}
                  aria-label="Excluir treinamento"
                >
                  <IconLixeira width={16} height={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {novo && <TreinamentoForm onClose={() => setNovo(false)} />}
    </div>
  )
}
