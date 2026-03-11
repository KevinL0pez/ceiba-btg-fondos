import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ITransaccion } from '@core/interfaces/ITransaccion.interface';
import { InversionesService } from '@core/services/inversiones.service';
import { map, Observable } from 'rxjs';

/**
 * Vista de historial de transacciones.
 * Presenta registros ordenados por fecha descendente y paginados en cliente.
 */
@Component({
  standalone: true,
  selector: 'app-historial',
  imports: [CommonModule, AsyncPipe, DatePipe, MatCardModule, MatPaginatorModule],
  templateUrl: './historial.html',
  styleUrl: './historial.scss',
})
export class Historial {
  /** Stream ordenado de transacciones (más recientes primero). */
  transacciones$: Observable<ITransaccion[]>;
  /** Opciones de tamaño de página disponibles en el paginador. */
  readonly pageSizeOptions = [5, 10, 25, 50];
  /** Tamaño de página actual. */
  pageSize = 10;
  /** Índice de página actual (base 0). */
  pageIndex = 0;

  readonly #inversionesService = inject(InversionesService);

  /**
   * Inicializa el stream de transacciones ordenadas por fecha.
   */
  constructor() {
    this.transacciones$ = this.#inversionesService.transacciones$.pipe(
      map((transacciones) =>
        [...transacciones].sort((a, b) => {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        }),
      ),
    );
  }

  /**
   * Normaliza nombres de fondos para visualización.
   */
  formatNombre(nombre: string): string {
    return nombre.replaceAll('_', ' ');
  }

  /**
   * Actualiza el estado de paginación al interactuar con el paginator.
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
