/**
 * Endpoints de API usados por la aplicación.
 * Se combinan con la base URL definida en el environment activo.
 */
export const api = {
  getFondos: '/btg/fondos',
  getSuscripciones: '/btg/suscripciones',
  postSuscripcion: '/btg/suscripciones',
  deleteSuscripcion: '/btg/suscripciones/:id',
  getTransacciones: '/btg/transacciones',
  postTransaccion: '/btg/transacciones',
  getUsuario: '/btg/usuario',
  putUsuario: '/btg/usuario',
  getFondo: '/btg/fondos/:id',
  postFondo: '/btg/fondos',
  putFondo: '/btg/fondos/:id',
  deleteFondo: '/btg/fondos/:id',
  getTransaccion: '/btg/transacciones/:id',
  putTransaccion: '/btg/transacciones/:id',
  deleteTransaccion: '/btg/transacciones/:id',
};
