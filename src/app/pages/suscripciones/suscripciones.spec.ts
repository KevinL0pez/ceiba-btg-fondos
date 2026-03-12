import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InversionesService } from '@core/services/inversiones.service';
import { CurrencyService } from '@shared/services/currency.service';
import { Store } from '@ngrx/store';
import { SuscripcionesActions } from '@store/actions/suscripciones.actions';
import { SwalToastService } from '@shared/services/swal-toast.service';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';
import { Suscripciones } from './suscripciones';
import { IParticipacion } from '@core/interfaces/IParticipacion.interface';

describe('Suscripciones', () => {
  let component: Suscripciones;
  let fixture: ComponentFixture<Suscripciones>;
  let storeMock: { select: ReturnType<typeof vi.fn>; dispatch: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const participaciones$ = new BehaviorSubject<IParticipacion[]>([]);

    storeMock = {
      select: vi.fn().mockReturnValue(of(null)),
      dispatch: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Suscripciones],
      providers: [
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
        { provide: Store, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Suscripciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe despachar cancelar al invocar cancelar()', () => {
    const participacion: IParticipacion = {
      id: 1,
      fondoId: 10,
      nombreFondo: 'FONDO_DE_PRUEBA',
      categoria: 'FPV',
      monto: 200000,
      metodoNotificacion: 'email',
      fecha: new Date().toISOString(),
    };

    component.cancelar(participacion);

    expect(storeMock.dispatch).toHaveBeenCalledWith(SuscripcionesActions.cancelar({ participacion }));
  });

  it('debe normalizar nombres de fondos', () => {
    expect(component.formatNombre('FONDO_DE_PRUEBA')).toBe('FONDO DE PRUEBA');
  });

  it('debe retornar descripción correcta de categoría', () => {
    expect(component.descripcionCategoria('FPV')).toContain('Fondo de Pensiones Voluntarias');
    expect(component.descripcionCategoria('FIC')).toContain('Fondo de Inversion Colectiva');
  });
});
