import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from './api.config';

const TOKEN_KEY = 'access_token';
const ROL_KEY = 'rol';
const NOMBRE_KEY = 'nombre';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly loggedIn = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));
  readonly rol = signal<string | null>(localStorage.getItem(ROL_KEY));
  readonly nombre = signal<string | null>(localStorage.getItem(NOMBRE_KEY));

  // Señal derivada: ¿el usuario logueado es ADMIN?
  readonly esAdmin = computed(() => this.rol() === 'ADMIN');

  login(nombre: string, clave: string) {
    return this.http
      .post<{ access_token: string; nombre: string; rol: string }>(
        `${API_URL}/auth/login`,
        { nombre, clave },
      )
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          localStorage.setItem(ROL_KEY, res.rol);
          localStorage.setItem(NOMBRE_KEY, res.nombre);
          this.loggedIn.set(true);
          this.rol.set(res.rol);
          this.nombre.set(res.nombre);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROL_KEY);
    localStorage.removeItem(NOMBRE_KEY);
    this.loggedIn.set(false);
    this.rol.set(null);
    this.nombre.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
