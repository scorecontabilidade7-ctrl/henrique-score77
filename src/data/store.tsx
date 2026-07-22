import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Apontamento,
  Cliente,
  DadosApp,
  Etapa,
  Membro,
  Projeto,
  Tarefa,
} from '../types'
import { dadosIniciais } from './seed'

// ---------------------------------------------------------------------------
// Persistence layer.
//
// This is the ONLY module that knows *where* data lives. Today it's the
// browser's localStorage. To move the office onto a shared backend later,
// swap the `carregar` / `salvar` implementations (or the whole provider) for
// API calls — the rest of the app talks to `useStore()` and never changes.
// ---------------------------------------------------------------------------

const CHAVE = 'gestor-escritorio:v2'

function carregar(): DadosApp {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return dadosIniciais
    const dados = JSON.parse(bruto) as Partial<DadosApp>
    return {
      membros: dados.membros ?? [],
      clientes: dados.clientes ?? [],
      projetos: dados.projetos ?? [],
      etapas: dados.etapas ?? [],
      tarefas: dados.tarefas ?? [],
      apontamentos: dados.apontamentos ?? [],
    }
  } catch {
    return dadosIniciais
  }
}

function salvar(dados: DadosApp) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados))
  } catch {
    // Storage full or unavailable — the UI keeps working in memory.
  }
}

const novoId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

// ---------------------------------------------------------------------------
// Context contract
// ---------------------------------------------------------------------------

interface StoreContextValue extends DadosApp {
  // Tarefas
  criarTarefa: (t: Omit<Tarefa, 'id' | 'criadaEm'>) => void
  atualizarTarefa: (id: string, patch: Partial<Tarefa>) => void
  removerTarefa: (id: string) => void
  // Clientes
  criarCliente: (c: Omit<Cliente, 'id'>) => void
  atualizarCliente: (id: string, patch: Partial<Cliente>) => void
  removerCliente: (id: string) => void
  // Membros
  criarMembro: (m: Omit<Membro, 'id'>) => void
  atualizarMembro: (id: string, patch: Partial<Membro>) => void
  removerMembro: (id: string) => void
  // Projetos
  criarProjeto: (p: Omit<Projeto, 'id'>) => void
  atualizarProjeto: (id: string, patch: Partial<Projeto>) => void
  removerProjeto: (id: string) => void
  // Etapas
  criarEtapa: (e: Omit<Etapa, 'id'>) => void
  atualizarEtapa: (id: string, patch: Partial<Etapa>) => void
  removerEtapa: (id: string) => void
  // Apontamentos
  criarApontamento: (a: Omit<Apontamento, 'id'>) => void
  removerApontamento: (id: string) => void
  // Utilidades
  substituirTudo: (dados: DadosApp) => void
  resetar: () => void
  limpar: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

const vazio: DadosApp = {
  membros: [],
  clientes: [],
  projetos: [],
  etapas: [],
  tarefas: [],
  apontamentos: [],
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<DadosApp>(carregar)

  useEffect(() => {
    salvar(dados)
  }, [dados])

  const criarTarefa = useCallback((t: Omit<Tarefa, 'id' | 'criadaEm'>) => {
    setDados((d) => ({
      ...d,
      tarefas: [
        { ...t, id: novoId(), criadaEm: new Date().toISOString() },
        ...d.tarefas,
      ],
    }))
  }, [])

  const atualizarTarefa = useCallback((id: string, patch: Partial<Tarefa>) => {
    setDados((d) => ({
      ...d,
      tarefas: d.tarefas.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }, [])

  const removerTarefa = useCallback((id: string) => {
    setDados((d) => ({
      ...d,
      tarefas: d.tarefas.filter((t) => t.id !== id),
      apontamentos: d.apontamentos.filter((a) => a.tarefaId !== id),
    }))
  }, [])

  const criarCliente = useCallback((c: Omit<Cliente, 'id'>) => {
    setDados((d) => ({ ...d, clientes: [...d.clientes, { ...c, id: novoId() }] }))
  }, [])

  const atualizarCliente = useCallback((id: string, patch: Partial<Cliente>) => {
    setDados((d) => ({
      ...d,
      clientes: d.clientes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }, [])

  const removerCliente = useCallback((id: string) => {
    setDados((d) => ({
      ...d,
      clientes: d.clientes.filter((c) => c.id !== id),
      tarefas: d.tarefas.map((t) =>
        t.clienteId === id ? { ...t, clienteId: null } : t,
      ),
      projetos: d.projetos.filter((p) => p.clienteId !== id),
    }))
  }, [])

  const criarMembro = useCallback((m: Omit<Membro, 'id'>) => {
    setDados((d) => ({ ...d, membros: [...d.membros, { ...m, id: novoId() }] }))
  }, [])

  const atualizarMembro = useCallback((id: string, patch: Partial<Membro>) => {
    setDados((d) => ({
      ...d,
      membros: d.membros.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }, [])

  const removerMembro = useCallback((id: string) => {
    setDados((d) => ({
      ...d,
      membros: d.membros.filter((m) => m.id !== id),
      apontamentos: d.apontamentos.filter((a) => a.membroId !== id),
      tarefas: d.tarefas.map((t) => ({
        ...t,
        responsaveisIds: t.responsaveisIds.filter((r) => r !== id),
      })),
      clientes: d.clientes.map((c) =>
        c.responsavelId === id ? { ...c, responsavelId: null } : c,
      ),
    }))
  }, [])

  const criarProjeto = useCallback((p: Omit<Projeto, 'id'>) => {
    setDados((d) => ({ ...d, projetos: [...d.projetos, { ...p, id: novoId() }] }))
  }, [])

  const atualizarProjeto = useCallback((id: string, patch: Partial<Projeto>) => {
    setDados((d) => ({
      ...d,
      projetos: d.projetos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }, [])

  const removerProjeto = useCallback((id: string) => {
    setDados((d) => ({
      ...d,
      projetos: d.projetos.filter((p) => p.id !== id),
      etapas: d.etapas.filter((e) => e.projetoId !== id),
      tarefas: d.tarefas.map((t) =>
        t.projetoId === id ? { ...t, projetoId: null, etapaId: null } : t,
      ),
    }))
  }, [])

  const criarEtapa = useCallback((e: Omit<Etapa, 'id'>) => {
    setDados((d) => ({ ...d, etapas: [...d.etapas, { ...e, id: novoId() }] }))
  }, [])

  const atualizarEtapa = useCallback((id: string, patch: Partial<Etapa>) => {
    setDados((d) => ({
      ...d,
      etapas: d.etapas.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
  }, [])

  const removerEtapa = useCallback((id: string) => {
    setDados((d) => ({
      ...d,
      etapas: d.etapas.filter((e) => e.id !== id),
      tarefas: d.tarefas.map((t) =>
        t.etapaId === id ? { ...t, etapaId: null } : t,
      ),
    }))
  }, [])

  const criarApontamento = useCallback((a: Omit<Apontamento, 'id'>) => {
    setDados((d) => ({
      ...d,
      apontamentos: [{ ...a, id: novoId() }, ...d.apontamentos],
    }))
  }, [])

  const removerApontamento = useCallback((id: string) => {
    setDados((d) => ({
      ...d,
      apontamentos: d.apontamentos.filter((a) => a.id !== id),
    }))
  }, [])

  // Replace the whole dataset at once, preserving ids (used by backup import).
  const substituirTudo = useCallback((novos: DadosApp) => {
    setDados({
      membros: novos.membros ?? [],
      clientes: novos.clientes ?? [],
      projetos: novos.projetos ?? [],
      etapas: novos.etapas ?? [],
      tarefas: novos.tarefas ?? [],
      apontamentos: novos.apontamentos ?? [],
    })
  }, [])

  const resetar = useCallback(() => setDados(dadosIniciais), [])
  const limpar = useCallback(() => setDados(vazio), [])

  const value = useMemo<StoreContextValue>(
    () => ({
      ...dados,
      criarTarefa,
      atualizarTarefa,
      removerTarefa,
      criarCliente,
      atualizarCliente,
      removerCliente,
      criarMembro,
      atualizarMembro,
      removerMembro,
      criarProjeto,
      atualizarProjeto,
      removerProjeto,
      criarEtapa,
      atualizarEtapa,
      removerEtapa,
      criarApontamento,
      removerApontamento,
      substituirTudo,
      resetar,
      limpar,
    }),
    [
      dados,
      criarTarefa,
      atualizarTarefa,
      removerTarefa,
      criarCliente,
      atualizarCliente,
      removerCliente,
      criarMembro,
      atualizarMembro,
      removerMembro,
      criarProjeto,
      atualizarProjeto,
      removerProjeto,
      criarEtapa,
      atualizarEtapa,
      removerEtapa,
      criarApontamento,
      removerApontamento,
      substituirTudo,
      resetar,
      limpar,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore precisa estar dentro de <StoreProvider>')
  return ctx
}
