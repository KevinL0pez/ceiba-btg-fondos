import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { MessagesService } from './messages.service';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { ISafeAny } from '@shared/interfaces/ISafeAny.interface';

const APP_XHR_TIMEOUT = 120000;

/**
 * Interceptor HTTP global.
 * - Normaliza URL base de API.
 * - Unifica formato de respuestas.
 * - Gestiona errores comunes y timeout.
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  constructor(
    private readonly mensajesService: MessagesService,
    private readonly router: Router,
  ) {}

  /**
   * Punto de entrada del interceptor para cada petición HTTP saliente.
   */
  intercept(req: HttpRequest<ISafeAny>, next: HttpHandler): Observable<HttpEvent<ISafeAny>> {
    return next.handle(this.performRequest(req)).pipe(
      timeout(APP_XHR_TIMEOUT),
      map((event) => this.handleSuccessfulResponse(event)),
      catchError((error) => this.handleErrorResponse(error)),
    );
  }

  /**
   * Aplica cabeceras y asegura que URL relativas usen la base configurada.
   */
  private performRequest(req: HttpRequest<ISafeAny>): HttpRequest<ISafeAny> {
    const headers: HttpHeaders = req.headers.set('x-funcionalidad', 'any');

    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      const { baseUrl } = environment.api;
      url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }

    return req.clone({ url, headers });
  }

  /**
   * Normaliza el cuerpo de respuesta para soportar payloads envueltos en { response }.
   */
  private handleSuccessfulResponse(event: HttpEvent<ISafeAny>): HttpEvent<ISafeAny> {
    if (event instanceof HttpResponse) {
      const body = event.body;
      const normalizedBody = body && typeof body === 'object' && 'response' in body ? body.response : body;
      return event.clone({ body: normalizedBody });
    }

    return event;
  }

  /**
   * Gestiona errores HTTP y delega feedback visual al servicio de mensajes.
   */
  private handleErrorResponse(errorResponse: ISafeAny): Observable<HttpEvent<ISafeAny>> {
    if (errorResponse instanceof TimeoutError) {
      return throwError(() => 'Timeout Exception');
    }

    switch (errorResponse.status) {
      case 401:
        this.mensajesService.mostrarErrorInterceptor(
          '¡Sesión vencida!',
          'Por favor inicia sesión de nuevo para seguir haciendo uso de las funcionalidades',
          'Aceptar',
        );
        this.router.navigate(['login']);
        break;
      case 400:
        this.mensajesService.mostrarErrorInterceptor(
          errorResponse.error.descripcionRespuesta,
          this.obtenerMensajesValidacion(errorResponse.error.validaciones),
        );
        break;
      case 404:
        const msjNotFound = `
          <div style="display: flex; align-items: center;">
              <div>
                  <p style="margin: 0;">El recurso que buscas no existe. Inténtalo nuevamente más tarde.</p>
              </div>
          </div>
        `;
        this.mensajesService.mostrarErrorInterceptor('Recurso no encontrado', msjNotFound);
        break;
      case 500:
        return throwError(() => errorResponse);
      case 503:
        break;
      case 504:
        const msjTimeOut = `
          <div style="display: flex; align-items: center;">
              <div>
                  <p style="margin: 0;">El servidor tardó demasiado en responder. Inténtalo nuevamente más tarde.</p>
              </div>
          </div>
        `;
        this.mensajesService.mostrarErrorInterceptor('Tiempo de espera agotado', msjTimeOut);
        break;
      default:
        break;
    }

    return throwError(() => errorResponse);
  }

  /**
   * Convierte errores de validación en una lista HTML para visualización.
   */
  private obtenerMensajesValidacion(validaciones: Array<{ campo: string; mensaje: string }>): string {
    const mensajes = validaciones.map(
      (validacion) => `<li style="text-align: left;" >${validacion.mensaje}</li>`,
    );
    return mensajes.length > 0 ? `<ul >${mensajes.join('')}</ul>` : '';
  }
}
