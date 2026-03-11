import { MetodoNotificacion } from "@core/models/MetodoNotificacion.model";
import { IFondo } from "@shared/models/IFondo.model";

/** Participación activa del usuario en un fondo. */
export interface IParticipacion {
  id: number;
  fondoId: number;
  nombreFondo: string;
  categoria: IFondo['categoria'];
  monto: number;
  metodoNotificacion: MetodoNotificacion;
  fecha: string;
}