import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Clientes } from './pages/clientes/clientes';
import { ClientesLista } from './pages/clientes-lista/clientes-lista';
import { Pecas } from './pages/pecas/pecas';
import { PecasLista } from './pages/pecas-lista/pecas-lista';
import { Servicos } from './pages/servicos/servicos';
import { ServicosLista } from './pages/servicos-lista/servicos-lista';
import { Orcamentos } from './pages/orcamentos/orcamentos';
import { OrcamentosLista } from './pages/orcamentos-lista/orcamentos-lista';
import { OrdensServico } from './pages/ordens-servico/ordens-servico';
import { OrdensServicoImportar } from './pages/ordens-servico-importar/ordens-servico-importar';
import { OrdensServicoMenu } from './pages/ordens-servico-menu/ordens-servico-menu';
import { OrdensServicoVisualizar } from './pages/ordens-servico-visualizar/ordens-servico-visualizar';
import { Tecnicos } from './pages/tecnicos/tecnicos';
import { TecnicosLista } from './pages/tecnicos-lista/tecnicos-lista';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { LayoutAutenticado } from './layouts/layout-autenticado/layout-autenticado';

const rotasAutenticadas: Routes = [
  { path: 'home', component: Home },
  { path: 'clientes/novo', component: Clientes, canActivate: [adminGuard] },
  { path: 'clientes/editar/:id', component: Clientes, canActivate: [adminGuard] },
  { path: 'clientes', component: ClientesLista, canActivate: [adminGuard] },
  { path: 'tecnicos/novo', component: Tecnicos, canActivate: [adminGuard] },
  { path: 'tecnicos/editar/:id', component: Tecnicos, canActivate: [adminGuard] },
  { path: 'tecnicos', component: TecnicosLista, canActivate: [adminGuard] },
  { path: 'pecas/novo', component: Pecas, canActivate: [adminGuard] },
  { path: 'pecas/editar/:id', component: Pecas, canActivate: [adminGuard] },
  { path: 'pecas', component: PecasLista, canActivate: [adminGuard] },
  { path: 'servicos/novo', component: Servicos, canActivate: [adminGuard] },
  { path: 'servicos/editar/:id', component: Servicos, canActivate: [adminGuard] },
  { path: 'servicos', component: ServicosLista, canActivate: [adminGuard] },
  { path: 'orcamentos/novo', component: Orcamentos },
  { path: 'orcamentos/editar/:orcamentoId', component: Orcamentos },
  { path: 'orcamentos', component: OrcamentosLista },
  { path: 'ordens-servico/criar', component: OrdensServico },
  { path: 'ordens-servico/importar', component: OrdensServicoImportar },
  { path: 'ordens-servico/importar/:orcamentoId', component: OrdensServico },
  { path: 'ordens-servico/editar/:ordemId', component: OrdensServico },
  { path: 'ordens-servico/visualizar', component: OrdensServicoVisualizar },
  { path: 'ordens-servico', component: OrdensServicoMenu },
];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  { path: 'ordens-de-servicos', redirectTo: 'ordens-servico', pathMatch: 'full' },
  {
    path: '',
    component: LayoutAutenticado,
    canActivate: [authGuard],
    children: rotasAutenticadas,
  },
  { path: '**', redirectTo: 'login' }
];
