import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrcamentoLista } from '../../models/orcamento.model';
import { MensagemService } from '../../services/mensagem.service';
import { OrcamentosService } from '../../services/orcamentos.service';

@Component({
  selector: 'app-orcamentos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orcamentos-lista.html',
  styleUrl: './orcamentos-lista.css',
})
export class OrcamentosLista implements OnInit {
  filtroNome = '';
  filtroId = '';
  filtroNomeAplicado = '';
  filtroIdAplicado = '';
  orcamentos: OrcamentoLista[] = [];

  constructor(
    private orcamentosService: OrcamentosService,
    private mensagemService: MensagemService,
  ) {
  }

  ngOnInit() {
    this.atualizarOrcamentos();
  }

  get orcamentosFiltrados(): OrcamentoLista[] {
    const nome = this.filtroNomeAplicado.trim().toLowerCase();
    const id = this.filtroIdAplicado.trim().toLowerCase();

    return this.orcamentos.filter((orcamento) => {
      const combinaNome = !nome || orcamento.nome.toLowerCase().includes(nome);
      const combinaId = !id || orcamento.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.orcamentosFiltrados.length) });
  }

  aplicarFiltros() {
    this.filtroNomeAplicado = this.filtroNome;
    this.filtroIdAplicado = this.filtroId;
  }

  async excluirOrcamento(id: string) {
    const confirmado = await this.mensagemService.confirmar('Deseja excluir orcamento?', 'Excluir orcamento');

    if (!confirmado) {
      return;
    }

    this.orcamentosService.excluir(id).subscribe({
      next: () => {
        this.atualizarOrcamentos();
      },
      error: (erro) => {
        console.error('Nao foi possivel excluir o orcamento.', erro);
      },
    });
  }

  private atualizarOrcamentos() {
    this.orcamentosService.listarLista().subscribe({
      next: (orcamentos) => {
        this.orcamentos = orcamentos;
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar os orcamentos.', erro);
        this.orcamentos = [];
      },
    });
  }
}
