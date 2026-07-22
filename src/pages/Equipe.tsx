import { useState } from 'react'
import { useStore } from '../data/store'
import type { Membro } from '../types'
import { cargaPorMembro } from '../lib/workload'
import { CORES_AVATAR } from '../lib/labels'
import { Avatar, Campo, EmptyState, Modal } from '../components/ui'
import { IconEditar, IconPlus } from '../components/icons'

function MembroForm({ membro, onClose }: { membro?: Membro | null; onClose: () => void }) {
  const { membros, criarMembro, atualizarMembro, removerMembro } = useStore()
  const [nome, setNome] = useState(membro?.nome ?? '')
  const [cargo, setCargo] = useState(membro?.cargo ?? '')
  const [email, setEmail] = useState(membro?.email ?? '')
  const [cor, setCor] = useState(
    membro?.cor ?? CORES_AVATAR[membros.length % CORES_AVATAR.length],
  )
  const [carga, setCarga] = useState(
    membro?.cargaHorariaSemanal != null ? String(membro.cargaHorariaSemanal) : '40',
  )

  function salvar() {
    if (!nome.trim()) return
    const payload = {
      nome: nome.trim(),
      cargo: cargo.trim(),
      email: email.trim(),
      cor,
      cargaHorariaSemanal: Number(carga) || 0,
    }
    if (membro) atualizarMembro(membro.id, payload)
    else criarMembro(payload)
    onClose()
  }

  return (
    <Modal
      titulo={membro ? 'Editar membro' : 'Novo membro'}
      onClose={onClose}
      footer={
        <>
          {membro && (
            <button
              className="btn-ghost mr-auto text-rose-600 hover:bg-rose-50"
              onClick={() => {
                if (confirm('Remover este membro? As tarefas dele ficarão sem responsável.')) {
                  removerMembro(membro.id)
                  onClose()
                }
              }}
            >
              Remover
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
        <Campo label="Nome *">
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Cargo">
            <input className="input" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex.: Analista fiscal" />
          </Campo>
          <Campo label="Carga horária semanal (h)">
            <input
              type="number"
              min="0"
              step="1"
              className="input"
              value={carga}
              onChange={(e) => setCarga(e.target.value)}
              placeholder="40"
            />
          </Campo>
        </div>
        <Campo label="E-mail">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@escritorio.com.br" />
        </Campo>
        <div role="group" aria-label="Cor do avatar">
          <span className="label">Cor do avatar</span>
          <div className="flex flex-wrap gap-2">
            {CORES_AVATAR.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                aria-pressed={cor === c}
                aria-label={`Cor ${i + 1}`}
                className={`h-8 w-8 rounded-full ${c} ${
                  cor === c ? 'ring-2 ring-slate-800 ring-offset-2' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function Equipe() {
  const { membros, tarefas } = useStore()
  const [form, setForm] = useState<{ open: boolean; membro?: Membro | null }>({ open: false })
  const cargas = cargaPorMembro(membros, tarefas)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipe</h1>
          <p className="text-sm text-slate-500">Os membros do time e a carga de cada um.</p>
        </div>
        <button className="btn-primary" onClick={() => setForm({ open: true, membro: null })}>
          <IconPlus width={16} height={16} />
          Novo membro
        </button>
      </header>

      {membros.length === 0 ? (
        <EmptyState
          titulo="Nenhum membro cadastrado"
          descricao="Cadastre a equipe para distribuir tarefas e acompanhar a carga de trabalho."
          acao={
            <button className="btn-primary" onClick={() => setForm({ open: true, membro: null })}>
              <IconPlus width={16} height={16} />
              Novo membro
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cargas.map(({ membro, abertas, atrasadas, venceSemana, concluidas }) => (
            <div key={membro.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar membro={membro} size="lg" />
                  <div>
                    <p className="font-semibold text-slate-800">{membro.nome}</p>
                    <p className="text-xs text-slate-500">{membro.cargo || '—'}</p>
                  </div>
                </div>
                <button
                  className="btn-ghost h-9 w-9 !p-0"
                  onClick={() => setForm({ open: true, membro })}
                  aria-label="Editar"
                >
                  <IconEditar width={16} height={16} />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="text-lg font-bold text-slate-800">{abertas}</p>
                  <p className="text-[11px] text-slate-500">Abertas</p>
                </div>
                <div className="rounded-lg bg-rose-50 py-2">
                  <p className="text-lg font-bold text-rose-600">{atrasadas}</p>
                  <p className="text-[11px] text-slate-500">Atrasadas</p>
                </div>
                <div className="rounded-lg bg-emerald-50 py-2">
                  <p className="text-lg font-bold text-emerald-600">{concluidas}</p>
                  <p className="text-[11px] text-slate-500">Concluídas</p>
                </div>
              </div>
              {venceSemana > 0 && (
                <p className="mt-3 text-xs font-medium text-amber-600">
                  {venceSemana} tarefa(s) vencem esta semana
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {form.open && <MembroForm membro={form.membro} onClose={() => setForm({ open: false })} />}
    </div>
  )
}
