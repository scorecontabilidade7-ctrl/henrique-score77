import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useStore } from '../data/store'
import type { Membro, PaginaPermissao } from '../types'

/** The member the app is currently "viewed as"; falls back to the first member. */
export function useUsuarioAtual(): Membro | undefined {
  const { membros, usuarioAtualId } = useStore()
  return membros.find((m) => m.id === usuarioAtualId) ?? membros[0]
}

/** Returns a predicate telling whether the current user may view a page. */
export function usePode(): (pagina: PaginaPermissao) => boolean {
  const usuario = useUsuarioAtual()
  return (pagina) => !usuario || usuario.permissoes.includes(pagina)
}

/** Route wrapper: redirects to the dashboard when the user lacks permission. */
export function RotaProtegida({
  pagina,
  children,
}: {
  pagina: PaginaPermissao
  children: ReactNode
}) {
  const pode = usePode()
  return pode(pagina) ? <>{children}</> : <Navigate to="/" replace />
}
