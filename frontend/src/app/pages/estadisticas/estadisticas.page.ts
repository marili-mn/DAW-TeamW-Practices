import { Component, computed, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/api.service';
import { Estadisticas } from '../../core/models';

@Component({
  selector: 'app-estadisticas',
  imports: [TableModule, TagModule],
  templateUrl: './estadisticas.page.html',
  styleUrl: './estadisticas.page.css',
})
export class EstadisticasPage {
  private readonly api = inject(ApiService);

  readonly data = signal<Estadisticas | null>(null);
  readonly cargando = signal(true);

  // Para que las barras horizontales sean comparables, normalizamos contra
  // el máximo de cada serie.
  readonly maxProyectos = computed(() =>
    Math.max(1, ...(this.data()?.proyectosPorEstado.map((p) => p.cantidad) ?? [0])),
  );
  readonly maxTareas = computed(() =>
    Math.max(1, ...(this.data()?.tareasPorEstado.map((t) => t.cantidad) ?? [0])),
  );
  readonly maxClientes = computed(() =>
    Math.max(1, ...(this.data()?.topClientes.map((c) => c.proyectos) ?? [0])),
  );

  ngOnInit(): void {
    this.api.getEstadisticas().subscribe({
      next: (e) => {
        this.data.set(e);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  porcentaje(valor: number, max: number): number {
    return Math.round((valor / max) * 100);
  }

  severidadProyecto(estado: string): 'success' | 'info' | 'danger' {
    return estado === 'ACTIVO'
      ? 'success'
      : estado === 'FINALIZADO'
        ? 'info'
        : 'danger';
  }

  severidadTarea(estado: string): 'warn' | 'success' | 'danger' {
    return estado === 'PENDIENTE'
      ? 'warn'
      : estado === 'FINALIZADA'
        ? 'success'
        : 'danger';
  }
}
