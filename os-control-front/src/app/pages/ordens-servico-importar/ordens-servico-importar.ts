import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrcamentoImportacao } from '../../models/orcamento.model';
import { OrcamentosService } from '../../services/orcamentos.service';

@Component({
  selector: 'app-ordens-servico-importar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ordens-servico-importar.html',
  styleUrl: './ordens-servico-importar.css',
})
export class OrdensServicoImportar implements OnInit {
  filtroNome = '';
  filtroId = '';
  filtroNomeAplicado = '';
  filtroIdAplicado = '';
  orcamentos: OrcamentoImportacao[] = [];

  constructor(
    private orcamentosService: OrcamentosService,
  ) {
  }

  ngOnInit() {
    this.orcamentosService.listarImportacao().subscribe({
      next: (orcamentos) => {
        this.orcamentos = orcamentos;
      },
      error: (erro) => {
        console.error('Não foi possível carregar os orçamentos.', erro);
        this.orcamentos = [];
      },
    });
  }

  get orcamentosFiltrados(): OrcamentoImportacao[] {
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
}
