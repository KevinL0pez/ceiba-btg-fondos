import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let httpMock: HttpTestingController;
  let documentRef: Document;

  beforeEach(() => {
    localStorage.removeItem('btg-language');

    TestBed.configureTestingModule({
      providers: [I18nService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(I18nService);
    httpMock = TestBed.inject(HttpTestingController);
    documentRef = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('btg-language');
  });

  it('debe cargar diccionarios iniciales y traducir en idioma por defecto', async () => {
    httpMock.expectOne('/assets/i18n/es.json').flush({
      'header.brand.title': 'Manejo inteligente de fondos',
    });
    httpMock.expectOne('/assets/i18n/en.json').flush({
      'header.brand.title': 'Smart fund management',
    });

    await Promise.resolve();
    expect(service.t('header.brand.title')).toBe('Manejo inteligente de fondos');
  });

  it('debe cambiar idioma, persistirlo y actualizar atributo lang', async () => {
    httpMock.expectOne('/assets/i18n/es.json').flush({ key: 'valor' });
    httpMock.expectOne('/assets/i18n/en.json').flush({ key: 'value' });
    await Promise.resolve();

    service.setLanguage('en');
    expect(service.language).toBe('en');
    expect(localStorage.getItem('btg-language')).toBe('en');
    expect(documentRef.documentElement.getAttribute('lang')).toBe('en');
  });

  it('debe interpolar parametros y retornar key si no existe traduccion', async () => {
    httpMock.expectOne('/assets/i18n/es.json').flush({
      'effects.subscribe.success': 'Suscripcion confirmada por {{method}}',
    });
    httpMock.expectOne('/assets/i18n/en.json').flush({});
    await Promise.resolve();

    expect(service.t('effects.subscribe.success', { method: 'email' })).toBe(
      'Suscripcion confirmada por email',
    );
    expect(service.t('missing.key')).toBe('missing.key');
  });
});
