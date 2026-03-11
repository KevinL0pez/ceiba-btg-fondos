import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { InversionesService } from '@core/services/inversiones.service';
import { SwalToastService } from '@shared/services/swal-toast.service';
import { SuscripcionesActions } from '@store/actions/suscripciones.actions';
import { selectCancelacionFeedback } from '@store/selectors/suscripciones.selectors';
import { distinctUntilChanged, filter, Observable } from 'rxjs';
import { IParticipacion } from '@core/interfaces/IParticipacion.interface';

/**
 * Vista de suscripciones activas del usuario.
 * Permite cancelar participaciones y mostrar feedback de operación.
 */
@Component({
  standalone: true,
  selector: 'app-suscripciones',
  imports: [CommonModule, AsyncPipe, DatePipe, MatCardModule, MatButtonModule, MatTooltipModule],
  templateUrl: './suscripciones.html',
  styleUrl: './suscripciones.scss',
})
export class Suscripciones {
  /** Listado reactivo de participaciones activas. */
  participaciones$: Observable<IParticipacion[]>;

  readonly #inversionesService = inject(InversionesService);
  readonly #store = inject(Store);
  readonly #swalToastService = inject(SwalToastService);
  readonly #destroyRef = inject(DestroyRef);

  /**
   * Inicializa stream de participaciones y feedback de cancelación.
   */
  constructor() {
    this.participaciones$ = this.#inversionesService.participaciones$;
    this.#store
      .select(selectCancelacionFeedback)
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.mensaje === curr?.mensaje && prev?.tipo === curr?.tipo),
        filter((feedback) => !!feedback),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((feedback) => {
        if (!feedback) {
          return;
        }

        void this.#swalToastService
          .mostrarMsg(feedback.mensaje, feedback.tipo === 'ok' ? 'success' : 'error')
          .finally(() => {
            this.#store.dispatch(SuscripcionesActions.limpiarMensajes());
          });
      });
  }

  /**
   * Dispara la acción de cancelación para una participación.
   */
  cancelar(participacion: IParticipacion): void {
    this.#store.dispatch(SuscripcionesActions.cancelar({ participacion }));
  }

  /**
   * Normaliza nombres de fondos para visualización.
   */
  formatNombre(nombre: string): string {
    return nombre.replaceAll('_', ' ');
  }

  /**
   * Texto explicativo mostrado en tooltip para la categoría del fondo.
   */
  descripcionCategoria(categoria: IParticipacion['categoria']): string {
    return categoria === 'FPV'
      ? 'FPV: Fondo de Pensiones Voluntarias.'
      : 'FIC: Fondo de Inversion Colectiva.';
  }
}
