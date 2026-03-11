import { inject, Injectable } from '@angular/core';
import { InversionesService } from '@core/services/inversiones.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, from, map, of } from 'rxjs';
import { SuscripcionesActions } from '../actions/suscripciones.actions';

/**
 * Efectos NgRx para orquestar llamadas asíncronas de suscripciones.
 */
@Injectable()
export class SuscripcionesEffects {
  private readonly actions$ = inject(Actions);
  private readonly inversionesService = inject(InversionesService);

  /** Efecto para ejecutar una suscripción y emitir resultado al store. */
  readonly suscribir$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SuscripcionesActions.suscribir),
      exhaustMap(({ fondo, metodoNotificacion }) =>
        from(this.inversionesService.suscribir(fondo, metodoNotificacion)).pipe(
          map((resultado) =>
            resultado.ok
              ? SuscripcionesActions.suscribirSuccess({
                  mensaje: `Suscripcion confirmada. Notificacion por ${metodoNotificacion.toUpperCase()}.`,
                })
              : SuscripcionesActions.suscribirFailure({ mensaje: resultado.mensaje })
          ),
          catchError(() =>
            of(
              SuscripcionesActions.suscribirFailure({
                mensaje: 'No se pudo completar la suscripcion. Intenta nuevamente.',
              })
            )
          )
        )
      )
    )
  );

  /** Efecto para cancelar una participación y emitir resultado al store. */
  readonly cancelar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SuscripcionesActions.cancelar),
      exhaustMap(({ participacion }) =>
        from(this.inversionesService.cancelarParticipacion(participacion)).pipe(
          map((resultado) =>
            resultado.ok
              ? SuscripcionesActions.cancelarSuccess({
                  mensaje: 'Suscripción cancelada. El saldo fue actualizado.',
                })
              : SuscripcionesActions.cancelarFailure({ mensaje: resultado.mensaje })
          ),
          catchError(() =>
            of(
              SuscripcionesActions.cancelarFailure({
                mensaje: 'No se pudo cancelar la suscripción. Intenta nuevamente.',
              })
            )
          )
        )
      )
    )
  );
}
