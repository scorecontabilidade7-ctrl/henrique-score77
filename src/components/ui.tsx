// Small presentational building blocks reused across pages.
import type { ReactNode } from 'react'
import type { Membro } from '../types'
import { IconClose } from './icons'

export function Avatar({ membro, size = 'md' }: { membro?: Membro; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-sm'
  if (!membro) {
    return (
      <span className={`inline-flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-500 ${dims}`}>
        ?
      </span>
    )
  }
  const iniciais = membro.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${membro.cor} ${dims}`}
      title={membro.nome}
    >
      {iniciais}
    </span>
  )
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>
}

export function EmptyState({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao: string
  acao?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-base font-semibold text-slate-700">{titulo}</p>
      <p className="max-w-sm text-sm text-slate-500">{descricao}</p>
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  )
}

export function Modal({
  titulo,
  onClose,
  children,
  footer,
}: {
  titulo: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">{titulo}</h3>
          <button className="btn-ghost -mr-2 h-8 w-8 !p-0" onClick={onClose} aria-label="Fechar">
            <IconClose />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  )
}
