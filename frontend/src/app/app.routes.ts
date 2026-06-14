import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';
import { authGuard } from './core/auth.guard';
import { LoginPage } from './pages/login/login.page';
import { ProyectosPage } from './pages/proyectos/proyectos.page';
import { ProyectoDetallePage } from './pages/proyecto-detalle/proyecto-detalle.page';
import { ClientesPage } from './pages/clientes/clientes.page';
import { EstadisticasPage } from './pages/estadisticas/estadisticas.page';
import { HistorialPage } from './pages/historial/historial.page';
import { UsuariosPage } from './pages/usuarios/usuarios.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'proyectos', component: ProyectosPage, canActivate: [authGuard] },
  {
    path: 'proyectos/:id',
    component: ProyectoDetallePage,
    canActivate: [authGuard],
  },
  { path: 'clientes', component: ClientesPage, canActivate: [authGuard] },
  {
    path: 'estadisticas',
    component: EstadisticasPage,
    canActivate: [authGuard],
  },
  { path: 'historial', component: HistorialPage, canActivate: [adminGuard] },
  { path: 'usuarios', component: UsuariosPage, canActivate: [adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'estadisticas' },
  { path: '**', redirectTo: 'estadisticas' },
];
