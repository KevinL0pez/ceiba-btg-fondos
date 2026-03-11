/** Categorías de fondos soportadas por la aplicación. */
export type CategoriaFondo = 'FPV' | 'FIC';

/** Modelo base de un fondo disponible para suscripción. */
export interface IFondo {
  id: number;
  nombre: string;
  montoMinimo: number;
  categoria: CategoriaFondo;
}
