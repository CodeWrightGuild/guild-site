# What the site expects from the pay server

All routes are POST with JSON, reached via tunnels.json.

| Route | Body | Reply |
|---|---|---|
| `/api/create-order` | `{product, tier, credential, currency}` | `{id}` (PayPal order id). Server records the order as `pending`, tied to the account. |
| `/api/capture-order` | `{orderID, credential}` | `{status:"COMPLETED", id}`. Credential is used so the licence is assigned to the signed-in account. Capture can also arrive via webhook. |
| `/api/order-status` | `{credential, orderID}` | `{status, licence?}` |
| `/api/purchases` | `{credential}` | `{purchases:[{product,tier,date,order,status,licence}]}` |
| `/api/perks` | `{credential}` | `{perks:[{name,value}]}` |
| `/api/request-invoice` | `{tier, credential, currency}` | `{status:"INVOICE_SENT"}` (optional) |

## Order lifecycle (server side)
1. `create-order` → store row `pending` (order id, account, tier, currency, amount, product).
2. Server waits until PayPal says paid: browser capture and/or `PAYMENT.CAPTURE.COMPLETED` webhook
   (also re-checks any `pending` order against PayPal's Orders API every 15 s).
3. When paid: mark done, generate the licence key, store it, apply the tier's perks.
   **The licence is delivered only via the dashboard** (no customer email).
4. `order-status` / `purchases` then return `status:"paid"` **and** `licence:"..."`.

`order-status` returns `pending`, `paid`, or `failed`.
If `/api/order-status` answers 404 the site falls back to reading `/api/purchases` for that order id.

## Important fix for the dashboard
`/api/purchases` and `/api/order-status` **no longer filter by LIVE vs SANDBOX mode**.
A purchase made in sandbox will still appear on the dashboard when the server is in live mode (and vice versa).
Previously the strict mode filter was the most common reason the dashboard showed "no products" after a successful payment.

## Front end behaviour
- Checkout: after sign-in the PayPal Buttons appear. A live progress panel polls until the licence arrives, then shows it with a Copy button.
- Dashboard: shows each product with its licence (masked, Reveal/Copy) and perks; while any order is unpaid or has no licence yet it refreshes every 5 s.
