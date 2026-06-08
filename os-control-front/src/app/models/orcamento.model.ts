export type AbaOrcamento = 'pecas' | 'servicos';

export interface ServicoSelecionado {
  id: string;
  itemId?: number;
  nome: string;
  valor: number;
}

export interface PecaSelecionada {
  id: string;
  itemId?: number;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrcamentoSalvo {
  id: string;
  nome: string;
  nomeOrcamento: string;
  dataAbertura: string;
  observacao: string;
  desconto: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
  valorTotal: string;
  total: number;
}

export interface OrcamentoLista {
  id: string;
  nome: string;
  valorTotal: string;
}

export interface OrcamentoImportacao {
  id: string;
  nome: string;
  dataAbertura: string;
  observacao: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
}

export interface OrcamentoPecaApi {
  id?: number;
  valorUnitario: number | null;
  quantidade: number | null;
  valorTotal: number | null;
  peca: {
    id: number;
    descricao?: string;
  } | null;
}

export interface OrcamentoServicoApi {
  id?: number;
  quantidade: number | null;
  valorUnitario: number | null;
  valorTotal: number | null;
  servico: {
    id: number;
    descricao?: string;
  } | null;
}

export interface OrcamentoApi {
  id: number;
  nomeOrcamento: string;
  dataCriacao: string;
  observacao: string;
  valorTotalPecas: number | null;
  valorTotalServico: number | null;
  valorTotal: number | null;
  itensPecas: OrcamentoPecaApi[] | null;
  itensServicos: OrcamentoServicoApi[] | null;
}
