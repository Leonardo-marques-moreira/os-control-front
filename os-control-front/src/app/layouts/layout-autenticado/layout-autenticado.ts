import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogoutService } from '../../services/logout.service';

@Component({
  selector: 'app-layout-autenticado',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout-autenticado.html',
})
export class LayoutAutenticado {
  private readonly authService = inject(AuthService);
  private readonly logoutService = inject(LogoutService);

  protected readonly usuarioLogado = this.authService.obterUsuario();

  protected async sair() {
    await this.logoutService.confirmarSaida();
  }
}
