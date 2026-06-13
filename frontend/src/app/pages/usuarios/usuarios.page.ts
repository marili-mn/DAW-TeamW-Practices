import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ApiService } from '../../core/api.service';
import { Usuario } from '../../core/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './usuarios.page.html',
  styleUrl: './usuarios.page.css',
})
export class UsuariosPage implements OnInit {
  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  dialogoVisible = signal(false);
  guardando = signal(false);
  editando = false;
  usuarioSeleccionado: Usuario | null = null;

  formNombre = '';
  formClave = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirNuevo() {
    this.editando = false;
    this.usuarioSeleccionado = null;
    this.formNombre = '';
    this.formClave = '';
    this.dialogoVisible.set(true);
  }

  abrirEdicion(usuario: Usuario) {
    this.editando = true;
    this.usuarioSeleccionado = usuario;
    this.formNombre = usuario.nombre;
    this.formClave = '';
    this.dialogoVisible.set(true);
  }

  guardar() {
    this.guardando.set(true);
    if (this.editando && this.usuarioSeleccionado) {
      const cambios: any = {};
      if (this.formNombre) cambios.nombre = this.formNombre;
      if (this.formClave) cambios.clave = this.formClave;
      this.api.updateUsuario(this.usuarioSeleccionado.id, cambios).subscribe({
        next: () => { this.dialogoVisible.set(false); this.guardando.set(false); this.cargar(); },
        error: () => this.guardando.set(false),
      });
    } else {
      this.api.createUsuario(this.formNombre, this.formClave).subscribe({
        next: () => { this.dialogoVisible.set(false); this.guardando.set(false); this.cargar(); },
        error: () => this.guardando.set(false),
      });
    }
  }

  darDeBaja(usuario: Usuario) {
    this.api.updateUsuario(usuario.id, { estado: 'BAJA' }).subscribe(() => this.cargar());
  }

  reactivar(usuario: Usuario) {
    this.api.updateUsuario(usuario.id, { estado: 'ACTIVO' }).subscribe(() => this.cargar());
  }
}