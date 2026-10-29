# Pruebas del Backend

## 1. Alcance

El backend es una aplicación Spring Boot 4 con Java 17, Spring Web MVC, Spring Data JPA, Spring Security, JWT y PostgreSQL.

Las pruebas backend deben comprobar:

- Reglas de negocio en servicios.
- Validación de DTOs y respuestas HTTP.
- Autenticación, autorización y cookies de refresh token.
- Persistencia y restricciones de PostgreSQL.
- Aislamiento de datos por usuario.
- Flujos de trades: creación, edición, cierre completo, cierre parcial y eliminación lógica.

## 2. Herramientas actuales

El proyecto usa las dependencias de test incluidas por Spring Boot:

- JUnit 5 para estructura y assertions.
- Mockito para mocks y verificaciones.
- Spring Boot Test para levantar el contexto.
- Spring MVC Test para probar controllers cuando se agreguen pruebas de API.

Las dependencias están en `Backend/pom.xml`, especialmente `spring-boot-starter-webmvc-test`.

## 3. Estructura

Los tests deben ubicarse en:

```text
Backend/src/test/java/com/portfolio/portfolio/
├── PortfolioApplicationTests.java
├── message/
│   └── MessageCatalogTest.java
├── security/
│   └── JwtServiceTest.java
└── service/
    ├── AuthServiceTest.java
    └── TradeServiceTest.java
```

Convenciones:

- El paquete del test debe coincidir con el paquete de la clase probada.
- El nombre debe terminar en `Test` para que Maven Surefire lo descubra.
- Una prueba debe describir un comportamiento, por ejemplo `partiallyClosesTradeAndMovesStopLoss`.
- No usar base de datos en pruebas unitarias de servicios.
- Usar pruebas de integración separadas para JPA, seguridad y PostgreSQL.

## 4. Tipos de prueba

### 4.1 Pruebas unitarias de servicios

Son las pruebas rápidas para reglas de negocio. Se usa `MockitoExtension` y se mockean repositorios o dependencias externas.

Ejemplo:

```java
@ExtendWith(MockitoExtension.class)
class TradeServiceTest {

    @Mock
    private TradeRepository tradeRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TradeService tradeService;

    @Test
    void partiallyClosesTradeAndKeepsItOpen() {
        // Arrange: usuario, cuenta, trade y request parcial.
        // Act: tradeService.close(...).
        // Assert: quantity disminuye y status sigue OPEN.
    }
}
```

La estructura recomendada es:

1. `Arrange`: prepara entidades, requests y stubs.
2. `Act`: ejecuta un único método público.
3. `Assert`: verifica resultado y efectos.
4. `Verify`: comprueba llamadas relevantes al repositorio.

### 4.2 Pruebas de controller

Usar `@WebMvcTest(TradeController.class)` para probar el contrato HTTP sin levantar toda la aplicación. El servicio debe ser un mock.

Casos mínimos para `TradeController`:

- `GET /api/trades` devuelve `200` y la lista del usuario autenticado.
- `GET /api/trades/open` devuelve únicamente posiciones abiertas.
- `POST /api/trades` devuelve `201` y `Location`.
- `PUT /api/trades/{id}` devuelve el trade editado.
- `PATCH /api/trades/{id}/close` acepta cierre completo y parcial.
- `DELETE /api/trades/{id}` devuelve `204`.
- Un usuario no autenticado recibe `401`.

Ejemplo de forma general:

```java
@WebMvcTest(TradeController.class)
class TradeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TradeService tradeService;

    @Test
    void createsTrade() throws Exception {
        when(tradeService.create(eq("trader@example.com"), any(CreateTradeRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/trades")
                        .with(user("trader@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"symbol":"EUR/USD","direction":"LONG","entryPrice":1.08,"quantity":1}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }
}
```

La configuración exacta de autenticación puede requerir un `SecurityMockMvcConfigurers.springSecurity()` y un `@Import(SecurityConfig.class)` según el test.

### 4.3 Pruebas de integración

Usar `@SpringBootTest` cuando se necesite probar varias capas juntas. La suite actual ya contiene una prueba de arranque de contexto en `PortfolioApplicationTests`.

Para pruebas que escriban datos reales:

- Preferir una base PostgreSQL exclusiva para tests.
- No depender de datos existentes en el volumen local.
- Crear datos mínimos por test.
- Limpiar datos después de cada test o usar una estrategia transaccional controlada.
- Probar las columnas de soft delete y las restricciones reales de la base.

Los tests de integración de autenticación deberían cubrir:

- Login y creación de cookie HTTP-only.
- Refresh y rotación de cookie.
- Logout y revocación.
- Request sin JWT.
- JWT expirado o inválido.

## 5. Casos obligatorios de trades

### Creación

- Crea el trade con estado `OPEN`.
- Normaliza el símbolo a mayúsculas.
- Usa la cuenta activa del usuario.
- Crea `Main account` si el usuario no tiene cuenta activa.
- Rechaza símbolo vacío, dirección ausente, precio negativo o cantidad no positiva.

### Edición

- Cambia símbolo, dirección, entrada, cantidad, stop loss y take profit.
- No cambia `status`, `exitPrice`, `closeAt` ni P&L.
- Solo modifica trades pertenecientes al usuario autenticado.

### Cierre completo

- Requiere precio de salida y cantidad válida.
- Cambia el estado a `CLOSE`.
- Guarda `closeAt`.
- Acumula el P&L enviado.
- Conserva la cantidad cerrada en el registro final.

### Cierre parcial

- La cantidad cerrada debe ser menor que la cantidad restante.
- Reduce la cantidad restante.
- Mantiene el estado `OPEN`.
- Mantiene `closeAt` vacío.
- Acumula el P&L parcial.

### Movimiento del stop loss

- `moveStopLoss=true` requiere un valor válido.
- Guarda el nuevo stop loss.
- `moveStopLoss=false` no modifica el stop loss existente.

### Soft delete

- Asigna `deletedAt`.
- No llama a `repository.delete(...)`.
- Mantiene el registro físicamente en la base.
- Excluye el trade de `GET /api/trades` y `GET /api/trades/open`.

## 6. Ejecutar pruebas

### Suite completa con Docker

PostgreSQL debe estar disponible. Desde la raíz:

```bash
docker compose up -d db
docker compose --profile development up -d backend
docker compose --profile development exec -T backend mvn test
```

La suite actual ejecuta las pruebas dentro del contenedor backend y usa PostgreSQL para el contexto de Spring.

### Suite completa desde `Backend/`

Si PostgreSQL está disponible en el host y la URL está configurada correctamente:

```bash
cd Backend
./mvnw test
```

El valor configurado por defecto usa el hostname `db`, por lo que normalmente se recomienda el comando Docker.

### Una clase específica

```bash
docker compose --profile development exec -T backend mvn -Dtest=TradeServiceTest test
```

### Un método específico

```bash
docker compose --profile development exec -T backend mvn -Dtest=TradeServiceTest#partiallyClosesTradeAndMovesStopLoss test
```

### Compilación sin pruebas

```bash
docker compose --profile development exec -T backend mvn -DskipTests compile
```

## 7. Diagnóstico de fallos

- `Connection refused`: iniciar PostgreSQL con `docker compose up -d db`.
- `Permission denied` en `Backend/target`: ejecutar Maven dentro del contenedor o corregir la propiedad del directorio generado.
- Fallo por datos previos: revisar el volumen PostgreSQL y aislar los datos del test.
- Fallo de constructor Lombok: comprobar el constructor vacío JPA y los constructores usados por `@Builder`.
- `401` inesperado: revisar el principal autenticado y el header `Authorization`.
- `404` en un trade existente: verificar que pertenece al mismo usuario y que `deletedAt` sea `null`.

## 8. Criterio de aceptación

Antes de integrar cambios backend, deben pasar:

```bash
docker compose --profile development exec -T backend mvn test
```

Además, todo nuevo comportamiento debe tener al menos una prueba positiva y una prueba de validación o autorización negativa.
