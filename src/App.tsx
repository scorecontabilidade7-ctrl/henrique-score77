import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tarefas from './pages/Tarefas'
import Projetos from './pages/Projetos'
import ProjetoDetalhe from './pages/ProjetoDetalhe'
import Agenda from './pages/Agenda'
import Semana from './pages/Semana'
import Horas from './pages/Horas'
import Consultores from './pages/Consultores'
import Clientes from './pages/Clientes'
import Equipe from './pages/Equipe'
import Configuracoes from './pages/Configuracoes'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tarefas" element={<Tarefas />} />
        <Route path="projetos" element={<Projetos />} />
        <Route path="projetos/:id" element={<ProjetoDetalhe />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="semana" element={<Semana />} />
        <Route path="horas" element={<Horas />} />
        <Route path="consultores" element={<Consultores />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="equipe" element={<Equipe />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  )
}
