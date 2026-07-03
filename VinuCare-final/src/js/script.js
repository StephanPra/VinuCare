/* ══════════════════════════════════
   PAGE NAVIGATION
══════════════════════════════════ */
const PAGES = ['home','services','appointments','shop','reviews'];
let currentPage = 'home';

function showPage(id) {
  if (id === currentPage) return;
  const prevEl = document.getElementById('page-' + currentPage);
  if (prevEl) { prevEl.classList.remove('active'); prevEl.classList.add('exit'); setTimeout(() => prevEl.classList.remove('exit'), 320); }
  PAGES.forEach(p => {
    const n = document.getElementById('nav-' + p); if(n) n.classList.remove('active');
    const m = document.getElementById('m-' + p); if(m) m.classList.remove('active');
  });
  currentPage = id;
  const el = document.getElementById('page-' + id);
  if (el) el.classList.add('active');
  const navEl = document.getElementById('nav-' + id); if(navEl) navEl.classList.add('active');
  const mEl = document.getElementById('m-' + id); if(mEl) mEl.classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
}

/* ══════════════════════════════════
   MOBILE MENU
══════════════════════════════════ */
function toggleMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }
document.addEventListener('click', e => {
  if (!e.target.closest('nav') && !e.target.closest('.mobile-menu')) document.getElementById('mobileMenu').classList.remove('open');
});

/* ══════════════════════════════════
   APPOINTMENT FORM
══════════════════════════════════ */
const dateInput = document.getElementById('apptDate');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

let selectedPetType = '';
let selectedTime = '';

function selectPetType(btn, type) {
  document.querySelectorAll('.pet-type-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedPetType = type;
  document.getElementById('petType').value = type;
}
function selectTime(btn) {
  document.querySelectorAll('.time-slot:not(.unavailable)').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedTime = btn.textContent.trim();
  document.getElementById('apptTime').value = selectedTime;
}
function submitAppointment() {
  const name = document.getElementById('ownerName').value.trim();
  const pet = document.getElementById('petName').value.trim();
  const svc = document.getElementById('service').value;
  const date = document.getElementById('apptDate').value;
  if (!name || !pet || !svc || !date) { alert('Please fill in all required fields 🐾'); return; }
  const msg = document.getElementById('successMsg');
  msg.style.display = 'block';
  const d = new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  msg.textContent = `🎉 Booked! ${pet}'s ${svc} on ${d}${selectedTime ? ' at ' + selectedTime : ''}. We'll confirm by email shortly!`;
  setTimeout(() => { msg.style.display = 'none'; }, 7000);
}

/* ══════════════════════════════════
   PRODUCT DATA
══════════════════════════════════ */
const PRODUCTS = [
  {id:1, name:"Premium Dog Kibble",      desc:"Grain-free adult formula with real chicken",   price:28.99, img:"https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=400&auto=format&fit=crop&q=70", cat:"dogs",  badge:"Best Seller", rating:"4.9"},
  {id:2, name:"Dog Dental Chews",        desc:"Daily dental health sticks — 30 pack",         price:14.99, img:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=70", cat:"dogs",  badge:"Vet Choice", rating:"4.7"},
  {id:3, name:"Orthopedic Dog Bed",      desc:"Memory foam with washable fleece cover",       price:54.99, img:"https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=70", cat:"dogs",  badge:"Premium",    rating:"5.0"},
  {id:4, name:"Dog Rope Toy Set",        desc:"3-piece braided cotton, great for fetch",      price:11.99, img:"https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&auto=format&fit=crop&q=70", cat:"dogs",  badge:null,         rating:"4.8"},
  {id:5, name:"Dog Shampoo — Hypo",      desc:"Sensitive skin, oat & aloe formula 500ml",    price:16.99, img:"https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400&auto=format&fit=crop&q=70", cat:"dogs",  badge:"Organic",    rating:"4.8"},
  {id:6,  name:"Premium Cat Food",       desc:"High-protein wet food with real tuna",         price:18.50, img:"https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&auto=format&fit=crop&q=70", cat:"cats",  badge:"New",        rating:"4.7"},
  {id:7,  name:"Cat Scratching Post",    desc:"Sisal rope post with dangling toy",            price:29.99, img:"https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&auto=format&fit=crop&q=70", cat:"cats",  badge:null,         rating:"4.9"},
  {id:8,  name:"Interactive Cat Wand",   desc:"Feather & bell teaser for daily play",         price:8.50,  img:"https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=400&auto=format&fit=crop&q=70", cat:"cats",  badge:"Popular",    rating:"4.8"},
  {id:9,  name:"Cat Self-Groomer",       desc:"Catnip-infused corner groomer brush",          price:13.99, img:"https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=400&auto=format&fit=crop&q=70", cat:"cats",  badge:null,         rating:"4.6"},
  {id:10, name:"Bird Seed Mix Premium",  desc:"14 variety blend for parrots & songbirds",    price:12.99, img:"https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop&q=70", cat:"birds", badge:null,         rating:"4.8"},
  {id:11, name:"Bird Cage Deluxe",       desc:"Stainless steel, 60×40cm, easy clean",        price:89.99, img:"https://images.unsplash.com/photo-1544558635-667480601430?w=400&auto=format&fit=crop&q=70", cat:"birds", badge:"Premium",    rating:"4.9"},
  {id:12, name:"Tropical Fish Flakes",   desc:"Color-enhancing flake food — 200g",           price:9.99,  img:"https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&auto=format&fit=crop&q=70", cat:"fish",  badge:null,         rating:"4.7"},
  {id:13, name:"Aquarium Water Conditioner", desc:"Neutralises chlorine & heavy metals",     price:7.50,  img:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&auto=format&fit=crop&q=70", cat:"fish",  badge:"Essential",  rating:"4.8"},
  {id:14, name:"Cattle Mineral Block",   desc:"Salt & mineral lick block — 2kg",             price:19.99, img:"https://images.unsplash.com/photo-1508253578933-20b529302151?w=400&auto=format&fit=crop&q=70", cat:"cows",  badge:null,         rating:"4.6"},
  {id:15, name:"Udder Health Cream",     desc:"Lanolin-based teat dip & conditioner",        price:22.99, img:"https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&auto=format&fit=crop&q=70", cat:"cows",  badge:"Vet Approved",rating:"4.9"},
  {id:16, name:"Goat Grain Pellets",     desc:"Balanced grain feed — 5kg bag",               price:24.99, img:"https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&auto=format&fit=crop&q=70", cat:"goats", badge:null,         rating:"4.7"},
  {id:17, name:"Rabbit Timothy Hay",     desc:"Fresh-cut premium timothy hay — 1kg",         price:11.99, img:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&auto=format&fit=crop&q=70", cat:"small", badge:"Best Seller", rating:"4.9"},
  {id:18, name:"Hamster Habitat Set",    desc:"Cage, wheel, water bottle & bedding",         price:44.99, img:"https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=400&auto=format&fit=crop&q=70", cat:"small", badge:"Bundle",     rating:"4.8"},
];

/* ══════════════════════════════════
   CART
══════════════════════════════════ */
let cart = {};
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  const badge = document.getElementById('cartBadge');
  badge.style.transform = 'scale(1.5)';
  setTimeout(() => { badge.style.transform = 'scale(1)'; }, 220);
}
function changeQty(id, delta) { if(!cart[id]) return; cart[id]+=delta; if(cart[id]<=0) delete cart[id]; renderCart(); }
function removeFromCart(id) { delete cart[id]; renderCart(); }
function clearCart() { cart = {}; renderCart(); }
function checkout() { alert(`🎉 Order placed! Total: $${(getTotal()+3.99).toFixed(2)}\nThank you for shopping at VinuCare! 🐾`); cart={}; renderCart(); }
function getTotal() { return Object.entries(cart).reduce((s,[id,q])=>{ const p=PRODUCTS.find(x=>x.id==id); return p?s+p.price*q:s; },0); }
function getTotalItems() { return Object.values(cart).reduce((a,b)=>a+b,0); }

function renderCart() {
  const total = getTotal(), totalItems = getTotalItems();
  const itemIds = Object.keys(cart).filter(id=>cart[id]>0);
  const badge = document.getElementById('cartBadge');
  if(totalItems>0){badge.textContent=totalItems;badge.classList.add('show');}else badge.classList.remove('show');
  const pill = document.getElementById('cartPill');
  if(pill) pill.textContent = totalItems + (totalItems===1?' item':' items');
  const container = document.getElementById('cartItems'), footer = document.getElementById('cartFooter');
  if(!container) return;
  if(itemIds.length===0){
    container.innerHTML='<div class="cart-empty-msg"><div class="empty-icon">🛒</div><p>Your cart is empty.<br>Add some products!</p></div>';
    if(footer) footer.style.display='none'; return;
  }
  container.innerHTML = itemIds.map(id=>{
    const p = PRODUCTS.find(x=>x.id==id); if(!p) return '';
    const qty = cart[id];
    return `<div class="cart-item">
      <div class="cart-item-img"><img src="${p.img}" alt="${p.name}"></div>
      <div class="cart-item-info"><div class="cart-item-name">${p.name}</div><div class="cart-item-price">$${(p.price*qty).toFixed(2)}</div></div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${p.id})" title="Remove">✕</button>
    </div>`;
  }).join('');
  const sub=document.getElementById('cartSubtotal'), tot=document.getElementById('cartTotal');
  if(sub) sub.textContent='$'+total.toFixed(2);
  if(tot) tot.textContent='$'+(total+3.99).toFixed(2);
  if(footer) footer.style.display='block';
}

function filterProducts(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}
function renderProducts(filter) {
  const list = filter==='all' ? PRODUCTS : PRODUCTS.filter(p=>p.cat===filter);
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  if(list.length===0){ grid.innerHTML='<div style="text-align:center;padding:60px;color:var(--text-light);grid-column:1/-1"><p>No products in this category yet.</p></div>'; return; }
  grid.innerHTML = list.map(p=>`
    <div class="product-card">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        ${p.badge?`<span class="product-badge">${p.badge}</span>`:''}
        <span class="product-rating">⭐ ${p.rating}</span>
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(${p.id})" title="Add to cart">+</button>
        </div>
      </div>
    </div>`).join('');
}

renderProducts('all');
renderCart();
