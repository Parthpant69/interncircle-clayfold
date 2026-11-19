# Clayfold

InternCircle Fullstack Web Development · Project 05

Clayfold is the mini e-commerce option for Parth Pant’s InternCircle project. Nine fictional products span cups, tableware and vases. The catalog, cart and checkout run in the browser using HTML, CSS and plain JavaScript.

## Run locally

Extract the source ZIP. From the directory containing `index.html`, run `python3 -m http.server 8000`, then open `http://localhost:8000`. You can also open that folder in VS Code and start Live Server. In the hosted source checkout the same app files are under `dist/`. No package install, API key or account is needed.

## Cart and checkout

- Product records in `shop.js` contain a stable ID, category, numeric INR price, name and image description. The catalog is rendered from those records.
- Filter the collection, add pieces, change quantities or remove an entire line. Decreasing a quantity to zero removes the piece.
- Each line amount equals unit price multiplied by quantity. The subtotal is the sum of the line amounts. Delivery is ₹40 for a positive subtotal below ₹500. It is free at ₹500 and above. An empty cart has a zero total.
- The cart is saved under `clayfold.cart.v1` in localStorage. A browser with storage disabled can still use the cart during the current page visit.
- Checkout shows the items, quantities, delivery and final total in a dialog. It does not request personal or payment details, place an order or clear the cart.

For a quick check, add one Dune Mug for ₹250. The cart total is ₹290 including delivery. Add a second mug and the total becomes ₹500 with free delivery. Reload, open the checkout preview, then remove both mugs to see the empty cart.

## Files

- `index.html` contains the storefront, templates and dialogs.
- `style.css` controls the responsive layout and keyboard focus styles.
- `shop.js` defines the products, manages the cart and renders the interface.
- `images/studio.webp` is the generated ceramic still life. `images/pieces.webp` is the generated nine-piece product photo grid. Both images are bundled with the app.

## Submission note

I chose the mini e-commerce option. Clayfold is a nine-product ceramics shop. The subtotal is the sum of each product’s price multiplied by its quantity. Delivery adds ₹40 below ₹500 and is free from ₹500. The checkout is a demo and takes no payment.
