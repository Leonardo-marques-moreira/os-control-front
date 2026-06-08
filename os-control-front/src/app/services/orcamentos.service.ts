import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  OrcamentoApi,
  OrcamentoImportacao,
  OrcamentoLista,
  OrcamentoPecaApi,
  OrcamentoSalvo,
  OrcamentoServicoApi,
  PecaSelecionada,
  ServicoSelecionado,
} from '../models/orcamento.model';
import { formatarMoeda } from '../utils/formatacao';

@Injectable({
  providedIn: 'root',
})
export class OrcamentosService {
  private readonly apiUrl = `${environment.apiBaseUrl}/orcamentos`;
  private readonly relatorioUrl = `${environment.apiBaseUrl}/relatorio-orcamento`;

  constructor(private http: HttpClient) {}

  listar(): Observable<OrcamentoSalvo[]> {
    return this.http
      .get<OrcamentoApi[]>(this.apiUrl)
      .pipe(
        map((orcamentos) => orcamentos.map((orcamento) => this.mapearOrcamentoSalvo(orcamento))),
      );
  }

  listarLista(): Observable<OrcamentoLista[]> {
    return this.http
      .get<OrcamentoApi[]>(this.apiUrl)
      .pipe(map((orcamentos) => orcamentos.map((orcamento) => this.mapearLista(orcamento))));
  }

  listarImportacao(): Observable<OrcamentoImportacao[]> {
    return this.http
      .get<OrcamentoApi[]>(this.apiUrl)
      .pipe(map((orcamentos) => orcamentos.map((orcamento) => this.mapearImportacao(orcamento))));
  }

  buscarPorId(id: string): Observable<OrcamentoSalvo> {
    return this.http
      .get<OrcamentoApi>(`${this.apiUrl}/${id}`)
      .pipe(map((orcamento) => this.mapearOrcamentoSalvo(orcamento)));
  }

  buscarParaImportacao(id: string): Observable<OrcamentoImportacao> {
    return this.http
      .get<OrcamentoApi>(`${this.apiUrl}/${id}`)
      .pipe(map((orcamento) => this.mapearImportacao(orcamento)));
  }

  salvar(orcamento: OrcamentoSalvo): Observable<OrcamentoSalvo> {
    const dados = {
      nomeOrcamento: orcamento.nomeOrcamento,
      dataCriacao: this.converterDataParaApi(orcamento.dataAbertura),
      observacao: orcamento.observacao,
      itensPecas: orcamento.pecas.map((peca) => this.mapearPecaParaApi(peca)),
      itensServicos: orcamento.servicos.map((servico) => this.mapearServicoParaApi(servico)),
    };

    if (!orcamento.id) {
      return this.http
        .post<OrcamentoApi>(this.apiUrl, dados)
        .pipe(map((novoOrcamento) => this.mapearOrcamentoSalvo(novoOrcamento)));
    }

    return this.http
      .put<OrcamentoApi>(`${this.apiUrl}/${orcamento.id}`, dados)
      .pipe(map((orcamentoAtualizado) => this.mapearOrcamentoSalvo(orcamentoAtualizado)));
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obterPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.relatorioUrl}/pdf/${id}`, {
      responseType: 'blob',
    });
  }

  private mapearOrcamentoSalvo(orcamento: OrcamentoApi): OrcamentoSalvo {
    const nome = orcamento.nomeOrcamento?.trim() || '';
    const total = orcamento.valorTotal ?? 0;

    return {
      id: String(orcamento.id).padStart(2, '0'),
      nome,
      nomeOrcamento: nome,
      dataAbertura: this.formatarData(orcamento.dataCriacao),
      observacao: orcamento.observacao?.trim() || '',
      desconto: '',
      servicos: this.mapearListaServicos(orcamento.itensServicos),
      pecas: this.mapearListaPecas(orcamento.itensPecas),
      valorTotal: formatarMoeda(total),
      total,
    };
  }

  private mapearLista(orcamento: OrcamentoApi): OrcamentoLista {
    return {
      id: String(orcamento.id).padStart(2, '0'),
      nome: orcamento.nomeOrcamento?.trim() || '',
      valorTotal: formatarMoeda(orcamento.valorTotal ?? 0),
    };
  }

  private mapearImportacao(orcamento: OrcamentoApi): OrcamentoImportacao {
    return {
      id: String(orcamento.id).padStart(2, '0'),
      nome: orcamento.nomeOrcamento?.trim() || '',
      dataAbertura: this.formatarData(orcamento.dataCriacao),
      observacao: orcamento.observacao?.trim() || '',
      servicos: this.mapearListaServicos(orcamento.itensServicos),
      pecas: this.mapearListaPecas(orcamento.itensPecas),
    };
  }

  private mapearListaServicos(itens: OrcamentoServicoApi[] | null): ServicoSelecionado[] {
    if (!Array.isArray(itens)) {
      return [];
    }

    return itens
      .filter((item) => item.servico?.id != null)
      .map((item) => ({
        id: String(item.servico!.id).padStart(2, '0'),
        itemId: item.id,
        nome: item.servico?.descricao?.trim() || '',
        valor: item.valorTotal ?? item.valorUnitario ?? 0,
      }));
  }

  private mapearListaPecas(itens: OrcamentoPecaApi[] | null): PecaSelecionada[] {
    if (!Array.isArray(itens)) {
      return [];
    }

    return itens
      .filter((item) => item.peca?.id != null)
      .map((item) => ({
        id: String(item.peca!.id).padStart(2, '0'),
        itemId: item.id,
        nome: item.peca?.descricao?.trim() || '',
        quantidade: item.quantidade ?? 0,
        valorUnitario: item.valorUnitario ?? 0,
        valorTotal: item.valorTotal ?? 0,
      }));
  }

  private mapearPecaParaApi(peca: PecaSelecionada) {
    return {
      ...(peca.itemId ? { id: peca.itemId } : {}),
      valorUnitario: peca.valorUnitario,
      quantidade: peca.quantidade,
      valorTotal: peca.valorTotal,
      peca: {
        id: Number.parseInt(peca.id, 10),
      },
    };
  }

  private mapearServicoParaApi(servico: ServicoSelecionado) {
    return {
      ...(servico.itemId ? { id: servico.itemId } : {}),
      quantidade: 1,
      valorUnitario: servico.valor,
      valorTotal: servico.valor,
      servico: {
        id: Number.parseInt(servico.id, 10),
      },
    };
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

  private formatarData(valor: string) {
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
}
