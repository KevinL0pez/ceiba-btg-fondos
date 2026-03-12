import { Routes } from '@angular/router';

/**
 * Rutas principales de la aplicación.
 * Incluye redirección inicial y fallback para rutas no encontradas.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'fondos', pathMatch: 'full' },
  {
    path: 'fondos',
    loadComponent: () => import('./pages/fondos/fondos').then((m) => m.Fondos),
  },
  {
    path: 'suscripciones',
    loadComponent: () => import('./pages/suscripciones/suscripciones').then((m) => m.Suscripciones),
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial/historial').then((m) => m.Historial),
  },
  { path: '**', redirectTo: 'fondos' },
];
