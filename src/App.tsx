import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tarefas from './pages/Tarefas'
import Projetos from './pages/Projetos'
import ProjetoDetalhe from './pages/ProjetoDetalhe'
import Agenda from './pages/Agenda'
import Semana from './pages/Semana'
import Horas from './pages/Horas'
import Recorrencias from './pages/Recorrencias'
import Compartilhamentos from './pages/Compartilhamentos'
import CompartilhamentoView from './pages/CompartilhamentoView'
import Consultores from './pages/Consultores'
import Financeiro from './pages/Financeiro'
import Treinamentos from './pages/Treinamentos'
import Clientes from './pages/Clientes'
import Equipe from './pages/Equipe'
import Configuracoes from './pages/Configuracoes'
import { RotaProtegida } from './lib/acesso'
import type { PaginaPermissao } from './types'
import type { ReactNode } from 'react'

const P = ({ pagina, children }: { pagina: PaginaPermissao; children: ReactNode }) => (
  <RotaProtegida pagina={pagina}>{children}</RotaProtegida>
)

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tarefas" element={<P pagina="tarefas"><Tarefas /></P>} />
        <Route path="projetos" element={<P pagina="projetos"><Projetos /></P>} />
        <Route path="projetos/:id" element={<P pagina="projetos"><ProjetoDetalhe /></P>} />
        <Route path="agenda" element={<P pagina="agenda"><Agenda /></P>} />
        <Route path="semana" element={<P pagina="semana"><Semana /></P>} />
        <Route path="horas" element={<P pagina="horas"><Horas /></P>} />
        <Route path="recorrencias" element={<P pagina="recorrencias"><Recorrencias /></P>} />
        <Route path="compartilhamentos" element={<P pagina="compartilhamentos"><Compartilhamentos /></P>} />
        <Route path="consultores" element={<P pagina="consultores"><Consultores /></P>} />
        <Route path="financeiro" element={<P pagina="financeiro"><Financeiro /></P>} />
        <Route path="treinamentos" element={<P pagina="treinamentos"><Treinamentos /></P>} />
        <Route path="clientes" element={<P pagina="clientes"><Clientes /></P>} />
        <Route path="equipe" element={<P pagina="equipe"><Equipe /></P>} />
        <Route path="configuracoes" element={<P pagina="configuracoes"><Configuracoes /></P>} />
      </Route>
      {/* Página pública do compartilhamento (fora do layout, acessível por link) */}
      <Route path="c/:id" element={<CompartilhamentoView />} />
    </Routes>
  )
}
