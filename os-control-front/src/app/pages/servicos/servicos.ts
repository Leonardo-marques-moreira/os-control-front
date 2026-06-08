import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicoFormulario, ServicoSalvo } from '../../models/servico.model';
import { MensagemService } from '../../services/mensagem.service';
import { ServicosService } from '../../services/servicos.service';
import { converterMoedaParaNumero, formatarMoeda } from '../../utils/formatacao';

@Component({
  selector: 'app-servicos',
  imports: [FormsModule, RouterLink],
  templateUrl: './servicos.html',
  styleUrl: './servicos.css',
})
export class Servicos implements OnInit {
  modoEdicao = false;
  servicoId = '';
  servico: ServicoFormulario = {
    nome: '',
    valor: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private servicosService: ServicosService,
    private mensagemService: MensagemService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.prepararNovoCadastro();
      return;
    }

    this.carregarServico(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar servico' : 'Cadastrar servico';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }

  salvarServico() {
    const nome = this.servico.nome.trim();
    const valor = converterMoedaParaNumero(this.servico.valor);

    if (!nome || valor === null) {
      return;
    }

    const servicoSalvo: ServicoSalvo = {
      id: this.servicoId,
      nome,
      valor: formatarMoeda(valor),
      preco: valor,
    };
    const novoCadastro = !this.modoEdicao;

    this.servicosService.salvar(servicoSalvo).subscribe({
      next: () => {
        if (novoCadastro) {
          this.mensagemService.mostrarSucesso('Servico cadastrado com sucesso.');
        }

        this.router.navigate(['/servicos']);
      },
      error: erro => console.error('Erro ao salvar servico no backend.', erro),
    });
  }

  private carregarServico(id: string) {
    this.servicosService.buscarPorId(id).subscribe({
      next: servico => {
        this.modoEdicao = true;
        this.servicoId = servico.id;
        this.servico = {
          nome: servico.nome,
          valor: typeof servico.preco === 'number' ? String(servico.preco) : servico.valor,
        };
      },
      error: erro => console.error('Erro ao carregar servico do backend.', erro),
    });
  }

  private prepararNovoCadastro() {
    this.servicoId = '';
  }
}
