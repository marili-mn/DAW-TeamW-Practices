import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  nombre = '';
  clave = '';
  readonly error = signal('');
  readonly cargando = signal(false);

  ingresar(): void {
    if (!this.nombre || !this.clave) {
      this.error.set('Ingrese usuario y clave');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.auth.login(this.nombre, this.clave).subscribe({
      next: () => this.router.navigate(['/proyectos']),
      error: () => {
        this.cargando.set(false);
        this.error.set('Credenciales inválidas');
      },
    });
  }
}
