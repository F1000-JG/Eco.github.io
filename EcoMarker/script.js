// EcoMarker · script.js
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel, ctx)];

// Demo dataset
const PRODUCTS = [
  { id:1, name:"Botella acero 750ml", price:14.99, cat:"hogar", img:"botelladeacero.webp" },
  { id:2, name:"Cepillo de bambú (pack x4)", price:6.50, cat:"cuidado", img:"Cepillobambu.jpg" },
  { id:3, name:"Bolsas reutilizables", price:4.25, cat:"hogar", img:"ecofactory-bolsa.png" },
  { id:4, name:"Shampoo sólido", price:7.75, cat:"cuidado", img:"shampoo.webp" },
  { id:5, name:"Luces LED para bici (USB)", price:9.90, cat:"movilidad", img:"assets/p5.jpg" },
  { id:6, name:"Pajillas de acero (x6)", price:5.00, cat:"hogar", img:"assets/p6.jpg" }
];

// Year
$("#year") && ($("#year").textContent = new Date().getFullYear());

// Theme toggle
const themeBtn = $("#themeToggle");
function setTheme(dark){
  document.documentElement.classList.toggle("dark", !!dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
}
setTheme(localStorage.getItem("theme")==="dark");
themeBtn && themeBtn.addEventListener("click", ()=> setTheme(!document.documentElement.classList.contains("dark")));

// Mobile menu
const navToggle = $(".nav-toggle");
const menu = $("#menu");
navToggle && navToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// Render helpers
function productCard(p){
  return `
  <article class="product" tabindex="0" aria-label="${p.name}">
    <img src="${p.img}" alt="${p.name}">
    <div class="p-body">
      <h3>${p.name}</h3>
      <div class="p-meta">
        <span>$${p.price.toFixed(2)}</span>
        <div>
          <button class="btn ghost" data-id="${p.id}" data-action="view">Ver</button>
          <button class="btn" data-id="${p.id}" data-action="add">Añadir</button>
        </div>
      </div>
    </div>
  </article>`;
}

// Featured on home
const featured = $("#featuredGrid");
if (featured){
  featured.innerHTML = PRODUCTS.slice(0,4).map(productCard).join("");
}

// Catalog page logic
const grid = $("#productsGrid");
const q = $("#q"), cat = $("#cat"), sort = $("#sort");
function apply(){
  let data = PRODUCTS.slice();
  if (q && q.value.trim()){
    const term = q.value.toLowerCase().trim();
    data = data.filter(p => p.name.toLowerCase().includes(term));
  }
  if (cat && cat.value) data = data.filter(p => p.cat === cat.value);
  if (sort && sort.value === "name") data.sort((a,b)=> a.name.localeCompare(b.name));
  if (sort && sort.value === "price") data.sort((a,b)=> a.price - b.price);
  if (grid) grid.innerHTML = data.map(productCard).join("") || "<p>No hay resultados.</p>";
}
$("#applyFilters") && $("#applyFilters").addEventListener("click", apply);
if (grid) apply();

// Simple form validations
function validateForm(form, rules){
  let ok = true;
  form.querySelectorAll(".error").forEach(e=> e.textContent="");
  for (const [name, rule] of Object.entries(rules)){
    const input = form.elements[name];
    if (!input) continue;
    const val = (input.value || "").trim();
    const elErr = input.nextElementSibling;
    let msg = "";
    if (rule.required && !val) msg = "Este campo es obligatorio";
    if (!msg && rule.min && val.length < rule.min) msg = `Debe tener al menos ${rule.min} caracteres`;
    if (!msg && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = "Correo inválido";
    if (!msg && rule.eq && val !== form.elements[rule.eq].value) msg = "Las contraseñas no coinciden";
    if (msg){ ok = false; elErr && (elErr.textContent = msg); }
  }
  return ok;
}

// Registro
const formRegister = $("#formRegister");
formRegister && formRegister.addEventListener("submit", (e)=>{
  e.preventDefault();
  const ok = validateForm(formRegister, {
    name:{required:true, min:3},
    email:{required:true, email:true},
    password:{required:true, min:6},
    password2:{required:true, min:6, eq:"password"}
  });
  if (ok){
    alert("¡Registro exitoso! (demo)");
    formRegister.reset();
  }
});

// Contacto
const formContact = $("#formContact");
formContact && formContact.addEventListener("submit", (e)=>{
  e.preventDefault();
  const ok = validateForm(formContact, {
    name:{required:true, min:3},
    email:{required:true, email:true},
    message:{required:true, min:10}
  });
  if (ok){
    alert("Mensaje enviado. ¡Gracias por contactarnos! (demo)");
    formContact.reset();
  }
});


// ===== Carrito (demo con localStorage) =====
const CART_KEY = "ecoconecta_cart";
const cartBtn = $("#cartBtn");
const cartDialog = $("#cartDialog");
const cartClose = $("#cartClose");
const cartItemsEl = $("#cartItems");
const cartTotalEl = $("#cartTotal");
const cartClearBtn = $("#cartClear");
const cartCountEl = $("#cartCount");

function loadCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch{ return []; }
}
function saveCart(data){ localStorage.setItem(CART_KEY, JSON.stringify(data)); }
function findProduct(id){ return PRODUCTS.find(p=> p.id === id); }

function cartCount(cart){ return cart.reduce((a,i)=> a + i.qty, 0); }
function cartTotal(cart){ return cart.reduce((a,i)=> a + i.qty * i.price, 0); }

function updateBadge(){
  const cart = loadCart();
  if (cartCountEl) cartCountEl.textContent = cartCount(cart);
}
function addToCart(id){
  const p = findProduct(id); if (!p) return;
  const cart = loadCart();
  const item = cart.find(it => it.id === id);
  if (item) item.qty += 1;
  else cart.push({id:p.id, name:p.name, price:p.price, img:p.img, qty:1});
  saveCart(cart); updateBadge(); renderCart();
}
function changeQty(id, delta){
  const cart = loadCart();
  const item = cart.find(it => it.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
  saveCart(cart); updateBadge(); renderCart();
}
function removeItem(id){
  const cart = loadCart().filter(it => it.id !== id);
  saveCart(cart); updateBadge(); renderCart();
}
function clearCart(){ saveCart([]); updateBadge(); renderCart(); }

function renderCart(){
  const cart = loadCart();
  if (!cartItemsEl) return;
  if (cart.length === 0){
    cartItemsEl.innerHTML = "<p>Tu carrito está vacío.</p>";
  } else {
    cartItemsEl.innerHTML = cart.map(it => `
      <div class="cart-item">
        <img src="${it.img}" alt="${it.name}">
        <div>
          <h4>${it.name}</h4>
          <div class="meta">$${it.price.toFixed(2)}</div>
          <div class="qty" role="group" aria-label="Cantidad">
            <button data-act="dec" data-id="${it.id}" aria-label="Disminuir">−</button>
            <span>${it.qty}</span>
            <button data-act="inc" data-id="${it.id}" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button class="btn ghost" data-act="rm" data-id="${it.id}" aria-label="Quitar">Quitar</button>
      </div>
    `).join("");
  }
  if (cartTotalEl) cartTotalEl.textContent = `$${cartTotal(cart).toFixed(2)}`;
}

updateBadge(); // inicial

// Delegación para botones "Añadir" en cards
document.addEventListener("click", (e)=>{
  const t = e.target.closest("button");
  if (!t) return;
  const action = t.getAttribute("data-action");
  const id = Number(t.getAttribute("data-id"));
  if (action === "add") addToCart(id);
  if (action === "view" && typeof alert === "function"){
    const p = findProduct(id);
    if (p) alert(`${p.name}\n$${p.price.toFixed(2)}\n\n(Detalle demo)`);
  }
  // Dentro del carrito
  const act = t.getAttribute("data-act");
  const cid = Number(t.getAttribute("data-id"));
  if (act === "inc") changeQty(cid, +1);
  if (act === "dec") changeQty(cid, -1);
  if (act === "rm") removeItem(cid);
});

// Abrir/cerrar carrito
cartBtn && cartBtn.addEventListener("click", ()=>{
  renderCart();
  try{ cartDialog.showModal(); }catch{ /* fallback */ }
});
cartClose && cartClose.addEventListener("click", ()=> cartDialog.close());
cartClearBtn && cartClearBtn.addEventListener("click", clearCart);
