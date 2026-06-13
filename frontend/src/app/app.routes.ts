import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginPage } from './pages/login/login.page';
import { ProyectosPage } from './pages/proyectos/proyectos.page';
import { ProyectoDetallePage } from './pages/proyecto-detalle/proyecto-detalle.page';
import { ClientesPage } from './pages/clientes/clientes.page';
import { HistorialPage } from './pages/historial/historial.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'proyectos', component: ProyectosPage, canActivate: [authGuard] },
  {
    path: 'proyectos/:id',
    component: ProyectoDetallePage,
    canActivate: [authGuard],
  },
  { path: 'clientes', component: ClientesPage, canActivate: [authGuard] },
  { path: 'historial', component: HistorialPage, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'proyectos' },
  { path: '**', redirectTo: 'proyectos' },
];
