import { Routes } from '@angular/router';
import { Fondos } from './pages/fondos/fondos';
import { Historial } from './pages/historial/historial';
import { Suscripciones } from './pages/suscripciones/suscripciones';

/**
 * Rutas principales de la aplicación.
 * Incluye redirección inicial y fallback para rutas no encontradas.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'fondos', pathMatch: 'full' },
  { path: 'fondos', component: Fondos },
  { path: 'suscripciones', component: Suscripciones },
  { path: 'historial', component: Historial },
  { path: '**', redirectTo: 'fondos' },
];
