export interface PecaFormulario { // define a estrutura dos dados de uma peça para o formulário, contendo os campos necessários para criar ou editar uma peça
  nome: string;
  valor: string;
}

export interface PecaApi { // define a estrutura dos dados de uma peça conforme retornado pelo backend, contendo os campos que o backend utiliza para representar uma peça
  id: number;
  descricao: string;
  valorUnitario: number;
}

export interface PecaSalva {  // define a estrutura dos dados de uma peça salva, estendendo o formato do formulário e adicionando o campo de ID para identificar a peça no backend, além de manter o valor numérico para edição
  id: string;
  nome: string;
  valor: string;
  valorUnitario: number;
}

export interface PecaLista { //   define a estrutura dos dados de uma peça para exibição na lista, contendo apenas os campos necessários para mostrar as informações da peça na tabela, formatando o valor como moeda
  id: string; 
  nome: string;
  valor: string;
}
