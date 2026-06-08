import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PecaApi, PecaLista, PecaSalva } from '../models/peca.model';
import { formatarMoeda } from '../utils/formatacao';

@Injectable({
  providedIn: 'root',
})
export class PecasService {
  private readonly apiUrl = `${environment.apiBaseUrl}/peca`;

  constructor(private http: HttpClient) {}

  listar(): Observable<PecaSalva[]> {
    return this.http
      .get<PecaApi[]>(this.apiUrl)
      .pipe(map((pecas) => pecas.map((peca) => this.mapearPecaSalva(peca))));
  }

  listarLista(): Observable<PecaLista[]> {
    return this.http
      .get<PecaApi[]>(this.apiUrl)
      .pipe(map((pecas) => pecas.map((peca) => this.mapearPecaLista(peca))));
  }

  buscarPorId(id: string): Observable<PecaSalva> {
    return this.http
      .get<PecaApi>(`${this.apiUrl}/${id}`)
      .pipe(map((peca) => this.mapearPecaSalva(peca)));
  }

  salvar(peca: PecaSalva): Observable<PecaSalva> {
    const dados = {
      descricao: peca.nome,
      valorUnitario: peca.valorUnitario,
    };

    if (!peca.id) {
      return this.http
        .post<PecaApi>(this.apiUrl, dados)
        .pipe(map((novaPeca) => this.mapearPecaSalva(novaPeca)));
    }

    return this.http
      .put<PecaApi>(`${this.apiUrl}/${peca.id}`, dados)
      .pipe(map((pecaAtualizada) => this.mapearPecaSalva(pecaAtualizada)));
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapearPecaSalva(peca: PecaApi): PecaSalva {
    return {
      id: String(peca.id).padStart(2, '0'),
      nome: peca.descricao,
      valor: formatarMoeda(peca.valorUnitario),
      valorUnitario: peca.valorUnitario,
    };
  }

  private mapearPecaLista(peca: PecaApi): PecaLista {
    return {
      id: String(peca.id).padStart(2, '0'),
      nome: peca.descricao,
      valor: formatarMoeda(peca.valorUnitario),
    };
  }
}
