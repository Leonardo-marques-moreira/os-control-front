import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TecnicoLista } from '../../models/tecnico.model';
import { MensagemService } from '../../services/mensagem.service';
import { TecnicosService } from '../../services/tecnicos.service';

@Component({
  selector: 'app-tecnicos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tecnicos-lista.html',
  styleUrl: './tecnicos-lista.css',
})
export class TecnicosLista implements OnInit {
  filtroNome = '';
  filtroId = '';
  filtroNomeAplicado = '';
  filtroIdAplicado = '';
  tecnicos: TecnicoLista[] = [];

  constructor(
    private tecnicosService: TecnicosService,
    private mensagemService: MensagemService,
  ) {
  }

  ngOnInit() {
    this.atualizarTecnicos();
  }

  get tecnicosFiltrados(): TecnicoLista[] {
    const nome = this.filtroNomeAplicado.trim().toLowerCase();
    const id = this.filtroIdAplicado.trim().toLowerCase();

    return this.tecnicos.filter(tecnico => {
      const combinaNome = !nome || tecnico.nome.toLowerCase().includes(nome);
      const combinaId = !id || tecnico.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.tecnicosFiltrados.length) });
  }

  aplicarFiltros() {
    this.filtroNomeAplicado = this.filtroNome;
    this.filtroIdAplicado = this.filtroId;
  }

  async excluirTecnico(id: string) {
    const confirmado = await this.mensagemService.confirmar('Deseja excluir tecnico?', 'Excluir tecnico');

    if (!confirmado) {
      return;
    }

    this.tecnicosService.excluir(id).subscribe({
      next: () => this.atualizarTecnicos(),
      error: erro => {
        console.error('Nao foi possivel excluir o tecnico.', erro);
      },
    });
  }

  private atualizarTecnicos() {
    this.tecnicosService.listarLista().subscribe({
      next: tecnicos => {
        this.tecnicos = tecnicos;
      },
      error: erro => {
        console.error('Nao foi possivel carregar os tecnicos.', erro);
        this.tecnicos = [];
      },
    });
  }
}
