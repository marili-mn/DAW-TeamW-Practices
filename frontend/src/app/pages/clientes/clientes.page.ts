import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/api.service';
import { Cliente } from '../../core/models';

@Component({
  selector: 'app-clientes',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './clientes.page.html',
})
export class ClientesPage {
  private readonly api = inject(ApiService);
  private readonly messages = inject(MessageService);
  private readonly confirmaciones = inject(ConfirmationService);

  readonly clientes = signal<Cliente[]>([]);
  readonly dialogoVisible = signal(false);
  readonly guardando = signal(false);
  readonly cargando = signal(true);

  editando: Cliente | null = null;
  formNombre = '';
  formTelefono = '';
  formEmail = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.api.getClientes().subscribe({
      next: (c) => {
        this.clientes.set(c);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirNuevo(): void {
    this.editando = null;
    this.formNombre = '';
    this.formTelefono = '';
    this.formEmail = '';
    this.dialogoVisible.set(true);
  }

  abrirEdicion(cliente: Cliente): void {
    this.editando = cliente;
    this.formNombre = cliente.nombre;
    this.formTelefono = cliente.telefono ?? '';
    this.formEmail = cliente.email ?? '';
    this.dialogoVisible.set(true);
  }

  guardar(): void {
    const nombre = this.formNombre.trim();
    if (!nombre) {
      this.messages.add({
        severity: 'warn',
        summary: 'Falta el nombre',
        detail: 'Ingresá un nombre para el cliente',
        life: 3000,
      });
      return;
    }
    this.guardando.set(true);

    const telefono = this.formTelefono.trim() || null;
    const email = this.formEmail.trim() || null;

    const esEdicion = !!this.editando;
    const peticion = this.editando
      ? this.api.updateCliente(this.editando.id, { nombre, telefono, email })
      : this.api.createCliente({ nombre, telefono, email });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogoVisible.set(false);
        this.cargar();
        this.messages.add({
          severity: 'success',
          summary: esEdicion ? 'Cliente actualizado' : 'Cliente creado',
          detail: nombre,
          life: 2500,
        });
      },
      error: (err) => {
        this.guardando.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo guardar el cliente',
          detail: err.error?.message ?? 'Error inesperado',
          life: 4000,
        });
      },
    });
  }

  darDeBaja(cliente: Cliente): void {
    this.confirmaciones.confirm({
      header: 'Dar de baja',
      message: `¿Dar de baja al cliente "${cliente.nombre}"? No podrá asignarse a nuevos proyectos.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Dar de baja', severity: 'danger' },
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        text: true,
      },
      accept: () => this.cambiarEstado(cliente, 'BAJA'),
    });
  }

  reactivar(cliente: Cliente): void {
    this.cambiarEstado(cliente, 'ACTIVO');
  }

  private cambiarEstado(cliente: Cliente, estado: 'ACTIVO' | 'BAJA'): void {
    this.api.updateCliente(cliente.id, { estado }).subscribe({
      next: () => {
        this.cargar();
        this.messages.add({
          severity: 'success',
          summary:
            estado === 'BAJA' ? 'Cliente dado de baja' : 'Cliente reactivado',
          detail: cliente.nombre,
          life: 2500,
        });
      },
      error: (err) =>
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo cambiar el estado',
          detail: err.error?.message ?? 'Error inesperado',
          life: 4000,
        }),
    });
  }
}
