# What the site now expects from the pay server

The site (front end) was rewritten; `payserver.c` was not in the zip, so these are the routes the page calls.
Routes marked NEW need adding if they do not exist yet. All are POST with JSON, via tunnels.json as before.

| Route | Body | Reply |
|---|---|---|
| `/api/create-order` | `{product, tier, credential, currency}` | `{id}` (PayPal order id). **Server must record the order now as `pending`**, tied to the account. `product` is new. |
| `/api/capture-order` | `{orderID, credential}` | `{status:"COMPLETED", id}`. `credential` is new (optional to use). If this fails the site still follows the order, so capture can also come from the webhook. |
| `/api/order-status` (NEW) | `{credential, orderID}` | `{status, licence?}` |
| `/api/purchases` | `{credential}` | `{purchases:[{product,tier,date,order,status,licence}]}` |
| `/api/perks` | `{credential}` | `{perks:[{name,value}]}` |

## Order lifecycle (server side)
1. `create-order` -> store row `pending` (order id, account, tier, currency, amount).
2. Server waits until PayPal says paid: capture result and/or the `PAYMENT.CAPTURE.COMPLETED` webhook
   (also re-check any `pending` order against PayPal's Orders API on a timer, so a closed tab never loses a payment).
3. When paid: mark `paid`, generate the licence key, store it on the order, apply the tier's perks, email the buyer.
4. `order-status` / `purchases` then return `status:"paid"` **and** `licence:"..."`.

`order-status` should return a `status` of `pending`, `paid` (licence may still be empty for a moment), or `failed`.
If `/api/order-status` answers 404 the site falls back to reading `/api/purchases` for that order id.

## Front end behaviour
- Checkout page: after sign-in the PayPal button appears (PayPal's own popup window opens on click), then a live
  progress panel polls every 3 s (10 s after ~2 min, up to 30 min) until the licence arrives, then shows it with a Copy button.
- Dashboard: shows each product with its licence (masked, Reveal/Copy inside the product view) and perks; while any order is
  unpaid or has no licence yet it refreshes itself every 5 s. A just-placed order shows as "confirming payment" immediately.
