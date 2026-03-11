import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SUSCRIPCIONES_FEATURE_KEY } from '../reducers/suscripciones.reducer';
import { ISuscripcionesState } from '@shared/interfaces/ISuscripcionesState.interface';

/** Estructura de feedback unificada para mensajes mostrados en UI. */
type TFeedback = { tipo: 'ok' | 'error'; mensaje: string } | null;

/** Selector raíz del estado de suscripciones. */
export const selectSuscripcionesState = createFeatureSelector<ISuscripcionesState>(SUSCRIPCIONES_FEATURE_KEY);

/** Selector del subestado de suscripción. */
export const selectSuscripcionState = createSelector(
  selectSuscripcionesState,
  (state) => state.suscripcion
);

/** Selector del subestado de cancelación. */
export const selectCancelacionState = createSelector(
  selectSuscripcionesState,
  (state) => state.cancelacion
);

/** Selector de feedback para operación de suscripción. */
export const selectSuscripcionFeedback = createSelector(
  selectSuscripcionState,
  (suscripcion): TFeedback => {
    if (!suscripcion.mensaje) {
      return null;
    }

    return {
      tipo: suscripcion.error ? 'error' : 'ok',
      mensaje: suscripcion.mensaje,
    };
  },
);

/** Selector de feedback para operación de cancelación. */
export const selectCancelacionFeedback = createSelector(
  selectCancelacionState,
  (cancelacion): TFeedback => {
    if (!cancelacion.mensaje) {
      return null;
    }

    return {
      tipo: cancelacion.error ? 'error' : 'ok',
      mensaje: cancelacion.mensaje,
    };
  },
);
