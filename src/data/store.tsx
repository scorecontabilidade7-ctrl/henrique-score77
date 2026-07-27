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
  CustoArea,
  DadosApp,
  Despesa,
  Etapa,
  Membro,
  Projeto,
  Tarefa,
  Treinamento,
} from '../types'
import { dadosIniciais } from './seed'
import { PERMISSOES_PADRAO } from '../lib/permissoes'

// Coerce possibly-incomplete records (older data / imports) into the current
// shape so the UI can rely on arrays always being present.
function normTarefa(t: Partial<Tarefa>): Tarefa {
  return {
    ...(t as Tarefa),
    responsaveisIds: t.responsaveisIds ?? [],
    checklists: t.checklists ?? [],
    comentarios: t.comentarios ?? [],
    estimativaHoras: t.estimativaHoras ?? 0,
  }
}

function normCliente(c: Partial<Cliente>): Cliente {
  return {
    ...(c as Cliente),
    assistentesIds: c.assistentesIds ?? [],
    valorMensal: c.valorMensal ?? 0,
    segmento: c.segmento ?? '',
  }
}

function normMembro(m: Partial<Membro>): Membro {
  const perfil = m.perfil ?? 'consultor'
  return {
    ...(m as Membro),
    perfil,
    permissoes: m.permissoes ?? PERMISSOES_PADRAO[perfil],
    custoMensal: m.custoMensal ?? 0,
    cargaHorariaSemanal: m.cargaHorariaSemanal ?? 40,
  }
}

const CATEGORIAS_PADRAO = [
  'Alimentação', 'Transporte', 'Hospedagem', 'Materiais', 'Assinaturas', 'Serviços terceirizados',
]

function normalizar(d: Partial<DadosApp>): DadosApp {
  const membros = (d.membros ?? []).map(normMembro)
  return {
    membros,
    clientes: (d.clientes ?? []).map(normCliente),
    projetos: d.projetos ?? [],
    etapas: d.etapas ?? [],
    tarefas: (d.tarefas ?? []).map(normTarefa),
    apontamentos: d.apontamentos ?? [],
    despesas: d.despesas ?? [],
    treinamentos: d.treinamentos ?? [],
    categoriasDespesa: d.categoriasDespesa ?? [...CATEGORIAS_PADRAO],
    custosArea: d.custosArea ?? [],
    usuarioAtualId: d.usuarioAtualId ?? membros[0]?.id ?? null,
  }
}

// ---------------------------------------------------------------------------
// Persistence layer.
//
// This is the ONLY module that knows *where* data lives. Today it's the
// browser's localStorage. To move the office onto a shared backend later,
// swap the `carregar` / `salvar` implementations (or the whole provider) for
// API calls — the rest of the app talks to `useStore()` and never changes.
// ---------------------------------------------------------------------------

const CHAVE = 'gestor-escritorio:v4'

function carregar(): DadosApp {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return dadosIniciais
    return normalizar(JSON.parse(bruto) as Partial<DadosApp>)
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
  // Despesas
  criarDespesa: (d: Omit<Despesa, 'id'>) => void
  removerDespesa: (id: string) => void
  // Categorias de despesa
  adicionarCategoria: (nome: string) => void
  // Treinamentos
  criarTreinamento: (t: Omit<Treinamento, 'id'>) => void
  removerTreinamento: (id: string) => void
  // Custos por área
  criarCustoArea: (c: Omit<CustoArea, 'id'>) => void
  atualizarCustoArea: (id: string, patch: Partial<CustoArea>) => void
  removerCustoArea: (id: string) => void
  // Usuário atual (visão/permissões)
  definirUsuarioAtual: (id: string) => void
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
  despesas: [],
  treinamentos: [],
  categoriasDespesa: [...CATEGORIAS_PADRAO],
  custosArea: [],
  usuarioAtualId: null,
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
      treinamentos: d.treinamentos.filter((t) => t.membroId !== id),
      usuarioAtualId:
        d.usuarioAtualId === id ? (d.membros.find((m) => m.id !== id)?.id ?? null) : d.usuarioAtualId,
      tarefas: d.tarefas.map((t) => ({
        ...t,
        responsaveisIds: t.responsaveisIds.filter((r) => r !== id),
      })),
      clientes: d.clientes.map((c) => ({
        ...c,
        responsavelId: c.responsavelId === id ? null : c.responsavelId,
        assistentesIds: c.assistentesIds.filter((a) => a !== id),
      })),
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
      despesas: d.despesas.filter((x) => x.projetoId !== id),
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

  const criarDespesa = useCallback((desp: Omit<Despesa, 'id'>) => {
    setDados((d) => ({ ...d, despesas: [{ ...desp, id: novoId() }, ...d.despesas] }))
  }, [])

  const removerDespesa = useCallback((id: string) => {
    setDados((d) => ({ ...d, despesas: d.despesas.filter((x) => x.id !== id) }))
  }, [])

  const adicionarCategoria = useCallback((nome: string) => {
    const n = nome.trim()
    if (!n) return
    setDados((d) =>
      d.categoriasDespesa.some((c) => c.toLowerCase() === n.toLowerCase())
        ? d
        : { ...d, categoriasDespesa: [...d.categoriasDespesa, n] },
    )
  }, [])

  const criarTreinamento = useCallback((t: Omit<Treinamento, 'id'>) => {
    setDados((d) => ({ ...d, treinamentos: [{ ...t, id: novoId() }, ...d.treinamentos] }))
  }, [])

  const removerTreinamento = useCallback((id: string) => {
    setDados((d) => ({ ...d, treinamentos: d.treinamentos.filter((x) => x.id !== id) }))
  }, [])

  const criarCustoArea = useCallback((c: Omit<CustoArea, 'id'>) => {
    setDados((d) => ({ ...d, custosArea: [...d.custosArea, { ...c, id: novoId() }] }))
  }, [])

  const atualizarCustoArea = useCallback((id: string, patch: Partial<CustoArea>) => {
    setDados((d) => ({
      ...d,
      custosArea: d.custosArea.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }, [])

  const removerCustoArea = useCallback((id: string) => {
    setDados((d) => ({ ...d, custosArea: d.custosArea.filter((c) => c.id !== id) }))
  }, [])

  const definirUsuarioAtual = useCallback((id: string) => {
    setDados((d) => ({ ...d, usuarioAtualId: id }))
  }, [])

  // Replace the whole dataset at once, preserving ids (used by backup import).
  const substituirTudo = useCallback((novos: DadosApp) => {
    setDados(normalizar(novos))
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
      criarDespesa,
      removerDespesa,
      adicionarCategoria,
      criarTreinamento,
      removerTreinamento,
      criarCustoArea,
      atualizarCustoArea,
      removerCustoArea,
      definirUsuarioAtual,
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
      criarDespesa,
      removerDespesa,
      adicionarCategoria,
      criarTreinamento,
      removerTreinamento,
      criarCustoArea,
      atualizarCustoArea,
      removerCustoArea,
      definirUsuarioAtual,
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
