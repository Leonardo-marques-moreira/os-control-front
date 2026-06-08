import { PecaSelecionada, ServicoSelecionado } from './orcamento.model';

export type AbaOs = 'pecas' | 'servicos';

export interface OrdemServicoSalva {
  id: string;
  numeroOrcamento: string;
  clienteId: string;
  clienteNome: string;
  veiculoId: string;
  veiculoNome: string;
  status: string;
  tecnicoId: string;
  tecnicoNome: string;
  dataAbertura: string;
  dataFechamento?: string;
  observacao: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
  desconto: string;
  totalOs: string;
  totalOsValor?: number;
}

export interface OrdemServicoLista {
  id: string;
  dataAbertura: string;
  cliente: string;
  veiculo: string;
  status: string;
  tecnico: string;
}

export interface OsPecaApi {
  id?: number;
  pecaId: number | null;
  descricaoPeca: string | null;
  quantidade: number | null;
  valorUnitario: number | null;
  valorTotal: number | null;
}

export interface OsServicoApi {
  id?: number;
  servicoId: number | null;
  descricaoServico: string | null;
  quantidade: number | null;
  valorUnitario: number | null;
  valorTotal: number | null;
}

export interface OrdemServicoApi {
  id: number;
  dataAbertura: string | null;
  dataFechamento: string | null;
  statusOs: string | null;
  observacoes: string | null;
  orcamentoId?: number | null;
  desconto?: number | null;
  valorTotalPecas: number | null;
  valorTotalServico: number | null;
  valorTotal: number | null;
  clienteId: number | null;
  clienteNome: string | null;
  veiculoId: number | null;
  veiculoPlaca: string | null;
  veiculoModelo: string | null;
  tecnicoResponsavelId: number | null;
  tecnicoResponsavelNome: string | null;
  pecas: OsPecaApi[] | null;
  servicos: OsServicoApi[] | null;
}
