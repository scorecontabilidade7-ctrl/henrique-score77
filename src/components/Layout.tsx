import { NavLink, Outlet } from 'react-router-dom'
import {
  IconCalendario,
  IconChecklist,
  IconClientes,
  IconConfig,
  IconDashboard,
  IconEquipe,
  IconGrafico,
  IconKanban,
  IconProjetos,
  IconRelogio,
} from './icons'
import type { ComponentType, SVGProps } from 'react'

interface Item {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const itens: Item[] = [
  { to: '/', label: 'Painel', Icon: IconDashboard },
  { to: '/tarefas', label: 'Tarefas', Icon: IconKanban },
  { to: '/projetos', label: 'Projetos', Icon: IconProjetos },
  { to: '/agenda', label: 'Agenda', Icon: IconCalendario },
  { to: '/semana', label: 'Semana', Icon: IconChecklist },
  { to: '/horas', label: 'Horas', Icon: IconRelogio },
  { to: '/consultores', label: 'Consultores', Icon: IconGrafico },
  { to: '/clientes', label: 'Clientes', Icon: IconClientes },
  { to: '/equipe', label: 'Equipe', Icon: IconEquipe },
  { to: '/configuracoes', label: 'Configurações', Icon: IconConfig },
]

function NavItens({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {itens.map(({ to, label, Icon }) => (
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
        <p className="text-sm font-bold text-slate-800">Gestor do Escritório</p>
        <p className="text-xs text-slate-400">Contabilidade & Consultoria</p>
      </div>
    </div>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar - desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:flex lg:flex-col lg:gap-6">
        <Marca />
        <NavItens />
      </aside>

      {/* Top bar - mobile */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between p-3">
          <Marca />
        </div>
        <div className="overflow-x-auto border-t border-slate-100 p-2 scrollbar-thin">
          <div className="flex gap-1">
            {itens.map(({ to, label, Icon }) => (
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
