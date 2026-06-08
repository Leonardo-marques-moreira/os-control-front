export interface Veiculo {
  id: string;
  marca: string;
  placa: string;
  modelo: string;
  ano: string;
}

export interface ClienteFormulario {
  nome: string;
  cpf: string;
  telefone: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento: string;
}

export interface NovoVeiculo {
  marca: string;
  placa: string;
  modelo: string;
  ano: string;
}

export interface ClienteSalvo extends ClienteFormulario {
  id: string;
  veiculos: Veiculo[];
  enderecoId?: number;
}

export interface ClienteLista {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  veiculo: string;
}

export interface EstadoApi {
  id: number;
  nome: string;
  uf?: string;
}

export interface CidadeApi {
  id: number;
  nome: string;
  estado: EstadoApi | null;
}

export interface EnderecoApi {
  id?: number;
  rua: string;
  bairro: string;
  cep: string;
  complemento: string;
  cidade: CidadeApi | string | null;
  estado?: EstadoApi | string | null;
}

export interface VeiculoApi {
  id?: number;
  marca: string;
  placa: string;
  modelo: string;
  ano: number | null;
  cor?: string | null;
}

export interface ClienteApi {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: EnderecoApi | null;
  veiculos: VeiculoApi[];
}

export interface CepApi{
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
