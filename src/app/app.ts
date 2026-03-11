import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '@shared/components/header/header';

/**
 * Componente raíz de la aplicación.
 * Renderiza el encabezado global y el contenedor de rutas.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
