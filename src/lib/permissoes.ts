import type { PaginaPermissao, Perfil } from '../types'

/** All pages, in menu order, with their labels. */
export const PAGINAS: { id: PaginaPermissao; label: string }[] = [
  { id: 'painel', label: 'Painel' },
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'semana', label: 'Semana' },
  { id: 'horas', label: 'Horas' },
  { id: 'recorrencias', label: 'Recorrências' },
  { id: 'compartilhamentos', label: 'Compartilhamentos' },
  { id: 'consultores', label: 'Consultores' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'treinamentos', label: 'Treinamentos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'configuracoes', label: 'Configurações' },
]

const TODAS = PAGINAS.map((p) => p.id)

/** Default view permissions per profile (a starting point; customizable per user). */
export const PERMISSOES_PADRAO: Record<Perfil, PaginaPermissao[]> = {
  administrador: [...TODAS],
  gestor: [
    'painel', 'tarefas', 'projetos', 'agenda', 'semana', 'horas',
    'recorrencias', 'compartilhamentos',
    'consultores', 'financeiro', 'treinamentos', 'clientes',
  ],
  consultor: [
    'painel', 'tarefas', 'projetos', 'agenda', 'semana', 'horas',
    'recorrencias', 'compartilhamentos', 'treinamentos', 'clientes',
  ],
}

export const PERFIS: { id: Perfil; label: string; descricao: string }[] = [
  { id: 'administrador', label: 'Administrador', descricao: 'Acesso total, inclui financeiro e usuários' },
  { id: 'gestor', label: 'Gestor', descricao: 'Operacional + financeiro, sem gestão de usuários' },
  { id: 'consultor', label: 'Consultor', descricao: 'Operacional, sem dados financeiros' },
]

export const perfilLabel = (p: Perfil) => PERFIS.find((x) => x.id === p)?.label ?? p
export const paginaLabel = (id: PaginaPermissao) => PAGINAS.find((p) => p.id === id)?.label ?? id
