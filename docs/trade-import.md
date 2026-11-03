# Importación de trades: SimpleFX y Bitget

## 1. Objetivo

La importación incorpora el historial de posiciones cerradas exportado por un broker o exchange a una cuenta existente del journal. El proceso es atómico: si una fila del archivo no es válida, no se guarda ningún trade y la API devuelve los errores encontrados.

La funcionalidad está implementada en:

| Archivo | Responsabilidad |
| --- | --- |
| `Backend/src/main/java/com/portfolio/portfolio/controller/TradeImportController.java` | Endpoint multipart protegido por JWT. |
| `Backend/src/main/java/com/portfolio/portfolio/service/tradeimport/TradeImportService.java` | Validaciones de cuenta, moneda y persistencia. |
| `Backend/src/main/java/com/portfolio/portfolio/service/tradeimport/TradeImportFileReader.java` | Lectura de CSV, XLS y XLSX. |
| `Backend/src/main/java/com/portfolio/portfolio/service/tradeimport/*TradeImportAdapter.java` | Mapeo de columnas por proveedor. |
| `Backend/src/main/java/com/portfolio/portfolio/entity/AccountProvider.java` | Identidad estable de los proveedores soportados. |
| `Frontend/src/api/trades.ts` | Cliente `importTrades`. |
| `Frontend/src/page/journal/Accounts.tsx` | Acción `Import trades` por cuenta. |

## 2. Proveedores y formatos

Cada cuenta debe tener un proveedor (`SIMPLEFX` o `BITGET`). El campo `broker` es solo una etiqueta visible y no determina el adaptador.

| Proveedor | Export esperado | Moneda del P&L | Columnas obligatorias |
| --- | --- | --- | --- |
| SimpleFX | Historial de trades cerrados en CSV, XLS o XLSX | `USD` | `Symbol`, `Side`, `Size`, `Open Time`, `Close Time`, `Open Price`, `Close price`, `Take Profit`, `Stop Loss`, `Profit (USD)` |
| Bitget | Historial de posiciones de Futures en CSV o Excel | `USDT` | `Futures`, `Opening time`, `Average entry price`, `Average closing price`, `Closed amount`, `Closed value`, `Position PnL`, `Realized PnL`, `Fees`, `Opening fee`, `Closing fee`, `Closed time` |

Los encabezados se comparan sin distinguir mayúsculas, espacios externos ni BOM. El archivo debe tener una cabecera para cada columna y no puede repetir nombres.
Las fechas aceptan ISO, `yyyy-MM-dd` o `yyyy/MM/dd`, formato `dd.MM.yyyy` o `dd/MM/yyyy` y fecha estadounidense con AM/PM; se permiten fracciones de segundo.
Los campos numéricos aceptan coma decimal. Si el valor contiene punto y coma, el último separador se toma como decimal y el otro como agrupador de miles.

### SimpleFX

- `Side` acepta `Buy`/`Long` y `Sell`/`Short`.
- `Size` se usa como cantidad.
- `Profit (USD)` se guarda como P&L realizado.
- `Take Profit` y `Stop Loss` son opcionales.

### Bitget

- `Futures` debe incluir símbolo y dirección, por ejemplo `BTCUSDT Short·Cross`.
- Solo se admiten contratos liquidados en `USDT` cuyo símbolo termine en `USDT`.
- `Closed amount` se usa como cantidad.
- `Realized PnL` se guarda como P&L realizado y `Fees` como comisión.
- El export puede añadir la unidad al final del número: activo base en `Closed amount` (por ejemplo, `0.0113BTC`) y `USDT` en precios, P&L y comisiones. La unidad debe coincidir con el símbolo o moneda esperada.
- El adaptador tolera el separador `·` o `•` entre la dirección y el modo de margen.

## 3. Reglas de cuenta y moneda

1. La cuenta debe pertenecer al usuario autenticado y no estar archivada.
2. La cuenta debe tener un proveedor soportado. Las cuentas heredadas sin proveedor deben editarlo primero; conservan su `id` y sus trades.
3. La moneda de la cuenta debe coincidir con la del proveedor: `USD` para SimpleFX y `USDT` para Bitget.
4. No se realiza conversión de moneda durante la importación.

Al arrancar, `AccountProviderBackfill` asigna proveedor a cuentas existentes cuyo `broker` sea `SimpleFX` o `Bitget` (sin distinguir mayúsculas). Las cuentas `Manual` o con etiquetas desconocidas permanecen sin proveedor.

## 4. Endpoint

```http
POST /api/accounts/{accountId}/trade-imports
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Campo multipart: `file`.

Respuesta `200`:

```json
{
  "accountId": "01JACCOUNT...",
  "provider": "SIMPLEFX",
  "importedCount": 42
}
```

Los trades importados se crean con estado `CLOSE`, `market=OTHER`, `notes="Imported from <proveedor>"`, `createdAt` igual al momento de la importación y precios/cantidades redondeados a 9 decimales. La comisión de Bitget se persiste y se expone junto con `swap` en `GET /api/trades`.

La carga máxima es de 10 MB (`spring.servlet.multipart.max-file-size`).

## 5. Errores

La API responde `400` con un cuerpo `{"message": "..."}`. Los casos principales son:

- Archivo vacío, extensión no soportada o archivo ilegible.
- Columnas faltantes o duplicadas.
- Cuenta sin proveedor o con moneda incompatible.
- Fila sin símbolo, dirección, precio, cantidad o fecha válidos.
- Fecha de cierre anterior a la de apertura.
- Cantidad o precio no positivos.

Si hay errores de fila, el mensaje indica que no se guardó ningún trade. Se listan como máximo 20 errores y se resume el total restante.

## 6. Flujo en frontend

En `Accounts`, cada cuenta con proveedor muestra `Import trades`. El archivo se envía con `FormData` y `withCredentials`; al finalizar se recarga el resumen de cuentas para actualizar balance neto, número de trades y win rate. Si la importación falla, se muestra el `message` devuelto por la API.

Las cuentas sin proveedor muestran `Assign a provider to import` y la acción queda deshabilitada.

## 7. Pruebas

| Archivo | Cobertura |
| --- | --- |
| `TradeImportAdapterTest` | Mapeo de SimpleFX y Bitget, dirección y P&L. |
| `TradeImportFileReaderTest` | CSV con BOM y XLSX. |
| `TradeImportServiceTest` | Persistencia, cuenta sin proveedor, moneda incorrecta y atomicidad. |
| `AccountServiceTest` | Alta con proveedor, `USDT` y asignación a cuentas heredadas. |
| `AccountProviderBackfillTest` | Backfill de etiquetas conocidas. |
| `ApiExceptionHandlerTest` | Formato `{"message": ...}` y códigos HTTP. |

Ejecución:

```bash
docker compose run --rm --no-deps backend mvn test
```

## 8. Limitaciones conocidas

- La importación es append-only: volver a subir el mismo archivo duplica los trades.
- Solo se procesa la primera hoja de un libro Excel.
- Solo se importan posiciones cerradas; no se reconstruyen trades abiertos.
- El mercado se almacena como `OTHER` porque las exportaciones no ofrecen un identificador de mercado homogéneo.
- No se guardan identificadores externos del broker, por lo que no hay deduplicación automática.
