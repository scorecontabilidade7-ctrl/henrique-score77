import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../data/store'

/**
 * Public-ish viewer for a share link (#/c/:id). Shows the shared message and
 * the client's Drive attachments; optionally gated by a password.
 */
export default function CompartilhamentoView() {
  const { id } = useParams()
  const { compartilhamentos, projetos, clientes } = useStore()
  const share = compartilhamentos.find((c) => c.id === id)

  const [senha, setSenha] = useState('')
  const [liberado, setLiberado] = useState(false)
  const [aprovado, setAprovado] = useState<'sim' | 'nao' | null>(null)

  if (!share) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold text-slate-800">Compartilhamento não encontrado</p>
        <p className="text-sm text-slate-500">O link pode ter expirado ou sido removido.</p>
        <Link to="/" className="btn-primary">Ir para o sistema</Link>
      </div>
    )
  }

  const projeto = projetos.find((p) => p.id === share.projetoId)
  const cliente = clientes.find((c) => c.id === projeto?.clienteId)
  const precisaSenha = share.protegido && !liberado

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl p-4 sm:p-8">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-800">Gestão de Projetos</p>
            <p className="text-xs font-semibold text-brand-600">Score</p>
          </div>
        </div>

        {precisaSenha ? (
          <div className="card p-6">
            <h1 className="text-lg font-semibold text-slate-800">Página protegida</h1>
            <p className="mt-1 text-sm text-slate-500">Digite a senha para acessar o conteúdo.</p>
            <div className="mt-4 flex gap-2">
              <input
                className="input"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                onKeyDown={(e) => e.key === 'Enter' && setLiberado(senha === share.senha)}
              />
              <button className="btn-primary" onClick={() => setLiberado(senha === share.senha)}>
                Acessar
              </button>
            </div>
            {senha && senha !== share.senha && (
              <p className="mt-2 text-sm text-rose-600">Senha incorreta.</p>
            )}
          </div>
        ) : (
          <div className="card p-6">
            <h1 className="text-xl font-bold text-slate-800">{share.titulo}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {projeto?.nome}
              {cliente ? ` · ${cliente.nome}` : ''}
            </p>

            {share.mensagem && (
              <p className="mt-4 whitespace-pre-line text-sm text-slate-600">{share.mensagem}</p>
            )}

            <div className="mt-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Arquivos</h2>
              {share.anexos.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum arquivo anexado.</p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {share.anexos.map((a) => (
                    <a
                      key={a.id}
                      href={a.url || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-brand-50 text-brand-600">
                        ↗
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700">{a.nome || 'Arquivo'}</p>
                        <p className="truncate text-xs text-slate-400">{a.url || 'sem link'}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {share.solicitarAprovacao && (
              <div className="mt-6 rounded-lg border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm font-medium text-violet-800">Aprovação solicitada</p>
                {aprovado === null ? (
                  <div className="mt-2 flex gap-2">
                    <button className="btn-primary" onClick={() => setAprovado('sim')}>
                      Aprovar
                    </button>
                    <button className="btn-secondary" onClick={() => setAprovado('nao')}>
                      Solicitar ajustes
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-violet-700">
                    {aprovado === 'sim'
                      ? '✓ Você aprovou este conteúdo. Obrigado!'
                      : 'Registramos seu pedido de ajustes. A equipe entrará em contato.'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          Compartilhado pela Score · Gestão de Projetos
        </p>
      </div>
    </div>
  )
}
