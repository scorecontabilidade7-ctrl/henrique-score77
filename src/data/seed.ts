import type { DadosApp } from '../types'
import { isoRelativo } from '../lib/dates'

// Sample data so the office sees a working product on first open.
// Inspired by a real consulting schedule: a project split into stages (Etapas),
// tasks per stage with multiple people, scheduled meetings and logged hours.

const agora = () => new Date().toISOString()

export const dadosIniciais: DadosApp = {
  membros: [
    { id: 'm1', nome: 'Henrique Figueira', cargo: 'Consultor líder', email: 'henrique@escritorio.com.br', cor: 'bg-indigo-500', cargaHorariaSemanal: 44 },
    { id: 'm2', nome: 'Amanda Ribeiro', cargo: 'Consultora sênior', email: 'amanda@escritorio.com.br', cor: 'bg-rose-500', cargaHorariaSemanal: 40 },
    { id: 'm3', nome: 'Bruno Carvalho', cargo: 'Analista fiscal', email: 'bruno@escritorio.com.br', cor: 'bg-emerald-500', cargaHorariaSemanal: 40 },
    { id: 'm4', nome: 'Carla Nunes', cargo: 'Analista de folha', email: 'carla@escritorio.com.br', cor: 'bg-amber-500', cargaHorariaSemanal: 30 },
    { id: 'm5', nome: 'Diego Martins', cargo: 'Consultor tributário', email: 'diego@escritorio.com.br', cor: 'bg-sky-500', cargaHorariaSemanal: 40 },
  ],
  clientes: [
    { id: 'c1', nome: 'Padaria Pão Quente Ltda', cnpj: '12.345.678/0001-90', regime: 'simples_nacional', responsavelId: 'm3', assistentesIds: ['m4'], ativo: true, valorMensal: 900, segmento: 'Alimentação' },
    { id: 'c2', nome: 'TechNova Sistemas', cnpj: '23.456.789/0001-01', regime: 'lucro_presumido', responsavelId: 'm2', assistentesIds: ['m3'], ativo: true, valorMensal: 1600, segmento: 'Tecnologia' },
    { id: 'c3', nome: 'Construtora Alicerce S.A.', cnpj: '34.567.890/0001-12', regime: 'lucro_real', responsavelId: 'm1', assistentesIds: ['m2'], ativo: true, valorMensal: 1800, segmento: 'Indústria leve' },
    { id: 'c4', nome: 'Studio Bella Estética', cnpj: '45.678.901/0001-23', regime: 'mei', responsavelId: 'm4', assistentesIds: ['m3'], ativo: true, valorMensal: 700, segmento: 'Saúde e Bem Estar' },
    { id: 'c6', nome: 'Mercado São João', cnpj: '67.890.123/0001-45', regime: 'simples_nacional', responsavelId: 'm4', assistentesIds: ['m5'], ativo: true, valorMensal: 1000, segmento: 'Varejo' },
    { id: 'c7', nome: 'Clínica Odontológica Lyndanara', cnpj: '78.901.234/0001-56', regime: 'lucro_presumido', responsavelId: 'm1', assistentesIds: ['m4'], ativo: true, valorMensal: 1620, segmento: 'Saúde e Bem Estar' },
    { id: 'c8', nome: 'Rosa Brand Moda', cnpj: '89.012.345/0001-67', regime: 'simples_nacional', responsavelId: 'm1', assistentesIds: ['m5'], ativo: true, valorMensal: 1800, segmento: 'Moda e Vestuário' },
    { id: 'c9', nome: 'Gabi Gourmet Confeitaria', cnpj: '90.123.456/0001-78', regime: 'mei', responsavelId: 'm1', assistentesIds: ['m4'], ativo: true, valorMensal: 1412, segmento: 'Alimentação' },
    { id: 'c10', nome: 'Soluvidros Indústria', cnpj: '01.234.567/0001-89', regime: 'lucro_real', responsavelId: 'm2', assistentesIds: ['m5'], ativo: true, valorMensal: 1250, segmento: 'Indústria leve' },
    { id: 'c11', nome: 'Qualifica Ensino', cnpj: '11.222.333/0001-44', regime: 'terceiro_setor', responsavelId: 'm2', assistentesIds: ['m3'], ativo: true, valorMensal: 1800, segmento: 'Educação' },
    { id: 'c12', nome: 'Garage 06 Automotivo', cnpj: '22.333.444/0001-55', regime: 'simples_nacional', responsavelId: 'm5', assistentesIds: ['m3'], ativo: true, valorMensal: 1000, segmento: 'Automotivo' },
    { id: 'c13', nome: 'B&L Elétrica', cnpj: '33.444.555/0001-66', regime: 'simples_nacional', responsavelId: 'm5', assistentesIds: ['m4'], ativo: true, valorMensal: 1700, segmento: 'Serviços' },
    { id: 'c14', nome: 'We Pets Comércio', cnpj: '44.555.666/0001-77', regime: 'mei', responsavelId: 'm3', assistentesIds: ['m5'], ativo: true, valorMensal: 460, segmento: 'Pet' },
    { id: 'c15', nome: 'Lais Bastos Odontologia', cnpj: '55.666.777/0001-88', regime: 'simples_nacional', responsavelId: 'm3', assistentesIds: ['m2'], ativo: true, valorMensal: 1250, segmento: 'Saúde e Bem Estar' },
    { id: 'c16', nome: 'Naturally Padaria', cnpj: '66.777.888/0001-99', regime: 'simples_nacional', responsavelId: 'm4', assistentesIds: ['m2'], ativo: false, valorMensal: 1800, segmento: 'Alimentação' },
  ],
  projetos: [
    { id: 'p1', nome: 'Consultoria Financeira', clienteId: 'c3', descricao: 'Implantação de gestão financeira: plano de contas, fluxo de caixa, contas a pagar/receber e planejamento orçamentário.', status: 'em_andamento', inicio: isoRelativo(-30), fim: isoRelativo(120) },
    { id: 'p2', nome: 'Implantação de sistema contábil', clienteId: 'c2', descricao: 'Migração de dados e treinamento da equipe interna da TechNova.', status: 'em_andamento', inicio: isoRelativo(-10), fim: isoRelativo(50) },
    { id: 'p3', nome: 'Abertura de filial', clienteId: 'c6', descricao: 'Constituição de nova unidade e regularização de licenças.', status: 'planejado', inicio: isoRelativo(5), fim: isoRelativo(40) },
  ],
  etapas: [
    // Projeto 1 — fluxo de consultoria financeira (baseado no cronograma)
    { id: 'e1', projetoId: 'p1', nome: 'Análise Inicial', ordem: 1, cor: 'bg-indigo-500' },
    { id: 'e2', projetoId: 'p1', nome: 'Organização', ordem: 2, cor: 'bg-emerald-500' },
    { id: 'e3', projetoId: 'p1', nome: 'Controle', ordem: 3, cor: 'bg-amber-500' },
    { id: 'e4', projetoId: 'p1', nome: 'Análise', ordem: 4, cor: 'bg-rose-500' },
    { id: 'e5', projetoId: 'p1', nome: 'Planejamento', ordem: 5, cor: 'bg-sky-500' },
    // Projeto 2
    { id: 'e6', projetoId: 'p2', nome: 'Levantamento', ordem: 1, cor: 'bg-indigo-500' },
    { id: 'e7', projetoId: 'p2', nome: 'Migração', ordem: 2, cor: 'bg-emerald-500' },
    { id: 'e8', projetoId: 'p2', nome: 'Treinamento', ordem: 3, cor: 'bg-amber-500' },
    // Projeto 3
    { id: 'e9', projetoId: 'p3', nome: 'Documentação', ordem: 1, cor: 'bg-indigo-500' },
    { id: 'e10', projetoId: 'p3', nome: 'Regularização', ordem: 2, cor: 'bg-emerald-500' },
  ],
  tarefas: [
    // --- Projeto 1: Consultoria Financeira ---
    { id: 't1', titulo: 'Briefing e recolhimento de arquivos', descricao: 'Coletar documentos contábeis dos últimos 3 meses.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e1', responsaveisIds: ['m1'], tipo: 'consultoria', prioridade: 'urgente', status: 'concluido', prazo: isoRelativo(-24), estimativaHoras: 8, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't2', titulo: 'Diagnóstico empresarial', descricao: 'Levantar situação financeira e gargalos.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e1', responsaveisIds: ['m2', 'm1'], tipo: 'consultoria', prioridade: 'alta', status: 'concluido', prazo: isoRelativo(-17), estimativaHoras: 12, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't3', titulo: 'Análise SWOT e Matriz GUT', descricao: 'Priorizar problemas por Gravidade, Urgência e Tendência.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e1', responsaveisIds: ['m1', 'm5'], tipo: 'consultoria', prioridade: 'alta', status: 'em_revisao', prazo: isoRelativo(-1), estimativaHoras: 10, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't4', titulo: 'Criação do plano de contas', descricao: 'Estruturar o plano de contas da empresa.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e2', responsaveisIds: ['m3'], tipo: 'consultoria', prioridade: 'alta', status: 'em_andamento', prazo: isoRelativo(3), estimativaHoras: 16, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't5', titulo: 'Mapeamento do processo financeiro', descricao: 'Desenhar as rotinas financeiras atuais.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e2', responsaveisIds: ['m2'], tipo: 'consultoria', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(6), estimativaHoras: 14, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't6', titulo: 'Fluxo de caixa (desenho do processo)', descricao: 'Implantar controle diário de caixa.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e3', responsaveisIds: ['m2', 'm5'], tipo: 'consultoria', prioridade: 'urgente', status: 'a_fazer', prazo: isoRelativo(9), estimativaHoras: 20, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't7', titulo: 'Contas a pagar (treinamento)', descricao: 'Treinar equipe do cliente no processo de CP.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e3', responsaveisIds: ['m3'], tipo: 'consultoria', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(16), estimativaHoras: 8, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't8', titulo: 'DRE e DFC do trimestre', descricao: 'Montar demonstrações e curva ABC.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e4', responsaveisIds: ['m1'], tipo: 'consultoria', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(25), estimativaHoras: 12, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't9', titulo: 'Planejamento orçamentário 2027', descricao: 'Construir orçamento anual com o cliente.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e5', responsaveisIds: ['m1', 'm2'], tipo: 'consultoria', prioridade: 'baixa', status: 'a_fazer', prazo: isoRelativo(40), estimativaHoras: 18, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },

    // --- Projeto 2: Implantação de sistema contábil ---
    { id: 't10', titulo: 'Levantar volume de notas fiscais', descricao: 'Dimensionar a migração de dados.', clienteId: 'c2', projetoId: 'p2', etapaId: 'e6', responsaveisIds: ['m2'], tipo: 'consultoria', prioridade: 'media', status: 'em_andamento', prazo: isoRelativo(4), estimativaHoras: 6, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't11', titulo: 'Migração de dados contábeis', descricao: 'Importar histórico para o novo sistema.', clienteId: 'c2', projetoId: 'p2', etapaId: 'e7', responsaveisIds: ['m3', 'm2'], tipo: 'consultoria', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(20), estimativaHoras: 24, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },

    // --- Tarefas contábeis avulsas / recorrentes ---
    { id: 't12', titulo: 'Apurar DAS - Simples Nacional', descricao: 'Emitir guia do Simples do mês.', clienteId: 'c1', projetoId: null, etapaId: null, responsaveisIds: ['m3'], tipo: 'contabil', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(2), estimativaHoras: 2, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't13', titulo: 'Fechar folha de pagamento', descricao: 'Consolidar folha e enviar para aprovação.', clienteId: 'c6', projetoId: null, etapaId: null, responsaveisIds: ['m4'], tipo: 'contabil', prioridade: 'urgente', status: 'em_andamento', prazo: isoRelativo(1), estimativaHoras: 4, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },
    { id: 't14', titulo: 'Emitir guia INSS', descricao: 'Gerar guia da previdência.', clienteId: 'c4', projetoId: null, etapaId: null, responsaveisIds: ['m4'], tipo: 'contabil', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(0), estimativaHoras: 1, data: null, horaInicio: null, horaFim: null, checklists: [], comentarios: [], criadaEm: agora() },

    // --- Reuniões agendadas (aparecem no Calendário; algumas com vários responsáveis) ---
    { id: 'r1', titulo: 'Alinhamento diário da consultoria', descricao: 'Daily do time de consultoria.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e2', responsaveisIds: ['m1', 'm2', 'm5'], tipo: 'reuniao', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(0), estimativaHoras: 0.5, data: isoRelativo(0), horaInicio: '09:00', horaFim: '09:30', checklists: [], comentarios: [], criadaEm: agora() },
    { id: 'r2', titulo: 'Reunião de diagnóstico com o cliente', descricao: 'Apresentar SWOT e GUT à Construtora Alicerce.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e1', responsaveisIds: ['m1', 'm2'], tipo: 'reuniao', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(0), estimativaHoras: 1, data: isoRelativo(0), horaInicio: '11:00', horaFim: '12:00', checklists: [], comentarios: [], criadaEm: agora() },
    { id: 'r3', titulo: 'Treinamento de fluxo de caixa', descricao: 'Treinar equipe do cliente.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e3', responsaveisIds: ['m2'], tipo: 'reuniao', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(1), estimativaHoras: 2, data: isoRelativo(1), horaInicio: '14:00', horaFim: '16:00', checklists: [], comentarios: [], criadaEm: agora() },
    { id: 'r4', titulo: 'Kickoff implantação TechNova', descricao: 'Alinhar cronograma e responsáveis.', clienteId: 'c2', projetoId: 'p2', etapaId: 'e6', responsaveisIds: ['m2', 'm3'], tipo: 'reuniao', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(2), estimativaHoras: 1.5, data: isoRelativo(2), horaInicio: '10:00', horaFim: '11:30', checklists: [], comentarios: [], criadaEm: agora() },
    { id: 'r5', titulo: 'Revisão semanal do projeto', descricao: 'Status geral com sócios.', clienteId: 'c3', projetoId: 'p1', etapaId: null, responsaveisIds: ['m1', 'm2', 'm3', 'm5'], tipo: 'reuniao', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(3), estimativaHoras: 1, data: isoRelativo(3), horaInicio: '16:00', horaFim: '17:00', checklists: [], comentarios: [], criadaEm: agora() },
    { id: 'r6', titulo: 'Reunião com contador do cliente', descricao: 'Dúvidas do plano de contas.', clienteId: 'c3', projetoId: 'p1', etapaId: 'e2', responsaveisIds: ['m3'], tipo: 'reuniao', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(-1), estimativaHoras: 1, data: isoRelativo(-1), horaInicio: '15:00', horaFim: '16:00', checklists: [], comentarios: [], criadaEm: agora() },

    // --- Quadro semanal (cartões por dia, com checklists estilo Trello) ---
    {
      id: 'q1', titulo: 'R3 Distribuidora', descricao: 'Estruturação financeira e dashboard.', clienteId: 'c2', projetoId: 'p2', etapaId: 'e7', responsaveisIds: ['m2', 'm3'], tipo: 'consultoria', prioridade: 'urgente', status: 'em_andamento', prazo: isoRelativo(0), estimativaHoras: 20, data: isoRelativo(0), horaInicio: null, horaFim: null,
      checklists: [
        { id: 'q1c1', titulo: 'Muito Urgente', itens: [
          { id: 'i1', texto: 'Análise da Varjocar', feito: true },
          { id: 'i2', texto: 'Análise da farmácia e R3 Plus', feito: true },
          { id: 'i3', texto: 'Montar DFC - R3', feito: true },
          { id: 'i4', texto: 'Gestão de Projetos', feito: false },
          { id: 'i5', texto: 'Organizar dados do plano de contas padrão', feito: false },
        ]},
        { id: 'q1c2', titulo: 'Urgente', itens: [
          { id: 'i6', texto: 'Inserir campo faturamento na API', feito: true },
          { id: 'i7', texto: 'Criar usuário para acesso ao dashboard', feito: false },
          { id: 'i8', texto: 'Atualizar documentação da API', feito: false },
        ]},
      ],
      comentarios: [
        { id: 'q1cm1', texto: 'Movi este cartão de Sexta para Quarta.', data: isoRelativo(-1) + 'T09:12:00', autorId: 'm2' },
        { id: 'q1cm2', texto: 'Plano de contas padrão em revisão com o Bruno.', data: isoRelativo(0) + 'T08:36:00', autorId: 'm3' },
      ],
      criadaEm: agora(),
    },
    { id: 'q2', titulo: '3A Frios', descricao: 'Diagnóstico e organização.', clienteId: 'c6', projetoId: null, etapaId: null, responsaveisIds: ['m3'], tipo: 'consultoria', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(0), estimativaHoras: 6, data: isoRelativo(0), horaInicio: null, horaFim: null, checklists: [ { id: 'q2c1', titulo: 'Tarefas', itens: [ { id: 'j1', texto: 'Levantar contas a pagar', feito: false }, { id: 'j2', texto: 'Conciliar extratos', feito: false } ] } ], comentarios: [], criadaEm: agora() },
    { id: 'q3', titulo: 'Dra Lyndanara', descricao: 'Fechamento e relatórios da clínica.', clienteId: 'c7', projetoId: null, etapaId: null, responsaveisIds: ['m1', 'm4'], tipo: 'contabil', prioridade: 'alta', status: 'em_andamento', prazo: isoRelativo(0), estimativaHoras: 8, data: isoRelativo(0), horaInicio: null, horaFim: null, checklists: [ { id: 'q3c1', titulo: 'Fechamento', itens: [ { id: 'k1', texto: 'DRE do mês', feito: true }, { id: 'k2', texto: 'Conciliação bancária', feito: true }, { id: 'k3', texto: 'Relatório gerencial', feito: false }, { id: 'k4', texto: 'Apuração de impostos', feito: false } ] } ], comentarios: [ { id: 'q3cm1', texto: 'Cliente pediu o relatório até quinta.', data: isoRelativo(-1) + 'T14:20:00', autorId: 'm1' } ], criadaEm: agora() },
    { id: 'q4', titulo: 'CCS / Toth', descricao: 'Implantação de processos.', clienteId: 'c10', projetoId: null, etapaId: null, responsaveisIds: ['m2'], tipo: 'consultoria', prioridade: 'media', status: 'em_andamento', prazo: isoRelativo(-1), estimativaHoras: 10, data: isoRelativo(-1), horaInicio: null, horaFim: null, checklists: [ { id: 'q4c1', titulo: 'Etapas', itens: [ { id: 'l1', texto: 'Mapear processo de compras', feito: true }, { id: 'l2', texto: 'Desenhar fluxo de aprovação', feito: false } ] } ], comentarios: [], criadaEm: agora() },
    { id: 'q5', titulo: 'Wepets', descricao: 'Controle de estoque e caixa.', clienteId: 'c14', projetoId: null, etapaId: null, responsaveisIds: ['m3', 'm5'], tipo: 'consultoria', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(1), estimativaHoras: 6, data: isoRelativo(1), horaInicio: null, horaFim: null, checklists: [ { id: 'q5c1', titulo: 'Tarefas', itens: [ { id: 'n1', texto: 'Inventário inicial', feito: true }, { id: 'n2', texto: 'Cadastro de produtos', feito: false }, { id: 'n3', texto: 'Treinamento do caixa', feito: false } ] } ], comentarios: [], criadaEm: agora() },
    { id: 'q6', titulo: 'Caíque Pneus Park', descricao: 'Plano de contas e fluxo de caixa.', clienteId: 'c12', projetoId: null, etapaId: null, responsaveisIds: ['m5'], tipo: 'consultoria', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(1), estimativaHoras: 12, data: isoRelativo(1), horaInicio: null, horaFim: null, checklists: [ { id: 'q6c1', titulo: 'Implantação', itens: [ { id: 'o1', texto: 'Plano de contas', feito: true }, { id: 'o2', texto: 'Fluxo de caixa', feito: true }, { id: 'o3', texto: 'Contas a receber', feito: false } ] } ], comentarios: [], criadaEm: agora() },
    { id: 'q7', titulo: 'For Men Prime', descricao: 'Abertura de loja.', clienteId: 'c8', projetoId: null, etapaId: null, responsaveisIds: ['m1'], tipo: 'avulsa', prioridade: 'baixa', status: 'a_fazer', prazo: isoRelativo(2), estimativaHoras: 3, data: isoRelativo(2), horaInicio: null, horaFim: null, checklists: [ { id: 'q7c1', titulo: 'Checklist', itens: [ { id: 'p1', texto: 'Contrato social', feito: false } ] } ], comentarios: [], criadaEm: agora() },
    { id: 'q8', titulo: 'Score (interno)', descricao: 'Melhorias do processo interno.', clienteId: null, projetoId: null, etapaId: null, responsaveisIds: ['m1', 'm2', 'm3'], tipo: 'avulsa', prioridade: 'media', status: 'em_andamento', prazo: isoRelativo(-1), estimativaHoras: 8, data: isoRelativo(-1), horaInicio: null, horaFim: null, checklists: [ { id: 'q8c1', titulo: 'Interno', itens: [ { id: 'r1i', texto: 'Padronizar plano de contas', feito: true }, { id: 'r2i', texto: 'Modelo de relatório gerencial', feito: true }, { id: 'r3i', texto: 'Documentar rotina de fechamento', feito: false } ] } ], comentarios: [], criadaEm: agora() },
  ],
  apontamentos: [
    // Horas já lançadas nesta semana
    { id: 'a1', tarefaId: 't1', membroId: 'm1', data: isoRelativo(-2), horas: 8, comentario: 'Coleta de arquivos concluída.' },
    { id: 'a2', tarefaId: 't2', membroId: 'm2', data: isoRelativo(-2), horas: 6, comentario: 'Diagnóstico inicial.' },
    { id: 'a3', tarefaId: 't2', membroId: 'm1', data: isoRelativo(-1), horas: 4, comentario: 'Revisão do diagnóstico.' },
    { id: 'a4', tarefaId: 't3', membroId: 'm1', data: isoRelativo(-1), horas: 5, comentario: 'Matriz GUT.' },
    { id: 'a5', tarefaId: 't4', membroId: 'm3', data: isoRelativo(0), horas: 3, comentario: 'Estruturando plano de contas.' },
    { id: 'a6', tarefaId: 't10', membroId: 'm2', data: isoRelativo(0), horas: 2.5, comentario: 'Levantamento de notas.' },
    { id: 'a7', tarefaId: 't13', membroId: 'm4', data: isoRelativo(-1), horas: 3, comentario: 'Folha em andamento.' },
    { id: 'a8', tarefaId: 'r3', membroId: 'm2', data: isoRelativo(-3), horas: 2, comentario: 'Preparação do treinamento.' },
  ],
}
