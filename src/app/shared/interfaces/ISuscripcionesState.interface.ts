import { IOperacionState } from './IOperacionState.interface';

/**
 * Estado UI para las operaciones asincronas de suscripcion/cancelacion.
 */
export interface ISuscripcionesState {
  suscripcion: IOperacionState;
  cancelacion: IOperacionState;
}