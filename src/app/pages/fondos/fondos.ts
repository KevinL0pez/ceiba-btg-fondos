import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { FondosService } from '@core/services/fondos.service';
import { InversionesService } from '@core/services/inversiones.service';
import { IFondo } from '@shared/models/IFondo.model';
import { IFondosViewState } from '@shared/models/IFondoViewState.model';
import { CurrencyService } from '@shared/services/currency.service';
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
    ReactiveFormsModule,
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
  /** Formularios reactivos por fondo para validar método de notificación. */
  private readonly formByFondoId = new Map<number, FormGroup<{ metodoNotificacion: FormControl<MetodoNotificacion | null> }>>();

  readonly #fondosService = inject(FondosService);
  readonly #inversionesService = inject(InversionesService);
  readonly #store = inject(Store);
  readonly #swalToastService = inject(SwalToastService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #i18n = inject(I18nService);
  readonly #currencyService = inject(CurrencyService);
  readonly #languageSignal = toSignal(this.#i18n.language$, { initialValue: this.#i18n.language });
  readonly #translationsVersionSignal = toSignal(this.#i18n.translationsVersion$, { initialValue: 0 });
  readonly #currencySignal = toSignal(this.#currencyService.selectedCurrency$, {
    initialValue: this.#currencyService.selectedCurrency,
  });

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
      map(([base, participaciones]) => {
        const fondosDisponibles = base.fondos.filter(
          (fondo) => !participaciones.some((participacion) => participacion.fondoId === fondo.id),
        );
        this.syncFormsWithFondos(fondosDisponibles);

        return {
          loading: false,
          error: base.error,
          fondos: fondosDisponibles,
        };
      }),
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
    const control = this.getMetodoControl(fondoId);
    control.setValue(metodo);
    control.markAsTouched();

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
    const metodoControl = this.getMetodoControl(fondo.id);
    metodoControl.markAsTouched();

    const metodo = this.metodoSeleccionado(fondo.id);
    if (!metodo || metodoControl.invalid) {
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
   * Indica si se debe mostrar el error de validación del método.
   */
  mostrarErrorMetodo(fondoId: number): boolean {
    const control = this.getMetodoControl(fondoId);
    return control.touched && control.invalid;
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
    this.#translationsVersionSignal();
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

  private getFondoForm(fondoId: number): FormGroup<{ metodoNotificacion: FormControl<MetodoNotificacion | null> }> {
    const formExistente = this.formByFondoId.get(fondoId);
    if (formExistente) {
      return formExistente;
    }

    const formNuevo = new FormGroup({
      metodoNotificacion: new FormControl<MetodoNotificacion | null>(null, {
        validators: [Validators.required],
      }),
    });

    this.formByFondoId.set(fondoId, formNuevo);
    return formNuevo;
  }

  private getMetodoControl(fondoId: number): FormControl<MetodoNotificacion | null> {
    return this.getFondoForm(fondoId).controls.metodoNotificacion;
  }

  private syncFormsWithFondos(fondos: IFondo[]): void {
    const idsDisponibles = new Set(fondos.map((fondo) => fondo.id));

    for (const id of this.formByFondoId.keys()) {
      if (!idsDisponibles.has(id)) {
        this.formByFondoId.delete(id);
      }
    }
  }

}
