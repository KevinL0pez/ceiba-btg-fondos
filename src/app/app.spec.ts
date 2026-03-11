import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UsuarioService } from '@core/services/usuario.service';
import { IUsuario } from '@shared/models/IUsuario.model';
import { of } from 'rxjs';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    const usuario: IUsuario = {
      id: 1,
      nombre: 'Cliente Test',
      saldo: 500000,
      metodoNotificacionPreferido: 'email',
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: UsuarioService,
          useValue: {
            saldo$: of(usuario.saldo),
            usuario$: of(usuario),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
