import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ISafeAny } from '@shared/interfaces/ISafeAny.interface';
import Swal, { SweetAlertResult } from 'sweetalert2';

/**
 * Servicio de modales/alertas para feedback de operaciones de la UI.
 */
@Injectable({ providedIn: 'root' })
export class SwalToastService {
  readonly #router = inject(Router);

  /**
   * Muestra un modal con estilo personalizado.
   * Puede navegar opcionalmente cuando el usuario confirma.
   */
  async mostrarMsg(
    messageError = '',
    icon: 'error' | 'success' | 'warning' | 'info' | 'question',
    router = '',
    textoBotonConfirmar = 'Aceptar',
    textoBotonCancelar = ''
  ): Promise<boolean> {
    let aceptarCancelar = false;

    const swalWithCustomButtons = Swal.mixin({
      customClass: {
        confirmButton: 'swal-btn swal-confirm',
        cancelButton: 'swal-btn swal-cancel',
        popup: `swal-popup swal-${icon}`,
      },
      buttonsStyling: false,
    });

    const swalConfig: ISafeAny = {
      html: `<div class="swal-content">${messageError}</div>`,
      icon,
      showCancelButton: !!textoBotonCancelar,
      confirmButtonText: textoBotonConfirmar,
      cancelButtonText: textoBotonCancelar,
      allowOutsideClick: false,
      allowEscapeKey: false,
    };

    await swalWithCustomButtons.fire(swalConfig).then((result: SweetAlertResult) => {
      if (result.isConfirmed && router) {
        this.#router.navigate([router]);
      }
      aceptarCancelar = result.isConfirmed;
    });

    return aceptarCancelar;
  }
}
