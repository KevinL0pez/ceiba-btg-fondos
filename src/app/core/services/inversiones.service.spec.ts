import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { IFondo } from '@shared/models/IFondo.model';
import { I18nService } from '@shared/services/i18n.service';
import { IUsuario } from '@shared/models/IUsuario.model';
import { vi } from 'vitest';
import { UsuarioService } from './usuario.service';
import { InversionesService } from './inversiones.service';

describe('InversionesService', () => {
  let service: InversionesService;
  let httpMock: HttpTestingController;

  const usuarioSubject = new BehaviorSubject<IUsuario>({
    id: 1,
    nombre: 'Cliente Test',
    saldo: 500000,
    metodoNotificacionPreferido: 'email',
  });

  const usuarioServiceMock = {
    saldo: 500000,
    usuario$: usuarioSubject.asObservable(),
    actualizarSaldo: vi.fn(),
    actualizarMetodoNotificacionPreferido: vi.fn(),
    cargarUsuario: vi.fn(),
  };

  const i18nMock = {
    t: (key: string) =>
      (
        {
          'fondos.error.insufficientBalance': 'Saldo insuficiente',
          'fondos.error.insufficientBalanceDetail': 'Saldo insuficiente para completar la suscripcion.',
        } as Record<string, string>
      )[key] ?? key,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InversionesService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: I18nService, useValue: i18nMock },
      ],
    });

    vi.clearAllMocks();
    service = TestBed.inject(InversionesService);
    httpMock = TestBed.inject(HttpTestingController);

    // Recarga inicial de estado ejecutada en constructor.
    httpMock.expectOne(environment.api.getSuscripciones).flush([]);
    httpMock.expectOne(environment.api.getTransacciones).flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe actualizar el metodo preferido y notificar a UsuarioService', () => {
    service.actualizarMetodoPreferido('sms');

    expect(service.metodoPreferido).toBe('sms');
    expect(usuarioServiceMock.actualizarMetodoNotificacionPreferido).toHaveBeenCalledWith('sms');
  });

  it('debe rechazar suscripcion cuando no hay saldo suficiente', async () => {
    usuarioServiceMock.saldo = 1000;
    (service as any).recargarEstado = vi.fn().mockResolvedValue(undefined);
    const fondo: IFondo = {
      id: 10,
      nombre: 'FONDO_TEST',
      categoria: 'FPV',
      montoMinimo: 50000,
    };

    const resultPromise = service.suscribir(fondo, 'email');

    const postTx = httpMock.expectOne(environment.api.postTransaccion);
    expect(postTx.request.method).toBe('POST');
    postTx.flush({ id: 1 });

    const result = await resultPromise;
    expect(result.ok).toBe(false);
    expect(result.mensaje).toBe('Saldo insuficiente');
  });

  it('debe cancelar participacion existente exitosamente', async () => {
    (service as any).recargarEstado = vi.fn().mockResolvedValue(undefined);
    const participacion = {
      id: 7,
      fondoId: 2,
      nombreFondo: 'FONDO_DEMO',
      categoria: 'FIC' as const,
      monto: 100000,
      metodoNotificacion: 'sms' as const,
      fecha: new Date().toISOString(),
    };

    // Simulamos estado local existente para permitir cancelación.
    (service as any).participacionesSubject.next([participacion]);

    const cancelPromise = service.cancelarParticipacion(participacion);

    const deleteRequest = httpMock.expectOne(environment.api.deleteSuscripcion.replace(':id', '7'));
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush({});

    await Promise.resolve();
    const postTx = httpMock.expectOne(environment.api.postTransaccion);
    expect(postTx.request.method).toBe('POST');
    postTx.flush({ id: 2 });

    const result = await cancelPromise;
    expect(result.ok).toBe(true);
    expect(usuarioServiceMock.actualizarSaldo).toHaveBeenCalled();
  });
});
