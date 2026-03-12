import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FondosService } from '@core/services/fondos.service';
import { IParticipacion } from '@core/interfaces/IParticipacion.interface';
import { InversionesService } from '@core/services/inversiones.service';
import { CurrencyService } from '@shared/services/currency.service';
import { IFondo } from '@shared/models/IFondo.model';
import { I18nService } from '@shared/services/i18n.service';
import { SwalToastService } from '@shared/services/swal-toast.service';
import { Store } from '@ngrx/store';
import { SuscripcionesActions } from '@store/actions/suscripciones.actions';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';
import { Fondos } from './fondos';

describe('Fondos', () => {
  let component: Fondos;
  let fixture: ComponentFixture<Fondos>;
  let storeMock: { select: ReturnType<typeof vi.fn>; dispatch: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const participaciones$ = new BehaviorSubject<IParticipacion[]>([]);
    const language$ = new BehaviorSubject<'es' | 'en'>('es');

    storeMock = {
      select: vi.fn().mockReturnValue(of(null)),
      dispatch: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Fondos],
      providers: [
        {
          provide: FondosService,
          useValue: {
            getFondos: () => of([]),
          },
        },
        {
          provide: InversionesService,
          useValue: {
            participaciones$: participaciones$.asObservable(),
          },
        },
        {
          provide: SwalToastService,
          useValue: {
            mostrarMsg: () => Promise.resolve(true),
          },
        },
        {
          provide: CurrencyService,
          useValue: {
            selectedCurrency$: of('COP'),
            selectedCurrency: 'COP',
            setCurrency: () => undefined,
            convertFromCop: (value: number) => value,
          },
        },
        {
          provide: I18nService,
          useValue: {
            language$: language$.asObservable(),
            translationsVersion$: of(1),
            language: 'es',
            setLanguage: () => undefined,
            t: (key: string) =>
              (
                {
                  'fondos.error.methodRequired':
                    'Selecciona el método de notificación (Email o SMS) antes de suscribirte.',
                } as Record<string, string>
              )[key] ?? key,
          },
        },
        { provide: Store, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Fondos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe normalizar el nombre del fondo', () => {
    expect(component.formatNombre('FONDO_DE_PRUEBA')).toBe('FONDO DE PRUEBA');
  });

  it('debe despachar failure si intenta suscribir sin método', () => {
    const fondo: IFondo = { id: 1, nombre: 'FONDO_TEST', montoMinimo: 100000, categoria: 'FPV' };

    component.suscribir(fondo);

    expect(storeMock.dispatch).toHaveBeenCalledWith(
      SuscripcionesActions.suscribirFailure({
        mensaje: 'Selecciona el método de notificación (Email o SMS) antes de suscribirte.',
      }),
    );
  });

  it('debe despachar suscribir cuando hay método seleccionado', () => {
    const fondo: IFondo = { id: 2, nombre: 'FONDO_TEST_2', montoMinimo: 150000, categoria: 'FIC' };
    component.seleccionarMetodo(fondo.id, 'sms');

    component.suscribir(fondo);

    expect(storeMock.dispatch).toHaveBeenCalledWith(
      SuscripcionesActions.suscribir({
        fondo,
        metodoNotificacion: 'sms',
      }),
    );
  });
});
