import { Injectable } from '@angular/core';
import { ISafeAny } from '@shared/interfaces/ISafeAny.interface';
import Swal from 'sweetalert2';

/**
 * Servicio utilitario para mostrar modales de error desde el interceptor.
 */
@Injectable({ providedIn: 'root' })
export class MessagesService {
  /**
   * Muestra mensajes de error estandarizados usados por el interceptor HTTP.
   */
  async mostrarErrorInterceptor(
    titleError = '',
    messageError = '',
    textoBotonConfirmar = '',
    textoBotonCancelar = '',
  ): Promise<boolean> {
    let aceptarCancelar = false;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'swal-btn swal-confirm',
        cancelButton: 'swal-btn swal-cancel',
        popup: 'swal-popup swal-error',
      },
      buttonsStyling: false,
    });

    const swalConfig: ISafeAny = {
      title: `<h2 class="swal-title">${titleError}</h2>`,
      html: `<div class="swal-content">${messageError}</div>`,
      icon: 'error',
      showCancelButton: !!textoBotonCancelar,
      confirmButtonText: textoBotonConfirmar || 'Aceptar',
      cancelButtonText: textoBotonCancelar,
      allowOutsideClick: false,
      allowEscapeKey: false,
    };

    await swalWithBootstrapButtons.fire(swalConfig).then((result: ISafeAny) => {
      aceptarCancelar = result.isConfirmed;
    });

    return aceptarCancelar;
  }
}