import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DiaCalendario } from '../../models/calendario.model';
import {
  AbaOrcamento,
  OrcamentoSalvo,
  PecaSelecionada,
  ServicoSelecionado,
} from '../../models/orcamento.model';
import { PecaSalva } from '../../models/peca.model';
import { ServicoSalvo } from '../../models/servico.model';
import { MensagemService } from '../../services/mensagem.service';
import { OrcamentosService } from '../../services/orcamentos.service';
import { PecasService } from '../../services/pecas.service';
import { ServicosService } from '../../services/servicos.service';
import {
  converterDataTexto,
  ehMesmaData,
  formatarData,
  formatarMesAno,
} from '../../utils/calendario';
import { converterMoedaParaNumero, formatarMoeda } from '../../utils/formatacao';

@Component({
  selector: 'app-orcamentos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orcamentos.html',
  styleUrl: './orcamentos.css',
})
export class Orcamentos implements OnInit {
  modoEdicao: boolean = false;
  orcamentoId: string = '';
  orcamentoConfirmadoId: string = '';
  nomeOrcamento: string = '';
  observacao: string = '';
  desconto: string = '';

  abaAtiva: AbaOrcamento = 'pecas';
  calendarioAberto: boolean = false;
  modalConfirmacaoPdfAberto: boolean = false;
  modalServicoAberto: boolean = false;
  modalPecaAberto: boolean = false;
  dropdownServicosAberto: boolean = false;
  dropdownPecasAberto: boolean = false;

  dataSelecionada: Date = new Date();
  mesExibido: Date = new Date();
  dataAbertura: string = '';
  tituloCalendario: string = '';
  diasCalendario: DiaCalendario[] = [];

  servicosSelecionados: ServicoSelecionado[] = [];
  pecasSelecionadas: PecaSelecionada[] = [];
  servicosDisponiveis: ServicoSalvo[] = [];
  pecasDisponiveis: PecaSalva[] = [];

  novoServico = {
    id: '',
    nome: '',
    valor: '',
  };

  novaPeca = {
    id: '',
    nome: '',
    quantidade: null as number | null,
    valorUnitario: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orcamentosService: OrcamentosService,
    private pecasService: PecasService,
    private servicosService: ServicosService,
    private mensagemService: MensagemService,
  ) {
    this.sincronizarCalendario(this.dataSelecionada);
  }

  ngOnInit() {
    this.carregarCatalogos();

    const id = this.route.snapshot.paramMap.get('orcamentoId');

    if (!id) {
      return;
    }

    this.carregarOrcamento(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar orçamento' : 'Novo orçamento';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar orçamento' : 'Confirmar orçamento';
  }

  get mensagemConfirmacaoPdf() {
    return this.modoEdicao ? 'Orcamento salvo,' : 'Orcamento confirmado,';
  }

  get podeVisualizarPdf() {
    return this.modoEdicao && !!this.orcamentoId;
  }

  get placeholder() {
    return this.abaAtiva === 'servicos' ? 'Adicionar servico' : 'Adicionar peca/produto';
  }

  get totalNovaPeca() {
    const total = this.calcularTotalNovaPeca();
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalServicos() {
    const total = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalPecas() {
    const total = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalOrcamento() {
    const totalServicos = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    const totalPecas = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    const desconto = this.converterEmNumero(this.desconto) || 0;
    const total = Math.max(0, totalServicos + totalPecas - desconto);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get servicosDisponiveisFiltrados() {
    const termo = this.novoServico.nome.trim().toLowerCase();

    return this.servicosDisponiveis.filter((servico) => {
      return (
        !termo ||
        servico.nome.toLowerCase().includes(termo) ||
        servico.id.toLowerCase().includes(termo)
      );
    });
  }

  get pecasDisponiveisFiltradas() {
    const termo = this.novaPeca.nome.trim().toLowerCase();

    return this.pecasDisponiveis.filter((peca) => {
      return (
        !termo || peca.nome.toLowerCase().includes(termo) || peca.id.toLowerCase().includes(termo)
      );
    });
  }

  selecionarAba(aba: AbaOrcamento) {
    this.abaAtiva = aba;
  }

  abrirModalSelecao() {
    if (this.abaAtiva === 'servicos') {
      this.modalServicoAberto = true;
      return;
    }

    this.modalPecaAberto = true;
  }

  fecharModalServico() {
    this.modalServicoAberto = false;
    this.dropdownServicosAberto = false;
    this.limparNovoServico();
  }

  abrirDropdownServicos() {
    if (this.novoServico.id) {
      return;
    }

    this.dropdownServicosAberto = true;
  }

  fecharDropdownServicos() {
    this.dropdownServicosAberto = false;
  }

  selecionarServico(servico: ServicoSalvo) {
    this.novoServico = {
      id: servico.id,
      nome: servico.nome,
      valor: servico.valor,
    };
    this.fecharDropdownServicos();
  }

  limparSelecaoServico() {
    this.novoServico = {
      id: '',
      nome: '',
      valor: '',
    };
    this.dropdownServicosAberto = true;
  }

  adicionarServico() {
    const id = Number.parseInt(this.novoServico.id.trim(), 10);
    const nome = this.novoServico.nome.trim();
    const valor = this.converterEmNumero(this.novoServico.valor);

    if (Number.isFinite(id) && nome && valor !== null) {
      this.adicionarServicoSelecionado(String(id), nome, valor);
      this.prepararProximaSelecaoServico();
    }
  }

  confirmarServicos() {
    this.fecharModalServico();
  }

  fecharModalPeca() {
    this.modalPecaAberto = false;
    this.dropdownPecasAberto = false;
    this.limparNovaPeca();
  }

  abrirDropdownPecas() {
    if (this.novaPeca.id) {
      return;
    }

    this.dropdownPecasAberto = true;
  }

  fecharDropdownPecas() {
    this.dropdownPecasAberto = false;
  }

  selecionarPeca(peca: PecaSalva) {
    const quantidade = this.obterQuantidadeNovaPeca();

    this.novaPeca = {
      ...this.novaPeca,
      id: peca.id,
      nome: peca.nome,
      quantidade,
      valorUnitario: peca.valor,
    };
    this.fecharDropdownPecas();
  }

  limparSelecaoPeca() {
    this.novaPeca = {
      ...this.novaPeca,
      id: '',
      nome: '',
      valorUnitario: '',
    };
    this.dropdownPecasAberto = true;
  }

  adicionarPeca() {
    const id = Number.parseInt(this.novaPeca.id.trim(), 10);
    const nome = this.novaPeca.nome.trim();
    const quantidade = Number(this.novaPeca.quantidade);
    const valorUnitario = this.converterEmNumero(this.novaPeca.valorUnitario);

    if (
      Number.isFinite(id) &&
      nome &&
      Number.isFinite(quantidade) &&
      quantidade > 0 &&
      valorUnitario !== null
    ) {
      this.adicionarPecaSelecionada(String(id), nome, quantidade, valorUnitario);
      this.prepararProximaSelecaoPeca();
    }
  }

  confirmarPecas() {
    this.fecharModalPeca();
  }

  removerServicoSelecionado(indice: number) {
    this.servicosSelecionados = this.servicosSelecionados.filter(
      (_, itemIndice) => itemIndice !== indice,
    );
  }

  removerPecaSelecionada(indice: number) {
    this.pecasSelecionadas = this.pecasSelecionadas.filter(
      (_, itemIndice) => itemIndice !== indice,
    );
  }

  abrirCalendario() {
    this.sincronizarCalendario(this.dataSelecionada);
    this.calendarioAberto = true;
  }

  fecharCalendario() {
    this.calendarioAberto = false;
  }

  selecionarDia(data: Date) {
    this.dataSelecionada = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    this.sincronizarCalendario(this.dataSelecionada);
    this.fecharCalendario();
  }

  mesAnterior() {
    this.mesExibido = new Date(this.mesExibido.getFullYear(), this.mesExibido.getMonth() - 1, 1);
    this.atualizarCalendario();
  }

  proximoMes() {
    this.mesExibido = new Date(this.mesExibido.getFullYear(), this.mesExibido.getMonth() + 1, 1);
    this.atualizarCalendario();
  }

  confirmar() {
    this.salvarOrcamento();
  }

  confirmarExibicaoPdf() {
    const id = this.orcamentoConfirmadoId || this.orcamentoId;

    if (!id) {
      this.finalizarConfirmacaoOrcamento();
      return;
    }

    const janela = window.open('', '_blank');

    if (!janela) {
      this.finalizarConfirmacaoOrcamento();
      return;
    }

    this.orcamentosService.obterPdf(id).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        janela.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        this.finalizarConfirmacaoOrcamento();
      },
      error: (erro) => {
        console.error('Não foi possível abrir o PDF do orçamento.', erro);
        janela.close();
        this.finalizarConfirmacaoOrcamento();
      },
    });
  }

  cancelarExibicaoPdf() {
    this.finalizarConfirmacaoOrcamento();
  }

  visualizarPdf() {
    if (!this.orcamentoId) {
      this.mensagemService.informar(
        'Salve o orcamento antes de visualizar o PDF.',
        'PDF indisponivel',
      );
      return;
    }

    const janela = window.open('', '_blank');

    if (!janela) {
      this.mensagemService.informar(
        'Nao foi possivel abrir uma nova aba para o PDF.',
        'PDF indisponivel',
      );
      return;
    }

    this.orcamentosService.obterPdf(this.orcamentoId).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        janela.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (erro) => {
        console.error('Nao foi possivel abrir o PDF do orcamento.', erro);
        janela.close();
        this.mensagemService.informar(
          'Nao foi possivel abrir o PDF do orcamento.',
          'Erro ao abrir PDF',
        );
      },
    });
  }

  formatarMoeda(valor: number) {
    return formatarMoeda(valor);
  }

  private salvarOrcamento() {
    const nome = this.nomeOrcamento.trim();

    const totalServicos = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    const totalPecas = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    const desconto = this.converterEmNumero(this.desconto) || 0;
    const total = Math.max(0, totalServicos + totalPecas - desconto);

    const orcamentoSalvo: OrcamentoSalvo = {
      id: this.orcamentoId,
      nome,
      nomeOrcamento: nome,
      dataAbertura: this.dataAbertura,
      observacao: this.observacao.trim(),
      desconto: this.desconto.trim(),
      servicos: this.servicosSelecionados,
      pecas: this.pecasSelecionadas,
      valorTotal: this.formatarMoeda(total),
      total,
    };

    this.orcamentosService.salvar(orcamentoSalvo).subscribe({
      next: (orcamento) => {
        this.orcamentoId = orcamento.id;
        this.orcamentoConfirmadoId = orcamento.id;
        this.modalConfirmacaoPdfAberto = true;
      },
      error: (erro) => {
        console.error('Não foi possível salvar o orçamento.', erro);
      },
    });
  }

  private carregarCatalogos() {
    this.servicosService.listar().subscribe({
      next: (servicos) => {
        this.servicosDisponiveis = servicos;
      },
      error: (erro) => {
        console.error('Não foi possível carregar os serviços.', erro);
        this.servicosDisponiveis = [];
      },
    });

    this.pecasService.listar().subscribe({
      next: (pecas) => {
        this.pecasDisponiveis = pecas;
      },
      error: (erro) => {
        console.error('Não foi possível carregar as peças.', erro);
        this.pecasDisponiveis = [];
      },
    });
  }

  private carregarOrcamento(id: string) {
    this.orcamentosService.buscarPorId(id).subscribe({
      next: (orcamento) => {
        this.modoEdicao = true;
        this.orcamentoId = orcamento.id;
        this.nomeOrcamento = orcamento.nome || orcamento.nomeOrcamento || '';
        this.observacao = orcamento.observacao || '';
        this.desconto = orcamento.desconto || '';
        this.servicosSelecionados = Array.isArray(orcamento.servicos) ? orcamento.servicos : [];
        this.pecasSelecionadas = Array.isArray(orcamento.pecas) ? orcamento.pecas : [];

        const data = converterDataTexto(orcamento.dataAbertura);

        if (data) {
          this.sincronizarCalendario(data);
        }
      },
      error: (erro) => {
        console.error('Não foi possível carregar o orçamento.', erro);
      },
    });
  }

  private limparNovoServico() {
    this.novoServico = {
      id: '',
      nome: '',
      valor: '',
    };
  }

  private adicionarServicoSelecionado(id: string, nome: string, valor: number) {
    this.servicosSelecionados = [
      ...this.servicosSelecionados,
      {
        id: id.padStart(2, '0'),
        nome,
        valor,
      },
    ];
  }

  private adicionarPecaSelecionada(
    id: string,
    nome: string,
    quantidade: number,
    valorUnitario: number,
  ) {
    this.pecasSelecionadas = [
      ...this.pecasSelecionadas,
      {
        id: id.padStart(2, '0'),
        nome,
        quantidade,
        valorUnitario,
        valorTotal: quantidade * valorUnitario,
      },
    ];
  }

  private prepararProximaSelecaoServico() {
    this.limparNovoServico();
    this.dropdownServicosAberto = false;
  }

  private limparNovaPeca() {
    this.novaPeca = {
      id: '',
      nome: '',
      quantidade: null,
      valorUnitario: '',
    };
  }

  private prepararProximaSelecaoPeca() {
    this.limparNovaPeca();
    this.dropdownPecasAberto = false;
  }

  private obterQuantidadeNovaPeca() {
    const quantidade = Number(this.novaPeca.quantidade);

    return Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1;
  }

  private calcularTotalNovaPeca() {
    const quantidade = Number(this.novaPeca.quantidade);
    const valorUnitario = this.converterEmNumero(this.novaPeca.valorUnitario);

    if (!Number.isFinite(quantidade) || quantidade <= 0 || valorUnitario === null) {
      return 0;
    }

    return quantidade * valorUnitario;
  }

  private converterEmNumero(valor: string | number) {
    return converterMoedaParaNumero(valor);
  }

  private sincronizarCalendario(dataBase: Date) {
    this.dataSelecionada = new Date(
      dataBase.getFullYear(),
      dataBase.getMonth(),
      dataBase.getDate(),
    );
    this.mesExibido = new Date(
      this.dataSelecionada.getFullYear(),
      this.dataSelecionada.getMonth(),
      1,
    );
    this.dataAbertura = formatarData(this.dataSelecionada);
    this.atualizarCalendario();
  }

  private atualizarCalendario() {
    this.tituloCalendario = formatarMesAno(this.mesExibido);

    const ano = this.mesExibido.getFullYear();
    const mes = this.mesExibido.getMonth();
    const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    const dias: DiaCalendario[] = [];

    for (let index = 0; index < primeiroDiaDaSemana; index += 1) {
      dias.push(null);
    }

    for (let numero = 1; numero <= ultimoDiaDoMes; numero += 1) {
      const data = new Date(ano, mes, numero);
      dias.push({
        data,
        domingo: data.getDay() === 0,
        numero,
        selecionado: ehMesmaData(data, this.dataSelecionada),
      });
    }

    while (dias.length % 7 !== 0) {
      dias.push(null);
    }

    this.diasCalendario = dias;
  }

  private finalizarConfirmacaoOrcamento() {
    this.modalConfirmacaoPdfAberto = false;
    this.orcamentoConfirmadoId = '';
    this.router.navigate(['/orcamentos']);
  }
}
