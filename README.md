# Gestor do Escritório

Sistema interno de **gestão de tarefas e carga de trabalho** para escritório de
contabilidade e consultoria empresarial. Responde a três perguntas do dia a dia:

- **Quem está fazendo o quê?**
- **Quem está sobrecarregado?**
- **Onde estão os gargalos (o que está atrasado ou vencendo)?**

## Funcionalidades

- **Painel** — métricas gerais (abertas, atrasadas, vencendo esta semana, concluídas),
  carga de trabalho por responsável e lista de tarefas que precisam de atenção imediata.
- **Tarefas** — quadro Kanban (A fazer → Em andamento → Em revisão → Concluído) com
  arrastar-e-soltar, filtros por responsável e por cliente.
- **Projetos** — trabalhos de consultoria com escopo, prazo e progresso.
- **Clientes** — carteira do escritório, com regime tributário e responsável.
- **Equipe** — membros do time e a carga de cada um.
- **Configurações** — backup/restauração dos dados (exportar e importar `.json`).

Cada tarefa tem: título, descrição, cliente, responsável, tipo (contábil / consultoria /
avulsa), prioridade, status e prazo.

## Como rodar

Requer Node.js 18+.

```bash
npm install     # instala as dependências
npm run dev     # inicia em modo desenvolvimento (http://localhost:5173)
```

Para gerar a versão de produção (site estático em `dist/`):

```bash
npm run build
npm run preview # pré-visualiza o build
```

## Onde ficam os dados

Nesta versão (MVP), os dados são salvos no **navegador** (localStorage) — não sincronizam
entre computadores. Use a aba **Configurações → Backup** para exportar/importar.

A camada de dados fica isolada em `src/data/store.tsx`. Para migrar o time para um
**servidor compartilhado** (todos vendo os mesmos dados em tempo real), basta trocar a
implementação desse arquivo por chamadas a uma API — o resto do app não muda.

## Acessibilidade e limitações conhecidas

- Modais com `role="dialog"`, fecham com **Esc** e movem o foco ao abrir.
- Campos de formulário com rótulo associado; cartões de tarefa navegáveis por teclado.
- **Arrastar-e-soltar do Kanban usa a API nativa do navegador, que não funciona em
  telas de toque (celular/tablet).** Nesses aparelhos, mude o status abrindo a tarefa
  e escolhendo o novo status no seletor. Suporte a toque no quadro é um próximo passo.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router

## Estrutura

```
src/
  components/   # Layout, formulários, cartões e componentes de UI
  data/         # store (estado + persistência) e dados de exemplo
  lib/          # datas, cálculo de carga de trabalho e rótulos do domínio
  pages/        # Painel, Tarefas, Projetos, Clientes, Equipe, Configurações
  types.ts      # modelo de domínio
```

## Próximos passos previstos

1. Backend compartilhado + login (multiusuário em tempo real).
2. Obrigações recorrentes (gerar tarefas automaticamente todo mês por cliente).
3. Portal do cliente.
