// Domain model for the office management system.
// Kept in one place so the persistence layer and the UI share a single source of truth.

export type StatusTarefa = 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluido'

export type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente'

// "reuniao" (meeting) is scheduled on the calendar and can have several people.
export type TipoTarefa = 'contabil' | 'consultoria' | 'avulsa' | 'reuniao'

export type RegimeTributario =
  | 'simples_nacional'
  | 'lucro_presumido'
  | 'lucro_real'
  | 'mei'
  | 'terceiro_setor'

export type StatusProjeto = 'planejado' | 'em_andamento' | 'concluido' | 'pausado'

export type Perfil = 'administrador' | 'gestor' | 'consultor'

/** Page keys that can be granted/revoked per user (view permissions). */
export type PaginaPermissao =
  | 'painel'
  | 'tarefas'
  | 'projetos'
  | 'agenda'
  | 'semana'
  | 'horas'
  | 'consultores'
  | 'financeiro'
  | 'treinamentos'
  | 'clientes'
  | 'equipe'
  | 'configuracoes'

export interface Membro {
  id: string
  nome: string
  cargo: string
  email: string
  /** Tailwind color token used for the avatar, e.g. "bg-rose-500". */
  cor: string
  /** Weekly capacity in hours, used by the hours dashboard. */
  cargaHorariaSemanal: number
  /** Access profile; presets a default set of permissions. */
  perfil: Perfil
  /** Pages this user may view. */
  permissoes: PaginaPermissao[]
  /** Monthly cost of this team member (salary/encargos) — admin only. */
  custoMensal: number
}

export interface Despesa {
  id: string
  projetoId: string
  categoria: string
  descricao: string
  valor: number
  data: string // ISO date (yyyy-mm-dd)
}

export interface Treinamento {
  id: string
  membroId: string
  tema: string
  horas: number
  data: string // ISO date (yyyy-mm-dd)
}

/** Direct monthly cost of a consulting/accounting area (admin config). */
export interface CustoArea {
  id: string
  area: string
  valorMensal: number
}

export interface Cliente {
  id: string
  nome: string
  cnpj: string
  regime: RegimeTributario
  /** Lead consultant — the financial return is attributed to them. */
  responsavelId: string | null
  /** Assistants supporting this client (usually one). */
  assistentesIds: string[]
  ativo: boolean
  /** Monthly consulting fee (R$) — the financial return this client brings. */
  valorMensal: number
  /** Market niche / segment, e.g. "Saúde e Bem Estar". */
  segmento: string
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

/** A stage/phase of a project (e.g. "Análise Inicial"). Tasks belong to a stage. */
export interface Etapa {
  id: string
  projetoId: string
  nome: string
  ordem: number
  /** Tailwind text/bg token for the stage marker, e.g. "bg-indigo-500". */
  cor: string
}

export interface ChecklistItem {
  id: string
  texto: string
  feito: boolean
}

/** A named checklist on a card, e.g. "Muito Urgente" with several items. */
export interface Checklist {
  id: string
  titulo: string
  itens: ChecklistItem[]
}

export interface Comentario {
  id: string
  texto: string
  data: string // ISO datetime
  autorId: string | null
}

export interface Tarefa {
  id: string
  titulo: string
  descricao: string
  clienteId: string | null
  projetoId: string | null
  etapaId: string | null
  /** One or more people responsible. Meetings appear in every assignee's agenda. */
  responsaveisIds: string[]
  tipo: TipoTarefa
  prioridade: Prioridade
  status: StatusTarefa
  prazo: string | null // ISO date (yyyy-mm-dd)
  /** Estimated effort in hours (0 when not estimated). */
  estimativaHoras: number
  // Optional scheduling — when set, the task/meeting shows on the calendar.
  data: string | null // ISO date (yyyy-mm-dd)
  horaInicio: string | null // "HH:mm"
  horaFim: string | null // "HH:mm"
  /** Trello-style checklists (groups of checkable items). */
  checklists: Checklist[]
  /** Comment/activity feed on the card. */
  comentarios: Comentario[]
  criadaEm: string // ISO datetime
}

/** A time entry: hours a person logged against a task on a given day. */
export interface Apontamento {
  id: string
  tarefaId: string
  membroId: string
  data: string // ISO date (yyyy-mm-dd)
  horas: number
  comentario: string
}

export interface DadosApp {
  membros: Membro[]
  clientes: Cliente[]
  projetos: Projeto[]
  etapas: Etapa[]
  tarefas: Tarefa[]
  apontamentos: Apontamento[]
  despesas: Despesa[]
  treinamentos: Treinamento[]
  /** User-created expense categories (with suggested defaults). */
  categoriasDespesa: string[]
  /** Direct costs per area (admin config). */
  custosArea: CustoArea[]
  /** The member whose permissions the app is currently viewed as. */
  usuarioAtualId: string | null
}
