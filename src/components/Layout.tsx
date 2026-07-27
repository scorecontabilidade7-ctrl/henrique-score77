import { NavLink, Outlet } from 'react-router-dom'
import {
  IconCalendario,
  IconChecklist,
  IconClientes,
  IconConfig,
  IconDashboard,
  IconDinheiro,
  IconEquipe,
  IconGrafico,
  IconKanban,
  IconProjetos,
  IconRelogio,
  IconTreinamento,
} from './icons'
import type { ComponentType, SVGProps } from 'react'
import type { PaginaPermissao } from '../types'
import { useStore } from '../data/store'
import { useUsuarioAtual } from '../lib/acesso'
import { perfilLabel } from '../lib/permissoes'
import { Avatar } from './ui'

interface Item {
  to: string
  key: PaginaPermissao
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const itens: Item[] = [
  { to: '/', key: 'painel', label: 'Painel', Icon: IconDashboard },
  { to: '/tarefas', key: 'tarefas', label: 'Tarefas', Icon: IconKanban },
  { to: '/projetos', key: 'projetos', label: 'Projetos', Icon: IconProjetos },
  { to: '/agenda', key: 'agenda', label: 'Agenda', Icon: IconCalendario },
  { to: '/semana', key: 'semana', label: 'Semana', Icon: IconChecklist },
  { to: '/horas', key: 'horas', label: 'Horas', Icon: IconRelogio },
  { to: '/consultores', key: 'consultores', label: 'Consultores', Icon: IconGrafico },
  { to: '/financeiro', key: 'financeiro', label: 'Financeiro', Icon: IconDinheiro },
  { to: '/treinamentos', key: 'treinamentos', label: 'Treinamentos', Icon: IconTreinamento },
  { to: '/clientes', key: 'clientes', label: 'Clientes', Icon: IconClientes },
  { to: '/equipe', key: 'equipe', label: 'Equipe', Icon: IconEquipe },
  { to: '/configuracoes', key: 'configuracoes', label: 'Configurações', Icon: IconConfig },
]

function useItensVisiveis(): Item[] {
  const usuario = useUsuarioAtual()
  if (!usuario) return itens
  return itens.filter((i) => usuario.permissoes.includes(i.key))
}

function NavItens({ onNavigate }: { onNavigate?: () => void }) {
  const visiveis = useItensVisiveis()
  return (
    <nav className="flex flex-col gap-1">
      {visiveis.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function Marca() {
  return (
    <div className="flex items-center gap-2.5 px-2">
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
  )
}

/** Lets you switch which user (and thus permission set) the app is viewed as. */
function SeletorUsuario() {
  const { membros, definirUsuarioAtual } = useStore()
  const usuario = useUsuarioAtual()
  if (!usuario) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Avatar membro={usuario} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-slate-700">{usuario.nome}</span>
          <span className="block text-[11px] text-slate-400">{perfilLabel(usuario.perfil)}</span>
        </span>
      </p>
      <label className="block">
        <span className="sr-only">Ver como</span>
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-600"
          value={usuario.id}
          onChange={(e) => definirUsuarioAtual(e.target.value)}
          title="Ver o sistema como este usuário"
        >
          {membros.map((m) => (
            <option key={m.id} value={m.id}>
              Ver como: {m.nome}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default function Layout() {
  const visiveis = useItensVisiveis()
  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar - desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:flex lg:flex-col lg:gap-6">
        <Marca />
        <NavItens />
        <div className="mt-auto">
          <SeletorUsuario />
        </div>
      </aside>

      {/* Top bar - mobile */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between gap-2 p-3">
          <Marca />
          <div className="w-40">
            <SeletorUsuario />
          </div>
        </div>
        <div className="overflow-x-auto border-t border-slate-100 p-2 scrollbar-thin">
          <div className="flex gap-1">
            {visiveis.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon width={16} height={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
