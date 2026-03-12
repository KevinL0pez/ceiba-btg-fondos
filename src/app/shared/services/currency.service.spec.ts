import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('btg-currency');
    TestBed.configureTestingModule({
      providers: [CurrencyService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('btg-currency');
  });

  it('debe iniciar en COP por defecto', () => {
    const request = httpMock.expectOne('https://open.er-api.com/v6/latest/COP');
    request.flush({ rates: { USD: 0.00025 } });

    expect(service.selectedCurrency).toBe('COP');
    expect(service.convertFromCop(100000)).toBe(100000);
  });

  it('debe convertir a USD con la tasa obtenida', () => {
    httpMock.expectOne('https://open.er-api.com/v6/latest/COP').flush({
      rates: { USD: 0.0005 },
    });

    service.setCurrency('USD');
    expect(localStorage.getItem('btg-currency')).toBe('USD');
    expect(service.convertFromCop(2000)).toBe(1);
  });

  it('debe usar API fallback cuando la principal falla', () => {
    httpMock.expectOne('https://open.er-api.com/v6/latest/COP').flush('error', {
      status: 500,
      statusText: 'Server Error',
    });
    httpMock.expectOne('https://latest.currency-api.pages.dev/v1/currencies/cop.json').flush({
      cop: { usd: 0.0004 },
    });

    service.setCurrency('USD');
    expect(service.convertFromCop(2500)).toBe(1);
  });
});
