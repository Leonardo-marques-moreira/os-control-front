import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClienteSalvo } from '../../models/cliente.model';
import { OrdemServicoSalva } from '../../models/ordem-servico.model';
import { OrcamentoSalvo } from '../../models/orcamento.model';
import { ClientesService } from '../../services/clientes.service';
import { OrdensServicoService } from '../../services/ordens-servico.service';
import { OrcamentosService } from '../../services/orcamentos.service';

interface IndicadorHome {
  titulo: string;
  valor: string;
  descricao: string;
  destaque: 'azul' | 'verde' | 'ambar' | 'grafite';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  carregandoIndicadores = true;
  houveFalhaNosIndicadores = false;
  mesReferencia = '';
  indicadores: IndicadorHome[] = [];

  constructor(
    private ordensServicoService: OrdensServicoService,
    private orcamentosService: OrcamentosService,
    private clientesService: ClientesService,
  ) {}

  ngOnInit() {
    this.mesReferencia = this.formatarMesAno(new Date());
    this.carregarIndicadores();
  }

  private carregarIndicadores() {
    this.carregandoIndicadores = true;
    this.houveFalhaNosIndicadores = false;

    forkJoin({
      ordens: this.ordensServicoService.listar().pipe(
        catchError((erro) => {
          console.error('Nao foi possivel carregar as ordens de servico da home.', erro);
          this.houveFalhaNosIndicadores = true;
          return of([] as OrdemServicoSalva[]);
        })
      ),
      orcamentos: this.orcamentosService.listar().pipe(
        catchError((erro) => {
          console.error('Nao foi possivel carregar os orcamentos da home.', erro);
          this.houveFalhaNosIndicadores = true;
          return of([] as OrcamentoSalvo[]);
        })
      ),
      clientes: this.clientesService.listar().pipe(
        catchError((erro) => {
          console.error('Nao foi possivel carregar os clientes da home.', erro);
          this.houveFalhaNosIndicadores = true;
          return of([] as ClienteSalvo[]);
        })
      ),
    }).subscribe({
      next: ({ ordens, orcamentos, clientes }) => {
        this.montarIndicadores(ordens, orcamentos, clientes);
        this.carregandoIndicadores = false;
      },
      error: (erro) => {
        console.error('Nao foi possivel montar os indicadores da home.', erro);
        this.indicadores = [];
        this.carregandoIndicadores = false;
        this.houveFalhaNosIndicadores = true;
      },
    });
  }

  private montarIndicadores(ordens: OrdemServicoSalva[], orcamentos: OrcamentoSalvo[], clientes: ClienteSalvo[]) {
    const hoje = new Date();
    const ordensFechadasNoMes = ordens.filter(
      (ordem) => ordem.status === 'Fechada' && this.estaNoMesmoMes(ordem.dataFechamento || ordem.dataAbertura, hoje)
    );
    const ordensAbertas = ordens.filter((ordem) => ordem.status === 'Aberto');
    const ordensEmAndamento = ordens.filter((ordem) => ordem.status === 'Em andamento');
    const ordensComOrcamento = ordens.filter((ordem) => ordem.numeroOrcamento.trim().length > 0);
    const idsConvertidos = new Set(ordensComOrcamento.map((ordem) => ordem.numeroOrcamento));
    const taxaConversao = orcamentos.length ? (idsConvertidos.size / orcamentos.length) * 100 : 0;

    this.indicadores = [
      {
        titulo: 'OS fechadas no mes',
        valor: String(ordensFechadasNoMes.length).padStart(2, '0'),
        descricao: `Fechadas em ${this.mesReferencia}`,
        destaque: 'verde',
      },
      {
        titulo: 'Conversao de orcamentos',
        valor: `${Math.round(taxaConversao)}%`,
        descricao: `${idsConvertidos.size} de ${orcamentos.length} orcamentos viraram OS`,
        destaque: 'azul',
      },
      {
        titulo: 'OS em andamento',
        valor: String(ordensEmAndamento.length).padStart(2, '0'),
        descricao: `${ordensAbertas.length} OS abertas no momento`,
        destaque: 'ambar',
      },
      {
        titulo: 'Clientes cadastrados',
        valor: String(clientes.length).padStart(2, '0'),
        descricao: `${ordens.length} ordens de servico registradas no sistema`,
        destaque: 'grafite',
      },
    ];
  }

  private estaNoMesmoMes(dataTexto: string, referencia: Date) {
    const data = this.converterDataTexto(dataTexto);

    if (!data) {
      return false;
    }

    return data.getMonth() === referencia.getMonth() && data.getFullYear() === referencia.getFullYear();
  }

  private converterDataTexto(valor: string) {
    const partes = (valor ?? '').split('/');

    if (partes.length !== 3) {
      return null;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const ano = Number(partes[2]);
    const data = new Date(ano, mes, dia);

    return Number.isFinite(data.getTime()) ? data : null;
  }

  private formatarMesAno(data: Date) {
    const texto = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(data);

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
