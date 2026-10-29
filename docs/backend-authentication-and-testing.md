# Backend: autenticación, mensajes y pruebas

## 1. Objetivo

Este documento describe la implementación actual del backend de Trading Journal, con énfasis en:

- Registro de usuarios.
- Inicio, renovación y cierre de sesión.
- Validación de contraseñas.
- Unicidad de correo y nombre de usuario.
- Mensajes de éxito y error en varios idiomas.
- Pruebas unitarias de los servicios.

El backend está implementado con Spring Boot, Spring Web MVC, Spring Data JPA, Spring Security, JWT y PostgreSQL.

## 2. Estructura relevante

| Ubicación | Responsabilidad |
| --- | --- |
| `Backend/src/main/java/com/portfolio/portfolio/controller` | Endpoints HTTP y códigos de estado. |
| `Backend/src/main/java/com/portfolio/portfolio/service/AuthService.java` | Reglas de registro, login, refresh, logout y revocación. |
| `Backend/src/main/java/com/portfolio/portfolio/security/JwtService.java` | Creación y lectura de JWT, hash de refresh tokens. |
| `Backend/src/main/java/com/portfolio/portfolio/message/MessageCatalog.java` | Catálogo central de códigos y traducciones. |
| `Backend/src/main/java/com/portfolio/portfolio/entity/User.java` | Persistencia de usuarios y restricciones de base de datos. |
| `Backend/src/main/java/com/portfolio/portfolio/entity/PasswordResetToken.java` | Hash, expiración y uso único de tokens de recuperación. |
| `Backend/src/main/java/com/portfolio/portfolio/service/GoogleAuthService.java` | Validación del ID token de Google y conversión a sesión propia. |
| `Backend/src/main/java/com/portfolio/portfolio/repository` | Acceso a usuarios y refresh tokens. |
| `Backend/src/test/java/com/portfolio/portfolio/service/AuthServiceTest.java` | Pruebas unitarias de `AuthService`. |
| `Backend/src/test/java/com/portfolio/portfolio/security/JwtServiceTest.java` | Pruebas unitarias de `JwtService`. |
| `Backend/src/test/java/com/portfolio/portfolio/service/GoogleAuthServiceTest.java` | Pruebas de validación del ID token de Google. |
| `Backend/src/test/java/com/portfolio/portfolio/service/TradeServiceTest.java` | Pruebas de servicio de operaciones. |
| `Backend/src/test/java/com/portfolio/portfolio/message/MessageCatalogTest.java` | Pruebas del catálogo multidioma. |

## 3. Flujo de registro

El endpoint es `POST /auth/register`.

### 3.1 Validaciones

Antes de consultar o escribir en la base de datos, `AuthService` valida:

- Que el request exista.
- Que usuario, correo y contraseña no sean nulos ni estén vacíos.
- Que la contraseña tenga al menos 8 caracteres.
- Que contenga una letra mayúscula.
- Que contenga una letra minúscula.
- Que contenga un número.

La contraseña no se exige única entre usuarios. Esto es intencional: las contraseñas se almacenan con BCrypt y cada hash usa un salt diferente. Una restricción `UNIQUE` sobre el hash no detectaría correctamente contraseñas iguales y recorrer todos los usuarios para compararlas sería costoso y no recomendable.

### 3.2 Normalización y unicidad

El correo se normaliza con `trim()` y conversión a minúsculas usando `Locale.ROOT`.

El servicio verifica:

- `findByEmailIgnoreCase(...)` para detectar correos existentes.
- `findByUsername(...)` para detectar nombres de usuario existentes.

Además, `User` define restricciones de persistencia:

- `username`: obligatorio y único.
- `email`: obligatorio y único mediante `uk_users_email`.
- `password`: obligatorio.

La verificación de aplicación mejora el mensaje para el usuario. La restricción de base de datos protege contra dos registros concurrentes que pasen la verificación al mismo tiempo.

### 3.3 Persistencia

La contraseña se guarda únicamente después de pasar la validación y se cifra mediante `PasswordEncoder` con BCrypt. Nunca se guarda la contraseña original.

Después de crear el usuario, el servicio genera un access token y lo devuelve junto con los datos básicos del usuario.

## 4. Flujo de login

El endpoint es `POST /auth/login`.

El servicio:

1. Rechaza requests nulos o credenciales vacías.
2. Busca el usuario por correo ignorando mayúsculas/minúsculas.
3. Compara la contraseña recibida contra el hash BCrypt.
4. Genera un access token JWT.
5. Genera un refresh token aleatorio.
6. Guarda solamente el hash SHA-256 del refresh token.
7. Devuelve el access token y coloca el refresh token original en una cookie HTTP-only.

El request puede incluir `rememberMe`. Sin esta opción, la cookie es de sesión y
el refresh token vence en 24 horas. Con ella, se establece `Max-Age=30 días` y el
registro de refresh vence en 30 días. El indicador se guarda con el refresh token
y se conserva durante la rotación. En ambos casos el access token sigue solo en
memoria en el cliente y la cookie mantiene `SameSite=Strict`.

Cuando el correo no existe o la contraseña no coincide, se devuelve el mismo error `INVALID_CREDENTIALS`. Esto evita revelar si un correo está registrado.

## 5. Refresh tokens

El endpoint es `POST /auth/refresh`.

El refresh token se busca usando su hash. El servicio rechaza el token si:

- No existe.
- Está revocado.
- Está expirado.
- Es nulo o está vacío.

Cuando es válido:

1. Se revoca el token actual.
2. Se genera un refresh token de reemplazo.
3. Se guarda el reemplazo.
4. Se genera un nuevo access token.
5. Se envía una nueva cookie.

Este proceso implementa rotación de refresh tokens.

## 5.1 Inicio de sesión con Google

`POST /auth/google` recibe `{ "credential": "<Google ID token>", "rememberMe": false }`.
El backend valida la firma con las claves públicas de Google y comprueba issuer,
expiración, `aud`, `azp` cuando aplica, y `email_verified=true`. La audiencia debe
coincidir exactamente con `GOOGLE_CLIENT_ID`.

El identificador del proveedor se almacena en `users.google_subject` con unicidad.
Una cuenta local con el mismo email se vincula solo después de validar el correo
verificado de Google. Para una cuenta nueva se crea un username único y un hash
BCrypt aleatorio que no es utilizable como contraseña elegida por el usuario.
Después se emite el JWT propio y el refresh cookie habitual; el ID token de Google
no se guarda ni se usa como token de API.

## 5.2 Recuperación de contraseña

`POST /auth/password/forgot` siempre responde `202` con el mismo código y mensaje
genérico, independientemente de que el email exista. Cuando el email está
configurado, se invalida cualquier solicitud anterior, se genera un token
aleatorio de 64 bytes y se guarda solamente su hash SHA-256. El enlace expira en
15 minutos. Si el envío SMTP falla, el token se invalida y el servicio no registra
ni devuelve el enlace/token.

`POST /auth/password/reset` recibe el token y la nueva contraseña. La fila se lee
con bloqueo pesimista para evitar usos concurrentes; un token expirado, usado o
desconocido se rechaza. Se valida la política existente, se almacena un hash
BCrypt nuevo, se consume el token y se revocan todos los refresh tokens. Los JWT
de acceso existentes no tienen revocación inmediata y pueden seguir siendo
válidos hasta que expiren (una hora como máximo). También se elimina la cookie
refresh del navegador que completó el restablecimiento.

SMTP está apagado por defecto (`AUTH_EMAIL_ENABLED=false`). El endpoint conserva
la respuesta genérica mientras no esté configurado, pero no enviará correo hasta
que se habilite SMTP.

## 6. Logout y revocación

`POST /auth/logout` revoca el refresh token recibido, si existe, y limpia la cookie `refreshToken`.

`POST /auth/revoke` revoca todos los refresh tokens del usuario asociado al token actual. Esta operación es útil para cerrar todas las sesiones.

El logout es tolerante a un token inexistente o vacío. El frontend limpia siempre el estado local y redirige al landing page `/`.

## 7. JWT

`JwtService` incluye en el token:

- Correo como subject.
- Rol.
- ID del usuario.
- Nombre de usuario.
- Fecha de emisión.
- Fecha de expiración de una hora.

El servicio también permite extraer cada claim y genera refresh tokens aleatorios de 64 bytes, codificados en Base64 URL-safe.

El secreto HS256 se carga exclusivamente desde `JWT_SECRET`, en Base64, y debe
contener al menos 256 bits. No se deja un secreto por defecto en el código.

## 8. Catálogo de mensajes

El archivo central es:

`Backend/src/main/java/com/portfolio/portfolio/message/MessageCatalog.java`

Cada mensaje tiene:

- Código estable para uso programático.
- Texto en español.
- Texto en inglés.
- Tipo `ERROR` o `SUCCESS`.

El catálogo contiene grupos de códigos:

### Auth

- `INVALID_CREDENTIALS`
- `INVALID_GOOGLE_CREDENTIAL`
- `GOOGLE_AUTH_UNAVAILABLE`

### Registration

- `EMAIL_ALREADY_EXISTS`
- `USERNAME_ALREADY_EXISTS`
- `REGISTRATION_CONFLICT`

### Validation

- `VALIDATION_ERROR`
- `WEAK_PASSWORD`

### Session

- `SESSION_EXPIRED`

### Success

- `REGISTER_SUCCESS`
- `LOGIN_SUCCESS`
- `REFRESH_SUCCESS`
- `LOGOUT_SUCCESS`

### Password reset

- `PASSWORD_RESET_REQUEST_ACCEPTED`
- `PASSWORD_RESET_SUCCESS`
- `INVALID_PASSWORD_RESET_TOKEN`

### 8.1 Cómo se selecciona el idioma

Los endpoints reciben el idioma mediante `Accept-Language`. El frontend envía automáticamente el idioma del navegador.

Ejemplo:

```http
Accept-Language: en
```

Si el idioma es inglés, se devuelve el texto inglés. Para cualquier otro idioma, el catálogo usa español como fallback.

### 8.2 Respuesta de error

```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "The email or password is incorrect",
  "type": "ERROR"
}
```

### 8.3 Respuesta exitosa de autenticación

Las respuestas de login, registro y refresh conservan los campos de autenticación y agregan:

```json
{
  "token": "jwt...",
  "id": "01JUSER",
  "email": "trader@example.com",
  "userName": "trader",
  "rol": "USER",
  "code": "LOGIN_SUCCESS",
  "message": "Login successful",
  "type": "SUCCESS"
}
```

El cliente debe tomar decisiones usando `code`, no comparando el texto de `message`.

## 9. Pruebas implementadas

### 9.1 `AuthServiceTest`

Prueba con Mockito las dependencias del servicio y cubre:

- Registro exitoso.
- Normalización del correo.
- Correo duplicado.
- Nombre de usuario duplicado.
- Request de registro nulo.
- Contraseña débil.
- Login exitoso.
- Usuario inexistente.
- Credenciales vacías.
- Refresh token válido.
- Revocación del token anterior durante refresh.
- Refresh token expirado.
- Logout con token válido y token vacío.
- Revocación de todos los tokens del usuario.
- Duraciones de refresh con y sin “Remember me”.
- Alta/autenticación Google, email verificado y vinculación por correo existente.
- Solicitud de reset no enumerable, hash de token y entrega por notifier.
- Uso único/expiración de reset, política de password y revocación de sesiones.

### 9.2 `JwtServiceTest`

Cubre:

- Generación de JWT.
- Lectura de correo, rol, nombre e ID.
- Hash SHA-256 determinista.
- Diferencia entre hashes de tokens diferentes.
- Generación de refresh token.
- Expiración futura.
- Estado inicial no revocado.
- Duraciones distintas para sesión normal y persistente.
- Generación de tokens opacos de alta entropía.

### 9.3 `GoogleAuthServiceTest`

Comprueba que el ID token validado produce una sesión de la aplicación y rechaza
un correo que Google no marca como verificado.

### 9.4 `TradeServiceTest`

Contiene las pruebas existentes del servicio de operaciones.

### 9.5 `MessageCatalogTest`

Cubre:

- Mensaje de error en español.
- Mensaje de éxito en inglés.
- Fallback al español para un idioma no soportado.
- Comportamiento para un código desconocido.

### 9.6 Test de contexto

`PortfolioApplicationTests` verifica que el contexto Spring pueda iniciar con PostgreSQL y crear los repositorios y beans principales.

## 10. Cómo ejecutar las pruebas

Desde la raíz, con los contenedores activos:

```bash
docker compose --profile development exec -T backend mvn test
```

Desde `Backend/`, si PostgreSQL está disponible y `target/` tiene permisos adecuados:

```bash
./mvnw test
```

Para ejecutar una clase específica:

```bash
./mvnw -Dtest=AuthServiceTest test
```

Resultado actual de la suite implementada:

- 38 tests ejecutados.
- 0 fallos.
- 0 errores.
- 0 tests omitidos.

## 11. Cómo agregar un nuevo mensaje

Para agregar un mensaje nuevo:

1. Añadir una constante en el grupo correspondiente de `MessageCatalog.Codes`.
2. Añadir una entrada en el mapa `messages` con texto español e inglés.
3. Usar la constante desde el servicio o controlador.
4. Devolver el mensaje mediante `messageCatalog.get(code, locale)`.
5. Agregar una prueba en `MessageCatalogTest`.

Ejemplo conceptual:

```java
public static final String ACCOUNT_CREATED = "ACCOUNT_CREATED";
```

```java
entry(
    Codes.Success.ACCOUNT_CREATED,
    Type.SUCCESS,
    "Cuenta creada correctamente",
    "Account created successfully"
)
```

## 12. Configuración local y consideraciones de producción

La configuración versionada no contiene credenciales. Para Compose:

1. Copiar `.env.example` a `.env`.
2. Completar `POSTGRES_USER`, `POSTGRES_PASSWORD` y generar `JWT_SECRET` con
   `openssl rand -base64 32`.
3. Para Google, configurar `GOOGLE_CLIENT_ID` en Google Cloud Console y añadir
   los orígenes locales/de producción autorizados. Compose lo entrega al backend
   y a Vite.
4. Para recovery real, configurar SMTP y `AUTH_EMAIL_ENABLED=true`. En local,
   establecer `PASSWORD_RESET_URL` en el origen del frontend.
5. Para desarrollo ejecutar `docker compose --profile development up --build`; para probar las imágenes de producción localmente, `docker compose --profile production up --build`.

Si se usa PostgreSQL con un volumen existente, cambiar las variables de entorno
no rota el usuario/contraseña de la base ya inicializada: hacer backup y cambiar
la credencial dentro de PostgreSQL antes de actualizar `.env`. Rotar los secretos
que estuvieron expuestos previamente en archivos versionados; rotar `JWT_SECRET`
invalida los access tokens actuales.

La suite actual es principalmente unitaria. Las siguientes pruebas pueden agregarse como siguiente etapa:

- Pruebas MVC de `AuthController` con `MockMvc`.
- Pruebas de integración contra PostgreSQL para confirmar índices y restricciones.
- Pruebas de concurrencia para registros simultáneos.
- Pruebas de seguridad del filtro JWT.
- Pruebas de cookies, CORS y expiración real.

También se deben revisar antes de producción:

- Mantener `JWT_SECRET` y credenciales SMTP/PostgreSQL fuera del repositorio.
- Rotar credenciales PostgreSQL previamente expuestas en archivos versionados.
- Eliminar la declaración duplicada de `spring-boot-devtools` en `pom.xml`.
- Usar migraciones versionadas en lugar de depender solamente de `ddl-auto=update`.
- Activar `AUTH_COOKIE_SECURE=true` al servir sobre HTTPS.
- Proteger y limitar solicitudes de login y recuperación con rate limiting antes
  de exponer el servicio públicamente.
