// Domain model for the office management system.
// Kept in one place so the persistence layer and the UI share a single source of truth.

export type StatusTarefa = 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluido'

export type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente'

export type TipoTarefa = 'contabil' | 'consultoria' | 'avulsa'

export type RegimeTributario =
  | 'simples_nacional'
  | 'lucro_presumido'
  | 'lucro_real'
  | 'mei'
  | 'terceiro_setor'

export type StatusProjeto = 'planejado' | 'em_andamento' | 'concluido' | 'pausado'

export interface Membro {
  id: string
  nome: string
  cargo: string
  email: string
  /** Tailwind color token used for the avatar, e.g. "bg-rose-500". */
  cor: string
}

export interface Cliente {
  id: string
  nome: string
  cnpj: string
  regime: RegimeTributario
  responsavelId: string | null
  ativo: boolean
}

export interface Projeto {
  id: string
  nome: string
  clienteId: string
  descricao: string
  status: StatusProjeto
  inicio: string // ISO date (yyyy-mm-dd)
  fim: string | null
}

export interface Tarefa {
  id: string
  titulo: string
  descricao: string
  clienteId: string | null
  responsavelId: string | null
  projetoId: string | null
  tipo: TipoTarefa
  prioridade: Prioridade
  status: StatusTarefa
  prazo: string | null // ISO date (yyyy-mm-dd)
  criadaEm: string // ISO datetime
}

export interface DadosApp {
  membros: Membro[]
  clientes: Cliente[]
  projetos: Projeto[]
  tarefas: Tarefa[]
}
