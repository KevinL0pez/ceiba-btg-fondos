import { AsyncPipe, CommonModule, CurrencyPipe, DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '@core/services/usuario.service';
import { map, Observable } from 'rxjs';

/**
 * Encabezado global de la aplicación.
 * Muestra contexto de navegación, información del cliente y control de tema.
 */
@Component({
  standalone: true,
  selector: 'app-header',
  imports: [
    CommonModule, 
    CurrencyPipe, 
    AsyncPipe,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  /** Clave usada para persistir el modo de tema. */
  private static readonly THEME_STORAGE_KEY = 'btg-theme-mode';
  /** Saldo del usuario para renderizado en tiempo real. */
  saldo$: Observable<number>;
  /** Nombre del usuario para renderizado en tiempo real. */
  usuario$: Observable<string>;
  /** Estado local del tema seleccionado. */
  isDarkTheme = true;
  /** Enlaces de navegación del encabezado. */
  readonly navItems = [
    { label: 'Fondos disponibles', route: '/fondos' },
    { label: 'Suscripciones activas', route: '/suscripciones' },
    { label: 'Historial de transacciones', route: '/historial' },
  ];

  readonly #usuarioService = inject(UsuarioService);
  readonly #document = inject(DOCUMENT);

  /**
   * Inicializa streams del usuario y aplica tema persistido.
   */
  constructor() {
    this.saldo$ = this.#usuarioService.saldo$;
    this.usuario$ = this.#usuarioService.usuario$.pipe(map((usuario) => usuario.nombre));
    this.initTheme();
  }

  /**
   * Texto contextual para tooltip y accesibilidad del botón de tema.
   */
  get themeTooltip(): string {
    return this.isDarkTheme ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  }

  /**
   * Alterna entre modo oscuro y claro.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme(this.isDarkTheme ? 'dark' : 'light');
  }

  /**
   * Lee y aplica el tema persistido en almacenamiento local.
   */
  private initTheme(): void {
    const storedTheme = localStorage.getItem(Header.THEME_STORAGE_KEY);
    const mode = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
    this.isDarkTheme = mode === 'dark';
    this.applyTheme(mode);
  }

  /**
   * Aplica el tema al documento y lo persiste en localStorage.
   */
  private applyTheme(mode: 'light' | 'dark'): void {
    const root = this.#document.documentElement;
    root.setAttribute('data-theme', mode);
    localStorage.setItem(Header.THEME_STORAGE_KEY, mode);
  }
}
