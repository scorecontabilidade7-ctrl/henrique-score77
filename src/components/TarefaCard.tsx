import { useStore } from '../data/store'
import type { Tarefa } from '../types'
import { estaAtrasada, formatarDataCurta, prazoRelativo, venceEstaSemana } from '../lib/dates'
import { prioridade, tipoTarefa } from '../lib/labels'
import { Avatar, Badge } from './ui'
import { IconRelogio } from './icons'

interface Props {
  tarefa: Tarefa
  onClick?: () => void
  /** Enables native drag on the Kanban board. */
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
}

export default function TarefaCard({ tarefa, onClick, draggable, onDragStart }: Props) {
  const { clientes, membros } = useStore()
  const cliente = clientes.find((c) => c.id === tarefa.clienteId)
  const responsavel = membros.find((m) => m.id === tarefa.responsavelId)
  const prio = prioridade(tarefa.prioridade)
  const tipo = tipoTarefa(tarefa.tipo)

  const atrasada = tarefa.status !== 'concluido' && estaAtrasada(tarefa.prazo)
  const urgente = tarefa.status !== 'concluido' && !atrasada && venceEstaSemana(tarefa.prazo)

  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`card cursor-pointer p-3 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        draggable ? 'active:cursor-grabbing' : ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-slate-800">{tarefa.titulo}</p>
        <Avatar membro={responsavel} size="sm" />
      </div>

      {cliente && <p className="mb-2 truncate text-xs text-slate-500">{cliente.nome}</p>}

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={tipo.badge}>{tipo.label}</Badge>
        <Badge className={prio.badge}>{prio.label}</Badge>
        {tarefa.prazo && (
          <Badge
            className={
              atrasada
                ? 'bg-rose-100 text-rose-700'
                : urgente
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-500'
            }
          >
            <IconRelogio width={12} height={12} />
            {atrasada || urgente ? prazoRelativo(tarefa.prazo) : formatarDataCurta(tarefa.prazo)}
          </Badge>
        )}
      </div>
    </article>
  )
}
