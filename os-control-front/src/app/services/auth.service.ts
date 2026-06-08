import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/auth/login`;
  private readonly CHAVE_USUARIO = 'usuario';
  private readonly CHAVE_TOKEN = 'token';
  private readonly CHAVE_PERFIL = 'perfil';
  private readonly PERFIL_ADMIN = 'ROLE_ADMIN';

  constructor(private http: HttpClient) {}

  entrar(usuario: string, senha: string): Observable<boolean> {
    const login = usuario.trim();
    const password = senha.trim();

    if (!login || !password) {
      return of(false);
    }

    return this.http.post<LoginResponse>(this.apiUrl, { login, password }).pipe(
      tap((response) => this.salvarSessao(login, response)),
      map(() => true),
    );
  }

  private salvarSessao(usuario: string, resposta?: LoginResponse): void {
    localStorage.setItem(this.CHAVE_USUARIO, usuario);

    const token = resposta?.token?.trim() || '';
    const perfil = resposta?.perfil?.trim() || '';

    if (token) {
      localStorage.setItem(this.CHAVE_TOKEN, token);
    } else {
      localStorage.removeItem(this.CHAVE_TOKEN);
    }

    if (perfil) {
      localStorage.setItem(this.CHAVE_PERFIL, perfil);
    } else {
      localStorage.removeItem(this.CHAVE_PERFIL);
    }
  }

  obterUsuario(): string {
    return localStorage.getItem(this.CHAVE_USUARIO) || 'Usuario';
  }

  obterToken(): string {
    return localStorage.getItem(this.CHAVE_TOKEN) || '';
  }

  obterPerfil(): string {
    return localStorage.getItem(this.CHAVE_PERFIL) || '';
  }

  ehAdmin(): boolean {
    return this.obterPerfil() === this.PERFIL_ADMIN;
  }

  estaAutenticado(): boolean {
    return this.obterToken().trim().length > 0;
  }

  sair(): void {
    localStorage.removeItem(this.CHAVE_USUARIO);
    localStorage.removeItem(this.CHAVE_TOKEN);
    localStorage.removeItem(this.CHAVE_PERFIL);
  }
}
