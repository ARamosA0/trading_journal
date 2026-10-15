# Repository Instructions

## Layout

- `Backend/` is the Spring Boot 4 application; the entrypoint is `com.portfolio.portfolio.PortfolioApplication`, with controllers, services, JWT security, and JPA entities under `src/main/java`.
- Backend structure: `src/main/java/com/portfolio/portfolio/controller` exposes HTTP endpoints, `service` contains application logic, `repository` contains JPA access, `entity` contains persistence/domain models, `dto` contains API payloads, and `security` plus `config` contain authentication and infrastructure configuration. Backend tests are under `src/test` and runtime configuration is under `src/main/resources`.
- Backend authentication support also lives in `message/MessageCatalog.java`, which is the single source of truth for error/success codes and Spanish/English text. `dto/ApiMessage.java` is the common message response shape; `dto/AuthResponse.java` also carries `code`, `message`, and `type` on successful authentication responses.
- `Frontend/` is a Vite React 19 + TypeScript app; `src/main.tsx` mounts the app and `src/router/AppRouter.tsx` defines the public and journal routes.
- Frontend structure: `src/api` owns Axios clients, `authContext` owns authentication state, `router` owns routes, `page` owns screens (including `page/journal`), `layouts` owns shared page shells, `component` owns reusable UI and charts, `hook` owns custom hooks, and `assets` owns static images/icons.
- Journal UI structure: `page/journal` contains `Dashboard`, `Journal`, `OpenTrades`, `Accounts`, `Profile`, and `Tools`; `component/journal/NewTradeDialog.tsx` is the reusable new-trade form; `layouts/JournalLayout.tsx`, `layouts/JournalHeader.tsx`, and `component/Sidebar.tsx` own the responsive shell/navigation.
- `schema.sql` is a database reference. The running backend currently uses Hibernate `ddl-auto=update`, not a migration runner.

## Architecture

- The current application is a single backend with a separate frontend; `docker-compose.yaml` is the local development topology, not the production AWS deployment model.
- Keep backend domain boundaries explicit in controllers, services, repositories, DTOs, and entities. For future microservices, split by business domain rather than by technical layer, and avoid cross-domain entity/repository imports.
- Treat backend processes as stateless and keep configuration, credentials, database connections, and service URLs externalized through environment or deployment configuration. Do not add AWS secrets to source control.
- A future service must own its data and expose a deliberate API or event contract; do not let the frontend or another service access its database directly. Prefer independently deployable containers over coupling services to the Compose network.
- Authentication remains stateless for access tokens. The access token is held in frontend memory only; the persistent HTTP-only refresh cookie reconstructs the session after reload or browser restart. Never move the refresh token or access token to `localStorage` as a shortcut.

## Development

- From the repository root, `docker compose up --build` starts PostgreSQL, the backend, and the Vite frontend. Use `http://localhost:3000`, `http://localhost:8080`, and PostgreSQL on `5432`.
- Compose gives the backend the database hostname `db`; a backend started directly on the host must override `spring.datasource.url` because the checked-in default also uses `db`.
- Frontend API endpoints come from `Frontend/.env` (`VITE_API_URL=/api` and `VITE_AUTH_URL=/auth`). Vite proxies both paths to the backend so frontend and authentication cookies remain same-origin during local development. The proxy target defaults to `http://127.0.0.1:8080` for host development; Compose sets `VITE_PROXY_TARGET=http://backend:8080` for the frontend container.
- Backend commands run from `Backend/`: `./mvnw spring-boot:run`, `./mvnw test`, or one test with `./mvnw -Dtest=PortfolioApplicationTests test`.
- Frontend commands run from `Frontend/`: `npm ci`, `npm run dev`, `npm run lint`, `npm run build`, and `npm run preview`.
- Full backend verification should run from the repository root with `docker compose exec -T backend ./mvnw test`; the current suite covers `AuthService`, `JwtService`, `MessageCatalog`, and Spring context startup. It currently contains 20 passing tests.
- Run PostgreSQL before backend tests or the backend test context may fail while creating the JPA datasource; `docker compose up -d db` is the focused prerequisite.
- Docker writes the mounted `Backend/target/` as `root`; if host Maven fails with `Permission denied` there, run the Maven command in the backend container or fix the generated directory ownership before retrying.

## Boundaries

- Authentication is under `/auth` and uses HTTP-only refresh-token cookies; frontend Axios clients are in `Frontend/src/api` and use `withCredentials`.
- Login, register, refresh, and logout return stable `code`, localized `message`, and `type` (`ERROR` or `SUCCESS`) where a response body is available. Use `MessageCatalog.Codes.*` instead of adding code string literals in controllers/services. Add both Spanish and English entries when introducing a message.
- Registration normalizes email, enforces unique non-null email/username at both service and database levels, and requires passwords with at least eight characters, uppercase, lowercase, and a number. Passwords must not be made globally unique.
- Refresh tokens are rotated on `/auth/refresh`, revoked on logout, and may all be revoked through `/auth/revoke`. The cookie is scoped to `/auth`; preserve `withCredentials` and same-origin proxying when changing API configuration.
- Non-authenticated backend routes require JWT authentication in `SecurityConfig`; update CORS there when adding a new frontend origin.
- Journal visual conventions use a charcoal canvas, flat bordered surfaces, cyan for primary actions, green/red only for financial outcomes, and monospace typography for prices/P&L. Avoid adding generic gradients or decorative cards to journal screens.
- Journal tables must remain horizontally usable on small screens, include an accessible `caption`, and expose status through text as well as color. Dialogs should use `role="dialog"`, `aria-modal`, an accessible label, an overlay, an explicit close button, and Escape-to-close behavior.
- `NewTradeDialog` currently captures asset, opening price, stop loss, take profit, and quantity locally. The asset field accepts future `assetOptions` and `onAssetSearch` integration; do not add fake API data as a substitute for the eventual market-data service.
- Do not edit `Backend/target/` or `Frontend/dist/`; they are generated build artifacts.

## Documentation

- `docs/backend-authentication-and-testing.md` documents the authentication flows, message catalog, test coverage, and production considerations. Keep it aligned with changes to auth behavior.

## Known Follow-ups

- Move the JWT signing secret and database credentials out of source-controlled configuration before production.
- Remove the duplicate `spring-boot-devtools` dependency declaration in `Backend/pom.xml`.
- Add integration tests for `AuthController`, cookie behavior, JWT filtering, PostgreSQL constraints, and concurrent registration.
- Connect `NewTradeDialog` to a backend trade endpoint and a market-data API before treating its submit action as persistence.
