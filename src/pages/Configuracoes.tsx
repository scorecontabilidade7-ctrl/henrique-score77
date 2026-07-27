import { useRef } from 'react'
import { useStore } from '../data/store'
import type { DadosApp } from '../types'

export default function Configuracoes() {
  const store = useStore()
  const {
    membros, clientes, projetos, etapas, tarefas, apontamentos,
    despesas, treinamentos, categoriasDespesa, custosArea, usuarioAtualId,
    resetar, limpar,
  } = store
  const inputRef = useRef<HTMLInputElement>(null)

  function exportar() {
    const dados: DadosApp = {
      membros, clientes, projetos, etapas, tarefas, apontamentos,
      despesas, treinamentos, categoriasDespesa, custosArea, usuarioAtualId,
    }
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-escritorio-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importar(file: File) {
    const leitor = new FileReader()
    leitor.onload = () => {
      try {
        const dados = JSON.parse(String(leitor.result)) as DadosApp
        if (!Array.isArray(dados.tarefas)) throw new Error('formato inválido')
        // Replace the whole dataset, preserving ids so references stay intact.
        store.substituirTudo(dados)
        alert('Backup importado com sucesso.')
      } catch {
        alert('Não foi possível ler o arquivo. Verifique se é um backup válido.')
      }
    }
    leitor.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-sm text-slate-500">Backup dos dados e opções do sistema.</p>
      </header>

      <section className="card p-5">
        <h2 className="font-semibold text-slate-800">Onde ficam os dados</h2>
        <p className="mt-1 text-sm text-slate-600">
          Neste MVP, os dados são salvos <strong>neste navegador</strong> — não sincronizam
          automaticamente entre computadores. Faça backups regulares e guarde o arquivo em local
          seguro. O próximo passo do produto é um servidor compartilhado para toda a equipe ver os
          mesmos dados em tempo real.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-xl font-bold text-slate-800">{tarefas.length}</p>
            <p className="text-xs text-slate-500">Tarefas</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-xl font-bold text-slate-800">{clientes.length}</p>
            <p className="text-xs text-slate-500">Clientes</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-xl font-bold text-slate-800">{projetos.length}</p>
            <p className="text-xs text-slate-500">Projetos</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-xl font-bold text-slate-800">{membros.length}</p>
            <p className="text-xs text-slate-500">Membros</p>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold text-slate-800">Backup</h2>
        <p className="mt-1 text-sm text-slate-600">
          Exporte um arquivo com todos os dados, ou restaure a partir de um backup.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={exportar}>
            Exportar backup (.json)
          </button>
          <button className="btn-secondary" onClick={() => inputRef.current?.click()}>
            Importar backup
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f && confirm('Importar substituirá todos os dados atuais. Continuar?')) importar(f)
              e.target.value = ''
            }}
          />
        </div>
      </section>

      <section className="card border-rose-200 p-5">
        <h2 className="font-semibold text-slate-800">Zona de risco</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ações irreversíveis. Faça um backup antes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            onClick={() => {
              if (confirm('Restaurar os dados de exemplo? Isso substitui os dados atuais.')) resetar()
            }}
          >
            Restaurar dados de exemplo
          </button>
          <button
            className="btn bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => {
              if (confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) limpar()
            }}
          >
            Apagar todos os dados
          </button>
        </div>
      </section>
    </div>
  )
}
