# Protección del diario y autorización por rol

## Objetivo

Las rutas del diario ahora requieren una sesión válida en el frontend y las
peticiones al backend incluyen el access token JWT. La cookie de refresh token
continúa siendo `HttpOnly` y no se guarda en `localStorage`.

La protección visual del frontend no reemplaza la seguridad del backend. Spring
Security sigue siendo la autoridad final para permitir o rechazar cada API.

## Estado de sesión

`AuthContext` mantiene en memoria:

- `token`: access token usado en la cabecera `Authorization`.
- `user`: nombre, email y rol del usuario.
- `isLoading`: indica que todavía se está intentando recuperar la sesión.

El access token no se persiste en el navegador. Cuando la aplicación arranca,
`AuthProvider` llama `POST /auth/refresh`. El navegador envía la cookie
`refreshToken` automáticamente gracias a `withCredentials: true`.

Si el refresh es válido, se guarda el nuevo access token en memoria. Si falla,
se limpia la sesión y `RequireAuth` redirige al usuario a `/login`.

## Guard de autenticación

`Frontend/src/router/RequireAuth.tsx` utiliza `Outlet` para renderizar las
rutas hijas solamente cuando `isAuthenticated` es verdadero:

```tsx
<Route element={<RequireAuth />}>
    <Route element={<JournalLayout />}>
        <Route path="/journal" element={<Journal />} />
        <Route path="/dashboard" element={<Dashboard />} />
    </Route>
</Route>
```

Durante `isLoading` se muestra un estado temporal y no se redirige. Esto evita
enviar al usuario al login mientras todavía se verifica la cookie de sesión.

## Guard por rol

`Frontend/src/router/RequireRole.tsx` permite restringir un grupo de rutas:

```tsx
<Route element={<RequireAuth />}>
    <Route element={<RequireRole roles={["ADMIN"]} />}>
        <Route path="/admin/users" element={<Users />} />
    </Route>
</Route>
```

Si el usuario está autenticado pero no tiene el rol requerido, se redirige a
`/journal`. Actualmente no se ha asignado una ruta administrativa porque el
frontend todavía no contiene una pantalla de administración.

## Interceptores Axios

El cliente `api` tiene un interceptor de petición que agrega:

```http
Authorization: Bearer <access-token>
```

Cuando una petición devuelve `401`, el interceptor ejecuta un refresh y reintenta
la petición original una sola vez. Las llamadas concurrentes reutilizan la
misma promesa de refresh para evitar rotar varias veces la misma sesión.

Si el refresh falla, se elimina el access token y se emite el evento interno
`auth:expired`, que limpia el estado de `AuthContext`.

## Login

El backend devuelve el usuario como un objeto plano:

```json
{
  "token": "...",
  "id": "...",
  "email": "user@email.com",
  "userName": "usuario",
  "rol": "USER"
}
```

El frontend convierte `rol` en `role` y normaliza el valor a mayúsculas antes
de guardarlo. Después del login se redirige a la ruta solicitada originalmente
o, si no existe, a `/journal`.

## Autorización en backend

La configuración global conserva:

```java
.requestMatchers("/auth/**").permitAll()
.anyRequest().authenticated()
```

Los endpoints específicos pueden exigir un rol con `@PreAuthorize`:

```java
@PreAuthorize("hasRole('ADMIN')")
```

El filtro JWT convierte `ADMIN` en la autoridad `ROLE_ADMIN`, por lo que
`hasRole('ADMIN')` es la expresión correcta.

El guard de React solo evita mostrar pantallas no autorizadas. Un usuario puede
ignorar el frontend y llamar directamente a la API, por lo que cada operación

## Respuestas de seguridad

- `401 Unauthorized`: no existe una sesión válida o el JWT expiró.
- `403 Forbidden`: existe una sesión válida, pero el rol no tiene permisos.

## Verificación manual

1. Abrir `/journal` sin iniciar sesión y comprobar la redirección a `/login`.
2. Iniciar sesión y comprobar la redirección a `/journal`.
3. Recargar la página y comprobar que la sesión se recupera mediante
   `/auth/refresh`.
4. Esperar o simular la expiración del access token y comprobar que una petición
   protegida se reintenta después del refresh.
5. Acceder a una ruta administrativa con un usuario `USER` y comprobar la
   redirección.
6. Llamar directamente a un endpoint `ADMIN` con un usuario `USER` y comprobar
   que el backend responde `403`.
