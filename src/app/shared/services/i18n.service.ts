import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppLanguage = 'es' | 'en';

type TranslationParams = Record<string, string | number>;

const DEFAULT_LANGUAGE: AppLanguage = 'es';
const STORAGE_KEY = 'btg-language';

const TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  'header.brand.title': {
    es: 'Manejo inteligente de fondos',
    en: 'Smart fund management',
  },
  'header.brand.subtitle': {
    es: 'con seguimiento en tiempo real',
    en: 'with real-time tracking',
  },
  'header.fpv.tooltip': {
    es: 'Fondo de Pensiones Voluntarias',
    en: 'Voluntary Pension Fund',
  },
  'header.fic.tooltip': {
    es: 'Fondo de Inversion Colectiva',
    en: 'Collective Investment Fund',
  },
  'header.client': { es: 'Cliente', en: 'Client' },
  'header.balance': { es: 'Saldo disponible', en: 'Available balance' },
  'header.nav.context': { es: 'Contexto de la aplicacion', en: 'Application context' },
  'header.nav.funds': { es: 'Fondos disponibles', en: 'Available funds' },
  'header.nav.subscriptions': { es: 'Suscripciones activas', en: 'Active subscriptions' },
  'header.nav.history': { es: 'Historial de transacciones', en: 'Transaction history' },
  'header.theme.light': { es: 'Cambiar a modo claro', en: 'Switch to light mode' },
  'header.theme.dark': { es: 'Cambiar a modo oscuro', en: 'Switch to dark mode' },
  'header.language.es': { es: 'ES', en: 'ES' },
  'header.language.en': { es: 'EN', en: 'EN' },
  'header.language.aria': { es: 'Cambiar idioma', en: 'Change language' },

  'fondos.title': { es: 'Fondos disponibles', en: 'Available funds' },
  'fondos.subtitle': {
    es: 'Explora las opciones de inversion y elige la que mejor se ajuste a tu perfil.',
    en: 'Explore investment options and choose the one that best fits your profile.',
  },
  'fondos.loading.title': { es: 'Cargando fondos...', en: 'Loading funds...' },
  'fondos.loading.body': {
    es: 'Estamos consultando la informacion de fondos.',
    en: 'We are fetching fund information.',
  },
  'fondos.error.title': { es: 'Error de conexion', en: 'Connection error' },
  'fondos.minAmount': { es: 'Monto minimo', en: 'Minimum amount' },
  'fondos.notification': { es: 'Notificacion de suscripcion', en: 'Subscription notification' },
  'fondos.subscribe': { es: 'Suscribirse', en: 'Subscribe' },
  'fondos.empty.title': { es: 'No hay fondos disponibles', en: 'No funds available' },
  'fondos.empty.body': {
    es: 'Puede que ya estes suscrito a todos los fondos o que el servicio no tenga datos.',
    en: 'You may already be subscribed to all funds or there may be no data available.',
  },
  'fondos.error.fetch': {
    es: 'No fue posible cargar la lista de fondos. Intenta nuevamente.',
    en: 'Unable to load the list of funds. Please try again.',
  },
  'fondos.error.methodRequired': {
    es: 'Selecciona el método de notificación (Email o SMS) antes de suscribirte.',
    en: 'Select a notification method (Email or SMS) before subscribing.',
  },
  'fondos.error.insufficientBalance': {
    es: 'No tienes saldo suficiente para suscribirte a este fondo.',
    en: 'You do not have enough balance to subscribe to this fund.',
  },
  'fondos.error.insufficientBalanceDetail': {
    es: 'Saldo insuficiente para completar la suscripcion.',
    en: 'Insufficient balance to complete the subscription.',
  },
  'fondos.category.fpv': {
    es: 'FPV: Fondo de Pensiones Voluntarias.',
    en: 'FPV: Voluntary Pension Fund.',
  },
  'fondos.category.fic': {
    es: 'FIC: Fondo de Inversion Colectiva.',
    en: 'FIC: Collective Investment Fund.',
  },

  'suscripciones.title': { es: 'Suscripciones activas', en: 'Active subscriptions' },
  'suscripciones.subtitle': {
    es: 'Gestiona tus inversiones vigentes y su metodo de notificacion.',
    en: 'Manage your current investments and their notification method.',
  },
  'suscripciones.amount': { es: 'Monto', en: 'Amount' },
  'suscripciones.notification': { es: 'Notificacion', en: 'Notification' },
  'suscripciones.date': { es: 'Fecha de suscripción', en: 'Subscription date' },
  'suscripciones.cancel': { es: 'Cancelar suscripción', en: 'Cancel subscription' },
  'suscripciones.empty.title': { es: 'No tienes suscripciones activas', en: 'You have no active subscriptions' },
  'suscripciones.empty.body': {
    es: 'Suscribete a un fondo para comenzar a construir tus inversiones.',
    en: 'Subscribe to a fund to start building your investments.',
  },

  'historial.title': { es: 'Historial de transacciones', en: 'Transaction history' },
  'historial.subtitle': {
    es: 'Monitorea tus movimientos y su estado en tiempo real.',
    en: 'Track your transactions and their status in real time.',
  },
  'historial.table.date': { es: 'Fecha', en: 'Date' },
  'historial.table.fund': { es: 'Fondo', en: 'Fund' },
  'historial.table.type': { es: 'Tipo', en: 'Type' },
  'historial.table.status': { es: 'Estado', en: 'Status' },
  'historial.table.channel': { es: 'Canal', en: 'Channel' },
  'historial.table.amount': { es: 'Monto', en: 'Amount' },
  'historial.empty.title': { es: 'No hay transacciones registradas', en: 'No transactions found' },
  'historial.empty.body': {
    es: 'Cuando suscribas o canceles un fondo, el historial aparecera aqui.',
    en: 'When you subscribe to or cancel a fund, history will appear here.',
  },

  'effects.subscribe.success': {
    es: 'Suscripcion confirmada. Notificacion por {{method}}.',
    en: 'Subscription confirmed. Notification via {{method}}.',
  },
  'effects.subscribe.error': {
    es: 'No se pudo completar la suscripcion. Intenta nuevamente.',
    en: 'Unable to complete the subscription. Please try again.',
  },
  'effects.cancel.success': {
    es: 'Suscripción cancelada. El saldo fue actualizado.',
    en: 'Subscription canceled. Balance was updated.',
  },
  'effects.cancel.error': {
    es: 'No se pudo cancelar la suscripción. Intenta nuevamente.',
    en: 'Unable to cancel the subscription. Please try again.',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly #document = inject(DOCUMENT);
  readonly #languageSubject = new BehaviorSubject<AppLanguage>(this.getInitialLanguage());

  readonly language$ = this.#languageSubject.asObservable();

  get language(): AppLanguage {
    return this.#languageSubject.value;
  }

  setLanguage(language: AppLanguage): void {
    this.#languageSubject.next(language);
    this.#document.documentElement.setAttribute('lang', language);
    localStorage.setItem(STORAGE_KEY, language);
  }

  t(key: string, params?: TranslationParams): string {
    const dictionaryEntry = TRANSLATIONS[key];
    if (!dictionaryEntry) {
      return key;
    }

    const message = dictionaryEntry[this.language] ?? dictionaryEntry[DEFAULT_LANGUAGE];
    return this.interpolate(message, params);
  }

  private getInitialLanguage(): AppLanguage {
    const storedLanguage = localStorage.getItem(STORAGE_KEY);
    const language: AppLanguage = storedLanguage === 'en' ? 'en' : 'es';
    this.#document.documentElement.setAttribute('lang', language);
    return language;
  }

  private interpolate(message: string, params?: TranslationParams): string {
    if (!params) {
      return message;
    }

    return Object.entries(params).reduce((acc, [key, value]) => {
      return acc.replaceAll(`{{${key}}}`, String(value));
    }, message);
  }
}
