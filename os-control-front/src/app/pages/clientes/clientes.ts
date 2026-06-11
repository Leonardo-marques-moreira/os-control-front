import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClienteFormulario, ClienteSalvo, NovoVeiculo, Veiculo } from '../../models/cliente.model';
import { CepService } from '../../services/cep.service';
import { ClientesService } from '../../services/clientes.service';
import { MensagemService } from '../../services/mensagem.service';
import { formatarCpf, formatarTelefone } from '../../utils/formatacao';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  modoEdicao = false;
  clienteId = '';
  clienteEnderecoId?: number;
  cadastroVeiculoAberto = false;
  cliente: ClienteFormulario = {
    nome: '',
    cpf: '',
    telefone: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: '',
  };
  veiculos: Veiculo[] = [];
  novoVeiculo: NovoVeiculo = {
    marca: '',
    placa: '',
    modelo: '',
    ano: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientesService: ClientesService,
    private cepService: CepService,
    private mensagemService: MensagemService,
  ) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.carregarCliente(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar cliente' : 'Cadastrar cliente';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar cliente' : 'Cadastrar cliente';
  }

  abrirCadastroVeiculo() {
    this.limparNovoVeiculo();
    this.cadastroVeiculoAberto = true;
  }

  fecharCadastroVeiculo() {
    this.cadastroVeiculoAberto = false;
  }

  adicionarVeiculo() {
    const marca = this.formatarTextoMaiusculo(this.novoVeiculo.marca);
    const placa = this.formatarTextoMaiusculo(this.novoVeiculo.placa);
    const modelo = this.formatarTextoMaiusculo(this.novoVeiculo.modelo);
    const ano = this.formatarTextoMaiusculo(this.novoVeiculo.ano);

    if (!marca && !placa && !modelo && !ano) {
      return;
    }

    this.veiculos = [
      ...this.veiculos,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        marca,
        placa,
        modelo,
        ano,
      },
    ];

    this.fecharCadastroVeiculo();
    this.limparNovoVeiculo();
  }

  excluirVeiculo(id: string) {
    this.veiculos = this.veiculos.filter(veiculo => veiculo.id !== id);
  }

  salvarCliente() {
    const clienteSalvo: ClienteSalvo = {
      id: this.clienteId,
      ...this.cliente,
      veiculos: this.veiculos,
      enderecoId: this.modoEdicao ? this.clienteEnderecoId : undefined,
    };
    const novoCadastro = !this.modoEdicao;

    this.clientesService.salvar(clienteSalvo).subscribe({
      next: () => {
        if (novoCadastro) {
          this.mensagemService.mostrarSucesso('Cliente cadastrado com sucesso.');
        }

        this.router.navigate(['/clientes']);
      },
      error: erro => {
        console.error('Nao foi possivel salvar o cliente.', erro);
        const mensagem =
          erro?.error?.message ||
          erro?.message ||
          'Nao foi possivel salvar o cliente. Verifique se a cidade e o estado existem no backend.';
        this.mensagemService.mostrarErro(mensagem);
      },
    });
  }

  private carregarCliente(id: string) {
    this.clientesService.buscarPorId(id).subscribe({
      next: cliente => {
        this.modoEdicao = true;
        this.clienteId = cliente.id;
        this.clienteEnderecoId = cliente.enderecoId;
        this.cliente = {
          nome: cliente.nome,
          cpf: cliente.cpf,
          telefone: cliente.telefone,
          rua: cliente.rua,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          estado: cliente.estado,
          cep: cliente.cep,
          complemento: cliente.complemento,
        };
        this.veiculos = Array.isArray(cliente.veiculos) ? cliente.veiculos : [];
      },
      error: erro => {
        console.error('Nao foi possivel carregar o cliente.', erro);
      },
    });
  }

  private normalizarCep(valor: string) {
    return (valor ?? '').replace(/\D/g, '').slice(0, 8);
  }

  private buscarEnderecoPorCep(cep: string) {
    this.cepService.buscarPorCep(cep).subscribe({
      next: endereco => {
        if (endereco.erro) {
          return;
        }

        this.cliente.rua = endereco.logradouro || '';
        this.cliente.bairro = endereco.bairro || '';
        this.cliente.cidade = endereco.localidade || '';
        this.cliente.estado = endereco.uf || '';
        this.cliente.complemento = endereco.complemento || '';
      },
      error: erro => {
        console.error('Nao foi possivel buscar o CEP.', erro);
      },
    });
  }

  atualizarCep(valor: string) {
    const cep = this.normalizarCep(valor);
    this.cliente.cep = cep;

    if (cep.length !== 8) {
      return;
    }

    this.buscarEnderecoPorCep(cep);
  }

  atualizarCpf(valor: string) {
    this.cliente.cpf = formatarCpf(valor);
  }

  atualizarTelefone(valor: string) {
    this.cliente.telefone = formatarTelefone(valor);
  }

  atualizarVeiculo(campo: keyof NovoVeiculo, valor: string) {
    this.novoVeiculo[campo] = this.formatarTextoMaiusculo(valor);
  }

  private limparNovoVeiculo() {
    this.novoVeiculo = {
      marca: '',
      placa: '',
      modelo: '',
      ano: '',
    };
  }

  private formatarTextoMaiusculo(valor: string) {
    return (valor ?? '').toUpperCase().trimStart();
  }
}
