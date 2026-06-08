import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MensagemService } from '../../services/mensagem.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  usuario = '';
  senha = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private mensagemService: MensagemService
  ) {}

  entrar() {
    this.authService.entrar(this.usuario, this.senha).subscribe({
      next: autenticado => {
        if (!autenticado) {
          return;
        }

        this.mensagemService.mostrarSucesso('Login realizado com sucesso.');
        this.router.navigate(['/home']);
      },
      error: erro => {
        console.error('Erro ao autenticar no backend.', erro);
      },
    });
  }
}
