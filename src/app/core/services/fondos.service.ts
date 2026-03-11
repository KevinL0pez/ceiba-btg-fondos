import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { IFondo } from '@shared/models/IFondo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
/**
 * Servicio de acceso al catálogo de fondos.
 */
export class FondosService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene el catalogo de fondos disponibles desde la API mock.
   */
  getFondos(): Observable<IFondo[]> {
    return this.http.get<IFondo[]>(environment.api.getFondos);
  }
}