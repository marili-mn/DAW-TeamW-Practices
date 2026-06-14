import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { EstadoTarea, Proyecto, Tarea } from '../../core/models';

@Component({
  selector: 'app-proyecto-detalle',
  imports: [
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './proyecto-detalle.page.html',
  styleUrl: './proyecto-detalle.page.css',
})
export class ProyectoDetallePage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly messages = inject(MessageService);
  private readonly confirmaciones = inject(ConfirmationService);
  protected readonly auth = inject(AuthService);

  readonly proyecto = signal<Proyecto | null>(null);
  readonly cargando = signal(true);
  readonly dialogoVisible = signal(false);
  readonly guardando = signal(false);

  readonly estadosTarea: EstadoTarea[] = ['PENDIENTE', 'FINALIZADA', 'BAJA'];

  // Vista activa: tabla clásica o tablero kanban.
  readonly vista = signal<'tabla' | 'tablero'>('tablero');

  // Definición de las columnas del tablero (una por estado).
  private readonly definicionColumnas: {
    estado: EstadoTarea;
    titulo: string;
    icono: string;
  }[] = [
    { estado: 'PENDIENTE', titulo: 'Pendientes', icono: 'pi pi-clock' },
    { estado: 'FINALIZADA', titulo: 'Finalizadas', icono: 'pi pi-check-circle' },
    { estado: 'BAJA', titulo: 'Dadas de baja', icono: 'pi pi-ban' },
  ];

  // Señal derivada: agrupa las tareas del proyecto por estado.
  // Se recalcula sola cada vez que cambia proyecto().
  readonly columnas = computed(() => {
    const tareas = this.proyecto()?.tareas ?? [];
    return this.definicionColumnas.map((col) => ({
      ...col,
      tareas: tareas.filter((t) => t.estado === col.estado),
    }));
  });

  // Tarea que se está arrastrando en el tablero.
  tareaArrastrada: Tarea | null = null;

  private idProyecto = 0;
  editando: Tarea | null = null;
  formDescripcion = '';
  formEstado: EstadoTarea = 'PENDIENTE';

  ngOnInit(): void {
    this.idProyecto = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.api.getProyecto(this.idProyecto).subscribe({
      next: (p) => {
        this.proyecto.set(p);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'Proyecto no encontrado',
          life: 4000,
        });
      },
    });
  }

  abrirNueva(): void {
    this.editando = null;
    this.formDescripcion = '';
    this.formEstado = 'PENDIENTE';
    this.dialogoVisible.set(true);
  }

  abrirEdicion(tarea: Tarea): void {
    this.editando = tarea;
    this.formDescripcion = tarea.descripcion;
    this.formEstado = tarea.estado;
    this.dialogoVisible.set(true);
  }

  guardar(): void {
    const descripcion = this.formDescripcion.trim();
    if (!descripcion) {
      this.messages.add({
        severity: 'warn',
        summary: 'Falta la descripción',
        detail: 'Ingresá una descripción para la tarea',
        life: 3000,
      });
      return;
    }
    this.guardando.set(true);

    const esEdicion = !!this.editando;
    const peticion = this.editando
      ? this.api.updateTarea(this.editando.id, {
          descripcion,
          estado: this.formEstado,
        })
      : this.api.createTarea({
          descripcion,
          id_proyecto: this.idProyecto,
        });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogoVisible.set(false);
        this.cargar();
        this.messages.add({
          severity: 'success',
          summary: esEdicion ? 'Tarea actualizada' : 'Tarea agregada',
          life: 2500,
        });
      },
      error: (err) => {
        this.guardando.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo guardar la tarea',
          detail: err.error?.message ?? 'Error inesperado',
          life: 4000,
        });
      },
    });
  }

  eliminar(tarea: Tarea): void {
    this.confirmaciones.confirm({
      header: 'Eliminar tarea',
      message: `¿Eliminar la tarea "${tarea.descripcion}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        text: true,
      },
      accept: () => {
        this.api.deleteTarea(tarea.id).subscribe({
          next: () => {
            this.cargar();
            this.messages.add({
              severity: 'success',
              summary: 'Tarea eliminada',
              life: 2500,
            });
          },
          error: () =>
            this.messages.add({
              severity: 'error',
              summary: 'No se pudo eliminar la tarea',
              life: 4000,
            }),
        });
      },
    });
  }

  // --- Drag & drop del tablero kanban ---

  // Al empezar a arrastrar, recordamos qué tarea es.
  empezarArrastre(tarea: Tarea): void {
    this.tareaArrastrada = tarea;
  }

  // Por defecto el navegador no permite soltar; preventDefault lo habilita.
  permitirDrop(evento: DragEvent): void {
    evento.preventDefault();
  }

  // Al soltar sobre una columna, cambiamos el estado de la tarea (si cambió).
  soltarEn(estado: EstadoTarea): void {
    const tarea = this.tareaArrastrada;
    this.tareaArrastrada = null;
    if (!tarea || tarea.estado === estado) {
      return;
    }
    this.api.updateTarea(tarea.id, { estado }).subscribe({
      next: () => {
        this.cargar();
        this.messages.add({
          severity: 'success',
          summary: 'Tarea movida',
          detail: `"${tarea.descripcion}" → ${estado}`,
          life: 2000,
        });
      },
      error: (err) =>
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo mover la tarea',
          detail: err.error?.message ?? 'Error inesperado',
          life: 4000,
        }),
    });
  }

  severidadTarea(estado: EstadoTarea): 'warn' | 'success' | 'danger' {
    return estado === 'PENDIENTE'
      ? 'warn'
      : estado === 'FINALIZADA'
        ? 'success'
        : 'danger';
  }

  severidadProyecto(estado: string): 'success' | 'info' | 'danger' {
    return estado === 'ACTIVO'
      ? 'success'
      : estado === 'FINALIZADO'
        ? 'info'
        : 'danger';
  }

  // Días restantes hasta fecha fin (negativo = atrasado).
  readonly diasRestantes = computed(() => {
    const p = this.proyecto();
    if (!p?.fechaFin) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(p.fechaFin);
    return Math.round((objetivo.getTime() - hoy.getTime()) / 86400000);
  });

  readonly estaAtrasado = computed(() => {
    const dias = this.diasRestantes();
    return this.proyecto()?.estado === 'ACTIVO' && dias !== null && dias < 0;
  });
}
