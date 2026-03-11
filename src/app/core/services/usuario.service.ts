import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { IUsuario } from '@shared/models/IUsuario.model';
import { BehaviorSubject, catchError, firstValueFrom, of } from 'rxjs';

/**
 * Gestiona la información del usuario actual:
 * saldo, método de notificación preferido y sincronización entre pestañas.
 */
@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly saldoSubject = new BehaviorSubject<number>(500000);
  private readonly usuarioSubject = new BehaviorSubject<IUsuario>({
    id: 1,
    nombre: 'Cliente BTG',
    saldo: 500000,
    metodoNotificacionPreferido: 'email',
  });
  private syncChannel?: BroadcastChannel;
  private readonly syncKey = 'btg-fondos-sync';
  private cargarUsuarioPromise: Promise<void> | null = null;

  readonly saldo$ = this.saldoSubject.asObservable();
  readonly usuario$ = this.usuarioSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.initSyncChannel();
    this.cargarUsuario();
  }

  /**
   * Saldo actual en memoria.
   */
  get saldo(): number {
    return this.saldoSubject.value;
  }

  /**
   * Snapshot del usuario actual en memoria.
   */
  get usuarioActual(): IUsuario {
    return this.usuarioSubject.value;
  }

  /**
   * Carga el usuario desde API con deduplicación de peticiones concurrentes.
   */
  cargarUsuario(): Promise<void> {
    if (this.cargarUsuarioPromise) {
      return this.cargarUsuarioPromise;
    }

    this.cargarUsuarioPromise = firstValueFrom(
      this.http.get<IUsuario>(environment.api.getUsuario).pipe(
        catchError(() => of(this.usuarioActual))
      )
    )
      .then((usuario) => {
        this.actualizarUsuarioLocal(usuario);
      })
      .finally(() => {
        this.cargarUsuarioPromise = null;
      });

    return this.cargarUsuarioPromise;
  }

  /**
   * Persiste cambios parciales del usuario y propaga sincronización.
   */
  guardarUsuario(parcial: Partial<IUsuario>) {
    const usuarioActualizado: IUsuario = {
      ...this.usuarioActual,
      ...parcial,
    };

    return this.http
      .put<IUsuario>(environment.api.putUsuario, usuarioActualizado)
      .pipe(catchError(() => of(usuarioActualizado)))
      .subscribe((usuario) => {
        this.actualizarUsuarioLocal(usuario);
        this.emitirSync();
      });
  }

  /**
   * Actualiza y persiste el saldo disponible del usuario.
   */
  actualizarSaldo(nuevoSaldo: number): void {
    this.guardarUsuario({ saldo: nuevoSaldo });
  }

  /**
   * Actualiza y persiste el método de notificación preferido.
   */
  actualizarMetodoNotificacionPreferido(metodo: 'email' | 'sms'): void {
    this.guardarUsuario({ metodoNotificacionPreferido: metodo });
  }

  /**
   * Refresca los subjects locales con la información más reciente del usuario.
   */
  private actualizarUsuarioLocal(usuario: IUsuario): void {
    this.usuarioSubject.next(usuario);
    this.saldoSubject.next(usuario.saldo);
  }

  /**
   * Inicializa mecanismos de sincronización multi-pestaña.
   */
  private initSyncChannel(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.syncChannel = new BroadcastChannel('btg-fondos-sync');
      this.syncChannel.onmessage = () => {
        this.cargarUsuario();
      };
    }

    window.addEventListener('storage', (event) => {
      if (event.key === this.syncKey) {
        this.cargarUsuario();
      }
    });
  }

  /**
   * Emite señal de sincronización para refrescar estado en otras pestañas.
   */
  private emitirSync(): void {
    this.syncChannel?.postMessage({ ts: Date.now() });
    localStorage.setItem(this.syncKey, Date.now().toString());
  }
}
