# Trades: funcionamiento y API

## 1. Objetivo

La funcionalidad de trades permite registrar, consultar, editar, cerrar y eliminar lógicamente las operaciones de un usuario. Los trades pertenecen a una cuenta y no pueden ser consultados o modificados por otro usuario.

La implementación está dividida entre:

- Backend Spring Boot: entidad, repositorio, servicio, DTOs y controller.
- Frontend React: cliente Axios, formulario de alta, diálogo de detalle y diálogo de cierre.

## 2. Modelo de estado

Un trade nuevo siempre se crea con estado `OPEN`.

| Estado | Significado |
| --- | --- |
| `OPEN` | La posición sigue activa. También se conserva en este estado después de un cierre parcial. |
| `CLOSE` | La cantidad restante se cerró completamente. |
| `BREAKE_EVEN` | Estado reservado para una futura clasificación del resultado. |
| `STOP_PROFIT` | Estado reservado para una futura clasificación del resultado. |

El estado no se recibe desde el formulario de creación ni desde la edición. Solamente la operación de cierre completo puede cambiarlo a `CLOSE`.

## 3. Persistencia y seguridad

Las clases principales son:

| Archivo | Responsabilidad |
| --- | --- |
| `Backend/src/main/java/com/portfolio/portfolio/entity/Trade.java` | Entidad JPA del trade. |
| `Backend/src/main/java/com/portfolio/portfolio/repository/TradeRepository.java` | Consultas filtradas por usuario y borrado lógico. |
| `Backend/src/main/java/com/portfolio/portfolio/service/TradeService.java` | Validaciones y reglas de negocio. |
| `Backend/src/main/java/com/portfolio/portfolio/controller/TradeController.java` | API HTTP protegida por JWT. |
| `Frontend/src/api/trades.ts` | Cliente tipado de la API. |

El usuario se obtiene del principal autenticado, cuyo nombre es el correo incluido en el JWT. Las consultas usan la relación `trade.account.user.id`; por eso un usuario no puede acceder a trades de otra cuenta.

Regla de cuenta: todo trade nuevo debe pertenecer a una cuenta con un proveedor soportado (`SIMPLEFX` o `BITGET`). Si se crea un trade sin indicar `accountId`, se usa la primera cuenta activa que tenga proveedor. Si no existe, la API responde `400` y no crea cuentas automáticamente. Las cuentas heredadas sin proveedor conservan sus trades, pero no admiten trades nuevos ni importaciones hasta que se les asigne un proveedor.

Los errores de la API de trades y cuentas devuelven un cuerpo estable `{"message": "..."}` generado por `ApiExceptionHandler`. La pantalla de cuentas muestra ese mensaje cuando una operación falla.

La importación de historiales de SimpleFX y Bitget se documenta en `docs/trade-import.md`.

## 4. Endpoints

Todos los endpoints requieren el access token JWT en `Authorization: Bearer <token>`.

### 4.1 Listar trades

```http
GET /api/trades?accountId=01JACCOUNT...
```

Devuelve los trades no eliminados de la cuenta indicada. La cuenta debe pertenecer al usuario autenticado y no estar eliminada; una cuenta inexistente, eliminada o de otro usuario responde `404`.

### 4.2 Listar trades abiertos

```http
GET /api/trades/open?accountId=01JACCOUNT...
```

Devuelve únicamente los trades no eliminados con estado `OPEN` de la cuenta indicada. La cuenta debe pertenecer al usuario autenticado y no estar eliminada. Los trades con cierre parcial siguen apareciendo aquí mientras conserven cantidad restante.

### 4.3 Crear un trade

```http
POST /api/trades
Content-Type: application/json
```

```json
{
  "symbol": "EUR/USD",
  "direction": "LONG",
  "entryPrice": 1.0854,
  "stopLoss": 1.08,
  "takeProfit": 1.095,
  "quantity": 1.5
}
```

`symbol`, `direction`, `entryPrice` y `quantity` son obligatorios. El servicio normaliza el símbolo a mayúsculas, redondea los precios a 9 decimales y establece `status=OPEN`, `openAt`, `createdAt` y `pnl=0`. La cuenta indicada debe tener un proveedor soportado.

### 4.4 Consultar un trade

```http
GET /api/trades/{id}
```

### 4.5 Editar parámetros

```http
PUT /api/trades/{id}
Content-Type: application/json
```

```json
{
  "symbol": "EUR/USD",
  "direction": "SHORT",
  "entryPrice": 1.087,
  "stopLoss": 1.09,
  "takeProfit": 1.075,
  "quantity": 1.25
}
```

La edición modifica únicamente el plan y los parámetros del trade. No cierra la posición, no modifica `status`, `exitPrice`, `closeAt` ni el P&L realizado.

La pantalla abre esta operación desde `Details` en `Journal` y `OpenTrades`.

### 4.6 Cerrar un trade

```http
PATCH /api/trades/{id}/close
Content-Type: application/json
```

```json
{
  "exitPrice": 1.0892,
  "quantity": 0.75,
  "pnl": 35.0,
  "moveStopLoss": true,
  "stopLoss": 1.0875
}
```

Reglas:

1. `exitPrice` y `quantity` son obligatorios.
2. `quantity` debe ser mayor que cero y no puede superar la cantidad restante.
3. Si `quantity` es menor que la cantidad restante, el cierre es parcial. La cantidad del trade se reduce, el P&L se acumula y el estado permanece `OPEN`.
4. Si `quantity` coincide con la cantidad restante, el cierre es completo. Se establece `closeAt` y el estado pasa a `CLOSE`.
5. `moveStopLoss=true` requiere un nuevo valor válido en `stopLoss`.
6. El P&L enviado se suma al P&L acumulado del trade. Esto permite conservar el resultado de varios cierres parciales.

El cierre se realiza desde `Close` y usa un diálogo independiente del diálogo de edición.

### 4.7 Eliminar lógicamente

```http
DELETE /api/trades/{id}
```

No se ejecuta un `DELETE` físico en la base de datos. El servicio asigna `deletedAt` con la fecha actual. Los listados y las búsquedas excluyen automáticamente registros con `deletedAt` distinto de `null`.

La eliminación se inicia desde `Details` y requiere confirmación dentro del diálogo.

## 5. Flujo en frontend

### Journal

`Journal.tsx` consume `GET /api/trades`, muestra el historial y permite abrir los detalles de cualquier trade para editarlo o eliminarlo lógicamente.

### OpenTrades

`OpenTrades.tsx` consume `GET /api/trades/open`. Cada fila ofrece:

- `Close`: abre el diálogo de cierre completo o parcial.
- `Details`: abre el diálogo independiente de edición y eliminación.

Después de crear, editar, cerrar o eliminar, la pantalla vuelve a consultar la API para reflejar el estado persistido.

## 6. Pruebas

Las pruebas unitarias están en:

`Backend/src/test/java/com/portfolio/portfolio/service/TradeServiceTest.java`

Cubren:

- Creación con una cuenta que tiene proveedor.
- Selección de la primera cuenta activa con proveedor cuando no se indica `accountId`.
- Rechazo de cuentas sin proveedor.
- Cierre completo.
- Cierre parcial.
- Acumulación de P&L.
- Movimiento del stop loss.
- Rechazo de cantidades inválidas.
- Edición independiente del estado de cierre.
- Borrado lógico mediante `deletedAt`.

La suite completa incluye además `AccountServiceTest`, `AccountProviderBackfillTest`, `ApiExceptionHandlerTest` y las pruebas de importación en `service/tradeimport/`.

Para ejecutarlas junto con toda la suite:

```bash
docker compose --profile development exec -T backend mvn test
```
