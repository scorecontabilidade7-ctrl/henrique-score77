import type { DadosApp } from '../types'
import { isoRelativo } from '../lib/dates'

// Sample data so the office sees a working product on first open.
// It can be wiped from Configurações; real data replaces it as it's entered.

export const dadosIniciais: DadosApp = {
  membros: [
    { id: 'm1', nome: 'Henrique Souza', cargo: 'Sócio-diretor', email: 'henrique@escritorio.com.br', cor: 'bg-indigo-500' },
    { id: 'm2', nome: 'Amanda Ribeiro', cargo: 'Contadora sênior', email: 'amanda@escritorio.com.br', cor: 'bg-rose-500' },
    { id: 'm3', nome: 'Bruno Carvalho', cargo: 'Analista fiscal', email: 'bruno@escritorio.com.br', cor: 'bg-emerald-500' },
    { id: 'm4', nome: 'Carla Nunes', cargo: 'Analista de folha', email: 'carla@escritorio.com.br', cor: 'bg-amber-500' },
    { id: 'm5', nome: 'Diego Martins', cargo: 'Consultor tributário', email: 'diego@escritorio.com.br', cor: 'bg-sky-500' },
  ],
  clientes: [
    { id: 'c1', nome: 'Padaria Pão Quente Ltda', cnpj: '12.345.678/0001-90', regime: 'simples_nacional', responsavelId: 'm3', ativo: true },
    { id: 'c2', nome: 'TechNova Sistemas', cnpj: '23.456.789/0001-01', regime: 'lucro_presumido', responsavelId: 'm2', ativo: true },
    { id: 'c3', nome: 'Construtora Alicerce S.A.', cnpj: '34.567.890/0001-12', regime: 'lucro_real', responsavelId: 'm2', ativo: true },
    { id: 'c4', nome: 'Studio Bella Estética', cnpj: '45.678.901/0001-23', regime: 'mei', responsavelId: 'm4', ativo: true },
    { id: 'c5', nome: 'Instituto Semear', cnpj: '56.789.012/0001-34', regime: 'terceiro_setor', responsavelId: 'm3', ativo: true },
    { id: 'c6', nome: 'Mercado São João', cnpj: '67.890.123/0001-45', regime: 'simples_nacional', responsavelId: 'm4', ativo: true },
    { id: 'c7', nome: 'Advocacia Lima & Costa', cnpj: '78.901.234/0001-56', regime: 'lucro_presumido', responsavelId: 'm3', ativo: false },
  ],
  projetos: [
    { id: 'p1', nome: 'Planejamento tributário 2026', clienteId: 'c3', descricao: 'Estudo de reenquadramento e economia fiscal para a construtora.', status: 'em_andamento', inicio: isoRelativo(-20), fim: isoRelativo(40) },
    { id: 'p2', nome: 'Implantação de sistema contábil', clienteId: 'c2', descricao: 'Migração de dados e treinamento da equipe interna da TechNova.', status: 'planejado', inicio: isoRelativo(5), fim: isoRelativo(60) },
    { id: 'p3', nome: 'Abertura de filial', clienteId: 'c6', descricao: 'Constituição de nova unidade e regularização de licenças.', status: 'em_andamento', inicio: isoRelativo(-10), fim: isoRelativo(20) },
  ],
  tarefas: [
    { id: 't1', titulo: 'Apurar DAS - Simples Nacional', descricao: 'Calcular e emitir a guia do Simples referente ao mês anterior.', clienteId: 'c1', responsavelId: 'm3', projetoId: null, tipo: 'contabil', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(2), criadaEm: new Date().toISOString() },
    { id: 't2', titulo: 'Fechar folha de pagamento', descricao: 'Consolidar folha e enviar para aprovação do cliente.', clienteId: 'c6', responsavelId: 'm4', projetoId: null, tipo: 'contabil', prioridade: 'urgente', status: 'em_andamento', prazo: isoRelativo(1), criadaEm: new Date().toISOString() },
    { id: 't3', titulo: 'Entregar EFD-Contribuições', descricao: 'Gerar e transmitir o SPED Contribuições.', clienteId: 'c3', responsavelId: 'm2', projetoId: null, tipo: 'contabil', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(-1), criadaEm: new Date().toISOString() },
    { id: 't4', titulo: 'Levantar dados para estudo tributário', descricao: 'Coletar balancetes dos últimos 12 meses.', clienteId: 'c3', responsavelId: 'm5', projetoId: 'p1', tipo: 'consultoria', prioridade: 'media', status: 'em_andamento', prazo: isoRelativo(4), criadaEm: new Date().toISOString() },
    { id: 't5', titulo: 'Conciliação bancária', descricao: 'Conciliar extratos de junho.', clienteId: 'c2', responsavelId: 'm2', projetoId: null, tipo: 'contabil', prioridade: 'media', status: 'em_revisao', prazo: isoRelativo(3), criadaEm: new Date().toISOString() },
    { id: 't6', titulo: 'Emitir guia INSS', descricao: 'Gerar guia da previdência social.', clienteId: 'c4', responsavelId: 'm4', projetoId: null, tipo: 'contabil', prioridade: 'alta', status: 'a_fazer', prazo: isoRelativo(0), criadaEm: new Date().toISOString() },
    { id: 't7', titulo: 'Reunião de kickoff da implantação', descricao: 'Alinhar cronograma e responsáveis com a TechNova.', clienteId: 'c2', responsavelId: 'm5', projetoId: 'p2', tipo: 'consultoria', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(6), criadaEm: new Date().toISOString() },
    { id: 't8', titulo: 'Preparar demonstrações contábeis', descricao: 'DRE e balanço patrimonial do trimestre.', clienteId: 'c3', responsavelId: 'm2', projetoId: null, tipo: 'contabil', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(9), criadaEm: new Date().toISOString() },
    { id: 't9', titulo: 'Regularizar licença de funcionamento', descricao: 'Protocolar renovação junto à prefeitura.', clienteId: 'c6', responsavelId: 'm3', projetoId: 'p3', tipo: 'consultoria', prioridade: 'alta', status: 'em_andamento', prazo: isoRelativo(-2), criadaEm: new Date().toISOString() },
    { id: 't10', titulo: 'Enviar relatório mensal', descricao: 'Relatório gerencial para o Instituto Semear.', clienteId: 'c5', responsavelId: 'm3', projetoId: null, tipo: 'avulsa', prioridade: 'baixa', status: 'concluido', prazo: isoRelativo(-3), criadaEm: new Date().toISOString() },
    { id: 't11', titulo: 'Atualizar cadastro na Receita', descricao: 'Alteração de quadro societário.', clienteId: 'c4', responsavelId: 'm3', projetoId: null, tipo: 'avulsa', prioridade: 'media', status: 'a_fazer', prazo: isoRelativo(12), criadaEm: new Date().toISOString() },
    { id: 't12', titulo: 'Revisar contrato de consultoria', descricao: 'Ajustar escopo do planejamento tributário.', clienteId: 'c3', responsavelId: 'm5', projetoId: 'p1', tipo: 'consultoria', prioridade: 'baixa', status: 'em_revisao', prazo: isoRelativo(7), criadaEm: new Date().toISOString() },
    { id: 't13', titulo: 'Emitir DARF IRPJ', descricao: 'Guia de imposto de renda pessoa jurídica.', clienteId: 'c2', responsavelId: 'm2', projetoId: null, tipo: 'contabil', prioridade: 'urgente', status: 'a_fazer', prazo: isoRelativo(1), criadaEm: new Date().toISOString() },
    { id: 't14', titulo: 'Baixar notas fiscais do mês', descricao: 'Importar XMLs de entrada e saída.', clienteId: 'c1', responsavelId: 'm3', projetoId: null, tipo: 'contabil', prioridade: 'media', status: 'concluido', prazo: isoRelativo(-5), criadaEm: new Date().toISOString() },
  ],
}
