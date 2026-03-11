import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { IFondo } from '@shared/models/IFondo.model';
import { BehaviorSubject, catchError, firstValueFrom, of } from 'rxjs';
import { UsuarioService } from './usuario.service';
import { IParticipacion } from '@core/interfaces/IParticipacion.interface';
import { ITransaccion } from '@core/interfaces/ITransaccion.interface';
import { EstadoTransaccion } from '@core/models/EstadoTransaccion.model';
import { MetodoNotificacion } from '@core/models/MetodoNotificacion.model';
import { TipoTransaccion } from '@core/models/TipoTransaccion.model';

/**
 * Servicio de dominio para suscripciones, cancelaciones e historial.
 * También sincroniza estado entre pestañas del navegador.
 */
@Injectable({
  providedIn: 'root',
})
export class InversionesService {
  private readonly participacionesSubject = new BehaviorSubject<IParticipacion[]>([]);
  private readonly transaccionesSubject = new BehaviorSubject<ITransaccion[]>([]);
  private readonly metodoPreferidoSubject = new BehaviorSubject<MetodoNotificacion>('email');
  private syncChannel?: BroadcastChannel;
  private readonly syncKey = 'btg-fondos-sync';
  private recargarEstadoPromise: Promise<void> | null = null;

  /** Participaciones activas del usuario. */
  readonly participaciones$ = this.participacionesSubject.asObservable();
  /** Historial de transacciones del usuario. */
  readonly transacciones$ = this.transaccionesSubject.asObservable();
  /** Método de notificación preferido. */
  readonly metodoPreferido$ = this.metodoPreferidoSubject.asObservable();

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly http: HttpClient,
  ) {
    this.initSyncChannel();
    this.usuarioService.usuario$.subscribe((usuario) => {
      this.metodoPreferidoSubject.next(usuario.metodoNotificacionPreferido);
    });
    this.recargarEstado();
  }

  /**
   * Valor actual del método preferido en memoria.
   */
  get metodoPreferido(): MetodoNotificacion {
    return this.metodoPreferidoSubject.value;
  }

  /**
   * Actualiza el método preferido localmente y en el perfil del usuario.
   */
  actualizarMetodoPreferido(metodo: MetodoNotificacion): void {
    this.metodoPreferidoSubject.next(metodo);
    this.usuarioService.actualizarMetodoNotificacionPreferido(metodo);
  }

  /**
   * Registra una nueva participacion si el usuario cumple las reglas de negocio.
   */
  async suscribir(fondo: IFondo, metodoNotificacion: MetodoNotificacion): Promise<{ ok: boolean; mensaje: string }> {
    const participaciones = this.participacionesSubject.value;
    const yaSuscrito = participaciones.some((p) => p.fondoId === fondo.id);

    if (yaSuscrito) {
      await this.registrarTransaccion(fondo, metodoNotificacion, 'SUSCRIPCION', 'RECHAZADA', 'Ya te encuentras suscrito a este fondo.');
      await this.recargarEstado();
      this.emitirSync();
      return { ok: false, mensaje: 'Ya te encuentras suscrito a este fondo.' };
    }

    if (this.usuarioService.saldo < fondo.montoMinimo) {
      await this.registrarTransaccion(
        fondo,
        metodoNotificacion,
        'SUSCRIPCION',
        'RECHAZADA',
        'Saldo insuficiente para completar la suscripcion.'
      );
      await this.recargarEstado();
      this.emitirSync();
      return { ok: false, mensaje: 'No tienes saldo suficiente para suscribirte a este fondo.' };
    }

    const payloadParticipacion: Omit<IParticipacion, 'id'> = {
      fondoId: fondo.id,
      nombreFondo: fondo.nombre,
      categoria: fondo.categoria,
      monto: fondo.montoMinimo,
      metodoNotificacion,
      fecha: new Date().toISOString(),
    };

    try {
      const nuevoSaldo = this.usuarioService.saldo - fondo.montoMinimo;
      this.usuarioService.actualizarSaldo(nuevoSaldo);
      await firstValueFrom(this.http.post<IParticipacion>(environment.api.postSuscripcion, payloadParticipacion));
      await this.registrarTransaccion(fondo, metodoNotificacion, 'SUSCRIPCION', 'EXITOSA', 'Suscripcion realizada correctamente.');

      await this.recargarEstado();
      this.emitirSync();
      return { ok: true, mensaje: 'Suscripcion exitosa.' };
    } catch {
      return { ok: false, mensaje: 'No se pudo procesar la suscripcion en este momento.' };
    }
  }

  /**
   * Cancela una participacion existente y devuelve el saldo al usuario.
   */
  async cancelarParticipacion(participacion: IParticipacion): Promise<{ ok: boolean; mensaje: string }> {
    const participaciones = this.participacionesSubject.value;
    const existe = participaciones.some((p) => p.id === participacion.id);

    if (!existe) {
      return { ok: false, mensaje: 'La participacion no existe.' };
    }

    try {
      const nuevoSaldo = this.usuarioService.saldo + participacion.monto;
      this.usuarioService.actualizarSaldo(nuevoSaldo);
      await firstValueFrom(
        this.http.delete<void>(environment.api.deleteSuscripcion.replace(':id', participacion.id.toString()))
      );
      await this.registrarTransaccion(
        {
          id: participacion.fondoId,
          nombre: participacion.nombreFondo,
          categoria: participacion.categoria,
          montoMinimo: participacion.monto,
        },
        participacion.metodoNotificacion,
        'CANCELACION',
        'EXITOSA',
        'Cancelacion realizada correctamente.'
      );

      await this.recargarEstado();
      this.emitirSync();
      return { ok: true, mensaje: 'Cancelacion exitosa.' };
    } catch {
      return { ok: false, mensaje: 'No se pudo cancelar la participacion en este momento.' };
    }
  }

  /**
   * Persiste una transacción en el historial.
   */
  private async registrarTransaccion(
    fondo: IFondo,
    metodoNotificacion: MetodoNotificacion,
    tipo: TipoTransaccion,
    estado: EstadoTransaccion,
    detalle: string
  ): Promise<void> {
    const transaccion: Omit<ITransaccion, 'id'> = {
      fondoId: fondo.id,
      nombreFondo: fondo.nombre,
      categoria: fondo.categoria,
      tipo,
      monto: fondo.montoMinimo,
      metodoNotificacion,
      fecha: new Date().toISOString(),
      estado,
      detalle,
    };
    await firstValueFrom(this.http.post<ITransaccion>(environment.api.postTransaccion, transaccion));
  }

  /**
   * Recarga participaciones, transacciones y datos de usuario en una sola operación.
   * Deduplica llamadas simultáneas para evitar solicitudes duplicadas.
   */
  private recargarEstado(): Promise<void> {
    if (this.recargarEstadoPromise) {
      return this.recargarEstadoPromise;
    }

    this.recargarEstadoPromise = Promise.all([
      firstValueFrom(
        this.http
          .get<IParticipacion[]>(environment.api.getSuscripciones)
          .pipe(catchError(() => of([])))
      ),
      firstValueFrom(
        this.http
          .get<ITransaccion[]>(environment.api.getTransacciones)
          .pipe(catchError(() => of([])))
      ),
    ])
      .then(([participaciones, transacciones]) => {
        this.participacionesSubject.next([...participaciones].sort((a, b) => b.id - a.id));
        this.transaccionesSubject.next([...transacciones].sort((a, b) => b.id - a.id));
        this.usuarioService.cargarUsuario();
      })
      .finally(() => {
        this.recargarEstadoPromise = null;
      });

    return this.recargarEstadoPromise;
  }

  /**
   * Configura escuchas de sincronización para actualizaciones cross-tab.
   */
  private initSyncChannel(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.syncChannel = new BroadcastChannel('btg-fondos-sync');
      this.syncChannel.onmessage = () => this.recargarEstado();
    }

    window.addEventListener('storage', (event) => {
      if (event.key === this.syncKey) {
        this.recargarEstado();
      }
    });
  }

  /**
   * Notifica cambios a otras pestañas abiertas de la aplicación.
   */
  private emitirSync(): void {
    this.syncChannel?.postMessage({ ts: Date.now() });
    localStorage.setItem(this.syncKey, Date.now().toString());
  }
}
