import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { vi } from 'vitest';
import { SwalToastService } from './swal-toast.service';

describe('SwalToastService', () => {
  let service: SwalToastService;
  const navigateMock = vi.fn();
  const fireMock = vi.fn();

  beforeEach(() => {
    fireMock.mockReset();
    navigateMock.mockReset();

    vi.spyOn(Swal, 'mixin').mockReturnValue({
      fire: fireMock,
    } as any);

    TestBed.configureTestingModule({
      providers: [
        SwalToastService,
        {
          provide: Router,
          useValue: {
            navigate: navigateMock,
          },
        },
      ],
    });

    service = TestBed.inject(SwalToastService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe navegar cuando el usuario confirma y se define ruta', async () => {
    fireMock.mockResolvedValue({ isConfirmed: true });

    const result = await service.mostrarMsg('OK', 'success', '/fondos');

    expect(result).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith(['/fondos']);
  });

  it('debe retornar false cuando el usuario no confirma', async () => {
    fireMock.mockResolvedValue({ isConfirmed: false });

    const result = await service.mostrarMsg('Cancelado', 'warning');

    expect(result).toBe(false);
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
