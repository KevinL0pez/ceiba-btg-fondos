import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, interval, map, of, startWith, switchMap } from 'rxjs';

export type AppCurrency = 'COP' | 'USD';

interface IOpenErApiResponse {
  result?: string;
  rates?: {
    USD?: number;
  };
}

interface ICurrencyPagesResponse {
  cop?: {
    usd?: number;
  };
}

const STORAGE_KEY = 'btg-currency';
const DEFAULT_CURRENCY: AppCurrency = 'COP';
const REFRESH_MS = 5 * 60 * 1000;

/**
 * Servicio para selección de moneda y conversión COP -> USD.
 * La tasa se consulta periódicamente desde una API pública.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly selectedCurrencySubject = new BehaviorSubject<AppCurrency>(this.getInitialCurrency());
  private readonly usdRateSubject = new BehaviorSubject<number>(0.00025);

  readonly selectedCurrency$ = this.selectedCurrencySubject.asObservable();
  readonly usdRate$ = this.usdRateSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.startRateRefresh();
  }

  get selectedCurrency(): AppCurrency {
    return this.selectedCurrencySubject.value;
  }

  setCurrency(currency: AppCurrency): void {
    this.selectedCurrencySubject.next(currency);
    localStorage.setItem(STORAGE_KEY, currency);
  }

  convertFromCop(amount: number): number {
    if (this.selectedCurrency === 'USD') {
      return amount * this.usdRateSubject.value;
    }

    return amount;
  }

  private getInitialCurrency(): AppCurrency {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'USD' ? 'USD' : DEFAULT_CURRENCY;
  }

  private startRateRefresh(): void {
    interval(REFRESH_MS)
      .pipe(
        startWith(0),
        switchMap(() => this.fetchUsdRate()),
      )
      .subscribe((rate) => this.usdRateSubject.next(rate));
  }

  private fetchUsdRate() {
    return this.http
      .get<IOpenErApiResponse>('https://open.er-api.com/v6/latest/COP')
      .pipe(
        map((response) => this.normalizeRate(response.rates?.USD)),
        catchError(() =>
          this.http.get<ICurrencyPagesResponse>('https://latest.currency-api.pages.dev/v1/currencies/cop.json').pipe(
            map((response) => this.normalizeRate(response.cop?.usd)),
            catchError(() => of(this.usdRateSubject.value)),
          ),
        ),
      );
  }

  private normalizeRate(rate: number | undefined): number {
    if (!rate || rate <= 0) {
      return this.usdRateSubject.value;
    }

    return rate;
  }
}
