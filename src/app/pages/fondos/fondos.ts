import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { FondosService } from '@core/services/fondos.service';
import { InversionesService } from '@core/services/inversiones.service';
import { IFondo } from '@shared/models/IFondo.model';
import { IFondosViewState } from '@shared/models/IFondoViewState.model';
import { I18nService } from '@shared/services/i18n.service';
import { SwalToastService } from '@shared/services/swal-toast.service';
import { SuscripcionesActions } from '@store/actions/suscripciones.actions';
import { selectSuscripcionFeedback } from '@store/selectors/suscripciones.selectors';
import { catchError, combineLatest, distinctUntilChanged, filter, map, Observable, of, startWith } from 'rxjs';
import { MetodoNotificacion } from '@core/models/MetodoNotificacion.model';

/**
 * Vista de fondos disponibles.
 * Gestiona la selección de método de notificación y la acción de suscripción.
 */
@Component({
  standalone: true,
  selector: 'app-fondos',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './fondos.html',
  styleUrl: './fondos.scss',
})
export class Fondos {
  /** Estado de UI: loading, error y listado filtrado de fondos. */
  fondosState$: Observable<IFondosViewState> = of({ loading: true, error: '', fondos: [] });
  /** Método de notificación elegido por cada fondo. */
  selectedNotificationByFondo = signal<Record<number, MetodoNotificacion>>({});

  readonly #fondosService = inject(FondosService);
  readonly #inversionesService = inject(InversionesService);
  readonly #store = inject(Store);
  readonly #swalToastService = inject(SwalToastService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #i18n = inject(I18nService);
  readonly #languageSignal = toSignal(this.#i18n.language$, { initialValue: this.#i18n.language });

  /**
   * Inicializa la vista combinando catálogo de fondos y suscripciones activas.
   * También escucha feedback del store para mostrar mensajes globales.
   */
  ngOnInit(): void {
    const fondosBase$ = this.#fondosService.getFondos().pipe(
      map((fondos) => ({ fondos, error: '' })),
      catchError(() => of({ fondos: [], error: this.t('fondos.error.fetch') }))
    );

    this.fondosState$ = combineLatest([fondosBase$, this.#inversionesService.participaciones$]).pipe(
      map(([base, participaciones]) => ({
        loading: false,
        error: base.error,
        fondos: base.fondos.filter((fondo) => !participaciones.some((participacion) => participacion.fondoId === fondo.id)),
      })),
      startWith({ loading: true, error: '', fondos: [] })
    );

    this.#store
      .select(selectSuscripcionFeedback)
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
   * Asigna el método de notificación elegido para un fondo específico.
   */
  seleccionarMetodo(fondoId: number, metodo: MetodoNotificacion): void {
    this.selectedNotificationByFondo.update((actual) => ({
      ...actual,
      [fondoId]: metodo,
    }));
  }

  /**
   * Retorna el método elegido para un fondo.
   */
  metodoSeleccionado(fondoId: number): MetodoNotificacion | undefined {
    return this.selectedNotificationByFondo()[fondoId];
  }

  /**
   * Indica si el fondo ya tiene un método de notificación seleccionado.
   */
  tieneMetodoSeleccionado(fondoId: number): boolean {
    return !!this.selectedNotificationByFondo()[fondoId];
  }

  /**
   * Dispara la acción de suscripción validando método de notificación.
   */
  suscribir(fondo: IFondo): void {
    const metodo = this.metodoSeleccionado(fondo.id);
    if (!metodo) {
      this.#store.dispatch(
        SuscripcionesActions.suscribirFailure({
          mensaje: this.t('fondos.error.methodRequired'),
        })
      );
      return;
    }

    this.#store.dispatch(
      SuscripcionesActions.suscribir({
        fondo,
        metodoNotificacion: metodo,
      })
    );
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
  descripcionCategoria(categoria: IFondo['categoria']): string {
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

}
