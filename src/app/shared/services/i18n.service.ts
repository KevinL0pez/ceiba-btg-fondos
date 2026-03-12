import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, of } from 'rxjs';

export type AppLanguage = 'es' | 'en';

type TranslationParams = Record<string, string | number>;
type TranslationDictionary = Record<string, string>;

const DEFAULT_LANGUAGE: AppLanguage = 'es';
const STORAGE_KEY = 'btg-language';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly #document = inject(DOCUMENT);
  readonly #http = inject(HttpClient);
  readonly #languageSubject = new BehaviorSubject<AppLanguage>(this.getInitialLanguage());
  readonly #versionSubject = new BehaviorSubject<number>(0);
  readonly #dictionaries: Record<AppLanguage, TranslationDictionary> = {
    es: {},
    en: {},
  };
  readonly #loaded = new Set<AppLanguage>();

  readonly language$ = this.#languageSubject.asObservable();
  readonly translationsVersion$ = this.#versionSubject.asObservable();

  constructor() {
    void this.loadDictionary(this.language);
    const fallbackLanguage: AppLanguage = this.language === 'es' ? 'en' : 'es';
    void this.loadDictionary(fallbackLanguage);
  }

  get language(): AppLanguage {
    return this.#languageSubject.value;
  }

  setLanguage(language: AppLanguage): void {
    this.#languageSubject.next(language);
    this.#document.documentElement.setAttribute('lang', language);
    localStorage.setItem(STORAGE_KEY, language);
    void this.loadDictionary(language);
  }

  t(key: string, params?: TranslationParams): string {
    const currentDictionary = this.#dictionaries[this.language];
    const fallbackDictionary = this.#dictionaries[DEFAULT_LANGUAGE];
    const message = currentDictionary[key] ?? fallbackDictionary[key] ?? key;
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

  private async loadDictionary(language: AppLanguage): Promise<void> {
    if (this.#loaded.has(language)) {
      return;
    }

    const dictionary = await firstValueFrom(
      this.#http.get<TranslationDictionary>(`/assets/i18n/${language}.json`).pipe(catchError(() => of({}))),
    );

    this.#dictionaries[language] = dictionary;
    this.#loaded.add(language);
    this.#versionSubject.next(this.#versionSubject.value + 1);
  }
}
