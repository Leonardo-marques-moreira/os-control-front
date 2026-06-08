import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DiaCalendario } from '../../models/calendario.model';
import { AbaOs, OrdemServicoSalva } from '../../models/ordem-servico.model';
import { ClienteSalvo, Veiculo } from '../../models/cliente.model';
import { PecaSalva } from '../../models/peca.model';
import { ServicoSalvo } from '../../models/servico.model';
import { PecaSelecionada, ServicoSelecionado } from '../../models/orcamento.model';
import { ClientesService } from '../../services/clientes.service';
import { OrdensServicoService } from '../../services/ordens-servico.service';
import { OrcamentosService } from '../../services/orcamentos.service';
import { PecasService } from '../../services/pecas.service';
import { ServicosService } from '../../services/servicos.service';
import { TecnicosService } from '../../services/tecnicos.service';
import {
  converterDataTexto,
  ehMesmaData,
  formatarData,
  formatarMesAno,
} from '../../utils/calendario';
import { converterMoedaParaNumero, formatarMoeda } from '../../utils/formatacao';

@Component({
  selector: 'app-ordens-servico',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ordens-servico.html',
  styleUrl: './ordens-servico.css',
})
export class OrdensServico implements OnInit {
  modoEdicao: boolean = false;
  numeroOs: string = '';
  numeroOrcamento: string = '';
  clienteId: string = '';
  nomeCliente: string = '';
  clientesDisponiveis: ClienteSalvo[] = [];
  veiculoId: string = '';
  veiculo: string = '';
  veiculosDisponiveis: Veiculo[] = [];
  observacao: string = '';
  abaAtiva: AbaOs = 'pecas';

  opcoesStatus: string[] = ['Aberto', 'Em andamento', 'Fechada'];
  statusSelecionado: string = 'Aberto';

  tecnicosDisponiveis: { id: string; nome: string }[] = [];
  tecnicoId: string = '';
  tecnicoNome: string = '';

  desconto: string = '';

  calendarioAberto: boolean = false;
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
    private clientesService: ClientesService,
    private ordensServicoService: OrdensServicoService,
    private orcamentosService: OrcamentosService,
    private pecasService: PecasService,
    private servicosService: ServicosService,
    private tecnicosService: TecnicosService,
  ) {
    this.sincronizarCalendario(this.dataSelecionada);
  }

  ngOnInit() {
    this.carregarCatalogos();

    this.route.paramMap.subscribe((params) => {
      this.limparFormulario();

      const ordemId = params.get('ordemId');
      const orcamentoId = params.get('orcamentoId');

      if (ordemId) {
        this.carregarOrdem(ordemId);
        return;
      }

      if (orcamentoId) {
        this.carregarOrcamento(orcamentoId);
      }
    });
  }

  get titulo() {
    return this.modoEdicao ? 'Editar OS' : 'Ordens de Servicos';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar OS' : 'Cadastrar OS';
  }

  get podeVisualizarPdf() {
    return this.obterOrcamentoIdParaPdf() !== null;
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

  get totalOs() {
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

  selecionarAba(aba: AbaOs) {
    this.abaAtiva = aba;
  }

  selecionarCliente(clienteId: string) {
    this.clienteId = clienteId;
    this.sincronizarClienteSelecionado(false);
  }

  selecionarVeiculo(veiculoId: string) {
    this.veiculoId = veiculoId;
    this.sincronizarVeiculoSelecionado();
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

  formatarMoeda(valor: number) {
    return formatarMoeda(valor);
  }

  salvarOs() {
    const ordem: OrdemServicoSalva = {
      id: this.numeroOs,
      numeroOrcamento: this.numeroOrcamento,
      clienteId: this.clienteId,
      clienteNome: this.nomeCliente.trim(),
      veiculoId: this.veiculoId,
      veiculoNome: this.veiculo.trim(),
      status: this.statusSelecionado,
      tecnicoId: this.tecnicoId,
      tecnicoNome: this.obterNomeTecnicoSelecionado(),
      dataAbertura: this.dataAbertura,
      observacao: this.observacao.trim(),
      servicos: this.servicosSelecionados,
      pecas: this.pecasSelecionadas,
      desconto: this.desconto,
      totalOs: this.totalOs,
    };

    this.ordensServicoService.salvar(ordem).subscribe({
      next: () => {
        this.router.navigate(['/ordens-servico/visualizar']);
      },
      error: (erro) => {
        console.error('Nao foi possivel salvar a OS.', erro);
      },
    });
  }

  visualizarPdf() {
    const orcamentoId = this.obterOrcamentoIdParaPdf();

    if (orcamentoId === null) {
      return;
    }

    const janela = window.open('', '_blank');

    if (!janela) {
      return;
    }

    this.orcamentosService.obterPdf(String(orcamentoId)).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        janela.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (erro) => {
        console.error('Nao foi possivel abrir o PDF do orcamento vinculado.', erro);
        janela.close();
      },
    });
  }

  private carregarCatalogos() {
    this.clientesService.listar().subscribe({
      next: (clientes) => {
        this.clientesDisponiveis = clientes;
        this.sincronizarClienteSelecionado(true);
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar os clientes.', erro);
        this.clientesDisponiveis = [];
        this.veiculosDisponiveis = [];
      },
    });

    this.tecnicosService.listar().subscribe({
      next: (tecnicos) => {
        this.tecnicosDisponiveis = tecnicos.map((tecnico) => ({
          id: tecnico.id,
          nome: tecnico.nome,
        }));
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar os tecnicos.', erro);
        this.tecnicosDisponiveis = [];
      },
    });

    this.servicosService.listar().subscribe({
      next: (servicos) => {
        this.servicosDisponiveis = servicos;
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar os servicos.', erro);
        this.servicosDisponiveis = [];
      },
    });

    this.pecasService.listar().subscribe({
      next: (pecas) => {
        this.pecasDisponiveis = pecas;
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar as pecas.', erro);
        this.pecasDisponiveis = [];
      },
    });
  }

  private carregarOrcamento(id: string) {
    this.ordensServicoService.buscarParaImportacao(id).subscribe({
      next: (ordem) => {
        this.numeroOrcamento = ordem.numeroOrcamento || id.padStart(2, '0');
        this.statusSelecionado = ordem.status || 'Aberto';
        this.observacao = ordem.observacao;
        this.desconto = ordem.desconto;
        this.servicosSelecionados = ordem.servicos;
        this.pecasSelecionadas = ordem.pecas;

        const data = converterDataTexto(ordem.dataAbertura);

        if (data) {
          this.sincronizarCalendario(data);
        }
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar o orcamento para importacao.', erro);
      },
    });
  }

  private carregarOrdem(id: string) {
    this.ordensServicoService.buscarPorId(id).subscribe({
      next: (ordem) => {
        this.modoEdicao = true;
        this.numeroOs = ordem.id;
        this.numeroOrcamento = ordem.numeroOrcamento;
        this.clienteId = ordem.clienteId;
        this.nomeCliente = ordem.clienteNome;
        this.veiculoId = ordem.veiculoId;
        this.veiculo = ordem.veiculoNome;
        this.observacao = ordem.observacao;
        this.statusSelecionado = ordem.status || 'Aberto';
        this.tecnicoId = ordem.tecnicoId;
        this.tecnicoNome = ordem.tecnicoNome;
        this.desconto = ordem.desconto;
        this.servicosSelecionados = ordem.servicos;
        this.pecasSelecionadas = ordem.pecas;
        this.sincronizarClienteSelecionado(true);

        const data = converterDataTexto(ordem.dataAbertura);

        if (data) {
          this.sincronizarCalendario(data);
        }
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar a ordem de servico.', erro);
      },
    });
  }

  private limparFormulario() {
    this.modoEdicao = false;
    this.numeroOs = '';
    this.numeroOrcamento = '';
    this.clienteId = '';
    this.nomeCliente = '';
    this.veiculoId = '';
    this.veiculo = '';
    this.veiculosDisponiveis = [];
    this.observacao = '';
    this.abaAtiva = 'pecas';
    this.statusSelecionado = 'Aberto';
    this.tecnicoId = '';
    this.tecnicoNome = '';
    this.desconto = '';
    this.servicosSelecionados = [];
    this.pecasSelecionadas = [];
    this.limparNovoServico();
    this.limparNovaPeca();
    this.sincronizarCalendario(new Date());
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

  private obterNomeTecnicoSelecionado() {
    return (
      this.tecnicosDisponiveis.find((tecnico) => tecnico.id === this.tecnicoId)?.nome ||
      this.tecnicoNome ||
      ''
    );
  }

  private sincronizarClienteSelecionado(preservarVeiculo: boolean) {
    const cliente = this.clientesDisponiveis.find((item) => item.id === this.clienteId);

    if (!cliente) {
      this.veiculosDisponiveis = [];

      if (!preservarVeiculo) {
        this.veiculoId = '';
        this.veiculo = '';
      }

      return;
    }

    this.nomeCliente = cliente.nome;
    this.veiculosDisponiveis = cliente.veiculos;

    if (!preservarVeiculo) {
      this.veiculoId = '';
      this.veiculo = '';
      return;
    }

    this.sincronizarVeiculoSelecionado();
  }

  private sincronizarVeiculoSelecionado() {
    const veiculoSelecionado = this.veiculosDisponiveis.find((item) => item.id === this.veiculoId);
    this.veiculo = veiculoSelecionado ? this.formatarVeiculo(veiculoSelecionado) : '';
  }

  private formatarVeiculo(veiculo: Veiculo) {
    return [veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(' - ');
  }

  private obterOrcamentoIdParaPdf() {
    const numero = Number.parseInt(this.numeroOrcamento.trim(), 10);
    return Number.isFinite(numero) ? numero : null;
  }
}
