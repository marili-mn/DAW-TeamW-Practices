import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/api.service';
import { descargarBlob } from '../../core/download.util';
import { Cliente, EstadoProyecto, Proyecto } from '../../core/models';

@Component({
  selector: 'app-proyectos',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './proyectos.page.html',
})
export class ProyectosPage {
  private readonly api = inject(ApiService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  readonly proyectos = signal<Proyecto[]>([]);
  readonly clientesActivos = signal<Cliente[]>([]);
  readonly dialogoVisible = signal(false);
  readonly guardando = signal(false);
  readonly cargando = signal(true);
  readonly dialogoClienteVisible = signal(false);
  readonly guardandoCliente = signal(false);
  nuevoClienteNombre = '';

  readonly estados: EstadoProyecto[] = ['ACTIVO', 'FINALIZADO', 'BAJA'];

  editando: Proyecto | null = null;
  formNombre = '';
  formEstado: EstadoProyecto = 'ACTIVO';
  formIdCliente: number | null = null;
  formFechaFin: string | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.api.getProyectos().subscribe({
      next: (p) => {
        this.proyectos.set(p);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  verDetalle(proyecto: Proyecto): void {
    this.router.navigate(['/proyectos', proyecto.id]);
  }

  abrirNuevo(): void {
    this.editando = null;
    this.formNombre = '';
    this.formEstado = 'ACTIVO';
    this.formIdCliente = null;
    this.formFechaFin = null;
    this.cargarClientesActivos();
    this.dialogoVisible.set(true);
  }

  abrirEdicion(proyecto: Proyecto, event?: Event): void {
    event?.stopPropagation();
    this.editando = proyecto;
    this.formNombre = proyecto.nombre;
    this.formEstado = proyecto.estado;
    this.formIdCliente = proyecto.cliente?.id ?? null;
    this.formFechaFin = proyecto.fechaFin ?? null;
    this.cargarClientesActivos();
    this.dialogoVisible.set(true);
  }

  private cargarClientesActivos(): void {
    this.api
      .getClientes('ACTIVO')
      .subscribe((clientes) => this.clientesActivos.set(clientes));
  }

  abrirNuevoCliente(): void {
    this.nuevoClienteNombre = '';
    this.dialogoClienteVisible.set(true);
  }

  crearCliente(): void {
    const nombre = this.nuevoClienteNombre.trim();
    if (!nombre) {
      return;
    }
    this.guardandoCliente.set(true);
    this.api.createCliente({ nombre }).subscribe({
      next: (cliente) => {
        this.guardandoCliente.set(false);
        this.dialogoClienteVisible.set(false);
        this.clientesActivos.update((lista) => [cliente, ...lista]);
        this.formIdCliente = cliente.id;
        this.messages.add({
          severity: 'success',
          summary: 'Cliente creado',
          detail: `${nombre} quedó seleccionado para el proyecto`,
          life: 2500,
        });
      },
      error: (err) => {
        this.guardandoCliente.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo crear el cliente',
          detail: err.error?.message ?? 'Error inesperado',
          life: 4000,
        });
      },
    });
  }

  guardar(): void {
    const nombre = this.formNombre.trim();
    if (!nombre) {
      this.messages.add({
        severity: 'warn',
        summary: 'Falta el nombre',
        detail: 'Ingresá un nombre para el proyecto',
        life: 3000,
      });
      return;
    }
    this.guardando.set(true);

    const esEdicion = !!this.editando;
    const peticion = this.editando
      ? this.api.updateProyecto(this.editando.id, {
          nombre,
          estado: this.formEstado,
          id_cliente: this.formIdCliente,
          fecha_fin: this.formFechaFin || null,
        })
      : this.api.createProyecto({
          nombre,
          ...(this.formIdCliente !== null && {
            id_cliente: this.formIdCliente,
          }),
          ...(this.formFechaFin && { fecha_fin: this.formFechaFin }),
        });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogoVisible.set(false);
        this.cargar();
        this.messages.add({
          severity: 'success',
          summary: esEdicion ? 'Proyecto actualizado' : 'Proyecto creado',
          detail: nombre,
          life: 2500,
        });
      },
      error: (err) => {
        this.guardando.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo guardar el proyecto',
          detail: err.error?.message ?? 'Error inesperado',
          life: 4000,
        });
      },
    });
  }

  severidad(estado: EstadoProyecto): 'success' | 'info' | 'danger' {
    return estado === 'ACTIVO'
      ? 'success'
      : estado === 'FINALIZADO'
        ? 'info'
        : 'danger';
  }

  // Días restantes hasta la fecha fin (negativo = atrasado).
  // Null si el proyecto no tiene fecha objetivo.
  diasRestantes(p: Proyecto): number | null {
    if (!p.fechaFin) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(p.fechaFin);
    return Math.round((objetivo.getTime() - hoy.getTime()) / 86400000);
  }

  // Un proyecto está atrasado si tiene fecha fin pasada y sigue activo.
  estaAtrasado(p: Proyecto): boolean {
    const dias = this.diasRestantes(p);
    return p.estado === 'ACTIVO' && dias !== null && dias < 0;
  }

  exportarCsv(): void {
    this.api.exportProyectosCsv().subscribe({
      next: (blob) => descargarBlob(blob, 'proyectos.csv'),
      error: () =>
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo exportar',
          life: 3000,
        }),
    });
  }
}
