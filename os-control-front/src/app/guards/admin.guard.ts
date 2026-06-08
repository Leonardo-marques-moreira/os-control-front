import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MensagemService } from '../services/mensagem.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const mensagemService = inject(MensagemService);

  if (authService.ehAdmin()) {
    return true;
  }

  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  mensagemService.mostrarErro('Voce nao tem permissao para acessar esta tela.');
  return router.createUrlTree(['/home']);
};
