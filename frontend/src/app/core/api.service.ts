import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './api.config';
import {
  Cliente,
  Estadisticas,
  EstadoProyecto,
  EstadoTarea,
  Historial,
  Proyecto,
  Tarea,
  Usuario,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  // Clientes
  getClientes(estado?: 'ACTIVO' | 'BAJA') {
    return this.http.get<Cliente[]>(`${API_URL}/clientes`, {
      params: estado ? { estado } : {},
    });
  }

  createCliente(datos: {
    nombre: string;
    telefono?: string | null;
    email?: string | null;
  }) {
    return this.http.post<Cliente>(`${API_URL}/clientes`, datos);
  }

  updateCliente(
    id: number,
    cambios: Partial<Pick<Cliente, 'nombre' | 'estado' | 'telefono' | 'email'>>,
  ) {
    return this.http.patch<Cliente>(`${API_URL}/clientes/${id}`, cambios);
  }

  // Proyectos — búsqueda avanzada (paginado, filtrado, ordenado).
  // Sin opts usa los defaults del back (page=1, pageSize=10, sort=nombre ASC).
  getProyectos(opts: {
    nombre?: string;
    estado?: EstadoProyecto;
    clienteId?: number;
    sort?: 'nombre' | 'estado' | 'fecha_fin' | 'id';
    dir?: 'ASC' | 'DESC';
    page?: number;
    pageSize?: number;
  } = {}) {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(opts)) {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    }
    return this.http.get<{
      data: Proyecto[];
      total: number;
      page: number;
      pageSize: number;
    }>(`${API_URL}/proyectos`, { params });
  }

  getProyecto(id: number) {
    return this.http.get<Proyecto>(`${API_URL}/proyectos/${id}`);
  }

  createProyecto(datos: {
    nombre: string;
    id_cliente?: number;
    fecha_fin?: string;
  }) {
    return this.http.post<Proyecto>(`${API_URL}/proyectos`, datos);
  }

  updateProyecto(
    id: number,
    cambios: {
      nombre?: string;
      estado?: EstadoProyecto;
      id_cliente?: number | null;
      fecha_fin?: string | null;
    },
  ) {
    return this.http.patch<Proyecto>(`${API_URL}/proyectos/${id}`, cambios);
  }

  // Tareas
  createTarea(datos: { descripcion: string; id_proyecto: number }) {
    return this.http.post<Tarea>(`${API_URL}/tareas`, datos);
  }

  updateTarea(
    id: number,
    cambios: { descripcion?: string; estado?: EstadoTarea },
  ) {
    return this.http.patch<Tarea>(`${API_URL}/tareas/${id}`, cambios);
  }

  deleteTarea(id: number) {
    return this.http.delete<Tarea>(`${API_URL}/tareas/${id}`);
  }

  // Historial de cambios
  getHistorial() {
    return this.http.get<Historial[]>(`${API_URL}/historial`);
  }

  // Estadísticas (dashboard)
  getEstadisticas() {
    return this.http.get<Estadisticas>(`${API_URL}/estadisticas`);
  }

  // Export CSV (devuelve Blob; el interceptor sigue agregando el token)
  exportProyectosCsv() {
    return this.http.get(`${API_URL}/proyectos/export.csv`, {
      responseType: 'blob',
    });
  }

  exportClientesCsv() {
    return this.http.get(`${API_URL}/clientes/export.csv`, {
      responseType: 'blob',
    });
  }

  // Usuarios
  getUsuarios() {
    return this.http.get<Usuario[]>(`${API_URL}/usuarios`);
  }

  createUsuario(nombre: string, clave: string) {
    return this.http.post<Usuario>(`${API_URL}/usuarios`, { nombre, clave });
  }

  updateUsuario(
    id: number,
    cambios: Partial<Pick<Usuario, 'nombre' | 'estado'>> & { clave?: string },
  ) {
    return this.http.patch<Usuario>(`${API_URL}/usuarios/${id}`, cambios);
  }
}
