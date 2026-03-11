/** Estado de una operación asíncrona en la UI. */
export interface IOperacionState {
  loading: boolean;
  success: boolean;
  error: string | null;
  mensaje: string | null;
}