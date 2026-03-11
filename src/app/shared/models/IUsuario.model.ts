/** Modelo del usuario actual de la plataforma. */
export interface IUsuario {
  id: number;
  nombre: string;
  saldo: number;
  metodoNotificacionPreferido: 'email' | 'sms';
}
