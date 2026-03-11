import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UsuarioService } from '@core/services/usuario.service';
import { IUsuario } from '@shared/models/IUsuario.model';
import { of } from 'rxjs';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let usuarioServiceMock: Pick<UsuarioService, 'saldo$' | 'usuario$'>;

  beforeEach(async () => {
    const usuario: IUsuario = {
      id: 1,
      nombre: 'Cliente Test',
      saldo: 500000,
      metodoNotificacionPreferido: 'email',
    };

    usuarioServiceMock = {
      saldo$: of(usuario.saldo),
      usuario$: of(usuario),
    };

    localStorage.removeItem('btg-theme-mode');

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: UsuarioService, useValue: usuarioServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe aplicar modo oscuro por defecto', () => {
    expect(component.isDarkTheme).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('debe alternar tema y persistirlo en localStorage', () => {
    component.toggleTheme();

    expect(component.isDarkTheme).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('btg-theme-mode')).toBe('light');
  });
});
