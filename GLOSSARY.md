# Domain Glossary

- **Broker/exchange provider:** The broker or exchange associated with an Account and the origin of its exported trade history. Each supported provider has a stable identity, separate from the display label. The initial providers are SimpleFX and Bitget; new providers are introduced through a code release with an adapter.
- **Provider-backed Account:** A new Account must identify one supported broker/exchange provider. Manual and unrecognized labels are not provider identities.
- **Provider-less legacy Account:** An existing Manual or unrecognized-broker Account retained without a supported provider identity. Existing trades remain readable, but new trades and file imports require explicitly assigning the Account a supported provider; this preserves the Account ID and linked trades.
- **Trade account rule:** Every newly created Trade must be assigned to an Account with a supported provider identity. Manual entry is allowed only against such an Account; without one, trade creation is unavailable.
- **Import P&L currency:** SimpleFX `Profit (USD)` is stored in USD; Bitget position-history `Realized PnL` is stored as exported in USDT. Imports do not perform currency conversion and require the Account to use the matching currency.
