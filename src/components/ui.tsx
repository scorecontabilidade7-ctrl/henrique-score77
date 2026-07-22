// Small presentational building blocks reused across pages.
import { useEffect, useId, useRef, type ReactNode } from 'react'
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

/** Overlapping avatars for a set of responsáveis; shows "+N" past the limit. */
export function AvatarGroup({
  membros,
  size = 'sm',
  limite = 3,
}: {
  membros: Membro[]
  size?: 'sm' | 'md'
  limite?: number
}) {
  if (membros.length === 0) return <Avatar size={size} />
  const visiveis = membros.slice(0, limite)
  const resto = membros.length - visiveis.length
  const dim = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
  return (
    <div className="flex items-center -space-x-2">
      {visiveis.map((m) => (
        <span key={m.id} className="rounded-full ring-2 ring-white">
          <Avatar membro={m} size={size} />
        </span>
      ))}
      {resto > 0 && (
        <span
          className={`inline-flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600 ring-2 ring-white ${dim}`}
          title={`+${resto}`}
        >
          +{resto}
        </span>
      )}
    </div>
  )
}

/**
 * Form field: wraps its control in a <label> so screen readers announce the
 * name without needing matching htmlFor/id pairs on every input.
 */
export function Campo({
  label,
  children,
  className = '',
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
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
  const tituloId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close on Escape and move focus into the dialog when it opens.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="card w-full max-w-lg outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 id={tituloId} className="text-base font-semibold text-slate-800">
            {titulo}
          </h3>
          <button
            className="btn-ghost -mr-1.5 h-9 w-9 !p-0"
            onClick={onClose}
            aria-label="Fechar"
          >
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
