// Domain model for the office management system.
// Kept in one place so the persistence layer and the UI share a single source of truth.

export type StatusTarefa = 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluido'

export type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente'

// The kind of item, which drives the form/behaviour:
// - "tarefa"   → a work demand (has an orientation field on how to do it)
// - "reuniao"  → scheduled meeting; enables voice recorder + ata (minutes)
// - "lembrete" → a reminder tied to the responsible, shown as a notification
export type TipoTarefa = 'tarefa' | 'reuniao' | 'lembrete'

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
  | 'recorrencias'
  | 'compartilhamentos'
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

/** PMBOK — Termo de Abertura do Projeto (TAP). All free text. */
export interface TAP {
  sponsor: string
  gerente: string
  orcamento: string
  justificativa: string
  objetivosSmart: string
  premissas: string
  restricoes: string
  entregas: string
  criteriosSucesso: string
  riscos: string
}

/** A person on the client's side involved in the project (used in RACI). */
export interface Envolvido {
  id: string
  nome: string
  /** Role/position in the client company, e.g. "Diretor financeiro". */
  cargo: string
}

export interface Projeto {
  id: string
  nome: string
  clienteId: string
  descricao: string
  status: StatusProjeto
  inicio: string // ISO date (yyyy-mm-dd)
  fim: string | null
  /** PMBOK project charter (Termo de Abertura). */
  tap: TAP
  /** Consultants on this project's team (a project has at most 3). */
  equipeIds: string[]
  /** People on the client side involved in the project (for RACI). */
  envolvidos: Envolvido[]
}

/** 5W2H item with GUT prioritization (What/Why/Where/Who/When/How/How much). */
export interface Item5W2H {
  id: string
  projetoId: string
  oQue: string
  porQue: string
  onde: string
  quemId: string | null // membro
  quando: string // ISO date or free text
  como: string
  quanto: number
  g: number // Gravidade 1-5
  u: number // Urgência 1-5
  t: number // Tendência 1-5
  status: StatusTarefa
}

export type PapelRaci = 'R' | 'A' | 'C' | 'I' | ''

/** A RACI row: an activity and each member's role on it. */
export interface ItemRaci {
  id: string
  projetoId: string
  atividade: string
  /** membroId -> R/A/C/I */
  papeis: Record<string, PapelRaci>
}

export interface Tag {
  id: string
  nome: string
  /** Tailwind badge classes, e.g. "bg-rose-100 text-rose-700". */
  cor: string
  /** Marks the special "meeting" tag (enables ata/recording). */
  ehReuniao: boolean
}

/** A guiding step + base material for a stage — a playbook to guide consultants. */
export interface PassoEtapa {
  id: string
  titulo: string
  /** What to do in this step (instructions/guidance). */
  descricao: string
  /** Link to the base material (Drive/doc/template) used in this step. */
  materialUrl: string
}

/** A stage/phase of a project (e.g. "Análise Inicial"). Tasks belong to a stage. */
export interface Etapa {
  id: string
  projetoId: string
  nome: string
  ordem: number
  /** Tailwind text/bg token for the stage marker, e.g. "bg-indigo-500". */
  cor: string
  /** Playbook: ordered guiding steps with base material for this stage. */
  roteiro: PassoEtapa[]
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

/** Meeting minutes (ata), based on the Score meeting template. */
export interface Ata {
  /** Client-side participants (Score side comes from the task's responsáveis). */
  participantesEmpresa: string
  /** Resumo das atividades/entregáveis realizados. */
  resumo: string
  /** Atividades para a próxima reunião (deveres de casa). */
  deveresDeCasa: string
  /** Outras observações relevantes. */
  observacoes: string
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
  /** For "tarefa": how the demand should be carried out (orientation/briefing). */
  orientacao: string
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
  /** Tags for filtering (one may be the meeting tag). */
  tagsIds: string[]
  /** Meeting minutes (ata) — used when the task is a meeting. */
  ata: Ata
  /** External link to the meeting recording (Meet/Zoom/Drive). */
  gravacaoUrl: string
  /** In-browser audio recording of the meeting, stored as a data: URL. */
  gravacaoAudio: string
  criadaEm: string // ISO datetime
}

/** A file/link attached to a share (usually a Google Drive link). */
export interface Anexo {
  id: string
  nome: string
  /** URL of the file — a Google Drive (or other) link. */
  url: string
}

/** A shareable page with client files/links (can point straight to Drive). */
export interface Compartilhamento {
  id: string
  projetoId: string
  titulo: string
  mensagem: string
  /** Recipient emails. */
  destinatarios: string[]
  /** Anyone with the link can open (no specific recipient needed). */
  qualquerComLink: boolean
  /** Protect the shared page with a password. */
  protegido: boolean
  senha: string
  /** Ask recipients to approve the shared content. */
  solicitarAprovacao: boolean
  anexos: Anexo[]
  criadoEm: string // ISO datetime
}

export type FrequenciaRecorrencia = 'semanalmente' | 'dias_semana'

/** A recurring task definition (repeats forever unless it has an end date). */
export interface Recorrencia {
  id: string
  titulo: string
  projetoId: string | null
  etapaId: string | null
  responsaveisIds: string[]
  frequencia: FrequenciaRecorrencia
  /** Weekdays (0=Dom … 6=Sáb) when frequencia === 'dias_semana'. */
  dias: number[]
  ativa: boolean
  /** End date (ISO) or null for "never". */
  termino: string | null
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
  /** Task tags (filtering). */
  tags: Tag[]
  /** 5W2H items (per project). */
  itens5w2h: Item5W2H[]
  /** RACI rows (per project). */
  raci: ItemRaci[]
  /** Shareable client file pages. */
  compartilhamentos: Compartilhamento[]
  /** Recurring task definitions. */
  recorrencias: Recorrencia[]
}
