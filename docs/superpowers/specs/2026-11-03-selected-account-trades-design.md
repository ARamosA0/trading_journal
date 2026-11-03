# Selected account trade filtering

## Intent

Imported trades belong to the selected account, and Journal, Dashboard, and Open Trades show data for that account only. Filtering in the backend keeps unrelated account trades out of those responses.

## Behavior

- Clicking **Import trades** on an account card selects that account before the file picker opens. The upload uses that same account ID. If the picker is canceled, the clicked account remains selected.
- `GET /api/trades` and `GET /api/trades/open` require `accountId` and return only trades for that account. The backend verifies the account belongs to the authenticated user and is not deleted; invalid or foreign account IDs return not found.
- The three journal pages pass the selected ID and reload when `ACCOUNT_SELECTION_EVENT` fires. Dashboard charts and metrics receive only the selected account's trades.
- If the stored selection is missing or stale, the pages select and persist the first account returned by `GET /api/accounts`, following Dashboard's current fallback.

## Approaches

- **Frontend-only filtering:** smallest code change, but sends all of the user's trades to the browser. Not selected.
- **Backend account filtering (selected):** adds a required `accountId` query parameter and account-ownership validation. It touches the repository, service, controller, API client, three pages, and their tests; only selected-account trades are returned.

## Scope and constraints

- Preserve the current account-selection storage and event.
- Keep trade import's existing all-or-nothing validation, provider/currency rules, and idempotency behavior.
- No database or response-schema changes. Other account data and trade mutation endpoints are out of scope.

## Verification

- Backend tests cover selected-account queries, rejection of another user's account ID, and required account filtering for open and all trades.
- Frontend verification covers selection changes triggering a fetch with the new ID, and import selecting the clicked card before upload.
