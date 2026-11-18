/* =========================================================
   DC LUXURIOUS — Script
   ========================================================= */

/* ---------- Shop settings ---------- */
const SHOP = {
  name: "DC LUXURIOUS",
  owner: "Deniel Castor",
  phone: "09668696296",
  address: "Botolan, Zambales",
};

/* Put your real links here. Leave "" if you don't have one yet. */
const SOCIAL_LINKS = {
  facebook: "",
  tiktok: "",
  instagram: "",
  gmail: "", // your Gmail address, e.g. dcluxurious@gmail.com
};

/* ---------- Products ---------- */
const PRODUCTS = [
  {
    id: "heart-silver-diamond-ring",
    name: "Heart Silver Diamond Ring",
    price: 400000,
    image: "images/heart_silver_diamond_ring.jpg",
  },
  {
    id: "diamond-gold-necklace",
    name: "Diamond Gold Necklace",
    price: 200000,
    image: "images/diamond_gold_necklace.jpg",
  },
  {
    id: "silver-diamond-ring",
    name: "Silver Diamond Ring",
    price: 600000,
    image: "images/silver_diamond_ring.jpg",
  },
];

/* ---------- Helpers ---------- */
const $ = (selector) => document.querySelector(selector);

function peso(amount) {
  return "₱" + amount.toLocaleString("en-PH");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* Builds a text-message link that works on Android and iPhone */
function smsLink(phone, body) {
  return "sms:" + phone + "?&body=" + encodeURIComponent(body);
}

/* ---------- Render product cards ---------- */
function renderProducts(list) {
  const grid = $("#productGrid");
  grid.innerHTML = "";

  list.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <span class="badge">Best Seller</span>
      <div class="photo">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="info">
        <h3>${product.name}</h3>
        <button class="buy-btn" data-id="${product.id}">Buy Now ${peso(product.price)}</button>
      </div>`;
    grid.appendChild(card);
  });

  grid.hidden = list.length === 0;
  $("#noResults").hidden = list.length !== 0;
}

/* ---------- Search ---------- */
function setupSearch() {
  const input = $("#searchInput");

  const filter = () => {
    const term = input.value.trim().toLowerCase();
    renderProducts(PRODUCTS.filter((p) => p.name.toLowerCase().includes(term)));
  };

  input.addEventListener("input", filter);
  $("#searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    filter();
    $("#products").scrollIntoView({ behavior: "smooth" });
    closeMenu();
  });
}

/* ---------- Mobile menu ---------- */
function closeMenu() {
  $("#navLinks").classList.remove("open");
  $("#menuToggle").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
}

function setupMenu() {
  const toggle = $("#menuToggle");
  toggle.addEventListener("click", () => {
    const open = $("#navLinks").classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-links > a").forEach((link) => link.addEventListener("click", closeMenu));
}

/* Highlight the nav link of the section on screen */
function setupActiveLinks() {
  const links = document.querySelectorAll(".nav-links > a");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["home", "about", "products", "contact"].forEach((id) => observer.observe(document.getElementById(id)));
}

/* ---------- Checkout (Buy Now) ---------- */
const cart = { product: null, qty: 1 };

function updateTotal() {
  $("#qtyValue").textContent = cart.qty;
  $("#coTotal").textContent = peso(cart.product.price * cart.qty);
}

function openCheckout(productId) {
  cart.product = PRODUCTS.find((p) => p.id === productId);
  cart.qty = 1;

  $("#coImage").src = cart.product.image;
  $("#coImage").alt = cart.product.name;
  $("#coName").textContent = cart.product.name;
  $("#coPrice").textContent = peso(cart.product.price);
  $("#checkoutError").textContent = "";
  $("#stepForm").hidden = false;
  $("#stepDone").hidden = true;
  updateTotal();

  const modal = $("#checkoutModal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#oName").focus(), 50);
}

function closeCheckout() {
  const modal = $("#checkoutModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function validate(fields) {
  let firstInvalid = null;
  fields.forEach(({ el, test }) => {
    const ok = test(el.value.trim());
    el.classList.toggle("invalid", !ok);
    if (!ok && !firstInvalid) firstInvalid = el;
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem("dcLuxuriousOrders") || "[]");
  orders.push(order);
  localStorage.setItem("dcLuxuriousOrders", JSON.stringify(orders));
}

function placeOrder(event) {
  event.preventDefault();

  const ok = validate([
    { el: $("#oName"), test: (v) => v.length >= 2 },
    { el: $("#oPhone"), test: (v) => /^(09|\+639)\d{9}$/.test(v.replace(/[\s-]/g, "")) },
    { el: $("#oAddress"), test: (v) => v.length >= 5 },
  ]);
  if (!ok) {
    $("#checkoutError").textContent = "Please fill in your name, a valid PH mobile number, and your address.";
    return;
  }

  const order = {
    number: "DC-" + Date.now().toString().slice(-6),
    product: cart.product.name,
    qty: cart.qty,
    total: cart.product.price * cart.qty,
    name: $("#oName").value.trim(),
    phone: $("#oPhone").value.trim(),
    address: $("#oAddress").value.trim(),
    note: $("#oNote").value.trim(),
    date: new Date().toLocaleString("en-PH"),
  };
  saveOrder(order);

  const message =
    `NEW ORDER ${order.number} - ${SHOP.name}\n` +
    `Item: ${order.product} x${order.qty}\n` +
    `Total: ${peso(order.total)}\n` +
    `Name: ${order.name}\n` +
    `Contact: ${order.phone}\n` +
    `Address: ${order.address}` +
    (order.note ? `\nNote: ${order.note}` : "");

  $("#doneName").textContent = order.name;
  $("#doneNumber").textContent = order.number;
  const summary = $("#doneSummary");
  summary.innerHTML = "";
  [
    ["Item", order.product + " × " + order.qty],
    ["Total", peso(order.total)],
    ["Deliver to", order.address],
  ].forEach(([label, value]) => {
    const row = document.createElement("div");
    const left = document.createElement("span");
    const right = document.createElement("span");
    left.textContent = label;
    right.textContent = value;
    row.append(left, right);
    summary.appendChild(row);
  });
  $("#smsOrder").href = smsLink(SHOP.phone, message);

  $("#stepForm").hidden = true;
  $("#stepDone").hidden = false;
  $("#checkoutForm").reset();
  showToast("Order " + order.number + " placed!");
}

function setupCheckout() {
  $("#productGrid").addEventListener("click", (event) => {
    const button = event.target.closest(".buy-btn");
    if (button) openCheckout(button.dataset.id);
  });

  $("#qtyMinus").addEventListener("click", () => {
    if (cart.qty > 1) cart.qty--;
    updateTotal();
  });
  $("#qtyPlus").addEventListener("click", () => {
    if (cart.qty < 10) cart.qty++;
    updateTotal();
  });

  document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeCheckout));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCheckout();
  });

  $("#checkoutForm").addEventListener("submit", placeOrder);
}

/* ---------- Contact form ---------- */
function setupContact() {
  $("#contactForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const ok = validate([
      { el: $("#cName"), test: (v) => v.length >= 2 },
      { el: $("#cEmail"), test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      { el: $("#cMessage"), test: (v) => v.length >= 5 },
    ]);
    if (!ok) {
      $("#contactError").textContent = "Please enter your name, a valid email, and a message.";
      return;
    }
    $("#contactError").textContent = "";

    const body =
      `Message for ${SHOP.name}\n` +
      `From: ${$("#cName").value.trim()} (${$("#cEmail").value.trim()})\n\n` +
      $("#cMessage").value.trim();

    window.location.href = smsLink(SHOP.phone, body);
    showToast("Opening your messages app to send to " + SHOP.phone);
    event.target.reset();
  });
}

/* ---------- Social links ---------- */
function setupSocials() {
  document.querySelectorAll("[data-social]").forEach((link) => {
    const key = link.dataset.social;
    const value = SOCIAL_LINKS[key];

    if (value) {
      link.href = key === "gmail" ? "mailto:" + value : value;
      if (key !== "gmail") {
        link.target = "_blank";
        link.rel = "noopener";
      }
    } else {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showToast("Our " + link.getAttribute("aria-label") + " page is coming soon!");
      });
    }
  });
}

/* ---------- Scroll reveal ---------- */
function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  renderProducts(PRODUCTS);
  setupSearch();
  setupMenu();
  setupActiveLinks();
  setupCheckout();
  setupContact();
  setupSocials();
  setupReveal();
});
