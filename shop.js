"use strict";

const products = [
  { id: "dune-mug", name: "Dune Mug", category: "Cups", price: 250, tile: "0% 0%", imageText: "An ochre speckled mug with a loop handle." },
  { id: "tide-bowl", name: "Tide Bowl", category: "Tableware", price: 320, tile: "50% 0%", imageText: "A wide celadon bowl with a raised foot." },
  { id: "stem-vase", name: "Stem Bud Vase", category: "Vases", price: 420, tile: "100% 0%", imageText: "An ivory pear-shaped vase with a narrow neck." },
  { id: "ink-cup", name: "Ink Espresso Cup", category: "Cups", price: 180, tile: "0% 50%", imageText: "A small cobalt blue espresso cup." },
  { id: "terrace-plate", name: "Terrace Plate", category: "Tableware", price: 340, tile: "50% 50%", imageText: "A broad shallow terracotta plate." },
  { id: "loop-vase", name: "Loop Vase", category: "Vases", price: 480, tile: "100% 50%", imageText: "A circular terracotta vase with an opening through its centre." },
  { id: "grove-cup", name: "Grove Cup", category: "Cups", price: 210, tile: "0% 100%", imageText: "A tapered sage-green drinking cup." },
  { id: "pebble-tray", name: "Pebble Tray", category: "Tableware", price: 240, tile: "50% 100%", imageText: "An elongated ivory ceramic tray." },
  { id: "silt-vase", name: "Silt Bottle Vase", category: "Vases", price: 460, tile: "100% 100%", imageText: "A dark brown bottle vase with a long narrow neck." }
];
const STORAGE_KEY = "clayfold.cart.v1";
const FREE_DELIVERY_AT = 500;
const DELIVERY_FEE = 40;
const byId = new Map(products.map(product => [product.id, product]));
const money = value => value.toLocaleString("en-IN", {
  style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0
});
const get = id => document.getElementById(id);
const cartDialog = get("cart-dialog");
const previewDialog = get("preview-dialog");
const cartLines = get("cart-lines");
let cart = readCart();
let toastTimer;

function readCart() {
  const clean = {};
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return clean;
    let subtotal = 0;
    for (const [id, quantity] of Object.entries(saved)) {
      const product = byId.get(id);
      if (!product || !Number.isSafeInteger(quantity) || quantity <= 0) continue;
      const nextSubtotal = subtotal + product.price * quantity;
      if (!Number.isSafeInteger(nextSubtotal)) continue;
      clean[id] = quantity;
      subtotal = nextSubtotal;
    }
  } catch {
    // Malformed data and browsers that block storage can still use a fresh cart.
  }
  return clean;
}

function totals() {
  const lines = Object.entries(cart).map(([id, quantity]) => {
    const product = byId.get(id);
    return { product, quantity, amount: product.price * quantity };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const delivery = subtotal > 0 && subtotal < FREE_DELIVERY_AT ? DELIVERY_FEE : 0;
  return { lines, count, subtotal, delivery, total: subtotal + delivery };
}

function saveAndRender(message) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    message += " This browser could not save your cart for the next visit.";
  }
  renderCart();
  if (cartDialog.open) {
    get("cart-status").textContent = message + " Total " + money(totals().total) + ".";
  } else {
    clearTimeout(toastTimer);
    get("toast").textContent = message;
    toastTimer = setTimeout(() => { get("toast").textContent = ""; }, 3200);
  }
}

function addToCart(id) {
  const product = byId.get(id);
  if (!product || !Number.isSafeInteger(totals().subtotal + product.price)) return;
  cart[id] = (cart[id] || 0) + 1;
  saveAndRender(product.name + " added to cart.");
}

function removeItem(id) {
  if (!cart[id]) return;
  delete cart[id];
  saveAndRender(byId.get(id).name + " removed.");
}

function changeQuantity(id, delta) {
  if (!cart[id] || (delta !== 1 && delta !== -1)) return;
  const product = byId.get(id);
  const next = cart[id] + delta;
  if (next === 0) {
    removeItem(id);
    return;
  }
  if (!Number.isSafeInteger(totals().subtotal + delta * product.price)) return;
  cart[id] = next;
  saveAndRender(product.name + " quantity " + next + ".");
}

function copyTemplate(id) {
  return get(id).content.firstElementChild.cloneNode(true);
}

function renderFilters() {
  const categories = ["All pieces", ...new Set(products.map(product => product.category))];
  for (const category of categories) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter";
    button.textContent = category;
    button.dataset.category = category;
    button.setAttribute("aria-pressed", String(category === "All pieces"));
    get("filters").append(button);
  }
}

function renderCatalogue(category) {
  const visible = category === "All pieces" ? products : products.filter(product => product.category === category);
  const cards = visible.map(product => {
    const card = copyTemplate("product-template");
    const photo = card.querySelector(".product-photo");
    photo.style.setProperty("--tile", product.tile);
    photo.setAttribute("aria-label", product.imageText);
    card.querySelector(".category-label").textContent = product.category;
    card.querySelector("h3").textContent = product.name;
    card.querySelector(".product-price").textContent = money(product.price);
    const button = card.querySelector("button");
    button.dataset.productId = product.id;
    button.setAttribute("aria-label", "Add " + product.name + " to cart");
    return card;
  });
  get("catalogue").replaceChildren(...cards);
  get("piece-count").textContent = visible.length + (visible.length === 1 ? " piece" : " pieces");
}

function renderTotals(container, summary) {
  const list = copyTemplate("totals-template");
  list.querySelector(".subtotal").textContent = money(summary.subtotal);
  list.querySelector(".delivery").textContent = summary.delivery ? money(summary.delivery) : "Free";
  list.querySelector(".grand-total").textContent = money(summary.total);
  container.replaceChildren(list);
}

function cartRow({ product, quantity, amount }) {
  const row = copyTemplate("line-template");
  row.dataset.productId = product.id;
  row.querySelector(".thumbnail").style.setProperty("--tile", product.tile);
  row.querySelector(".item-name").textContent = product.name;
  row.querySelector(".each-price").textContent = money(product.price) + " each";
  row.querySelector(".qty-value").textContent = quantity;
  row.querySelector(".line-amount").textContent = money(amount);
  const labels = { remove: "Remove ", decrease: "Decrease quantity of ", increase: "Increase quantity of " };
  for (const button of row.querySelectorAll("button")) {
    button.setAttribute("aria-label", labels[button.dataset.action] + product.name);
  }
  return row;
}

function renderPreview(summary) {
  const rows = summary.lines.map(({ product, quantity, amount }) => {
    const row = document.createElement("li");
    const label = document.createElement("span");
    const price = document.createElement("b");
    label.textContent = product.name + " × " + quantity;
    price.textContent = money(amount);
    row.append(label, price);
    return row;
  });
  get("preview-lines").replaceChildren(...rows);
  renderTotals(get("preview-totals"), summary);
}

function renderCart() {
  const summary = totals();
  get("cart-count").textContent = summary.count;
  get("open-cart").setAttribute("aria-label", "Open cart, " + summary.count + (summary.count === 1 ? " item" : " items"));
  get("empty-cart").hidden = summary.count > 0;
  get("filled-cart").hidden = summary.count === 0;
  cartLines.replaceChildren(...summary.lines.map(cartRow));
  renderTotals(get("cart-totals"), summary);
  if (previewDialog.open) {
    if (summary.count) renderPreview(summary);
    else {
      previewDialog.close();
      get("browse-empty").focus();
    }
  }
}

function returnToCollection() {
  if (previewDialog.open) previewDialog.close();
  if (cartDialog.open) cartDialog.close();
  const heading = get("collection-title");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  get("collection").scrollIntoView({ block: "start" });
}

get("filters").addEventListener("click", event => {
  const chosen = event.target.closest("button[data-category]");
  if (!chosen) return;
  for (const button of get("filters").children) {
    button.setAttribute("aria-pressed", String(button === chosen));
  }
  renderCatalogue(chosen.dataset.category);
});
get("catalogue").addEventListener("click", event => {
  const button = event.target.closest("button[data-product-id]");
  if (button) addToCart(button.dataset.productId);
});
cartLines.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const row = button.closest("tr");
  const id = row.dataset.productId;
  const action = button.dataset.action;
  const oldIndex = row.sectionRowIndex;
  if (action === "remove") removeItem(id);
  else changeQuantity(id, action === "increase" ? 1 : -1);

  // Re-rendering replaced the button. Keep keyboard focus on the same action or nearest item.
  const rows = [...cartLines.rows];
  const nextRow = rows.find(item => item.dataset.productId === id) || rows[Math.min(oldIndex, rows.length - 1)];
  const nextButton = nextRow?.querySelector('[data-action="' + action + '"]') || get("browse-empty");
  nextButton.focus({ preventScroll: true });
});
get("open-cart").addEventListener("click", () => {
  get("toast").textContent = "";
  cartDialog.showModal();
});
get("open-preview").addEventListener("click", () => {
  const summary = totals();
  if (summary.count) {
    renderPreview(summary);
    previewDialog.showModal();
  }
});
cartDialog.querySelector("[data-close]").addEventListener("click", () => cartDialog.close());
previewDialog.querySelector("[data-close]").addEventListener("click", () => previewDialog.close());
get("back-to-cart").addEventListener("click", () => previewDialog.close());
get("finish-browsing").addEventListener("click", returnToCollection);
get("browse-empty").addEventListener("click", returnToCollection);
window.addEventListener("storage", event => {
  if (event.key === STORAGE_KEY || event.key === null) {
    cart = readCart();
    renderCart();
  }
});

renderFilters();
renderCatalogue("All pieces");
renderCart();
