import { EstadoTransaccion } from "@core/models/EstadoTransaccion.model";
import { MetodoNotificacion } from "@core/models/MetodoNotificacion.model";
import { TipoTransaccion } from "@core/models/TipoTransaccion.model";
import { IFondo } from "@shared/models/IFondo.model";

/** Registro histórico de una operación de suscripción o cancelación. */
export interface ITransaccion {
  id: number;
  fondoId: number;
  nombreFondo: string;
  categoria: IFondo['categoria'];
  tipo: TipoTransaccion;
  monto: number;
  metodoNotificacion: MetodoNotificacion;
  fecha: string;
  estado: EstadoTransaccion;
  detalle: string;
}
