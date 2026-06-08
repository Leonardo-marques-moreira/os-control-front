import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  OrdemServicoApi,
  OrdemServicoLista,
  OrdemServicoSalva,
  OsPecaApi,
  OsServicoApi,
} from '../models/ordem-servico.model';
import { PecaSelecionada, ServicoSelecionado } from '../models/orcamento.model';
import { converterMoedaParaNumero, formatarMoeda } from '../utils/formatacao';

@Injectable({
  providedIn: 'root',
})
export class OrdensServicoService {
  private readonly apiUrl = `${environment.apiBaseUrl}/os`;

  constructor(private http: HttpClient) {}

  listar(): Observable<OrdemServicoSalva[]> {
    return this.http
      .get<OrdemServicoApi[]>(this.apiUrl)
      .pipe(map((ordens) => ordens.map((ordem) => this.mapearOrdemSalva(ordem))));
  }

  listarVisualizacao(): Observable<OrdemServicoLista[]> {
    return this.listar().pipe(
      map((ordens) =>
        ordens.map((ordem) => ({
          id: ordem.id || '--',
          dataAbertura: ordem.dataAbertura || '--',
          cliente: ordem.clienteNome || '--',
          veiculo: ordem.veiculoNome || '--',
          status: ordem.status || '--',
          tecnico: ordem.tecnicoNome || '--',
        })),
      ),
    );
  }

  buscarPorId(id: string): Observable<OrdemServicoSalva> {
    return this.http
      .get<OrdemServicoApi>(`${this.apiUrl}/${id}`)
      .pipe(map((ordem) => this.mapearOrdemSalva(ordem)));
  }

  buscarParaImportacao(orcamentoId: string): Observable<OrdemServicoSalva> {
    return this.http
      .get<OrdemServicoApi>(`${this.apiUrl}/importar-orcamento/${orcamentoId}`)
      .pipe(map((ordem) => this.mapearOrdemSalva(ordem)));
  }

  salvar(ordem: OrdemServicoSalva): Observable<OrdemServicoSalva> {
    const dados = this.mapearPayload(ordem);

    if (!ordem.id) {
      return this.http
        .post<OrdemServicoApi>(this.apiUrl, dados)
        .pipe(map((novaOrdem) => this.mapearOrdemSalva(novaOrdem)));
    }

    return this.http
      .put<OrdemServicoApi>(`${this.apiUrl}/${ordem.id}`, dados)
      .pipe(map((ordemAtualizada) => this.mapearOrdemSalva(ordemAtualizada)));
  }

  private mapearOrdemSalva(ordem: OrdemServicoApi): OrdemServicoSalva {
    return {
      id: ordem.id != null ? String(ordem.id).padStart(2, '0') : '',
      numeroOrcamento: ordem.orcamentoId != null ? String(ordem.orcamentoId).padStart(2, '0') : '',
      clienteId: ordem.clienteId != null ? String(ordem.clienteId) : '',
      clienteNome: ordem.clienteNome?.trim() || '',
      veiculoId: ordem.veiculoId != null ? String(ordem.veiculoId) : '',
      veiculoNome: this.formatarVeiculo(ordem.veiculoModelo, ordem.veiculoPlaca),
      status: this.mapearStatusDaApi(ordem.statusOs),
      tecnicoId: ordem.tecnicoResponsavelId != null ? String(ordem.tecnicoResponsavelId) : '',
      tecnicoNome: ordem.tecnicoResponsavelNome?.trim() || '',
      dataAbertura: this.formatarData(ordem.dataAbertura),
      dataFechamento: this.formatarData(ordem.dataFechamento),
      observacao: ordem.observacoes?.trim() || '',
      servicos: this.mapearServicos(ordem.servicos),
      pecas: this.mapearPecas(ordem.pecas),
      desconto: this.formatarNumero(ordem.desconto),
      totalOs: formatarMoeda(ordem.valorTotal ?? 0),
      totalOsValor: ordem.valorTotal ?? 0,
    };
  }

  private mapearPayload(ordem: OrdemServicoSalva) {
    return {
      dataAbertura: this.converterDataParaApi(ordem.dataAbertura),
      statusOs: this.mapearStatusParaApi(ordem.status),
      observacoes: ordem.observacao.trim(),
      orcamentoId: this.converterTextoParaInteiro(ordem.numeroOrcamento),
      desconto: converterMoedaParaNumero(ordem.desconto) ?? 0,
      clienteId: this.converterTextoParaInteiro(ordem.clienteId),
      veiculoId: this.converterTextoParaInteiro(ordem.veiculoId),
      tecnicoResponsavelId: this.converterTextoParaInteiro(ordem.tecnicoId),
      pecas: ordem.pecas.map((peca) => this.mapearPecaParaApi(peca)),
      servicos: ordem.servicos.map((servico) => this.mapearServicoParaApi(servico)),
    };
  }

  private mapearPecas(itens: OsPecaApi[] | null): PecaSelecionada[] {
    if (!Array.isArray(itens)) {
      return [];
    }

    return itens
      .filter((item) => item.pecaId != null)
      .map((item) => ({
        id: String(item.pecaId).padStart(2, '0'),
        itemId: item.id,
        nome: item.descricaoPeca?.trim() || '',
        quantidade: item.quantidade ?? 0,
        valorUnitario: item.valorUnitario ?? 0,
        valorTotal: item.valorTotal ?? 0,
      }));
  }

  private mapearServicos(itens: OsServicoApi[] | null): ServicoSelecionado[] {
    if (!Array.isArray(itens)) {
      return [];
    }

    return itens
      .filter((item) => item.servicoId != null)
      .map((item) => ({
        id: String(item.servicoId).padStart(2, '0'),
        itemId: item.id,
        nome: item.descricaoServico?.trim() || '',
        valor: item.valorTotal ?? item.valorUnitario ?? 0,
      }));
  }

  private mapearPecaParaApi(peca: PecaSelecionada) {
    return {
      ...(peca.itemId ? { id: peca.itemId } : {}),
      pecaId: this.converterTextoParaInteiro(peca.id),
      quantidade: peca.quantidade,
      valorUnitario: peca.valorUnitario,
      valorTotal: peca.valorTotal,
    };
  }

  private mapearServicoParaApi(servico: ServicoSelecionado) {
    return {
      ...(servico.itemId ? { id: servico.itemId } : {}),
      servicoId: this.converterTextoParaInteiro(servico.id),
      quantidade: 1,
      valorUnitario: servico.valor,
      valorTotal: servico.valor,
    };
  }

  private mapearStatusDaApi(status?: string | null) {
    switch ((status ?? '').trim().toUpperCase()) {
      case 'ABERTA':
      case 'ABERTO':
        return 'Aberto';
      case 'EM_ANDAMENTO':
      case 'EM ANDAMENTO':
        return 'Em andamento';
      case 'FECHADA':
        return 'Fechada';
      default:
        return 'Aberto';
    }
  }

  private mapearStatusParaApi(status: string) {
    const valor = status.trim().toLowerCase();

    if (valor === 'em andamento') {
      return 'Em andamento';
    }

    if (valor === 'fechada') {
      return 'Fechada';
    }

    return 'Aberto';
  }

  private formatarData(valor?: string | null) {
    if (!valor) {
      return '';
    }

    const data = new Date(valor);

    if (!Number.isFinite(data.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(data);
  }

  private formatarVeiculo(modelo?: string | null, placa?: string | null) {
    return [modelo?.trim() || '', placa?.trim() || ''].filter(Boolean).join(' - ') || '';
  }

  private formatarNumero(valor?: number | null) {
    return typeof valor === 'number' && Number.isFinite(valor) ? String(valor) : '';
  }

  private converterTextoParaInteiro(valor: string) {
    const numero = Number.parseInt(valor.trim(), 10);
    return Number.isFinite(numero) ? numero : null;
  }

  private converterDataParaApi(valor: string) {
    const partes = valor.split('/');

    if (partes.length !== 3) {
      return null;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano)) {
      return null;
    }

    return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T00:00:00`;
  }
}
