import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TecnicoFormulario, TecnicoSalvo } from '../../models/tecnico.model';
import { MensagemService } from '../../services/mensagem.service';
import { TecnicosService } from '../../services/tecnicos.service';
import { formatarCpf, formatarTelefone } from '../../utils/formatacao';

@Component({
  selector: 'app-tecnicos',
  imports: [FormsModule, RouterLink],
  templateUrl: './tecnicos.html',
  styleUrl: './tecnicos.css',
})
export class Tecnicos implements OnInit {
  modoEdicao = false;
  tecnicoId = '';
  tecnico: TecnicoFormulario = {
    nome: '',
    cpf: '',
    telefone: '',
    usuario: '',
    senha: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tecnicosService: TecnicosService,
    private mensagemService: MensagemService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.carregarTecnico(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar Tecnico' : 'Cadastro de Tecnico';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }

  salvarTecnico() {
    const nome = this.tecnico.nome.trim();

    if (!nome) {
      return;
    }

    const tecnicoSalvo: TecnicoSalvo = {
      id: this.tecnicoId,
      nome,
      cpf: this.tecnico.cpf.trim(),
      telefone: this.tecnico.telefone.trim(),
      usuario: this.tecnico.usuario.trim(),
      senha: this.tecnico.senha,
    };
    const novoCadastro = !this.modoEdicao;

    this.tecnicosService.salvar(tecnicoSalvo).subscribe({
      next: () => {
        if (novoCadastro) {
          this.mensagemService.mostrarSucesso('Tecnico cadastrado com sucesso.');
        }

        this.router.navigate(['/tecnicos']);
      },
      error: erro => {
        console.error('Nao foi possivel salvar o tecnico.', erro);
      },
    });
  }

  atualizarCpf(valor: string) {
    this.tecnico.cpf = formatarCpf(valor);
  }

  atualizarTelefone(valor: string) {
    this.tecnico.telefone = formatarTelefone(valor);
  }

  private carregarTecnico(id: string) {
    this.tecnicosService.buscarPorId(id).subscribe({
      next: tecnico => {
        this.modoEdicao = true;
        this.tecnicoId = tecnico.id;
        this.tecnico = {
          nome: tecnico.nome,
          cpf: tecnico.cpf,
          telefone: tecnico.telefone,
          usuario: tecnico.usuario,
          senha: '',
        };
      },
      error: erro => {
        console.error('Nao foi possivel carregar o tecnico.', erro);
      },
    });
  }
}
