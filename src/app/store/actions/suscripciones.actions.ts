import { IFondo } from '@shared/models/IFondo.model';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IParticipacion } from '@core/interfaces/IParticipacion.interface';
import { MetodoNotificacion } from '@core/models/MetodoNotificacion.model';

/**
 * Acciones de dominio para el flujo de suscripción/cancelación.
 */
export const SuscripcionesActions = createActionGroup({
  source: 'Suscripciones',
  events: {
    Suscribir: props<{ fondo: IFondo; metodoNotificacion: MetodoNotificacion }>(),
    'Suscribir Success': props<{ mensaje: string }>(),
    'Suscribir Failure': props<{ mensaje: string }>(),

    Cancelar: props<{ participacion: IParticipacion }>(),
    'Cancelar Success': props<{ mensaje: string }>(),
    'Cancelar Failure': props<{ mensaje: string }>(),

    'Limpiar Mensajes': emptyProps(),
  },
});
