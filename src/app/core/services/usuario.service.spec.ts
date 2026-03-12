import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { IUsuario } from '@shared/models/IUsuario.model';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  const usuarioBase: IUsuario = {
    id: 1,
    nombre: 'Cliente Test',
    saldo: 500000,
    metodoNotificacionPreferido: 'email',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsuarioService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe cargar el usuario al inicializar', async () => {
    const request = httpMock.expectOne(environment.api.getUsuario);
    expect(request.request.method).toBe('GET');
    request.flush(usuarioBase);

    await Promise.resolve();
    expect(service.usuarioActual).toEqual(usuarioBase);
    expect(service.saldo).toBe(500000);
  });

  it('debe actualizar y persistir saldo', () => {
    httpMock.expectOne(environment.api.getUsuario).flush(usuarioBase);

    service.actualizarSaldo(250000);

    const putRequest = httpMock.expectOne(environment.api.putUsuario);
    expect(putRequest.request.method).toBe('PUT');
    expect(putRequest.request.body.saldo).toBe(250000);
    putRequest.flush({ ...usuarioBase, saldo: 250000 });

    expect(service.saldo).toBe(250000);
    expect(service.usuarioActual.saldo).toBe(250000);
  });

  it('debe actualizar el metodo de notificacion preferido', () => {
    httpMock.expectOne(environment.api.getUsuario).flush(usuarioBase);

    service.actualizarMetodoNotificacionPreferido('sms');

    const putRequest = httpMock.expectOne(environment.api.putUsuario);
    expect(putRequest.request.method).toBe('PUT');
    expect(putRequest.request.body.metodoNotificacionPreferido).toBe('sms');
    putRequest.flush({ ...usuarioBase, metodoNotificacionPreferido: 'sms' });

    expect(service.usuarioActual.metodoNotificacionPreferido).toBe('sms');
  });
});
