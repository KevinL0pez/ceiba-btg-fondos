import { IFondo } from './IFondo.model';

/** Estado de presentación de la vista de fondos. */
export interface IFondosViewState {
  loading: boolean;
  error: string;
  fondos: IFondo[];
}