# Docker: desarrollo y producción local

El proyecto ofrece dos perfiles en `docker-compose.yaml`. Ambos reutilizan el
mismo servicio PostgreSQL, pero nunca arrancan a la vez por defecto.

## Preparar variables

Desde la raíz:

```bash
cp .env.example .env
```

Completa `POSTGRES_USER`, `POSTGRES_PASSWORD` y `JWT_SECRET` (generado con
`openssl rand -base64 32`). Google y SMTP son opcionales. No se debe copiar `.env`
al contexto de ninguna imagen: los `.dockerignore` los excluyen.

## Desarrollo

```bash
docker compose --profile development up --build
```

- Frontend Vite: `http://localhost:3000`.
- Backend Spring Boot: `http://localhost:8080`.
- PostgreSQL: `localhost:5432` (solo loopback).
- Frontend y backend montan el código fuente. Vite recarga cambios; Maven ejecuta
  `spring-boot:run`.
- Las dependencias Maven y Node se guardan en volúmenes nombrados. `npm ci` corre
  al arrancar el frontend para que el volumen `node_modules` coincida con el lock.
- El backend corre como UID/GID 1000 para que `Backend/target` no quede propiedad
  de root en el host.

Para ejecutar las pruebas backend:

```bash
docker compose --profile development exec -T backend mvn test
```

## Imagen de producción local

```bash
docker compose --profile production up --build
```

Esta configuración construye el JAR con Maven y lo ejecuta en una imagen JRE
como usuario no root. Vite construye los assets y Nginx no privilegiado los
sirve en `http://localhost:3000`, aplica fallback de SPA para React Router y
reenvía `/api/*` y `/auth/*` al backend interno. El backend no publica el puerto
8080 al host en este perfil.

`VITE_API_URL`, `VITE_AUTH_URL` y `VITE_GOOGLE_CLIENT_ID` se inyectan como build
args y quedan incorporados en el bundle; vuelve a construir la imagen frontend
si cambian. Las credenciales runtime del backend se leen desde el entorno.

El perfil `production` permite comprobar localmente la imagen de runtime; no es
la topología de despliegue AWS. En un despliegue real, configura HTTPS y
`AUTH_COOKIE_SECURE=true` en el backend.

## Contextos de build

`Backend/.dockerignore` y `Frontend/.dockerignore` eliminan dependencias, outputs,
archivos de IDE, documentación y `.env` de sus respectivos contextos. El build
de producción usa etapas separadas: Maven/JDK y Node solo están en etapas de
build; el runtime contiene un JRE mínimo o Nginx no privilegiado.
