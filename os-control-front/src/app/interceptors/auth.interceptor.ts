import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MensagemService } from '../services/mensagem.service';

const ROTAS_PUBLICAS = ['/auth/login'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const mensagemService = inject(MensagemService);
  const requestAutenticada = adicionarTokenQuandoNecessario(request);

  return next(requestAutenticada).pipe(catchError((erro) => tratarErroHttp(erro, mensagemService)));
};

function adicionarTokenQuandoNecessario(request: HttpRequest<unknown>) {
  if (ehRotaPublica(request) || request.headers.has('Authorization')) {
    return request;
  }

  const token = inject(AuthService).obterToken();

  if (!token) {
    return request;
  }

  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function ehRotaPublica(request: HttpRequest<unknown>) {
  return ROTAS_PUBLICAS.some((rota) => request.url.includes(rota));
}

function tratarErroHttp(erro: unknown, mensagemService: MensagemService) {
  const mensagem = obterMensagemErro(erro);

  if (mensagem) {
    mensagemService.mostrarErro(mensagem);
  }

  return throwError(() => erro);
}

function obterMensagemErro(erro: unknown) {
  if (!(erro instanceof HttpErrorResponse)) {
    return '';
  }

  const mensagemCorpo = extrairTexto(erro.error);

  if (mensagemCorpo) {
    return mensagemCorpo;
  }

  const dadosErro = extrairDadosErro(erro.error);
  const mensagemBackend = extrairTexto(dadosErro?.message) || extrairTexto(dadosErro?.error);

  if (mensagemBackend) {
    return mensagemBackend;
  }

  if (erro.status === 0) {
    return 'Nao foi possivel conectar com o backend.';
  }

  return extrairTexto(erro.message);
}

function extrairDadosErro(valor: unknown) {
  if (!valor || typeof valor !== 'object') {
    return null;
  }

  return valor as { message?: unknown; error?: unknown };
}

function extrairTexto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : '';
}
