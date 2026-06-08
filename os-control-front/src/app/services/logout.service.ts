import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MensagemService } from './mensagem.service';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  constructor(
    private authService: AuthService,
    private router: Router,
    private mensagemService: MensagemService
  ) {}

  async confirmarSaida() {
    const confirmado = await this.mensagemService.confirmar(
      'Voce realmente deseja sair?',
      'Confirmar saida',
      'Confirmar',
      'Cancelar'
    );

    if (!confirmado) {
      return false;
    }

    this.authService.sair();
    await this.router.navigate(['/login']);
    return true;
  }
}
