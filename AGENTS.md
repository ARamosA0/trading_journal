# Repository Instructions

## Layout

- `Backend/` is the Spring Boot 4 application; the entrypoint is `com.portfolio.portfolio.PortfolioApplication`, with controllers, services, JWT security, and JPA entities under `src/main/java`.
- Backend structure: `src/main/java/com/portfolio/portfolio/controller` exposes HTTP endpoints, `service` contains application logic, `repository` contains JPA access, `entity` contains persistence/domain models, `dto` contains API payloads, and `security` plus `config` contain authentication and infrastructure configuration. Backend tests are under `src/test` and runtime configuration is under `src/main/resources`.
- `Frontend/` is a Vite React 19 + TypeScript app; `src/main.tsx` mounts the app and `src/router/AppRouter.tsx` defines the public and journal routes.
- Frontend structure: `src/api` owns Axios clients, `authContext` owns authentication state, `router` owns routes, `page` owns screens (including `page/journal`), `layouts` owns shared page shells, `component` owns reusable UI and charts, `hook` owns custom hooks, and `assets` owns static images/icons.
- `schema.sql` is a database reference. The running backend currently uses Hibernate `ddl-auto=update`, not a migration runner.

## Architecture

- The current application is a single backend with a separate frontend; `docker-compose.yaml` is the local development topology, not the production AWS deployment model.
- Keep backend domain boundaries explicit in controllers, services, repositories, DTOs, and entities. For future microservices, split by business domain rather than by technical layer, and avoid cross-domain entity/repository imports.
- Treat backend processes as stateless and keep configuration, credentials, database connections, and service URLs externalized through environment or deployment configuration. Do not add AWS secrets to source control.
- A future service must own its data and expose a deliberate API or event contract; do not let the frontend or another service access its database directly. Prefer independently deployable containers over coupling services to the Compose network.

## Development

- From the repository root, `docker compose up --build` starts PostgreSQL, the backend, and the Vite frontend. Use `http://localhost:3000`, `http://localhost:8080`, and PostgreSQL on `5432`.
- Compose gives the backend the database hostname `db`; a backend started directly on the host must override `spring.datasource.url` because the checked-in default also uses `db`.
- Frontend API endpoints come from `Frontend/.env` (`VITE_API_URL` and `VITE_AUTH_URL`); the current local values target the backend at `127.0.0.1:8080`. Keep these variables available when running Vite outside Compose.
- Backend commands run from `Backend/`: `./mvnw spring-boot:run`, `./mvnw test`, or one test with `./mvnw -Dtest=PortfolioApplicationTests test`.
- Frontend commands run from `Frontend/`: `npm ci`, `npm run dev`, `npm run lint`, `npm run build`, and `npm run preview`.
- Run PostgreSQL before backend tests or the backend test context may fail while creating the JPA datasource; `docker compose up -d db` is the focused prerequisite.
- Docker writes the mounted `Backend/target/` as `root`; if host Maven fails with `Permission denied` there, run the Maven command in the backend container or fix the generated directory ownership before retrying.

## Boundaries

- Authentication is under `/auth` and uses HTTP-only refresh-token cookies; frontend Axios clients are in `Frontend/src/api` and use `withCredentials`.
- Non-authenticated backend routes require JWT authentication in `SecurityConfig`; update CORS there when adding a new frontend origin.
- Do not edit `Backend/target/` or `Frontend/dist/`; they are generated build artifacts.
