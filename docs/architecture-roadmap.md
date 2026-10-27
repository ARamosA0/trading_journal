# Roadmap de arquitectura y escalabilidad

## 1. Objetivo

Este documento define una evolución arquitectónica progresiva para Trading Journal, desde la aplicación actual hasta una plataforma capaz de soportar más de 1.000 usuarios activos.

Las cifras deben interpretarse separando:

| Métrica | Ejemplo |
|---|---:|
| Usuarios registrados | 1.200 |
| Usuarios activos diarios | 500 |
| Usuarios concurrentes | 100–300 |
| Conexiones SSE activas | 500+ |
| Requests por segundo | 20+ |
| Trades por usuario | 1.000+ |

No es equivalente tener 1.200 usuarios registrados y tener 1.200 usuarios conectados simultáneamente.

## 2. Arquitectura actual

```text
                    +-----------------+
                    | React + Vite    |
                    +--------+--------+
                             |
                         REST / SSE
                             |
                    +--------v--------+
                    | Spring Boot     |
                    | PostgreSQL      |
                    +-----------------+
```

El sistema actual contiene autenticación, cuentas, trades, dashboard, alertas de precio y cálculo de métricas en un backend Spring Boot con frontend React separado.

## 3. Principio principal

No se recomienda migrar directamente a microservicios. Para entre 500 y 1.200 usuarios, un **monolito modular** bien estructurado normalmente ofrece mejor relación entre velocidad, coste y mantenibilidad.

La evolución recomendada es:

```text
Monolito modular
        ↓
Monolito modular + Redis
        ↓
Escalamiento horizontal
        ↓
Market Data Worker
        ↓
Alert Service independiente
        ↓
Analytics y workers asíncronos
        ↓
Microservicios por dominio
```

## 4. Fase 1: consolidación del monolito

### Objetivo

Preparar el código actual para crecer sin introducir complejidad operacional innecesaria.

### Estructura recomendada

```text
com.portfolio.portfolio
├── auth
│   ├── controller
│   ├── service
│   ├── repository
│   └── model
├── accounts
│   ├── controller
│   ├── service
│   ├── repository
│   └── model
├── trades
│   ├── controller
│   ├── service
│   ├── repository
│   └── model
├── alerts
│   ├── controller
│   ├── service
│   ├── repository
│   ├── streaming
│   └── model
├── analytics
├── marketdata
├── shared
│   ├── exception
│   ├── security
│   └── pagination
└── config
```

### Prioridades del backend

- Separar los paquetes por dominio de negocio.
- Mantener controladores delgados.
- Mantener la lógica de negocio en servicios.
- Crear DTOs específicos para cada API.
- Añadir validaciones con `jakarta.validation`.
- Crear un manejador global de excepciones.
- Añadir paginación a trades y alertas.
- Usar `BigDecimal` para importes y precios.
- Crear pruebas unitarias y de integración.
- Centralizar eventos de dominio.
- Mantener el backend stateless.

### Prioridades del frontend

Crear hooks y servicios reutilizables:

```text
useAccounts()
useTrades()
usePriceAlerts()
useDashboardMetrics()
useAlertStream()
```

También se recomienda evaluar TanStack Query para manejar cache, estados de carga, reintentos y sincronización de datos.

### Base de datos

Índices iniciales recomendados:

```sql
CREATE INDEX idx_trade_account_open_at
ON trade(account_id, open_at DESC);

CREATE INDEX idx_trade_account_status
ON trade(account_id, status);

CREATE INDEX idx_price_alert_user_status
ON price_alert(user_id, status);

CREATE INDEX idx_price_alert_instrument
ON price_alert(instrument, status);
```

### Temas para investigar

- `Spring Boot modular monolith`
- `Spring Modulith`
- `Domain-driven design modular monolith`
- `Hexagonal architecture Spring Boot`
- `TanStack Query React`
- `PostgreSQL indexing`
- `SSE reconnection strategy`

## 5. Fase 2: escalamiento vertical

### Objetivo

Soportar aproximadamente 500–1.200 usuarios registrados, entre 100 y 300 usuarios simultáneos y cientos de conexiones SSE.

```text
                  +------------------+
                  | Cloudflare / CDN |
                  | WAF              |
                  +--------+---------+
                           |
                  +--------v---------+
                  | Reverse Proxy    |
                  | / Load Balancer  |
                  +--------+---------+
                           |
                  +--------v---------+
                  | Spring Boot      |
                  | instancia grande |
                  +--------+---------+
                           |
                  +--------v---------+
                  | PostgreSQL       |
                  | administrado     |
                  +------------------+
```

### Mejoras

- Aumentar CPU y memoria del backend.
- Usar PostgreSQL administrado.
- Configurar correctamente HikariCP.
- Configurar backups automáticos.
- Añadir health checks.
- Configurar timeouts.
- Añadir rate limiting.
- Servir el frontend desde CDN.
- Usar HTTPS obligatorio.
- Centralizar logs.

### Consideraciones SSE

Una conexión SSE permanece abierta. Si hay 500 usuarios conectados, pueden existir aproximadamente 500 conexiones persistentes.

Buenas prácticas:

- Enviar heartbeats periódicos.
- Eliminar conexiones desconectadas.
- Configurar timeouts apropiados.
- Implementar reconexión en frontend.
- Preparar el uso de Redis Pub/Sub antes de desplegar varias instancias.

## 6. Fase 3: escalamiento horizontal

### Objetivo

Permitir varias instancias del backend y distribuir la carga.

```text
                         +---------------+
                         | Load Balancer |
                         +-------+-------+
                                 |
                 +---------------+---------------+
                 v               v               v
          +-------------+ +-------------+ +-------------+
          | Backend 1   | | Backend 2   | | Backend 3   |
          | Spring Boot | | Spring Boot | | Spring Boot |
          +------+------+ +------+------+ +------+------+ 
                 \               |               /
                  +--------------+--------------+
                                 |
                         +-------v-------+
                         | Redis         |
                         | Cache/PubSub  |
                         +-------+-------+
                                 |
                         +-------v-------+
                         | PostgreSQL    |
                         +---------------+
```

### Usos de Redis

- Distribuir eventos SSE.
- Cachear métricas.
- Rate limiting.
- Bloqueos distribuidos.
- Datos temporales.
- Pub/Sub para alertas.

### Flujo de alertas distribuido

```text
Market Data Provider
        |
        v
Market Data Service
        |
        v
Redis Pub/Sub
        |
        +-------- Backend 1 ---- SSE ---- Usuario
        +-------- Backend 2 ---- SSE ---- Usuario
        +-------- Backend 3 ---- SSE ---- Usuario
```

### Temas para investigar

- `Redis Pub/Sub Spring Boot`
- `Spring SSE multiple instances`
- `stateless Spring Boot horizontal scaling`
- `distributed event streaming`
- `Kubernetes Horizontal Pod Autoscaler`
- `sticky sessions SSE`

## 7. Fase 4: servicio de market data

Las alertas necesitan una fuente real de precios. El endpoint manual de cotizaciones debe ser sustituido o alimentado por un servicio de market data.

```text
+----------------------+       WebSocket       +----------------------+
| Binance / Broker API | --------------------> | Market Data Worker   |
| Forex Provider       |                       | Normalización        |
+----------------------+                       +----------+-----------+
                                                        |
                                                        v
                                             +----------------------+
                                             | Redis Streams        |
                                             | o Kafka               |
                                             +----------+-----------+
                                                        |
                                                        v
                                             +----------------------+
                                             | Alert Evaluation     |
                                             | Service              |
                                             +----------+-----------+
                                                        |
                                                        v
                                             +----------------------+
                                             | Redis Pub/Sub        |
                                             +----------+-----------+
                                                        |
                                                        v
                                             +----------------------+
                                             | SSE Gateway           |
                                             +----------------------+
```

### Elección de tecnología

| Tecnología | Uso recomendado |
|---|---|
| Redis Pub/Sub | Eventos rápidos sin persistencia |
| Redis Streams | Eventos con cierta persistencia |
| RabbitMQ | Jobs y mensajes confiables |
| Kafka | Alto volumen, retención y reprocesamiento |

Kafka no debería introducirse inicialmente salvo que exista un volumen alto de cotizaciones, múltiples consumidores o necesidad de reprocesar eventos históricos.

## 8. Fase 5: procesamiento asíncrono

Los siguientes procesos pueden ejecutarse fuera de la request HTTP:

- Evaluación de alertas.
- Cálculo de métricas.
- Importación de trades.
- Sincronización con brokers.
- Emails y notificaciones push.
- Generación de reportes.
- Backtesting.
- Exportaciones CSV/PDF.

```text
HTTP Request
     |
     v
Backend API
     | publica evento
     v
Message Broker
     |
     +── Alert Worker
     +── Analytics Worker
     +── Notification Worker
     +── Export Worker
```

### Patrones recomendados

- `Transactional Outbox`
- `Outbox Pattern`
- `Idempotent Consumer`
- `Retry with Backoff`
- `Dead Letter Queue`
- `Event-driven architecture`
- `CQRS`

## 9. Fase 6: separación en microservicios

La separación debe hacerse únicamente cuando existan problemas concretos de escalabilidad, equipos, despliegues o aislamiento de fallos.

```text
                         +-------------+
                         | API Gateway |
                         +------+------+ 
                                |
       +------------------------+------------------------+
       v                        v                        v
+--------------+        +--------------+        +--------------+
| Auth Service |        | Trade Service|        | Alert Service|
+------+-------+        +------+-------+        +------+-------+
       |                       |                       |
       v                       v                       v
   Auth DB                 Trade DB                Alert DB
                                ^
                                |
                       +--------+---------+
                       | Market Data      |
                       | Service          |
                       +------------------+
```

### Servicios posibles

#### Auth Service

- Registro y login.
- Refresh tokens.
- Roles y permisos.
- MFA.
- Sesiones por dispositivo.

#### Account Service

- Cuentas.
- Balances.
- Divisas.
- Conexiones con brokers.

#### Trade Service

- Apertura y cierre de trades.
- Cierres parciales.
- P&L.
- Estados.

#### Alert Service

- Creación y edición de alertas.
- Evaluación de precios.
- Eventos SSE.
- Historial de activaciones.

#### Market Data Service

- Conexiones a exchanges.
- Normalización de símbolos.
- Precios en tiempo real.
- Reconexion de proveedores.

#### Analytics Service

- Win rate.
- R:R.
- Equity curve.
- Reportes.
- Estadísticas históricas.

## 10. Estrategia de bases de datos

### Base compartida

```text
Todos los módulos ---- PostgreSQL
```

Ventajas:

- Más simple.
- Migración sencilla.
- Transacciones fáciles.

Desventajas:

- Mayor acoplamiento.
- Separación posterior más compleja.

### Base por dominio

```text
Auth Service      ---- auth_db
Trade Service     ---- trading_db
Alert Service     ---- alerts_db
Analytics Service ---- analytics_db
```

Ventajas:

- Aislamiento real.
- Escalabilidad independiente.
- Menor acoplamiento.

Desventajas:

- Más complejidad.
- Consistencia eventual.
- Sin joins directos entre servicios.

Recomendación: mantener PostgreSQL compartido con límites de dominio claros en las primeras fases y separar bases únicamente al separar servicios.

## 11. Seguridad a largo plazo

Prioridades:

- Rotación de refresh tokens.
- Detección de reutilización de tokens.
- Rate limiting para login.
- Bloqueo por intentos fallidos.
- MFA/2FA.
- OAuth2/OIDC.
- Gestión de sesiones por dispositivo.
- Auditoría de acciones.
- Cifrado de credenciales de brokers.
- Secret Manager.
- Rotación de secretos.
- WAF.
- CORS restrictivo.
- Content Security Policy.

### Temas para investigar

- `OAuth2 Authorization Code PKCE`
- `OpenID Connect Spring Security`
- `JWT refresh token rotation`
- `Spring Security rate limiting`
- `OWASP API Security Top 10`
- `AWS Secrets Manager Spring Boot`

## 12. Observabilidad

```text
Application
    |
    +── Logs
    +── Metrics
    +── Traces
    +── Health checks
```

### Stack inicial

- Spring Boot Actuator.
- Micrometer.
- Prometheus.
- Grafana.
- Loki.

### Stack avanzado

- OpenTelemetry.
- Prometheus.
- Grafana.
- Tempo o Jaeger.
- Loki o Elasticsearch.

### Métricas importantes

- Latencia por endpoint.
- Requests por segundo.
- Errores 4xx/5xx.
- Conexiones SSE activas.
- Alertas procesadas.
- Tiempo de evaluación de alertas.
- Consultas lentas.
- Pool de conexiones.
- Uso de CPU y memoria.
- Eventos perdidos.
- Reconexiones de market data.

## 13. Despliegue

### Desarrollo

```text
Docker Compose
├── frontend
├── backend
└── postgres
```

### Producción intermedia

```text
Cloudflare
    |
    +── Frontend en CDN/S3
    +── Backend en ECS o VM
            |
            +── PostgreSQL administrado
            +── Redis administrado
```

### Producción avanzada

```text
Cloudflare
    |
AWS Load Balancer
    |
ECS / Kubernetes
    ├── API
    ├── Alert Worker
    ├── Market Data Worker
    ├── Analytics Worker
    └── Notification Worker
         |
         ├── RDS PostgreSQL
         ├── ElastiCache Redis
         ├── SQS/RabbitMQ/Kafka
         └── S3
```

### Temas para investigar

- `AWS ECS Fargate Spring Boot`
- `AWS RDS PostgreSQL`
- `AWS ElastiCache Redis`
- `AWS Application Load Balancer SSE`
- `Cloudflare CDN React Vite`
- `Kubernetes Spring Boot deployment`
- `Docker Compose to Kubernetes migration`

## 14. Roadmap por cantidad de usuarios

### De 0 a 500 usuarios

1. Modularizar el monolito.
2. Completar CRUDs y validaciones.
3. Añadir pruebas de integración.
4. Crear índices PostgreSQL.
5. Añadir Actuator.
6. Configurar backups.
7. Mejorar reconexión SSE.
8. Incorporar un proveedor real de precios.
9. Añadir manejo global de errores.
10. Separar lógica de frontend en hooks.

### De 500 a 1.200 usuarios

1. Deploy con múltiples instancias.
2. Load balancer.
3. Redis.
4. Redis Pub/Sub para SSE.
5. Cache de métricas.
6. Rate limiting.
7. Observabilidad completa.
8. Workers asíncronos.
9. Paginación y consultas optimizadas.
10. PostgreSQL administrado.

### Más de 1.000 usuarios activos

1. Separar market data del API principal.
2. Crear Alert Service independiente.
3. Añadir broker de mensajes.
4. Crear Analytics Worker.
5. Implementar Outbox Pattern.
6. Separar bases de datos si es necesario.
7. Escalamiento automático.
8. Alta disponibilidad.
9. Disaster recovery.
10. Pruebas de carga y caos.

## 15. Posibles características futuras

- Integración con brokers.
- Sincronización automática de trades.
- Notificaciones push.
- Email, Telegram y Discord.
- Backtesting.
- Planes de suscripción.
- Multi-tenancy.
- Equipos y cuentas compartidas.
- Auditoría financiera.
- Data warehouse.
- Machine learning.
- API pública.
- Webhooks.
- Aplicación móvil.

## 16. Recomendación final

La arquitectura objetivo más razonable es:

```text
React/Vite
   |
Cloudflare/CDN
   |
Load Balancer
   |
Spring Boot Modular Monolith
   ├── Auth
   ├── Accounts
   ├── Trades
   ├── Alerts
   └── Analytics
   |
Redis
   ├── Cache
   ├── Pub/Sub
   └── Rate limiting
   |
PostgreSQL
   |
Market Data Worker
```

Esta estructura permite crecer progresivamente y separar servicios solamente cuando exista una necesidad real. Evita comenzar prematuramente con Kubernetes, Kafka y numerosos microservicios, que aumentarían costes y complejidad operacional sin aportar necesariamente beneficios para la primera etapa del producto.
