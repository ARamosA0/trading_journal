# Recomendaciones y Roadmap

Este documento propone una ruta para estabilizar Trading Journal, completar las funcionalidades principales y prepararlo para AWS sin introducir microservicios antes de que exista una necesidad real.

## Estado actual

- El backend es una aplicación Spring Boot con JPA, PostgreSQL y autenticación JWT.
- El frontend es una aplicación React 19 + TypeScript + Vite.
- `docker-compose.yaml` sirve para desarrollo local; no representa todavía la arquitectura de producción en AWS.
- El backend tiene entidades iniciales para usuarios, cuentas, trades, estrategias, tags e imágenes, pero todavía no existen APIs completas para todos esos dominios.
- La base de datos usa `spring.jpa.hibernate.ddl-auto=update`; todavía no existe un sistema de migraciones controlado.
- Las pruebas backend solo cubren la carga del contexto y el frontend no tiene pruebas automatizadas.

## Prioridad crítica: seguridad y autenticación

1. Mover el secreto JWT y todas las credenciales fuera del código fuente. Usar variables de entorno localmente y AWS Secrets Manager o SSM Parameter Store en AWS.
2. Rotar inmediatamente cualquier secreto que haya sido expuesto en archivos versionados o comentarios.
3. Definir un único contrato de autenticación. La respuesta debería incluir nombres consistentes como `accessToken`, `user` y `role`.
4. Implementar los endpoints de refresh, logout, revocación y rotación de refresh tokens.
5. Configurar un interceptor Axios que adjunte el access token y gestione respuestas `401` con un único intento de refresh.
6. Proteger las rutas del diario mediante un guard de autenticación y aplicar autorización por rol cuando sea necesario.
7. Añadir validación de registro, control de usuarios duplicados, respuestas de error genéricas para login y límites contra abuso.
8. Hacer que las opciones `Secure`, `SameSite`, expiración y dominio de las cookies dependan del entorno. Probar explícitamente local HTTP, staging HTTPS y producción HTTPS.
9. Definir una estrategia CSRF antes de añadir operaciones autenticadas mediante cookies.
10. Eliminar logs de credenciales, tokens, requests y responses sensibles.

## Datos y backend

1. Introducir Flyway o Liquibase y cambiar `ddl-auto` a `validate` en entornos controlados. Las migraciones deben ser la única fuente de cambios de esquema.
2. Reconciliar las entidades JPA con `schema.sql`, incluidos nombres de columnas, relaciones, tipos y restricciones.
3. Añadir la tabla y las migraciones de refresh tokens al modelo formal de datos.
4. Definir ownership por usuario para cuentas, trades, estrategias, tags e imágenes. Cada consulta debe filtrar por el usuario autenticado.
5. Usar `BigDecimal` con precisión y escala documentadas para balances, precios, cantidades y PnL.
6. Añadir restricciones, índices y claves únicas apropiadas, especialmente para email, cuentas por usuario y búsquedas frecuentes por cuenta y fecha.
7. Modelar claramente el ciclo de vida de un trade. Un trade abierto no debería requerir `close_at` hasta ser cerrado.
8. No devolver entidades JPA directamente. Crear DTOs de entrada y salida para evitar filtraciones de campos y problemas de carga diferida.
9. Crear APIs versionadas, por ejemplo `/api/v1/accounts`, `/api/v1/trades`, `/api/v1/strategies` y `/api/v1/tags`.
10. Añadir paginación, filtros, ordenamiento y respuestas de error consistentes usando Problem Details.
11. Eliminar controladores placeholder y duplicación en los servicios de autenticación antes de ampliar el dominio.

## Frontend

1. Corregir primero los errores actuales de TypeScript y ESLint para recuperar un build confiable.
2. Centralizar los tipos de respuestas de la API y el mapeo de errores.
3. Añadir validación de formularios, estados de carga, estados vacíos y mensajes de error accesibles.
4. Implementar logout real, expiración de sesión y redirección de rutas protegidas.
5. Sustituir navegación activa basada en estado duplicado por navegación derivada de la URL, por ejemplo con `NavLink`.
6. Validar al inicio que `VITE_API_URL` y `VITE_AUTH_URL` estén definidos y sean válidos.
7. Añadir un error boundary y estados de recuperación para fallos de API.
8. Incorporar code splitting para las pantallas del diario cuando el número de módulos crezca.
9. Estandarizar nombres como `Signup`, `userName` y `role` en todo el frontend y backend.

## Pruebas y calidad

### Backend

- Añadir pruebas unitarias para hash de contraseñas, registro, login, claims JWT, expiración y refresh tokens.
- Añadir pruebas MVC y de seguridad para rutas públicas, rutas protegidas, CORS, cookies y autorización por rol.
- Añadir pruebas de integración con PostgreSQL, preferiblemente mediante Testcontainers.
- Verificar aislamiento entre dos usuarios: ningún usuario debe poder leer o modificar cuentas, trades o imágenes de otro.
- Validar automáticamente que las migraciones se aplican desde una base vacía y desde una base existente.

### Frontend

- Incorporar Vitest y React Testing Library.
- Probar `AuthContext`, guards de rutas, formularios de login/registro y estados de error.
- Probar los flujos principales del diario: crear cuenta, registrar trade, consultar dashboard y cerrar sesión.

### End-to-end y CI

- Incorporar Playwright o Cypress para el flujo registro → login → refresh → CRUD de trade → logout.
- Crear CI que ejecute lint, typecheck, build, pruebas backend, pruebas frontend, análisis de dependencias y validación de migraciones.
- Mantener la infraestructura y las variables de cada entorno separadas de los secretos.

## Operación y AWS

Una primera arquitectura AWS razonable para el monolito modular sería:

- Frontend compilado en S3 y servido mediante CloudFront.
- Backend containerizado en ECS/Fargate; EKS solo si la complejidad operativa lo justifica.
- PostgreSQL en RDS con backups, restauración probada y monitorización.
- Imágenes de trades en S3 mediante URLs prefirmadas, no en la base de datos ni en el contenedor.
- Secretos en Secrets Manager o SSM Parameter Store.
- ALB o API Gateway delante del backend, con TLS y reglas CORS explícitas.
- CloudWatch para logs, métricas y alarmas; OpenTelemetry cuando se necesite trazabilidad entre servicios.
- Health checks de liveness y readiness antes de habilitar despliegues automáticos.

Antes de producción también deben definirse:

- Separación de perfiles local, staging y producción.
- Política de backups, retención y recuperación ante desastre.
- Migraciones reversibles o procedimiento documentado de rollback.
- Límites de tasa, auditoría de operaciones sensibles y alertas de autenticación.
- Despliegue blue/green o rolling con posibilidad de rollback.

## Evolución hacia microservicios

No conviene dividir el sistema ahora por carpetas técnicas como `controller`, `service` o `repository`. Primero debe consolidarse un monolito modular con límites de dominio claros.

Posibles dominios futuros:

- Identidad y autenticación.
- Usuarios y perfiles.
- Cuentas de trading.
- Trades y journal.
- Analytics y dashboard.
- Media e imágenes.

Reglas para una futura extracción:

1. Extraer únicamente cuando existan necesidades demostrables de escalado, despliegue independiente, aislamiento de datos o ownership de equipo.
2. Cada servicio debe poseer sus datos y sus migraciones.
3. Los servicios deben comunicarse mediante APIs o eventos versionados, nunca mediante acceso directo a la base de datos de otro servicio.
4. No compartir entidades JPA, repositorios ni modelos internos entre servicios.
5. Definir contratos, idempotencia, timeouts, reintentos y manejo de errores antes de introducir comunicación asíncrona.
6. Usar el patrón outbox para publicar eventos de dominio de forma confiable.
7. Añadir versionado de eventos, colas de mensajes y dead-letter queues cuando el volumen lo requiera.
8. Mantener al frontend consumiendo una API estable o un API Gateway, no múltiples bases de datos o servicios internos directamente.

## Roadmap recomendado

### Fase 1: estabilización

- Corregir TypeScript, ESLint y problemas de build.
- Eliminar secretos y logs sensibles.
- Normalizar el contrato de autenticación.
- Implementar refresh, logout, guards y manejo de errores.

### Fase 2: base de datos y dominio

- Introducir migraciones.
- Alinear entidades y esquema.
- Implementar ownership y restricciones de integridad.
- Completar un vertical slice de cuentas y trades, desde API hasta interfaz.

### Fase 3: calidad y producto

- Añadir pruebas unitarias, integración y end-to-end.
- Completar CRUD de estrategias, tags, imágenes y perfil.
- Añadir paginación, filtros, dashboard y estados de interfaz consistentes.

### Fase 4: operación

- Añadir CI/CD, health checks, métricas, logs estructurados y tracing.
- Crear perfiles de despliegue y configuración segura.
- Desplegar primero el monolito modular en AWS con RDS y S3.

### Fase 5: evaluación de extracción

- Medir carga, latencia, frecuencia de despliegues y límites de ownership.
- Identificar el primer dominio que tenga una razón concreta para separarse.
- Extraerlo conservando contratos compatibles, migración de datos y observabilidad.
