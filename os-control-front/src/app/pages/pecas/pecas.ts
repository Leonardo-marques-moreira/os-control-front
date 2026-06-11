import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PecaFormulario, PecaSalva } from '../../models/peca.model';
import { MensagemService } from '../../services/mensagem.service';
import { PecasService } from '../../services/pecas.service';
import { converterMoedaParaNumero, formatarMoeda } from '../../utils/formatacao';

@Component({
  selector: 'app-pecas',
  imports: [FormsModule, RouterLink],
  templateUrl: './pecas.html',
  styleUrl: './pecas.css',
})
export class Pecas implements OnInit {
  modoEdicao = false;
  pecaId = '';
  peca: PecaFormulario = {
    nome: '',
    valor: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pecasService: PecasService,
    private mensagemService: MensagemService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.prepararNovoCadastro();
      return;
    }

    this.carregarPeca(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar peca' : 'Cadastro de pecas';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }

  salvarPeca() {
    const nome = this.peca.nome.trim();
    const valor = converterMoedaParaNumero(this.peca.valor);

    if (!nome) {
      this.mensagemService.mostrarErro('Nome da peça é obrigatória.');
      return;
    }

    if (valor === null || valor <= 0) {
      this.mensagemService.mostrarErro('Valor unitário da peça deve ser maior que zero.');
      return;
    }

    const pecaSalva: PecaSalva = {
      id: this.pecaId,
      nome,
      valor: formatarMoeda(valor),
      valorUnitario: valor,
    };
    const novoCadastro = !this.modoEdicao;

    this.pecasService.salvar(pecaSalva).subscribe({
      next: () => {
        if (novoCadastro) {
          this.mensagemService.mostrarSucesso('Peca cadastrada com sucesso.');
        }

        this.router.navigate(['/pecas']);
      },
      error: erro => console.error('Erro ao salvar peca no backend.', erro),
    });
  }

  private carregarPeca(id: string) {
    this.pecasService.buscarPorId(id).subscribe({
      next: peca => {
        this.modoEdicao = true;
        this.pecaId = peca.id;
        this.peca = {
          nome: peca.nome,
          valor: typeof peca.valorUnitario === 'number' ? String(peca.valorUnitario) : peca.valor,
        };
      },
      error: erro => console.error('Erro ao carregar peca do backend.', erro),
    });
  }

  private prepararNovoCadastro() {
    this.pecaId = '';
  }
}
