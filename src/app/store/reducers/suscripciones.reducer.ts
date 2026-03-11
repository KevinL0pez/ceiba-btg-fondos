import { createReducer, on } from '@ngrx/store';
import { SuscripcionesActions } from '../actions/suscripciones.actions';
import { ISuscripcionesState } from '@shared/interfaces/ISuscripcionesState.interface';
import { initialSuscripcionesState, initialOperacionState } from '@store/state/suscripciones.state';

/** Feature key para registrar el slice de suscripciones en el store global. */
export const SUSCRIPCIONES_FEATURE_KEY = 'suscripciones';

/**
 * Reducer del flujo de suscripciones/cancelaciones.
 * Actualiza loading, éxito y mensajes de cada operación.
 */
export const suscripcionesReducer = createReducer(
  initialSuscripcionesState,
  on(SuscripcionesActions.suscribir, (state): ISuscripcionesState => ({
    ...state,
    suscripcion: { ...initialOperacionState, loading: true },
  })),
  on(SuscripcionesActions.suscribirSuccess, (state, { mensaje }): ISuscripcionesState => ({
    ...state,
    suscripcion: {
      loading: false,
      success: true,
      error: null,
      mensaje,
    },
  })),
  on(SuscripcionesActions.suscribirFailure, (state, { mensaje }): ISuscripcionesState => ({
    ...state,
    suscripcion: {
      loading: false,
      success: false,
      error: mensaje,
      mensaje,
    },
  })),

  on(SuscripcionesActions.cancelar, (state): ISuscripcionesState => ({
    ...state,
    cancelacion: { ...initialOperacionState, loading: true },
  })),
  on(SuscripcionesActions.cancelarSuccess, (state, { mensaje }): ISuscripcionesState => ({
    ...state,
    cancelacion: {
      loading: false,
      success: true,
      error: null,
      mensaje,
    },
  })),
  on(SuscripcionesActions.cancelarFailure, (state, { mensaje }): ISuscripcionesState => ({
    ...state,
    cancelacion: {
      loading: false,
      success: false,
      error: mensaje,
      mensaje,
    },
  })),

  on(SuscripcionesActions.limpiarMensajes, (state): ISuscripcionesState => ({
    ...state,
    suscripcion: { ...state.suscripcion, mensaje: null, error: null, success: false },
    cancelacion: { ...state.cancelacion, mensaje: null, error: null, success: false },
  })),
);
