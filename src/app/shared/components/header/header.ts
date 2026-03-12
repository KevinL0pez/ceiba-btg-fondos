import { AsyncPipe, CommonModule, CurrencyPipe, DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '@core/services/usuario.service';
import { AppCurrency, CurrencyService } from '@shared/services/currency.service';
import { AppLanguage, I18nService } from '@shared/services/i18n.service';
import { map, Observable, combineLatest } from 'rxjs';

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
  /** Idioma activo de la interfaz. */
  language: AppLanguage;
  /** Moneda activa para visualización. */
  currency: AppCurrency;
  /** Enlaces de navegación del encabezado. */
  readonly navItems = [
    { labelKey: 'header.nav.funds', route: '/fondos' },
    { labelKey: 'header.nav.subscriptions', route: '/suscripciones' },
    { labelKey: 'header.nav.history', route: '/historial' },
  ];

  readonly #usuarioService = inject(UsuarioService);
  readonly #document = inject(DOCUMENT);
  readonly #i18n = inject(I18nService);
  readonly #currencyService = inject(CurrencyService);
  readonly #languageSignal = toSignal(this.#i18n.language$, { initialValue: this.#i18n.language });

  /**
   * Inicializa streams del usuario y aplica tema persistido.
   */
  constructor() {
    this.saldo$ = combineLatest([this.#usuarioService.saldo$, this.#currencyService.selectedCurrency$]).pipe(
      map(([saldo]) => this.#currencyService.convertFromCop(saldo)),
    );
    this.usuario$ = this.#usuarioService.usuario$.pipe(map((usuario) => usuario.nombre));
    this.language = this.#i18n.language;
    this.currency = this.#currencyService.selectedCurrency;
    this.initTheme();
  }

  /**
   * Texto contextual para tooltip y accesibilidad del botón de tema.
   */
  get themeTooltip(): string {
    return this.isDarkTheme ? this.t('header.theme.light') : this.t('header.theme.dark');
  }

  /**
   * Alterna entre modo oscuro y claro.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme(this.isDarkTheme ? 'dark' : 'light');
  }

  /**
   * Cambia el idioma activo y lo persiste.
   */
  setLanguage(language: AppLanguage): void {
    this.language = language;
    this.#i18n.setLanguage(language);
  }

  /**
   * Cambia la moneda activa para visualización de montos.
   */
  setCurrency(currency: AppCurrency): void {
    this.currency = currency;
    this.#currencyService.setCurrency(currency);
  }

  /**
   * Devuelve la traducción de una clave de texto.
   */
  t(key: string, params?: Record<string, string | number>): string {
    this.#languageSignal();
    return this.#i18n.t(key, params);
  }

  /**
   * Código de moneda actual para usar en pipes de formato.
   */
  get currencyCode(): AppCurrency {
    return this.currency;
  }

  /**
   * Etiqueta de visualización para el pipe currency.
   */
  get currencyDisplay(): string {
    return `${this.currency} $`;
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
