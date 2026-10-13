# Refresh tokens

## Objetivo

Se implementó el ciclo completo de refresh tokens para mantener sesiones sin
exponer el token de larga duración al JavaScript del navegador.

El refresh token se genera con `SecureRandom`, se envía en una cookie
`HttpOnly` y solo se guarda en la base de datos como un hash SHA-256. El access
token continúa siendo un JWT de corta duración y se devuelve en el cuerpo de
las respuestas de login y refresh.

## Endpoints

### `POST /auth/login`

Autentica al usuario, crea un refresh token y devuelve el access token. También
crea la cookie `refreshToken` con estas propiedades:

- `HttpOnly`: el frontend no puede leerla con JavaScript.
- `SameSite=Strict`: limita el envío desde otros sitios.
- `Path=/auth`: permite que login, refresh, logout y revoke reciban la cookie.
- `Secure`: controlado por `app.auth.cookie-secure`.

### `POST /auth/refresh`

No requiere el access token. El servidor:

1. Lee el refresh token desde la cookie.
2. Calcula su hash y busca el registro correspondiente.
3. Rechaza tokens inexistentes, expirados o revocados con `401 Unauthorized`.
4. Revoca el token usado.
5. Crea y persiste un nuevo refresh token.
6. Genera un nuevo access token y reemplaza la cookie.

La búsqueda usa un bloqueo pesimista en la fila para evitar que dos refresh
concurrentes reutilicen el mismo token.

### `POST /auth/logout`

Revoca el refresh token de la cookie actual, si existe, y elimina la cookie
del navegador. Es idempotente y responde `204 No Content`.

### `POST /auth/revoke`

Revoca todos los refresh tokens del usuario asociado al token de la cookie.
También elimina la cookie y responde `204 No Content`. La operación no revela
si el token recibido existía, estaba expirado o ya había sido revocado.

## Rotación y revocación

Cada refresh exitoso consume el token original. El token anterior nunca se
reactiva y su valor en texto plano no se persiste. Si un token rotado vuelve a
usarse, se rechaza como revocado.

La entidad `RefreshToken` mantiene el estado `revoked`, la fecha de expiración,
la fecha de creación, el hash y la relación con el usuario. La operación de
refresh está marcada como transaccional para que la revocación y creación del
nuevo token se confirmen juntas.

## Configuración

En desarrollo se utiliza:

```properties
app.auth.cookie-secure=false
```

Esto permite trabajar con `http://localhost`. En producción debe sobrescribirse
sin modificar el código:

```properties
app.auth.cookie-secure=true
```

La aplicación debe servirse entonces mediante HTTPS. La clave usada para
firmar JWT y las credenciales de base de datos también deben moverse a
variables de entorno antes de desplegar en producción.

## Cambios realizados

- `AuthService`: validación, rotación, logout y revocación global.
- `AuthController`: endpoints y gestión de cookies.
- `RefreshTokenRepository`: bloqueo pesimista durante la rotación.
- `JwtService`: hash SHA-256 reutilizable para buscar tokens.
- `application.properties`: configuración local de `Secure`.

## Verificación manual

1. Ejecutar login con un cliente que soporte cookies.
2. Ejecutar `/auth/refresh` y comprobar que recibe un access token nuevo y una
   cookie nueva.
3. Repetir `/auth/refresh` usando la cookie anterior y comprobar `401`.
4. Ejecutar `/auth/logout` y comprobar que la cookie se elimina.
5. Iniciar sesión en dos clientes y ejecutar `/auth/revoke` desde uno; ambos
   refresh tokens deben dejar de funcionar.
