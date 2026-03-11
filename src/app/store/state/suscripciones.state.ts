import { IOperacionState } from '@shared/interfaces/IOperacionState.interface';
import { ISuscripcionesState } from '@shared/interfaces/ISuscripcionesState.interface';

/** Estado inicial base para una operación asíncrona. */
export const initialOperacionState: IOperacionState = {
  loading: false,
  success: false,
  error: null,
  mensaje: null,
};

/** Estado inicial del feature de suscripciones. */
export const initialSuscripcionesState: ISuscripcionesState = {
  suscripcion: { ...initialOperacionState },
  cancelacion: { ...initialOperacionState },
};
