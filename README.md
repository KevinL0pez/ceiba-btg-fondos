# BTG Fondos

Aplicación Angular para gestión de fondos (FPV/FIC) con persistencia en `json-server`, sincronización entre pestañas, tema claro/oscuro y pruebas unitarias con Vitest.

## Requisitos

- Node.js 20+ (recomendado LTS)
- npm 10+

## Instalación

```bash
npm install
```

## Ejecución local (paso a paso)

Esta app necesita **dos procesos**: backend mock y frontend Angular.

### 1) Levantar API mock (`json-server`)

```bash
npx json-server mock/db.json --port 8001
```

### 2) Levantar aplicación Angular

En otra terminal:

```bash
npm start
```

### 3) Abrir en navegador

```text
http://localhost:4200/
```

## Scripts disponibles

- `npm start`: levanta la app Angular en desarrollo.
- `npm run build`: genera el build en `dist/`.
- `npm test`: ejecuta pruebas unitarias en modo watch.
- `npm test -- --watch=false`: ejecuta pruebas unitarias una sola vez (ideal para CI).

## Pruebas unitarias

El proyecto usa **Vitest** como runner de pruebas.

```bash
npm test -- --watch=false
```

## Notas de desarrollo

- La base de datos mock vive en `mock/db.json`.
- Si cambias puertos o endpoints, revisa:
  - `proxy.conf.js`
  - `src/environments/api.ts`
  - `src/environments/environment.ts`

## Internacionalización (i18n)

La aplicación incluye soporte de idioma para **Español (ES)** e **Inglés (EN)** mediante un servicio interno de traducciones.

- Servicio principal: `src/app/shared/services/i18n.service.ts`
- Selector de idioma: disponible en el `header` (botones ES / EN).
- Persistencia: el idioma seleccionado se guarda en `localStorage` con la clave `btg-language`.
- Comportamiento: los textos visibles en componentes y mensajes de feedback se traducen con `i18n.t('clave')`.

### Agregar o modificar traducciones

1. Abre `src/app/shared/services/i18n.service.ts`.
2. Registra la clave en el objeto `TRANSLATIONS` con valores `es` y `en`.
3. Usa la clave en el componente/servicio con:

```ts
this.i18n.t('mi.clave')
```

### Recomendación

Para mantener consistencia, evita textos hardcodeados en componentes/servicios y centraliza todos los mensajes en `i18n.service.ts`.

## Stack principal

- Angular 21 (standalone components)
- Angular Material
- NgRx (Store + Effects)
- RxJS
- json-server
- Vitest
