import { useState } from 'react'
import { useStore } from '../data/store'
import type { Membro, PaginaPermissao, Perfil } from '../types'
import { cargaPorMembro } from '../lib/workload'
import { CORES_AVATAR } from '../lib/labels'
import { PAGINAS, PERFIS, PERMISSOES_PADRAO, perfilLabel } from '../lib/permissoes'
import { Avatar, Badge, Campo, EmptyState, Modal } from '../components/ui'
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
  const [perfil, setPerfil] = useState<Perfil>(membro?.perfil ?? 'consultor')
  const [permissoes, setPermissoes] = useState<PaginaPermissao[]>(
    membro?.permissoes ?? PERMISSOES_PADRAO.consultor,
  )
  const [custo, setCusto] = useState(
    membro?.custoMensal != null ? String(membro.custoMensal) : '',
  )

  // Choosing a profile resets permissions to that profile's defaults.
  function escolherPerfil(p: Perfil) {
    setPerfil(p)
    setPermissoes(PERMISSOES_PADRAO[p])
  }

  function togglePermissao(id: PaginaPermissao) {
    setPermissoes((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    )
  }

  function salvar() {
    if (!nome.trim()) return
    const payload = {
      nome: nome.trim(),
      cargo: cargo.trim(),
      email: email.trim(),
      cor,
      cargaHorariaSemanal: Number(carga) || 0,
      perfil,
      permissoes,
      custoMensal: Number(custo) || 0,
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

        {/* Perfil de acesso + custo */}
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Perfil de acesso">
            <select className="input" value={perfil} onChange={(e) => escolherPerfil(e.target.value as Perfil)}>
              {PERFIS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Custo mensal (R$)">
            <input
              type="number"
              min="0"
              step="100"
              className="input"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="Ex.: 5000"
            />
          </Campo>
        </div>

        {/* Permissões de visualização */}
        <div role="group" aria-label="Telas visíveis">
          <span className="label">O que este usuário pode visualizar</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
            {PAGINAS.map((pg) => (
              <label key={pg.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={permissoes.includes(pg.id)}
                  onChange={() => togglePermissao(pg.id)}
                  className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                />
                {pg.label}
              </label>
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
                    <Badge
                      className={`mt-1 ${
                        membro.perfil === 'administrador'
                          ? 'bg-brand-100 text-brand-700'
                          : membro.perfil === 'gestor'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {perfilLabel(membro.perfil)}
                    </Badge>
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
