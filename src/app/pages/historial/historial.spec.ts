import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';
import { InversionesService, ITransaccion } from '@core/services/inversiones.service';
import { firstValueFrom, of } from 'rxjs';
import { Historial } from './historial';

describe('Historial', () => {
  let component: Historial;
  let fixture: ComponentFixture<Historial>;

  beforeEach(async () => {
    const transacciones: ITransaccion[] = [
      {
        id: 1,
        fondoId: 100,
        nombreFondo: 'FONDO_VIEJO',
        categoria: 'FPV',
        tipo: 'SUSCRIPCION',
        monto: 100000,
        metodoNotificacion: 'email',
        fecha: '2025-01-01T00:00:00.000Z',
        estado: 'EXITOSA',
        detalle: 'Primera operación',
      },
      {
        id: 2,
        fondoId: 200,
        nombreFondo: 'FONDO_RECIENTE',
        categoria: 'FIC',
        tipo: 'CANCELACION',
        monto: 200000,
        metodoNotificacion: 'sms',
        fecha: '2026-01-01T00:00:00.000Z',
        estado: 'EXITOSA',
        detalle: 'Última operación',
      },
    ];

    await TestBed.configureTestingModule({
      imports: [Historial],
      providers: [
        {
          provide: InversionesService,
          useValue: {
            transacciones$: of(transacciones),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Historial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe ordenar transacciones por fecha más reciente', async () => {
    const resultado = await firstValueFrom(component.transacciones$);

    expect(resultado[0].nombreFondo).toBe('FONDO_RECIENTE');
    expect(resultado[1].nombreFondo).toBe('FONDO_VIEJO');
  });

  it('debe actualizar paginación al cambiar página', () => {
    const pageEvent: PageEvent = {
      pageIndex: 2,
      pageSize: 25,
      length: 100,
      previousPageIndex: 1,
    };

    component.onPageChange(pageEvent);

    expect(component.pageIndex).toBe(2);
    expect(component.pageSize).toBe(25);
  });

  it('debe normalizar nombres de fondos', () => {
    expect(component.formatNombre('FONDO_DE_PRUEBA')).toBe('FONDO DE PRUEBA');
  });
});
