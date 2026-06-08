import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { TecnicoApi, TecnicoLista, TecnicoSalvo } from '../models/tecnico.model';

@Injectable({
  providedIn: 'root',
})
export class TecnicosService {
  private readonly apiUrl = `${environment.apiBaseUrl}/usuario`;

  constructor(private http: HttpClient) {}

  listar(): Observable<TecnicoSalvo[]> {
    return this.http
      .get<TecnicoApi[]>(this.apiUrl)
      .pipe(
        map((usuarios) =>
          usuarios
            .filter((usuario) => this.ehTecnico(usuario))
            .map((usuario) => this.mapearTecnicoSalvo(usuario)),
        ),
      );
  }

  listarLista(): Observable<TecnicoLista[]> {
    return this.http
      .get<TecnicoApi[]>(this.apiUrl)
      .pipe(
        map((usuarios) =>
          usuarios
            .filter((usuario) => this.ehTecnico(usuario))
            .map((usuario) => this.mapearTecnicoLista(usuario)),
        ),
      );
  }

  listarNomes(): Observable<string[]> {
    return this.http.get<TecnicoApi[]>(this.apiUrl).pipe(
      map((usuarios) =>
        usuarios
          .filter((usuario) => this.ehTecnico(usuario))
          .map((usuario) => usuario.nome.trim())
          .filter((nome) => nome.length > 0),
      ),
    );
  }

  buscarPorId(id: string): Observable<TecnicoSalvo> {
    return this.http
      .get<TecnicoApi>(`${this.apiUrl}/${id}`)
      .pipe(map((usuario) => this.mapearTecnicoSalvo(usuario)));
  }

  salvar(tecnico: TecnicoSalvo): Observable<TecnicoSalvo> {
    const senha = tecnico.senha.trim();
    const dados: Record<string, unknown> = {
      nome: tecnico.nome,
      cpf: tecnico.cpf,
      telefone: tecnico.telefone,
      login: tecnico.usuario,
      perfil: 'ROLE_USUARIO',
    };

    if (!tecnico.id || senha) {
      dados['senha'] = senha;
    }

    if (!tecnico.id) {
      return this.http
        .post<TecnicoApi>(this.apiUrl, dados)
        .pipe(map((novoTecnico) => this.mapearTecnicoSalvo(novoTecnico)));
    }

    return this.http
      .put<TecnicoApi>(`${this.apiUrl}/${tecnico.id}`, dados)
      .pipe(map((tecnicoAtualizado) => this.mapearTecnicoSalvo(tecnicoAtualizado)));
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapearTecnicoSalvo(usuario: TecnicoApi): TecnicoSalvo {
    return {
      id: String(usuario.id).padStart(2, '0'),
      nome: usuario.nome,
      cpf: usuario.cpf,
      telefone: usuario.telefone,
      usuario: usuario.login,
      senha: '',
    };
  }

  private mapearTecnicoLista(usuario: TecnicoApi): TecnicoLista {
    return {
      id: String(usuario.id).padStart(2, '0'),
      nome: usuario.nome,
      telefone: usuario.telefone || '--',
    };
  }

  private ehTecnico(usuario: TecnicoApi) {
    return usuario.perfil === 'ROLE_USUARIO';
  }
}
