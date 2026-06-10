import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from './api.config';

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly loggedIn = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));

  login(nombre: string, clave: string) {
    return this.http
      .post<{ access_token: string }>(`${API_URL}/auth/login`, {
        nombre,
        clave,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          this.loggedIn.set(true);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.loggedIn.set(false);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
