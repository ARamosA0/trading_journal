# Selected Account Trade Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scope trade-list responses and journal views to the selected account, and select an account-card destination before its import picker opens.

**Architecture:** Add required `accountId` query parameters to the all-trades and open-trades endpoints. `TradeService` verifies ownership through `AccountRepository` before querying account-scoped trades. The frontend resolves a valid global selection, refetches on selection events, and selects the clicked account before importing.

**Tech Stack:** Spring Boot 4, Spring Data JPA, React 19, TypeScript, Maven, Vite.

**Spec:** `docs/superpowers/specs/2026-11-03-selected-account-trades-design.md`

## Global Constraints

- Clicking **Import trades** selects that account before the file picker opens; cancellation leaves it selected.
- `GET /api/trades` and `GET /api/trades/open` require `accountId` and return only that account's trades.
- The backend verifies that the account belongs to the authenticated user and is not deleted; invalid or foreign IDs return 404.
- Journal, Dashboard, and Open Trades refetch when `ACCOUNT_SELECTION_EVENT` fires.
- If selection is missing or stale, persist and use the first account from `GET /api/accounts`.
- Preserve import atomicity, provider/currency validation, and idempotency; do not change database schema or trade mutation endpoints.

## Review Focus

- A foreign account ID must not expose trades: backend service test expects 404 and no trade query.
- A deleted account ID must not expose retained trades: backend service test expects 404.
- An account with no trades returns an empty list for both endpoints: backend service test verifies empty results.
- A rapid account switch must not let a late response replace the newly selected account's data: page effects retain their active-request guard; verify by switching accounts during loading.
- Clicking import on an unselected card must select that card before the file picker and upload: verify the selection event and request account ID in the UI.

---

### Task 1: Account-scoped backend trade queries

**Files:**
- Modify: `Backend/src/main/java/com/portfolio/portfolio/repository/TradeRepository.java`
- Modify: `Backend/src/main/java/com/portfolio/portfolio/service/TradeService.java`
- Modify: `Backend/src/main/java/com/portfolio/portfolio/controller/TradeController.java`
- Test: `Backend/src/test/java/com/portfolio/portfolio/service/TradeServiceTest.java`
- Modify: `docs/trades.md`

**Interfaces:**
- `TradeService.findAll(String email, String accountId)` returns the owned account's non-deleted trades ordered by `openAt` descending.
- `TradeService.findOpen(String email, String accountId)` returns the owned account's non-deleted `OPEN` trades ordered by `openAt` descending.
- Controller endpoints require query parameter `accountId` and pass it to the matching service method.

- [x] **Step 1: Add failing service tests** named `findAllReturnsOnlyTheOwnedAccountsTrades`, `findOpenReturnsOnlyTheOwnedAccountsOpenTrades`, `rejectsTradeListingForForeignAccount`, `rejectsTradeListingForDeletedAccount`, and `returnsEmptyListsWhenSelectedAccountHasNoTrades`. Assert repository calls include the requested account ID and only the open query uses `TradeState.OPEN`.
- [x] **Step 2: Run the focused tests** with `docker compose --profile development exec -T backend mvn -Dtest=TradeServiceTest test`; confirm the new calls/signatures fail before implementation.
- [x] **Step 3: Add account-specific repository query methods** for all non-deleted trades and open non-deleted trades, both ordered by `openAt` descending.
- [x] **Step 4: Implement the service signatures** above. Resolve the user from email, call `findByIdAndUser_IdAndDeletedAtIsNull(accountId, userId)`, return 404 if absent, then query by account ID.
- [x] **Step 5: Require `@RequestParam("accountId") String accountId`** on both controller list methods and document the query parameter and 404 behavior in `docs/trades.md`.
- [x] **Step 6: Rerun `TradeServiceTest`** and confirm all account-scope tests pass.

### Task 2: Selected-account API calls and page refresh

**Files:**
- Modify: `Frontend/src/api/accounts.ts`
- Modify: `Frontend/src/api/trades.ts`
- Modify: `Frontend/src/page/journal/Journal.tsx`
- Modify: `Frontend/src/page/journal/Dashboard.tsx`
- Modify: `Frontend/src/page/journal/OpenTrades.tsx`

**Interfaces:**
- Export `resolveSelectedAccountId(accounts: Account[]): string | null`; retain a stored ID present in `accounts`, otherwise persist the first account via `selectAccount`, or return `null` when none exist.
- Change API signatures to `getTrades(accountId: string)` and `getOpenTrades(accountId: string)`; pass `accountId` as the query parameter.

- [x] **Step 1: Update the trade API functions** to require an account ID and send it as `params.accountId`.
- [x] **Step 2: Resolve selection in each page** using `resolveSelectedAccountId`; when it returns `null`, clear the list and skip the trade request.
- [x] **Step 3: Subscribe Journal and Open Trades to `ACCOUNT_SELECTION_EVENT`**, store the selected ID in state, and refetch only for that ID.
- [x] **Step 4: Refactor Dashboard loading** so its existing account list resolves selection before fetching trades; refetch when the selected ID or reload version changes. Keep the calendar scoped to the selected account's full trade history.
- [ ] **Step 5: Verify page behavior** by switching accounts while requests are in flight; each view must settle on the selected account, and an account with no trades must show an empty state.

### Task 3: Import destination selection and final verification

**Files:**
- Modify: `Frontend/src/page/journal/Accounts.tsx`
- Verify: `Frontend/src/page/journal/Journal.tsx`, `Frontend/src/page/journal/Dashboard.tsx`, `Frontend/src/page/journal/OpenTrades.tsx`

- [x] **Step 1: Select the clicked account card on import-button click** using `selectAccount(account.id)` before the file picker opens; keep posting to that same `account.id`.
- [ ] **Step 2: Verify import selection behavior** by clicking Import trades on a different card, confirming the selected ID changes before file choice, and confirming the POST path uses that card's ID.
- [x] **Step 3: Run frontend checks** with `npm run lint` and `npm run build` from `Frontend/`.
- [x] **Step 4: Run the full backend suite** with `docker compose --profile development exec -T backend mvn test`.
