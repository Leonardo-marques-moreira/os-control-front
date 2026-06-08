import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServicoApi, ServicoLista, ServicoSalvo } from '../models/servico.model';
import { formatarMoeda } from '../utils/formatacao';

@Injectable({
  providedIn: 'root',
})
export class ServicosService {
  private readonly apiUrl = `${environment.apiBaseUrl}/servico`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ServicoSalvo[]> {
    return this.http
      .get<ServicoApi[]>(this.apiUrl)
      .pipe(map((servicos) => servicos.map((servico) => this.mapearServicoSalvo(servico))));
  }

  listarLista(): Observable<ServicoLista[]> {
    return this.http
      .get<ServicoApi[]>(this.apiUrl)
      .pipe(map((servicos) => servicos.map((servico) => this.mapearServicoLista(servico))));
  }

  buscarPorId(id: string): Observable<ServicoSalvo> {
    return this.http
      .get<ServicoApi>(`${this.apiUrl}/${id}`)
      .pipe(map((servico) => this.mapearServicoSalvo(servico)));
  }

  salvar(servico: ServicoSalvo): Observable<ServicoSalvo> {
    const dados = {
      descricao: servico.nome,
      valor: servico.preco,
    };

    if (!servico.id) {
      return this.http
        .post<ServicoApi>(this.apiUrl, dados)
        .pipe(map((novoServico) => this.mapearServicoSalvo(novoServico)));
    }

    return this.http
      .put<ServicoApi>(`${this.apiUrl}/${servico.id}`, dados)
      .pipe(map((servicoAtualizado) => this.mapearServicoSalvo(servicoAtualizado)));
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapearServicoSalvo(servico: ServicoApi): ServicoSalvo {
    return {
      id: String(servico.id).padStart(2, '0'),
      nome: servico.descricao,
      valor: formatarMoeda(servico.valor),
      preco: servico.valor,
    };
  }

  private mapearServicoLista(servico: ServicoApi): ServicoLista {
    return {
      id: String(servico.id).padStart(2, '0'),
      nome: servico.descricao,
      valor: formatarMoeda(servico.valor),
    };
  }
}
