import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PecaLista } from '../../models/peca.model';
import { MensagemService } from '../../services/mensagem.service';
import { PecasService } from '../../services/pecas.service';

@Component({
  selector: 'app-pecas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pecas-lista.html',
  styleUrl: './pecas-lista.css',
})
export class PecasLista implements OnInit {
  filtroNome = '';
  filtroId = '';
  filtroNomeAplicado = '';
  filtroIdAplicado = '';
  pecas: PecaLista[] = [];

  constructor(
    private pecasService: PecasService,
    private mensagemService: MensagemService,
  ) {
  }

  ngOnInit() {
    this.atualizarPecas();
  }

  get pecasFiltradas(): PecaLista[] {
    const nome = this.filtroNomeAplicado.trim().toLowerCase();
    const id = this.filtroIdAplicado.trim().toLowerCase();

    return this.pecas.filter(peca => {
      const combinaNome = !nome || peca.nome.toLowerCase().includes(nome);
      const combinaId = !id || peca.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.pecasFiltradas.length) });
  }

  aplicarFiltros() {
    this.filtroNomeAplicado = this.filtroNome;
    this.filtroIdAplicado = this.filtroId;
  }

  async excluirPeca(id: string) {
    const confirmado = await this.mensagemService.confirmar('Deseja excluir peca?', 'Excluir peca');

    if (!confirmado) {
      return;
    }

    this.pecasService.excluir(id).subscribe({
      next: () => this.atualizarPecas(),
      error: erro => console.error('Erro ao excluir peca no backend.', erro),
    });
  }

  private atualizarPecas() {
    this.pecasService.listarLista().subscribe({
      next: pecas => {
        this.pecas = pecas;
      },
      error: erro => {
        console.error('Erro ao carregar pecas do backend.', erro);
        this.pecas = [];
      },
    });
  }
}
