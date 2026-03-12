import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { InversionesService } from '@core/services/inversiones.service';
import { CurrencyService } from '@shared/services/currency.service';
import { I18nService } from '@shared/services/i18n.service';
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
  readonly #i18n = inject(I18nService);
  readonly #currencyService = inject(CurrencyService);
  readonly #languageSignal = toSignal(this.#i18n.language$, { initialValue: this.#i18n.language });
  readonly #currencySignal = toSignal(this.#currencyService.selectedCurrency$, {
    initialValue: this.#currencyService.selectedCurrency,
  });

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
      ? this.t('fondos.category.fpv')
      : this.t('fondos.category.fic');
  }

  /**
   * Devuelve la traducción de una clave de texto.
   */
  t(key: string, params?: Record<string, string | number>): string {
    this.#languageSignal();
    return this.#i18n.t(key, params);
  }

  /**
   * Convierte montos base COP a la moneda seleccionada.
   */
  convertirMonto(amount: number): number {
    this.#currencySignal();
    return this.#currencyService.convertFromCop(amount);
  }

  /**
   * Código de moneda actual para formateo visual.
   */
  currencyCode(): 'COP' | 'USD' {
    return this.#currencySignal();
  }

  currencyDisplay(): string {
    return `${this.currencyCode()} $`;
  }
}
