# Pruebas del Frontend

## 1. Estado actual

El frontend es React 19 + TypeScript + Vite. Actualmente tiene lint y build, pero no tiene un runner de pruebas configurado ni archivos `*.test.*`.

Scripts disponibles hoy en `Frontend/package.json`:

```bash
npm run lint
npm run build
npm run dev
npm run preview
```

Por tanto, `npm test` no está disponible hasta instalar y configurar un runner.

## 2. Stack recomendado

Para pruebas unitarias y de componentes se recomienda:

- Vitest: runner integrado con Vite.
- React Testing Library: pruebas orientadas al comportamiento visible del usuario.
- `@testing-library/user-event`: interacción realista con inputs, botones y formularios.
- `@testing-library/jest-dom`: assertions como `toBeInTheDocument` y `toHaveAccessibleName`.
- MSW: mock de API HTTP sin acoplar los tests a la implementación de Axios.

Para pruebas end-to-end se recomienda:

- Playwright.

## 3. Instalación inicial

Desde `Frontend/`:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
npm install -D @playwright/test
npx playwright install
```

No ejecutar estos comandos en cada prueba. Son pasos de configuración del proyecto y deben actualizar `package.json` y el lockfile.

## 4. Configuración de Vitest

Crear `Frontend/vitest.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

Crear `Frontend/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`jsdom` es necesario para componentes que usan `document`, `window`, diálogos y formularios.

Agregar scripts a `Frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

Si se usan globals de Vitest sin importar `describe`, `it` o `expect`, agregar los tipos de Vitest al `tsconfig` usado por la aplicación.

## 5. Estructura de tests

Se recomienda mantener los tests cerca del código probado:

```text
Frontend/src/
├── api/
│   ├── trades.ts
│   └── trades.test.ts
├── component/journal/
│   ├── CloseTradeDialog.tsx
│   ├── CloseTradeDialog.test.tsx
│   ├── TradeDetailDialog.tsx
│   └── TradeDetailDialog.test.tsx
├── page/journal/
│   ├── Journal.tsx
│   ├── Journal.test.tsx
│   ├── OpenTrades.tsx
│   └── OpenTrades.test.tsx
└── test/
    ├── setup.ts
    └── server.ts
```

Convenciones:

- Usar `*.test.ts` para lógica y API.
- Usar `*.test.tsx` para componentes React.
- Consultar por roles, labels y texto visible, no por clases CSS ni detalles internos.
- Usar `userEvent` en lugar de disparar eventos manuales cuando sea posible.
- Esperar resultados asíncronos con `findByRole`, `findByText` o `waitFor`.
- Probar una intención de usuario por test.
- No usar snapshots como única forma de cobertura.

## 6. Pruebas de API

Las funciones de `Frontend/src/api/trades.ts` deben verificar que se usa el método, URL y payload correctos.

Para componentes y flujos completos, preferir MSW:

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  http.get('/api/trades/open', () => HttpResponse.json([])),
);
```

Configurar el servidor en `src/test/setup.ts` o en un archivo global:

```ts
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Para una prueba aislada de una función también se puede usar `vi.mock`, pero MSW es preferible para mantener el test cercano al contrato HTTP real.

## 7. Casos de trades

### `NewTradeDialog`

- Abre y cierra el diálogo.
- Permite seleccionar `Long` o `Short`.
- Envía símbolo, dirección, precio de entrada, cantidad, stop loss y take profit.
- Deshabilita el submit mientras guarda.
- Muestra error si la API falla.
- Ejecuta `onCreated` tras una creación exitosa.
- Cierra con Escape.

### `CloseTradeDialog`

- Abre en modo completo por defecto.
- Cambia entre cierre completo y parcial.
- Deshabilita o fija la cantidad según el modo.
- Valida precio de salida y cantidad.
- Permite introducir P&L realizado.
- Permite activar `Move stop loss` y exige el nuevo valor.
- Envía `PATCH /api/trades/{id}/close`.
- Ejecuta `onClosed` solo después de una respuesta exitosa.
- Muestra error y mantiene el diálogo si la API falla.

### `TradeDetailDialog`

- Carga los valores actuales del trade.
- Permite editar símbolo, dirección, precio, cantidad, stop loss y take profit.
- Envía `PUT /api/trades/{id}`.
- No dispara el endpoint de cierre al guardar.
- Requiere confirmación antes del soft delete.
- Envía `DELETE /api/trades/{id}`.
- Ejecuta `onUpdated` o `onDeleted` únicamente tras éxito.

### `Journal`

- Carga `GET /api/trades`.
- Filtra por texto y estado.
- Muestra loading, error y estado vacío.
- Abre el detalle desde la tabla.
- Recarga la lista después de crear, editar o eliminar.

### `OpenTrades`

- Carga `GET /api/trades/open`.
- Muestra solo trades abiertos.
- Abre el diálogo de cierre.
- Mantiene visible un trade después de un cierre parcial.
- Lo elimina de la lista después de un cierre completo.
- Permite abrir detalles y eliminar lógicamente.

## 8. Ejemplo de prueba de componente

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CloseTradeDialog from './CloseTradeDialog';

describe('CloseTradeDialog', () => {
  it('sends a partial close with the new stop loss', async () => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(<CloseTradeDialog trade={tradeFixture} onClosed={onClosed} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /partial/i }));
    await user.clear(screen.getByLabelText(/quantity to close/i));
    await user.type(screen.getByLabelText(/quantity to close/i), '0.5');
    await user.click(screen.getByRole('checkbox', { name: /move stop loss/i }));
    await user.click(screen.getByRole('button', { name: /record partial close/i }));

    expect(onClosed).toHaveBeenCalledOnce();
  });
});
```

En un test real, mockear la respuesta HTTP con MSW o mockear `closeTrade` con `vi.mock`. No depender de un backend encendido para una prueba unitaria de componente.

## 9. Pruebas end-to-end con Playwright

Crear `Frontend/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 0.0.0.0',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

El puerto debe coincidir con el entorno real. En Docker, el frontend se publica como `http://localhost:3000`, pero el servidor Vite interno escucha en `5173`.

Ejemplo:

```ts
import { test, expect } from '@playwright/test';

test('opens the partial close dialog', async ({ page }) => {
  await page.goto('/journal/open-trades');
  await page.getByRole('button', { name: 'Close' }).first().click();
  await expect(page.getByRole('dialog', { name: /close position/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /partial/i })).toBeVisible();
});
```

Los tests E2E necesitan una sesión autenticada y un backend disponible. Para CI se debe preparar un usuario de prueba, una base aislada y datos deterministas.

Comandos:

```bash
npx playwright test
npx playwright test --headed
npx playwright show-report
```

## 10. Ejecutar pruebas frontend

Cuando Vitest esté configurado:

```bash
cd Frontend
npm run test:run
npm run test:coverage
```

Modo watch durante desarrollo:

```bash
npm run test
```

Validación complementaria actual:

```bash
npm run lint
npm run build
```

## 11. Diagnóstico

- `npm test` no existe: agregar Vitest y los scripts indicados.
- `document is not defined`: configurar `environment: 'jsdom'`.
- `toBeInTheDocument is not a function`: importar `@testing-library/jest-dom/vitest` en setup.
- Test intermitente: usar `findBy*` o `waitFor` para efectos asíncronos y limpiar mocks.
- Axios intenta contactar el backend real: configurar MSW o mockear el cliente.
- `401` en E2E: preparar la cookie/token de sesión antes de navegar a rutas protegidas.
- Playwright no encuentra browser: ejecutar `npx playwright install`.
- Fallos por puerto ocupado: detener el servidor anterior o habilitar `reuseExistingServer`.

## 12. Criterio de aceptación

Un cambio de frontend debe pasar como mínimo:

```bash
npm run lint
npm run build
npm run test:run
```

Los cambios que afecten autenticación, API o flujos críticos de trades deben incluir pruebas de error además de la ruta exitosa. Los cambios de navegación y formularios críticos deben incluir al menos un escenario E2E.
