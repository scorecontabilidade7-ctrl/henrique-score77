import type {
  Prioridade,
  RegimeTributario,
  StatusProjeto,
  StatusTarefa,
  TipoTarefa,
} from '../types'

export const STATUS_TAREFA: { id: StatusTarefa; label: string; cor: string }[] = [
  { id: 'a_fazer', label: 'A fazer', cor: 'bg-slate-400' },
  { id: 'em_andamento', label: 'Em andamento', cor: 'bg-blue-500' },
  { id: 'em_revisao', label: 'Em revisão', cor: 'bg-amber-500' },
  { id: 'concluido', label: 'Concluído', cor: 'bg-emerald-500' },
]

export const statusLabel = (s: StatusTarefa) =>
  STATUS_TAREFA.find((x) => x.id === s)?.label ?? s

export const PRIORIDADES: {
  id: Prioridade
  label: string
  badge: string
  peso: number
}[] = [
  { id: 'baixa', label: 'Baixa', badge: 'bg-slate-100 text-slate-600', peso: 1 },
  { id: 'media', label: 'Média', badge: 'bg-sky-100 text-sky-700', peso: 2 },
  { id: 'alta', label: 'Alta', badge: 'bg-orange-100 text-orange-700', peso: 3 },
  { id: 'urgente', label: 'Urgente', badge: 'bg-rose-100 text-rose-700', peso: 4 },
]

export const prioridade = (p: Prioridade) =>
  PRIORIDADES.find((x) => x.id === p) ?? PRIORIDADES[0]

export const TIPOS_TAREFA: { id: TipoTarefa; label: string; badge: string }[] = [
  { id: 'contabil', label: 'Contábil', badge: 'bg-indigo-100 text-indigo-700' },
  { id: 'consultoria', label: 'Consultoria', badge: 'bg-violet-100 text-violet-700' },
  { id: 'reuniao', label: 'Reunião', badge: 'bg-cyan-100 text-cyan-700' },
  { id: 'avulsa', label: 'Avulsa', badge: 'bg-slate-100 text-slate-600' },
]

export const tipoTarefa = (t: TipoTarefa) =>
  TIPOS_TAREFA.find((x) => x.id === t) ?? TIPOS_TAREFA[2]

export const REGIMES: { id: RegimeTributario; label: string }[] = [
  { id: 'simples_nacional', label: 'Simples Nacional' },
  { id: 'lucro_presumido', label: 'Lucro Presumido' },
  { id: 'lucro_real', label: 'Lucro Real' },
  { id: 'mei', label: 'MEI' },
  { id: 'terceiro_setor', label: 'Terceiro Setor' },
]

export const regimeLabel = (r: RegimeTributario) =>
  REGIMES.find((x) => x.id === r)?.label ?? r

export const STATUS_PROJETO: { id: StatusProjeto; label: string; badge: string }[] = [
  { id: 'planejado', label: 'Planejado', badge: 'bg-slate-100 text-slate-600' },
  { id: 'em_andamento', label: 'Em andamento', badge: 'bg-blue-100 text-blue-700' },
  { id: 'pausado', label: 'Pausado', badge: 'bg-amber-100 text-amber-700' },
  { id: 'concluido', label: 'Concluído', badge: 'bg-emerald-100 text-emerald-700' },
]

export const statusProjeto = (s: StatusProjeto) =>
  STATUS_PROJETO.find((x) => x.id === s) ?? STATUS_PROJETO[0]

// Palette for project stages (Etapas), reused in the flow view and calendar.
export const CORES_ETAPA = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
]

export const CORES_AVATAR = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
]
