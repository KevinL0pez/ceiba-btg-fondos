import { TestBed } from '@angular/core/testing';
import Swal from 'sweetalert2';
import { vi } from 'vitest';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;
  const fireMock = vi.fn();

  beforeEach(() => {
    fireMock.mockReset();

    vi.spyOn(Swal, 'mixin').mockReturnValue({
      fire: fireMock,
    } as any);

    TestBed.configureTestingModule({
      providers: [MessagesService],
    });

    service = TestBed.inject(MessagesService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe retornar true cuando el usuario confirma', async () => {
    fireMock.mockResolvedValue({ isConfirmed: true });

    const result = await service.mostrarErrorInterceptor('Error', 'Mensaje');

    expect(result).toBe(true);
  });

  it('debe retornar false cuando el usuario cancela', async () => {
    fireMock.mockResolvedValue({ isConfirmed: false });

    const result = await service.mostrarErrorInterceptor('Error', 'Mensaje');

    expect(result).toBe(false);
  });
});
