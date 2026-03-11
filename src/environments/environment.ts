import { api } from './api';

/**
 * Variables de entorno para ejecución local.
 */
export const environment = {
  ambiente: 'LOCAL',
  baseUrlAPI: '',
  baseUrl: '',
  mocks: true,
  production: false,
  api: {
    baseUrl: `${window.location.origin}/`,
    ...api,
  },
};
