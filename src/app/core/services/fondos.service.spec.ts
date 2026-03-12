import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { IFondo } from '@shared/models/IFondo.model';
import { environment } from '@env/environment';
import { FondosService } from './fondos.service';

describe('FondosService', () => {
  let service: FondosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FondosService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FondosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe consultar el catalogo de fondos', () => {
    const fondosMock: IFondo[] = [
      { id: 1, nombre: 'FPV_EL_CLIENTE_RECAUDADORA', categoria: 'FPV', montoMinimo: 75000 },
    ];

    service.getFondos().subscribe((fondos) => {
      expect(fondos).toEqual(fondosMock);
    });

    const request = httpMock.expectOne(environment.api.getFondos);
    expect(request.request.method).toBe('GET');
    request.flush(fondosMock);
  });
});
