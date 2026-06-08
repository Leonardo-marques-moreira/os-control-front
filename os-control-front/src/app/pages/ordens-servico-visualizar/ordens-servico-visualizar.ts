import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdemServicoLista } from '../../models/ordem-servico.model';
import { OrdensServicoService } from '../../services/ordens-servico.service';

@Component({
  selector: 'app-ordens-servico-visualizar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ordens-servico-visualizar.html',
  styleUrl: './ordens-servico-visualizar.css',
})
export class OrdensServicoVisualizar implements OnInit {
  filtroCliente = '';
  filtroTecnico = '';
  filtroStatus = '';
  filtroClienteAplicado = '';
  filtroTecnicoAplicado = '';
  filtroStatusAplicado = '';
  ordens: OrdemServicoLista[] = [];
  readonly statusDisponiveis = ['Aberto', 'Em andamento', 'Fechada'];

  constructor(
    private ordensServicoService: OrdensServicoService,
  ) {
  }

  ngOnInit() {
    this.ordensServicoService.listarVisualizacao().subscribe({
      next: (ordens) => {
        this.ordens = ordens;
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar as ordens de servico.', erro);
        this.ordens = [];
      },
    });
  }

  get ordensFiltradas(): OrdemServicoLista[] {
    const cliente = this.filtroClienteAplicado.trim().toLowerCase();
    const tecnico = this.filtroTecnicoAplicado.trim().toLowerCase();
    const status = this.filtroStatusAplicado.trim().toLowerCase();

    return this.ordens.filter((ordem) => {
      const combinaCliente = !cliente || ordem.cliente.toLowerCase().includes(cliente);
      const combinaTecnico = !tecnico || ordem.tecnico.toLowerCase() === tecnico;
      const combinaStatus = !status || ordem.status.toLowerCase() === status;

      return combinaCliente && combinaTecnico && combinaStatus;
    });
  }

  get tecnicosDisponiveis(): string[] {
    return [...new Set(this.ordens.map((ordem) => ordem.tecnico).filter((tecnico) => !!tecnico))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.ordensFiltradas.length) });
  }

  aplicarFiltros() {
    this.filtroClienteAplicado = this.filtroCliente;
    this.filtroTecnicoAplicado = this.filtroTecnico;
    this.filtroStatusAplicado = this.filtroStatus;
  }
}
