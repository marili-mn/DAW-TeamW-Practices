import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.loggedIn()) return inject(Router).createUrlTree(['/login']);
  return auth.esAdmin() ? true : inject(Router).createUrlTree(['/proyectos']);
};
