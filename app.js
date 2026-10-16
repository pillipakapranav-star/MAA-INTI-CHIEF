// ==========================================================================
// SMARTSERV GOURMET – MULTI-ROLE RESTAURANT & ANIMATION CONTROLLER
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initConfettiCanvas();
  initCurrencyEngine();
  initRoleSwitching();
  initThemeSwitcher();
  initAudioSystem();
  initClock();
  initCustomerPortal();
  initChefPortal();
  initOwnerPortal();
  initGuestSimulation();
  initDishModal();
  initReceiptModal();
  initDeliveryGpsModal();
  renderAllPortals();
});


// --------------------------------------------------------------------------
// 1. CELEBRATION CONFETTI ENGINE (HTML5 Canvas Physics)
// --------------------------------------------------------------------------
let confettiCanvas = null;
let confettiCtx = null;
let confettiParticles = [];
let confettiAnimationId = null;

function initConfettiCanvas() {
  confettiCanvas = document.getElementById('confettiCanvas');
  if (!confettiCanvas) return;
  confettiCtx = confettiCanvas.getContext('2d');

  const resize = () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);
}

function launchConfettiCelebration(durationMs = 2800) {
  if (!confettiCanvas || !confettiCtx) return;

  const colors = ['#6366f1', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981', '#a855f7', '#fbbf24', '#38bdf8'];
  const count = 90;

  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 180,
      y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 1.2) * 14 - 3,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.35,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  if (!confettiAnimationId) {
    animateConfetti();
  }

  setTimeout(() => {
    // Graceful fadeout
    confettiParticles.forEach(p => p.fading = true);
  }, durationMs - 800);
}

function animateConfetti() {
  if (!confettiCtx) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.98;
    p.rotation += p.vRot;

    if (p.fading) {
      p.opacity -= 0.025;
    }

    if (p.opacity <= 0 || p.y > window.innerHeight + 20) {
      confettiParticles.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.globalAlpha = Math.max(0, p.opacity);
    confettiCtx.fillStyle = p.color;

    if (p.shape === 'rect') {
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
    } else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }
    confettiCtx.restore();
  }

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiAnimationId = null;
  }
}

// --------------------------------------------------------------------------
// 2. FLYING ADD-TO-BASKET PARTICLE ANIMATION
// --------------------------------------------------------------------------
function triggerFlyingFoodAnimation(sourceEl, emojiChar) {
  const targetBadge = document.getElementById('cartCountBadge');
  if (!sourceEl || !targetBadge) return;

  const srcRect = sourceEl.getBoundingClientRect();
  const tgtRect = targetBadge.getBoundingClientRect();

  const particle = document.createElement('div');
  particle.className = 'flying-food-particle';
  particle.textContent = emojiChar;
  particle.style.left = `${srcRect.left + srcRect.width / 2}px`;
  particle.style.top = `${srcRect.top + srcRect.height / 2}px`;
  document.body.appendChild(particle);

  // Animate to cart badge target
  requestAnimationFrame(() => {
    particle.style.left = `${tgtRect.left + tgtRect.width / 2}px`;
    particle.style.top = `${tgtRect.top + tgtRect.height / 2}px`;
    particle.style.transform = 'translate(-50%, -50%) scale(0.35) rotate(25deg)';
    particle.style.opacity = '0.3';
  });

  setTimeout(() => {
    particle.remove();
    // Pop cart badge with animation
    targetBadge.classList.remove('pop');
    void targetBadge.offsetWidth; // trigger reflow
    targetBadge.classList.add('pop');
  }, 750);
}

// --------------------------------------------------------------------------
// 3. UNIVERSAL MULTI-CURRENCY ENGINE
// --------------------------------------------------------------------------
const currencyConfig = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, flag: '🇺🇸', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, flag: '🇪🇺', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, flag: '🇬🇧', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', rate: 83.50, flag: '🇮🇳', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, flag: '🇯🇵', decimals: 0 },
  AED: { code: 'AED', symbol: 'د.إ ', rate: 3.67, flag: '🇦🇪', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.37, flag: '🇨🇦', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'AU$', rate: 1.52, flag: '🇦🇺', decimals: 2 },
  CHF: { code: 'CHF', symbol: 'Fr ', rate: 0.90, flag: '🇨🇭', decimals: 2 },
  SGD: { code: 'SGD', symbol: 'SG$', rate: 1.35, flag: '🇸🇬', decimals: 2 }
};

let currentCurrency = 'USD';

function initCurrencyEngine() {
  const select = document.getElementById('currencySelect');
  if (!select) return;

  const saved = localStorage.getItem('smartserv_currency') || 'USD';
  if (currencyConfig[saved]) {
    currentCurrency = saved;
    select.value = saved;
  }

  select.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    localStorage.setItem('smartserv_currency', currentCurrency);
    playRestaurantChime('tap');
    showToast(`💱 Currency converted to: ${currencyConfig[currentCurrency].flag} ${currentCurrency}`);
    renderAllPortals();
  });
}

function formatMoney(amountInUSD) {
  const curr = currencyConfig[currentCurrency] || currencyConfig.USD;
  const converted = amountInUSD * curr.rate;
  if (curr.decimals === 0) {
    return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --------------------------------------------------------------------------
// 4. PRIMARY ROLE SELECTOR (CUSTOMER • CHEF • OWNER)
// --------------------------------------------------------------------------
let currentRole = 'customer';

function initRoleSwitching() {
  const roleButtons = document.querySelectorAll('.role-btn');
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRole = btn.dataset.role;

      document.querySelectorAll('.portal-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `portal${capitalize(currentRole)}`);
      });

      playRestaurantChime('tap');
      renderAdaptiveMetrics();
      if (currentRole === 'owner') renderOwnerPortal();
      if (currentRole === 'chef') renderChefPortal();
      if (currentRole === 'customer') renderCustomerMenu();
    });
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --------------------------------------------------------------------------
// 5. SOUND SYNTHESIZER
// --------------------------------------------------------------------------
let audioContext = null;
let audioEnabled = true;

function initAudioSystem() {
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');
  const audioStatusText = document.getElementById('audioStatusText');

  if (!audioBtn) return;
  audioBtn.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    audioIcon.textContent = audioEnabled ? '🔔' : '🔕';
    audioStatusText.textContent = audioEnabled ? 'Sound On' : 'Sound Off';
    audioBtn.classList.toggle('btn-audio', audioEnabled);
    audioBtn.classList.toggle('btn-secondary', !audioEnabled);
    showToast(audioEnabled ? '🔔 Sound chimes enabled' : '🔕 Sound muted');
  });
}

function playRestaurantChime(type = 'bell') {
  if (!audioEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume();

    const now = audioContext.currentTime;

    if (type === 'bell') {
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.1);

      osc2.frequency.setValueAtTime(880.0, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioContext.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } else if (type === 'ready') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'tap') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880.0, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (err) {
    console.warn('Audio note:', err);
  }
}

// --------------------------------------------------------------------------
// 6. THEME SWITCHER
// --------------------------------------------------------------------------
function initThemeSwitcher() {
  const themeBtns = document.querySelectorAll('.theme-dot-btn');
  const savedTheme = localStorage.getItem('smartserv_theme') || 'aurora';
  applyTheme(savedTheme);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.theme;
      applyTheme(selected);
      localStorage.setItem('smartserv_theme', selected);
      showToast(`🎨 Aesthetic theme applied: ${btn.title}`);
    });
  });
}

function applyTheme(themeName) {
  document.body.classList.remove('theme-aurora', 'theme-sunset', 'theme-neon', 'theme-emerald');
  document.body.classList.add(`theme-${themeName}`);

  document.querySelectorAll('.theme-dot-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === themeName);
  });
}

// --------------------------------------------------------------------------
// 7. LIVE CLOCK
// --------------------------------------------------------------------------
function initClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;
  const update = () => {
    const d = new Date();
    clockEl.textContent = d.toTimeString().split(' ')[0];
  };
  update();
  setInterval(update, 1000);
}

// --------------------------------------------------------------------------
// 8. DATA STATE
// --------------------------------------------------------------------------
const state = {
  isPromoActive: false,
  promoDiscountPercent: 15,

  menu: [
    {
      id: 'd0_maa',
      name: 'Maa Royal Butter Chicken',
      category: 'mains',
      badge: 'chef',
      badgeText: "Maa's Signature",
      time: '12m prep',
      basePriceUSD: 21.00,
      emoji: '🥘',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
      desc: 'Slow-simmered tender chicken breast in a rich butter, vine tomato, and cashew cream gravy, scented with sun-dried fenugreek.',
      calories: '580 kcal',
      allergens: 'Dairy, Cashews',
      soldToday: 54,
      isOutOfStock: false
    },
    {
      id: 'd0_biryani',
      name: 'Awadhi Dum Saffron Biryani',
      category: 'mains',
      badge: 'bestseller',
      badgeText: 'Guest Favorite',
      time: '15m prep',
      basePriceUSD: 22.50,
      emoji: '🍛',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      desc: 'Aged long-grain basmati rice, tender spiced cuts, caramelized brown onions, fresh mint, and fragrant saffron milk.',
      calories: '640 kcal',
      allergens: 'Dairy',
      soldToday: 48,
      isOutOfStock: false
    },
    {
      id: 'd1',
      name: 'Truffle Wagyu Ribeye',
      category: 'grill',
      badge: 'chef',
      badgeText: "Chef's Signature",
      time: '14m prep',
      basePriceUSD: 42.00,
      emoji: '🥩',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      desc: 'Prime 28-day dry-aged Wagyu ribeye, bone marrow herb emulsion, charred baby asparagus.',
      calories: '740 kcal',
      allergens: 'Dairy',
      soldToday: 48
    },
    {
      id: 'd2',
      name: 'Double Burrata Artisan Pizza',
      category: 'oven',
      badge: 'bestseller',
      badgeText: 'Bestseller',
      time: '11m prep',
      basePriceUSD: 19.50,
      emoji: '🍕',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      desc: '72-hr fermented sourdough base, DOP San Marzano tomatoes, Pugliese creamy burrata, organic Genovese basil.',
      calories: '680 kcal',
      allergens: 'Dairy, Gluten',
      soldToday: 42
    },
    {
      id: 'd3',
      name: 'Firecracker Tiger Prawns',
      category: 'mains',
      badge: 'chef',
      badgeText: 'Spicy 🔥',
      time: '10m prep',
      basePriceUSD: 25.50,
      emoji: '🦐',
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
      desc: 'Charred jumbo ocean prawns, tamarind palm glaze, fragrant garlic chives, crushed toasted chilies.',
      calories: '510 kcal',
      allergens: 'Shellfish',
      soldToday: 29
    },
    {
      id: 'd4',
      name: "Gourmet Smoked Chef's Burger",
      category: 'grill',
      badge: 'bestseller',
      badgeText: 'Guest Favorite',
      time: '9m prep',
      basePriceUSD: 18.00,
      emoji: '🍔',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      desc: 'Double dry-aged Angus brisket patties, melted aged Gruyère, bacon onion jam, brioche bun.',
      calories: '820 kcal',
      allergens: 'Dairy, Gluten',
      soldToday: 35
    },
    {
      id: 'd5',
      name: 'Crispy Skin Atlantic Salmon',
      category: 'mains',
      badge: 'time',
      badgeText: 'Healthy 🌿',
      time: '12m prep',
      basePriceUSD: 26.50,
      emoji: '🐟',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
      desc: 'Pan-roasted Norwegian salmon, sweet pea purée, shaved fennel, Meyer lemon reduction.',
      calories: '560 kcal',
      allergens: 'Fish',
      soldToday: 21
    },
    {
      id: 'd6',
      name: 'Black Summer Truffle Fries',
      category: 'starters',
      badge: 'bestseller',
      badgeText: 'Bestseller',
      time: '5m prep',
      basePriceUSD: 8.50,
      emoji: '🍟',
      image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
      desc: 'Triple-cooked russet potatoes, aged Pecorino snow, Umbrian black truffle mist, roasted garlic aioli.',
      calories: '420 kcal',
      allergens: 'Dairy',
      soldToday: 56
    },
    {
      id: 'd7',
      name: 'Mediterranean Burrata Bowl',
      category: 'starters',
      badge: 'time',
      badgeText: 'Vegetarian 🍃',
      time: '6m prep',
      basePriceUSD: 14.50,
      emoji: '🥗',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      desc: 'Heirloom cherry tomatoes, fresh basil pesto, torn Puglia burrata, balsamic pearls, seeded sourdough.',
      calories: '390 kcal',
      allergens: 'Dairy, Gluten',
      soldToday: 18
    },
    {
      id: 'd8',
      name: 'Tender Salt & Pepper Calamari',
      category: 'starters',
      badge: 'time',
      badgeText: 'Crispy 🦑',
      time: '7m prep',
      basePriceUSD: 13.50,
      emoji: '🦑',
      image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=600&q=80',
      desc: 'Crispy flash-fried calamari curls, smoked sea salt, scallions, sweet chili lime emulsion.',
      calories: '440 kcal',
      allergens: 'Molluscs',
      soldToday: 26
    },
    {
      id: 'd9',
      name: 'Molten Valrhona Soufflé',
      category: 'desserts',
      badge: 'chef',
      badgeText: 'House Classic',
      time: '12m prep',
      basePriceUSD: 12.00,
      emoji: '🍫',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      desc: '70% dark Guanaja chocolate center, Madagascar Bourbon vanilla bean gelato, dusted gold flakes.',
      calories: '530 kcal',
      allergens: 'Dairy, Eggs, Gluten',
      soldToday: 24
    },
    {
      id: 'd10',
      name: 'Artisan Berry Panna Cotta',
      category: 'desserts',
      badge: 'time',
      badgeText: 'Gluten Free',
      time: '4m prep',
      basePriceUSD: 9.50,
      emoji: '🍮',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
      desc: 'Silky Tahitian vanilla cream, wild forest berry compote, micro-mint.',
      calories: '340 kcal',
      allergens: 'Dairy',
      soldToday: 15
    },
    {
      id: 'd11',
      name: 'Yuzu Dragonfruit Spritz',
      category: 'drinks',
      badge: 'chef',
      badgeText: 'Mocktail',
      time: '3m prep',
      basePriceUSD: 7.50,
      emoji: '🍹',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      desc: 'Japanese yuzu juice, crushed dragonfruit, sparkling mineral water, rosemary plume.',
      calories: '110 kcal',
      allergens: 'None',
      soldToday: 32
    },
    {
      id: 'd12',
      name: 'Cold-Pressed Blood Orange',
      category: 'drinks',
      badge: 'time',
      badgeText: '100% Raw',
      time: '2m prep',
      basePriceUSD: 6.50,
      emoji: '🍊',
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80',
      desc: 'Fresh Sicilian blood oranges, hint of ginger and organic agave nectar.',
      calories: '130 kcal',
      allergens: 'None',
      soldToday: 28
    }
  ],

  cart: [],
  cartDiningType: 'Dine-In',
  cartTipPercent: 0,

  orders: [
    {
      id: 'ORD-101',
      table: 'Table 02',
      guest: 'Chloe V.',
      diningType: 'Dine-In',
      step: 3,
      elapsedMinutes: 8,
      notes: 'Medium Rare, extra truffle aioli',
      items: [
        { name: 'Truffle Wagyu Ribeye', qty: 1, basePriceUSD: 42.00 },
        { name: 'Black Summer Truffle Fries', qty: 1, basePriceUSD: 8.50 }
      ]
    },
    {
      id: 'ORD-102',
      table: 'Table 07',
      guest: 'Marcus A.',
      diningType: 'Dine-In',
      step: 2,
      elapsedMinutes: 5,
      notes: 'Crust extra blistered, cut into 8',
      items: [
        { name: 'Double Burrata Artisan Pizza', qty: 2, basePriceUSD: 19.50 },
        { name: 'Yuzu Dragonfruit Spritz', qty: 2, basePriceUSD: 7.50 }
      ]
    },
    {
      id: 'ORD-103',
      table: 'Express Pick-Up',
      guest: 'Elena S.',
      diningType: 'Takeaway',
      step: 4,
      elapsedMinutes: 14,
      notes: 'Packaging sealed for transit',
      items: [
        { name: 'Firecracker Tiger Prawns', qty: 1, basePriceUSD: 25.50 },
        { name: 'Tender Salt & Pepper Calamari', qty: 1, basePriceUSD: 13.50 }
      ]
    },
    {
      id: 'ORD-104',
      table: 'Table 11',
      guest: 'David K.',
      diningType: 'Dine-In',
      step: 2,
      elapsedMinutes: 4,
      notes: 'Dressing on the side, no croutons',
      items: [
        { name: 'Mediterranean Burrata Bowl', qty: 1, basePriceUSD: 14.50 },
        { name: 'Crispy Skin Atlantic Salmon', qty: 1, basePriceUSD: 26.50 }
      ]
    }
  ],

  pantry: [
    { id: 'p1', name: 'Prime Wagyu Ribeye Cuts', station: 'GRILL', stock: 16, max: 20, icon: '🥩', status: 'OK' },
    { id: 'p2', name: 'Wild Tiger Ocean Prawns', station: 'WOK', stock: 22, max: 25, icon: '🦐', status: 'OK' },
    { id: 'p3', name: 'Norwegian Salmon Fillets', station: 'SAUTÉ', stock: 12, max: 15, icon: '🐟', status: 'OK' },
    { id: 'p4', name: 'DOP Puglia Burrata Cheese', station: 'OVEN', stock: 14, max: 18, icon: '🧀', status: 'OK' },
    { id: 'p5', name: 'Genovese Fresh Basil', station: 'PANTRY', stock: 3, max: 15, icon: '🌿', status: 'LOW' },
    { id: 'p6', name: '70% Valrhona Dark Chocolate', station: 'PASTRY', stock: 8, max: 10, icon: '🍫', status: 'OK' },
    { id: 'p7', name: 'Umbrian Black Truffle Oil', station: 'FRYER', stock: 5, max: 8, icon: '🫒', status: 'OK' },
    { id: 'p8', name: 'San Marzano Vine Tomatoes', station: 'OVEN', stock: 25, max: 30, icon: '🍅', status: 'OK' },
    { id: 'p9', name: 'Atlantic Squid Rings', station: 'FRYER', stock: 2, max: 12, icon: '🦑', status: 'LOW' },
    { id: 'p10', name: 'Madagascar Vanilla Pods', station: 'PASTRY', stock: 0, max: 6, icon: '🌾', status: '86' }
  ],

  activeMenuCat: 'all',
  menuSearch: '',
  chefFilter: 'all',
  chefMenuCat: 'all',
  chefMenuSearch: '',

  kitchenSettings: (() => {
    const saved = localStorage.getItem('maa_kitchen_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Maa Chief Kitchen & Culinary Hearth',
      street: '42 Culinary Boulevard, Gourmet Haven',
      landmark: 'Level 2, Artisan Food Plaza',
      city: 'Downtown District, NY 10012',
      phone: '+1 (555) 789-2433',
      radius: '8.5 km (5.3 miles)',
      deliveryFeeUSD: 2.50,
      freeDeliveryMinUSD: 35.00
    };
  })()
};

function getDishEffectivePriceUSD(dish) {
  if (state.isPromoActive) {
    return dish.basePriceUSD * (1 - state.promoDiscountPercent / 100);
  }
  return dish.basePriceUSD;
}

// --------------------------------------------------------------------------
// 9. CUSTOMER PORTAL
// --------------------------------------------------------------------------
function initCustomerPortal() {
  const subtabs = document.querySelectorAll('.customer-subtab');
  subtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subtabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.dataset.subview;
      document.getElementById('custMenuView').classList.toggle('active', view === 'custMenu');
      document.getElementById('custTrackerView').classList.toggle('active', view === 'custTracker');
      if (view === 'custTracker') renderCustomerTracker();
    });
  });

  const catPills = document.querySelectorAll('#menuCatTabs .cat-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeMenuCat = pill.dataset.cat;
      renderCustomerMenu();
    });
  });

  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.menuSearch = e.target.value.toLowerCase().trim();
      renderCustomerMenu();
    });
  }

  const deliveryAddressPanel = document.getElementById('deliveryAddressPanel');
  const dispatchAddressDisplay = document.getElementById('dispatchKitchenAddressDisplay');
  if (dispatchAddressDisplay && state.kitchenSettings) {
    dispatchAddressDisplay.textContent = `${state.kitchenSettings.name}, ${state.kitchenSettings.street}`;
  }

  const diningPills = document.querySelectorAll('.dining-pill');
  diningPills.forEach(pill => {
    pill.addEventListener('click', () => {
      diningPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.cartDiningType = pill.dataset.type;

      if (deliveryAddressPanel) {
        deliveryAddressPanel.style.display = state.cartDiningType === 'Delivery' ? 'block' : 'none';
      }

      playRestaurantChime('tap');
      updateCustomerCartUI();
    });
  });

  const tipPills = document.querySelectorAll('.tip-pill');
  tipPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tipPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.cartTipPercent = parseInt(pill.dataset.tip, 10);
      playRestaurantChime('tap');
      updateCustomerCartUI();
    });
  });

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', submitCustomerOrder);
  }

  // Floating Bag and Header Cart scroll to cart panel
  const scrollToCart = () => {
    const cartPanel = document.getElementById('orderCartPanel') || document.getElementById('customerCartPanel');
    if (cartPanel) {
      cartPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      cartPanel.style.outline = '2px solid var(--primary)';
      setTimeout(() => { cartPanel.style.outline = 'none'; }, 1500);
    }
  };

  const floatingCartBtn = document.getElementById('floatingCartBtn');
  if (floatingCartBtn) {
    floatingCartBtn.addEventListener('click', scrollToCart);
  }

  const headerCartTriggerBtn = document.getElementById('headerCartTriggerBtn');
  if (headerCartTriggerBtn) {
    headerCartTriggerBtn.addEventListener('click', scrollToCart);
  }

  // Promo Banner actions
  const closePromoBannerBtn = document.getElementById('closePromoBannerBtn');
  if (closePromoBannerBtn) {
    closePromoBannerBtn.addEventListener('click', () => {
      const banner = document.getElementById('promoBanner') || document.getElementById('topPromoBanner');
      if (banner) banner.classList.add('hidden');
    });
  }

  const copyPromoBtn = document.getElementById('copyPromoBtn');
  if (copyPromoBtn) {
    copyPromoBtn.addEventListener('click', () => {
      state.isPromoActive = true;
      showToast('🎉 Promo code GOURMET15 applied! 15% discount activated on all dishes.');
      playRestaurantChime('success');
      launchConfettiCelebration(2200);
      renderCustomerMenu();
      updateCustomerCartUI();
    });
  }

  renderCustomerMenu();
  updateCustomerCartUI();
}

function renderCustomerMenu() {
  const grid = document.getElementById('dishesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const heroCurrencyBadge = document.getElementById('heroCurrencyBadge');
  if (heroCurrencyBadge) {
    heroCurrencyBadge.textContent = `💵 Currency: ${currencyConfig[currentCurrency].flag} ${currentCurrency} (${currencyConfig[currentCurrency].symbol})`;
  }

  let list = state.menu;
  if (state.activeMenuCat !== 'all') {
    list = list.filter(d => d.category === state.activeMenuCat);
  }
  if (state.menuSearch) {
    list = list.filter(d => d.name.toLowerCase().includes(state.menuSearch) || d.desc.toLowerCase().includes(state.menuSearch));
  }

  list.forEach((dish, idx) => {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.style.animationDelay = `${idx * 0.045}s`;

    const effectivePriceUSD = getDishEffectivePriceUSD(dish);
    const formattedPrice = formatMoney(effectivePriceUSD);

    card.innerHTML = `
      <div>
        ${dish.image ? `
          <div class="dish-card-img-wrap">
            <img src="${dish.image}" alt="${dish.name}" class="dish-card-img" loading="lazy" />
            <div class="dish-img-emoji-badge">${dish.emoji}</div>
            <div class="dish-img-floating-badges">
              <span class="dish-tag ${dish.badge}">${dish.badgeText}</span>
              ${state.isPromoActive ? `<span class="dish-tag bestseller" style="background:#f43f5e;">-15% Promo</span>` : ''}
              <span class="dish-tag time">⏱️ ${dish.time}</span>
            </div>
          </div>
        ` : `
          <div class="dish-top-row">
            <div class="dish-emoji-wrap">${dish.emoji}</div>
            <div class="dish-badges-col">
              <span class="dish-tag ${dish.badge}">${dish.badgeText}</span>
              ${state.isPromoActive ? `<span class="dish-tag bestseller" style="background:#f43f5e;">-15% Promo</span>` : ''}
              <span class="dish-tag time">⏱️ ${dish.time}</span>
            </div>
          </div>
        `}

        <div class="dish-info-block" style="margin-top: 0.4rem;">
          <h3>${dish.name}</h3>
          <p class="dish-desc">${dish.desc}</p>
        </div>
      </div>

      <div class="dish-bottom-bar">
        <span class="dish-price">${formattedPrice}</span>
        ${dish.isOutOfStock ? `
          <button class="dish-add-btn" disabled style="background: rgba(244,63,94,0.2); border: 1px solid rgba(244,63,94,0.4); color: #f43f5e; cursor: not-allowed;">
            🚫 86'd Out
          </button>
        ` : `
          <button class="dish-add-btn" data-id="${dish.id}">
            <span>+</span> Add
          </button>
        `}
      </div>
    `;

    if (dish.isOutOfStock) {
      card.style.opacity = '0.68';
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('.dish-add-btn')) return;
      openDishDetailsModal(dish);
    });

    const addBtn = card.querySelector('.dish-add-btn:not([disabled])');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerFlyingFoodAnimation(addBtn, dish.emoji);
        addDishToCart(dish);
      });
    }

    grid.appendChild(card);
  });
}

function addDishToCart(dish) {
  const existing = state.cart.find(i => i.id === dish.id);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...dish, qty: 1 });
  }
  playRestaurantChime('tap');
  updateCustomerCartUI();
  showToast(`🛒 Added "${dish.name}" to your basket`);
}

function updateCustomerCartUI() {
  const container = document.getElementById('cartItemsContainer');
  const countBadge = document.getElementById('cartCountBadge');
  const floatingBadge = document.getElementById('floatingCartBadge') || document.getElementById('floatingCartCount');
  const headerBadge = document.getElementById('headerCartCount');
  const subtotalEl = document.getElementById('cartSubtotal');
  const taxEl = document.getElementById('cartTax');
  const tipRow = document.getElementById('tipRow');
  const tipEl = document.getElementById('cartTip');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('placeOrderBtn');

  document.querySelectorAll('.currency-code-span').forEach(sp => {
    sp.textContent = currentCurrency;
  });

  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  if (countBadge) countBadge.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
  if (floatingBadge) floatingBadge.textContent = totalItems;
  if (headerBadge) headerBadge.textContent = totalItems;

  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="empty-emoji">🍳</div>
        <h4>Your basket is empty</h4>
        <p>Choose your favorite dishes from the menu to build your meal.</p>
      </div>
    `;
    subtotalEl.textContent = formatMoney(0);
    taxEl.textContent = formatMoney(0);
    if (tipRow) tipRow.style.display = 'none';
    totalEl.textContent = formatMoney(0);
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  container.innerHTML = '';

  let subtotalUSD = 0;

  state.cart.forEach((item, index) => {
    const unitPriceUSD = getDishEffectivePriceUSD(item);
    const itemTotalUSD = unitPriceUSD * item.qty;
    subtotalUSD += itemTotalUSD;

    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <div class="cart-item-left">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-unit-price">${formatMoney(unitPriceUSD)} each</span>
      </div>
      <div class="cart-item-controls">
        <button class="btn-qty btn-minus" data-idx="${index}">-</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button class="btn-qty btn-plus" data-idx="${index}">+</button>
        <span class="cart-item-total">${formatMoney(itemTotalUSD)}</span>
      </div>
    `;

    row.querySelector('.btn-minus').addEventListener('click', () => {
      if (item.qty > 1) {
        item.qty--;
      } else {
        state.cart.splice(index, 1);
      }
      playRestaurantChime('tap');
      updateCustomerCartUI();
    });

    row.querySelector('.btn-plus').addEventListener('click', () => {
      item.qty++;
      playRestaurantChime('tap');
      updateCustomerCartUI();
    });

    container.appendChild(row);
  });

  let deliveryFeeUSD = 0;
  const deliveryFeeRow = document.getElementById('deliveryFeeRow');
  const cartDeliveryFeeEl = document.getElementById('cartDeliveryFee');

  if (state.cartDiningType === 'Delivery') {
    const minFreeUSD = state.kitchenSettings?.freeDeliveryMinUSD || 35.00;
    if (subtotalUSD >= minFreeUSD) {
      deliveryFeeUSD = 0;
      if (cartDeliveryFeeEl) {
        cartDeliveryFeeEl.textContent = 'FREE 🎉 (Over Threshold)';
        cartDeliveryFeeEl.style.color = '#34d399';
      }
    } else {
      deliveryFeeUSD = state.kitchenSettings?.deliveryFeeUSD || 2.50;
      if (cartDeliveryFeeEl) {
        cartDeliveryFeeEl.textContent = formatMoney(deliveryFeeUSD);
        cartDeliveryFeeEl.style.color = 'var(--text-main)';
      }
    }
    if (deliveryFeeRow) deliveryFeeRow.style.display = 'flex';
  } else {
    if (deliveryFeeRow) deliveryFeeRow.style.display = 'none';
  }

  const taxUSD = subtotalUSD * 0.10;
  const tipUSD = subtotalUSD * (state.cartTipPercent / 100);
  const grandTotalUSD = subtotalUSD + taxUSD + tipUSD + deliveryFeeUSD;

  subtotalEl.textContent = formatMoney(subtotalUSD);
  taxEl.textContent = formatMoney(taxUSD);

  if (tipRow && state.cartTipPercent > 0) {
    tipRow.style.display = 'flex';
    tipEl.textContent = formatMoney(tipUSD);
  } else if (tipRow) {
    tipRow.style.display = 'none';
  }

  totalEl.textContent = formatMoney(grandTotalUSD);
}

function submitCustomerOrder() {
  if (state.cart.length === 0) return;

  let deliveryStreet = '';
  let deliveryPhone = '';
  let deliveryDoorNotes = '';

  if (state.cartDiningType === 'Delivery') {
    deliveryStreet = document.getElementById('deliveryStreet')?.value.trim();
    deliveryPhone = document.getElementById('deliveryPhone')?.value.trim();
    deliveryDoorNotes = document.getElementById('deliveryDoorNotes')?.value.trim() || '';

    if (!deliveryStreet) {
      showToast('⚠️ Please enter your Home Delivery address');
      document.getElementById('deliveryStreet')?.focus();
      return;
    }
    if (!phoneRegexCheck(deliveryPhone)) {
      showToast('⚠️ Please enter a contact phone number for home delivery');
      document.getElementById('deliveryPhone')?.focus();
      return;
    }
  }

  const notes = document.getElementById('cartChefNotes')?.value.trim() || '';
  const orderId = `ORD-${Math.floor(Math.random() * 800 + 100)}`;
  
  let tableLabel = 'Table 04';
  if (state.cartDiningType === 'Delivery') {
    tableLabel = `🛵 Home Delivery (${deliveryStreet})`;
  } else if (state.cartDiningType === 'Takeaway') {
    tableLabel = 'Express Takeaway';
  } else if (state.cartDiningType === 'VIP') {
    tableLabel = 'VIP Chef Suite';
  }

  const newOrder = {
    id: orderId,
    table: tableLabel,
    guest: state.cartDiningType === 'Delivery' ? `Home Delivery Guest (${deliveryPhone})` : 'Table 04 Guest',
    diningType: state.cartDiningType,
    deliveryStreet: deliveryStreet,
    deliveryPhone: deliveryPhone,
    deliveryDoorNotes: deliveryDoorNotes,
    dispatchFrom: `${state.kitchenSettings.name}, ${state.kitchenSettings.street}`,
    step: 1,
    elapsedMinutes: 0,
    notes: state.cartDiningType === 'Delivery' 
      ? `🛵 Home Delivery to: ${deliveryStreet} • Phone: ${deliveryPhone}${deliveryDoorNotes ? ' (' + deliveryDoorNotes + ')' : ''}${notes ? ' • Chef note: ' + notes : ''}`
      : (notes || 'Guest order placed from app'),
    items: state.cart.map(i => ({
      name: i.name,
      qty: i.qty,
      basePriceUSD: getDishEffectivePriceUSD(i)
    }))
  };

  state.orders.unshift(newOrder);
  state.cart = [];
  updateCustomerCartUI();
  if (document.getElementById('cartChefNotes')) {
    document.getElementById('cartChefNotes').value = '';
  }

  // Audio and Confetti Celebration Animation!
  playRestaurantChime('bell');
  launchConfettiCelebration(2800);
  showToast(state.cartDiningType === 'Delivery'
    ? `🛵 Order #${newOrder.id} placed for Home Delivery! Kitchen is preparing your dishes.`
    : `🎉 Order #${newOrder.id} confirmed! Kitchen is firing your dishes.`);

  const trackerSubtab = document.querySelector('.customer-subtab[data-subview="custTracker"]');
  if (trackerSubtab) trackerSubtab.click();

  renderCustomerTracker();
  renderChefPortal();
  renderAdaptiveMetrics();
}

function phoneRegexCheck(p) {
  return p && p.length >= 6;
}

function renderCustomerTracker() {
  const container = document.getElementById('custTrackerList');
  if (!container) return;
  container.innerHTML = '';

  const activeOrders = state.orders;
  const countEl = document.getElementById('custActiveOrderCount');
  if (countEl) countEl.textContent = activeOrders.length;

  if (activeOrders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-dim); background: var(--surface-glass); border-radius: var(--radius-lg);">
        <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">🛎️</div>
        <h3>No active orders placed yet</h3>
        <p style="font-size: 0.85rem; margin-top: 0.2rem;">Head over to "Explore Menu & Order" to select and fire your meal!</p>
      </div>
    `;
    return;
  }

  activeOrders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'tracker-order-card';

    const isDelivery = order.diningType === 'Delivery';
    const stepLabels = isDelivery
      ? ['Order Placed 📝', 'Kitchen Prepping 🥘', 'Out for Delivery 🛵', 'Delivered to Door 🎉']
      : ['Order Placed', 'Chef Prepping', 'In Cooking', 'Ready to Serve 🛎️'];

    const progressPercent = ((order.step - 1) / 3) * 100;

    let stepperNodes = stepLabels.map((label, idx) => {
      const stepNum = idx + 1;
      let statusClass = '';
      if (stepNum < order.step) statusClass = 'completed';
      else if (stepNum === order.step) statusClass = 'current';

      return `
        <div class="step-node ${statusClass}">
          <div class="step-circle">${stepNum < order.step ? '✓' : stepNum}</div>
          <span class="step-label">${label}</span>
        </div>
      `;
    }).join('');

    let itemsChips = order.items.map(item => `
      <span class="tracker-dish-chip">
        <strong>${item.qty}×</strong> ${item.name}
      </span>
    `).join('');

    card.innerHTML = `
      <div class="tracker-card-top">
        <div class="tracker-order-title">
          <span class="tracker-order-id">#${order.id}</span>
          <span class="tracker-table-badge">${order.table}</span>
          <span class="tracker-dining-type" style="${isDelivery ? 'background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; font-weight: 800;' : ''}">${isDelivery ? '🛵 Home Delivery' : order.diningType}</span>
        </div>
        <span class="tracker-timer-badge">
          ⏱️ ${isDelivery ? 'Est. Delivery' : 'Prep Time'}: ~${order.elapsedMinutes + (isDelivery ? 25 : 12)} mins
        </span>
      </div>

      ${isDelivery ? `
        <div class="tracker-delivery-badge-box">
          <div class="delivery-dest">
            <span>🛵 <strong>Delivering to:</strong> ${order.deliveryStreet || 'Customer Address'}</span>
            ${order.deliveryPhone ? `<span style="color: var(--accent-cyan); margin-left: 0.5rem;">📞 ${order.deliveryPhone}</span>` : ''}
          </div>
          <div class="delivery-origin">
            <span>📍 <strong>Dispatched from Kitchen Hub:</strong> ${order.dispatchFrom || (state.kitchenSettings?.name + ', ' + state.kitchenSettings?.street)}</span>
          </div>
          ${order.deliveryDoorNotes ? `<div class="delivery-instructions">💬 Delivery Note: "${order.deliveryDoorNotes}"</div>` : ''}
        </div>
      ` : ''}

      <div class="order-stepper-wrap">
        <div class="stepper-line">
          <div class="stepper-line-fill" style="width: ${progressPercent}%;"></div>
        </div>
        ${stepperNodes}
      </div>

      <div class="tracker-items-chips">
        ${itemsChips}
      </div>

      <div class="tracker-card-actions">
        <span class="tracker-note-text">${order.notes ? `<strong>Notes:</strong> ${order.notes}` : ''}</span>
        <div class="tracker-action-buttons">
          <button type="button" class="btn-tracker-receipt" data-id="${order.id}">
            <span>🧾 Receipt</span>
          </button>
          ${isDelivery ? `
            <button type="button" class="btn-tracker-gps" data-id="${order.id}">
              <span>🗺️ Live GPS Track</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    card.querySelector('.btn-tracker-receipt')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openReceiptModal(order);
    });

    if (isDelivery) {
      card.querySelector('.btn-tracker-gps')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openDeliveryGpsModal(order);
      });
    }

    container.appendChild(card);
  });
}



// --------------------------------------------------------------------------
// 10. EXECUTIVE CHEF PORTAL
// --------------------------------------------------------------------------
function initChefPortal() {
  const filterChips = document.querySelectorAll('.sub-section-header .filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.chefFilter = chip.dataset.chefFilter;
      renderChefOrders();
    });
  });

  const simTicketBtn = document.getElementById('chefSimulateTicketBtn');
  if (simTicketBtn) {
    simTicketBtn.addEventListener('click', () => {
      const randomOrder = state.menu[Math.floor(Math.random() * 4)];
      const newId = `ORD-${Math.floor(Math.random() * 800 + 300)}`;
      state.orders.unshift({
        id: newId,
        table: `Table ${Math.floor(Math.random() * 16 + 1)}`,
        guest: 'Chef Table',
        diningType: 'Dine-In',
        step: 1,
        elapsedMinutes: 0,
        notes: 'Chef priority fast ticket',
        items: [{ name: randomOrder.name, qty: 1, basePriceUSD: randomOrder.basePriceUSD }]
      });
      playRestaurantChime('bell');
      showToast(`⚡ Chef ticket #${newId} fired to the line!`);
      renderChefOrders();
      renderAdaptiveMetrics();
    });
  }

  const restockAllBtn = document.getElementById('chefRestockAllBtn');
  if (restockAllBtn) {
    restockAllBtn.addEventListener('click', () => {
      state.pantry.forEach(p => { p.stock = p.max; p.status = 'OK'; });
      playRestaurantChime('ready');
      renderChefPantry();
      showToast('🔄 All pantry raw materials restocked to 100% capacity');
    });
  }

  // Chief Subtab switching (Orders vs Recipe Studio)
  const chefSubtabs = document.querySelectorAll('.chef-subtab');
  chefSubtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      chefSubtabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.dataset.chefView;
      const ordersView = document.getElementById('chefOrdersView');
      const menuView = document.getElementById('chefMenuView');
      if (ordersView) ordersView.classList.toggle('hidden', view !== 'orders');
      if (menuView) {
        menuView.classList.toggle('hidden', view !== 'menu');
        if (view === 'menu') renderChefDishesList();
      }
      playRestaurantChime('tap');
    });
  });

  // Chief Menu Category Filter Pills
  const chefCatPills = document.querySelectorAll('#chefCatTabs .cat-pill');
  chefCatPills.forEach(pill => {
    pill.addEventListener('click', () => {
      chefCatPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.chefMenuCat = pill.dataset.chefCat || 'all';
      renderChefDishesList();
      playRestaurantChime('tap');
    });
  });

  // Chief Add Dish Modal Wiring
  const addModal = document.getElementById('chefAddDishModal');
  const openAddModal = () => {
    if (addModal) {
      addModal.classList.add('active');
      updateChefDishPreview();
      playRestaurantChime('tap');
    }
  };
  const closeAddModal = () => {
    if (addModal) addModal.classList.remove('active');
  };

  const chefOpenAddDishBtn = document.getElementById('chefOpenAddDishBtn');
  if (chefOpenAddDishBtn) chefOpenAddDishBtn.addEventListener('click', openAddModal);

  const chefCreateDishBtn2 = document.getElementById('chefCreateDishBtn2');
  if (chefCreateDishBtn2) chefCreateDishBtn2.addEventListener('click', openAddModal);

  const closeChefAddModalBtn = document.getElementById('closeChefAddModalBtn');
  if (closeChefAddModalBtn) closeChefAddModalBtn.addEventListener('click', closeAddModal);

  const cancelChefAddBtn = document.getElementById('cancelChefAddBtn');
  if (cancelChefAddBtn) cancelChefAddBtn.addEventListener('click', closeAddModal);

  if (addModal) {
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) closeAddModal();
    });
  }

  // Live Preview Updating
  const updateChefDishPreview = () => {
    const nameVal = document.getElementById('newDishName')?.value.trim() || 'Signature Dish';
    const priceVal = parseFloat(document.getElementById('newDishPrice')?.value) || 18.50;
    const timeVal = document.getElementById('newDishTime')?.value.trim() || '12m prep';
    const badgeVal = document.getElementById('newDishBadge')?.value || 'chef';
    const emojiVal = document.getElementById('newDishEmoji')?.value.trim() || '🥘';
    const imgVal = document.getElementById('newDishImage')?.value.trim() || 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80';
    const descVal = document.getElementById('newDishDesc')?.value.trim() || 'Delicious homestyle specialty crafted fresh with rich spices.';

    const convertedSpan = document.getElementById('newDishPriceConverted');
    if (convertedSpan) convertedSpan.textContent = `≈ ${formatMoney(priceVal)}`;

    const prevName = document.getElementById('prevName');
    if (prevName) prevName.textContent = nameVal;

    const prevPrice = document.getElementById('prevPrice');
    if (prevPrice) prevPrice.textContent = formatMoney(priceVal);

    const prevTime = document.getElementById('prevTime');
    if (prevTime) prevTime.textContent = `⏱️ ${timeVal}`;

    const prevEmoji = document.getElementById('prevEmoji');
    if (prevEmoji) prevEmoji.textContent = emojiVal;

    const prevImg = document.getElementById('prevImg');
    if (prevImg) prevImg.src = imgVal;

    const prevDesc = document.getElementById('prevDesc');
    if (prevDesc) prevDesc.textContent = descVal;

    const prevBadge = document.getElementById('prevBadge');
    if (prevBadge) {
      const badgeMap = {
        chef: "⭐ Maa's Signature",
        bestseller: '🔥 Guest Favorite',
        time: '🌿 Fresh & Healthy'
      };
      prevBadge.textContent = badgeMap[badgeVal] || "Maa's Signature";
      prevBadge.className = `dish-tag ${badgeVal}`;
    }
  };

  const previewInputs = [
    'newDishName', 'newDishPrice', 'newDishTime', 'newDishBadge',
    'newDishEmoji', 'newDishImage', 'newDishDesc', 'newDishCalories', 'newDishAllergens'
  ];
  previewInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateChefDishPreview);
  });

  // Quick Emoji picker buttons
  document.querySelectorAll('.btn-emoji-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const emojiInput = document.getElementById('newDishEmoji');
      if (emojiInput) {
        emojiInput.value = btn.dataset.emoji;
        updateChefDishPreview();
      }
    });
  });

  // Photo preset buttons
  document.querySelectorAll('.btn-preset-photo').forEach(btn => {
    btn.addEventListener('click', () => {
      const imgInput = document.getElementById('newDishImage');
      if (imgInput) {
        imgInput.value = btn.dataset.img;
        updateChefDishPreview();
      }
    });
  });

  // Submit New Dish
  const submitBtn = document.getElementById('submitChefNewDishBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name = document.getElementById('newDishName')?.value.trim();
      const price = parseFloat(document.getElementById('newDishPrice')?.value);

      if (!name) {
        showToast('⚠️ Please enter a title for the new dish');
        document.getElementById('newDishName')?.focus();
        return;
      }
      if (isNaN(price) || price <= 0) {
        showToast('⚠️ Please enter a valid base price');
        document.getElementById('newDishPrice')?.focus();
        return;
      }

      const category = document.getElementById('newDishCategory')?.value || 'mains';
      const time = document.getElementById('newDishTime')?.value.trim() || '12m prep';
      const badge = document.getElementById('newDishBadge')?.value || 'chef';
      const emoji = document.getElementById('newDishEmoji')?.value.trim() || '🥘';
      const image = document.getElementById('newDishImage')?.value.trim() || 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80';
      const desc = document.getElementById('newDishDesc')?.value.trim() || 'Authentic homestyle culinary creation.';
      const calories = document.getElementById('newDishCalories')?.value.trim() || '520 kcal';
      const allergens = document.getElementById('newDishAllergens')?.value.trim() || 'None';

      const badgeMap = {
        chef: "⭐ Maa's Signature",
        bestseller: '🔥 Guest Favorite',
        time: '🌿 Fresh & Healthy'
      };

      const newDish = {
        id: `dish_maa_${Date.now()}`,
        name,
        category,
        badge,
        badgeText: badgeMap[badge] || "Maa's Signature",
        time,
        basePriceUSD: price,
        emoji,
        image,
        desc,
        calories,
        allergens,
        soldToday: 0,
        isOutOfStock: false
      };

      state.menu.unshift(newDish);
      closeAddModal();
      playRestaurantChime('success');
      launchConfettiCelebration(2600);
      showToast(`✨ Maa Chief published "${newDish.name}" to live menu! Converted across all 10 currencies.`);

      renderCustomerMenu();
      renderChefDishesList();
      renderOwnerPortal();
      renderAdaptiveMetrics();
    });
  }

  // Chief Price Adjustment Wiring
  let editingPriceDish = null;
  const priceModal = document.getElementById('chefAdjustPriceModal');
  const priceInput = document.getElementById('adjustPriceInput');
  const convertedPriceEl = document.getElementById('adjustLiveConvertedPrice');
  const currencyCodeEl = document.getElementById('adjustCurrentCurrencyCode');

  window.openAdjustPriceModal = (dish) => {
    editingPriceDish = dish;
    if (!priceModal) return;

    document.getElementById('adjustDishTitle').textContent = `Adjust Price – ${dish.name}`;
    document.getElementById('adjustDishName').textContent = dish.name;
    document.getElementById('adjustDishCategory').textContent = `${dish.category.toUpperCase()} • ${dish.badgeText}`;
    document.getElementById('adjustDishEmoji').textContent = dish.emoji;

    if (currencyCodeEl) currencyCodeEl.textContent = currentCurrency;
    if (priceInput) priceInput.value = dish.basePriceUSD.toFixed(2);
    if (convertedPriceEl) convertedPriceEl.textContent = formatMoney(dish.basePriceUSD);

    priceModal.classList.add('active');
    playRestaurantChime('tap');
  };

  const closePriceModal = () => {
    if (priceModal) priceModal.classList.remove('active');
    editingPriceDish = null;
  };

  const closeAdjustPriceModalBtn = document.getElementById('closeAdjustPriceModalBtn');
  if (closeAdjustPriceModalBtn) closeAdjustPriceModalBtn.addEventListener('click', closePriceModal);

  const cancelAdjustPriceBtn = document.getElementById('cancelAdjustPriceBtn');
  if (cancelAdjustPriceBtn) cancelAdjustPriceBtn.addEventListener('click', closePriceModal);

  if (priceModal) {
    priceModal.addEventListener('click', (e) => {
      if (e.target === priceModal) closePriceModal();
    });
  }

  const updatePriceLivePreview = () => {
    const val = parseFloat(priceInput?.value) || 0;
    if (convertedPriceEl) convertedPriceEl.textContent = formatMoney(val);
  };

  if (priceInput) {
    priceInput.addEventListener('input', updatePriceLivePreview);
  }

  const btnMinusDollar = document.getElementById('btnMinusDollar');
  if (btnMinusDollar) {
    btnMinusDollar.addEventListener('click', () => {
      let val = (parseFloat(priceInput.value) || 0) - 1.0;
      if (val < 0.5) val = 0.5;
      priceInput.value = val.toFixed(2);
      updatePriceLivePreview();
      playRestaurantChime('tap');
    });
  }

  const btnPlusDollar = document.getElementById('btnPlusDollar');
  if (btnPlusDollar) {
    btnPlusDollar.addEventListener('click', () => {
      let val = (parseFloat(priceInput.value) || 0) + 1.0;
      priceInput.value = val.toFixed(2);
      updatePriceLivePreview();
      playRestaurantChime('tap');
    });
  }

  document.querySelectorAll('.btn-price-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const delta = parseFloat(chip.dataset.delta) || 0;
      let val = (parseFloat(priceInput.value) || 0) + delta;
      if (val < 0.5) val = 0.5;
      priceInput.value = val.toFixed(2);
      updatePriceLivePreview();
      playRestaurantChime('tap');
    });
  });

  const saveAdjustPriceBtn = document.getElementById('saveAdjustPriceBtn');
  if (saveAdjustPriceBtn) {
    saveAdjustPriceBtn.addEventListener('click', () => {
      if (!editingPriceDish) return;
      const newPrice = parseFloat(priceInput.value);
      if (isNaN(newPrice) || newPrice <= 0) {
        showToast('⚠️ Please enter a valid price greater than 0');
        return;
      }

      editingPriceDish.basePriceUSD = newPrice;

      // Update any matching items in current cart as well
      state.cart.forEach(cartItem => {
        if (cartItem.id === editingPriceDish.id) {
          cartItem.basePriceUSD = newPrice;
        }
      });

      const updatedDishName = editingPriceDish.name;
      closePriceModal();
      playRestaurantChime('success');
      launchConfettiCelebration(1800);
      showToast(`💰 Updated "${updatedDishName}" price to ${formatMoney(newPrice)} across all 10 currencies!`);

      renderChefDishesList();
      renderCustomerMenu();
      updateCustomerCartUI();
      renderOwnerPortal();
      renderAdaptiveMetrics();
    });
  }

  renderChefPortal();
}

function renderChefPortal() {
  renderChefStations();
  renderChefOrders();
  renderChefPantry();
  renderChefDishesList();
}

function renderChefDishesList() {
  const container = document.getElementById('chefDishesAdminGrid');
  const countBadge = document.getElementById('chefDishesCountBadge');
  const countText = document.getElementById('chefDishesCount');
  if (countBadge) countBadge.textContent = state.menu.length;
  if (countText) countText.textContent = state.menu.length;

  if (!container) return;
  container.innerHTML = '';

  let list = state.menu;
  if (state.chefMenuCat && state.chefMenuCat !== 'all') {
    list = list.filter(d => d.category === state.chefMenuCat);
  }

  list.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'chef-dish-admin-card';
    const isOut = !!dish.isOutOfStock;
    const formattedPrice = formatMoney(dish.basePriceUSD);

    card.innerHTML = `
      <div class="chef-admin-top">
        <img src="${dish.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}" alt="${dish.name}" class="chef-admin-img" loading="lazy" />
        <div class="dish-img-emoji-badge">${dish.emoji}</div>
        <div class="dish-img-floating-badges">
          <span class="dish-tag ${dish.badge}">${dish.badgeText}</span>
          ${isOut ? '<span class="dish-tag" style="background:#f43f5e; color:#fff;">🚫 86\'d Out</span>' : '<span class="dish-tag" style="background:#10b981; color:#fff;">🟢 In Stock</span>'}
        </div>
      </div>
      <div class="chef-admin-body">
        <div class="chef-admin-title-row">
          <h4>${dish.name}</h4>
          <button class="btn-chef-price-badge" data-id="${dish.id}" title="Click to adjust price">
            ${formattedPrice} ✏️
          </button>
        </div>
        <div class="chef-admin-meta">
          <span>⏱️ ${dish.time}</span>
          <span>🔥 ${dish.calories}</span>
          <span>${dish.category.toUpperCase()}</span>
        </div>
        <p class="dish-desc" style="font-size: 0.8rem; line-height: 1.4; color: var(--text-muted);">${dish.desc}</p>
      </div>
      <div class="chef-admin-actions">
        <button class="btn-toggle-stock ${isOut ? 'out-of-stock' : 'in-stock'}" data-id="${dish.id}">
          ${isOut ? '🚫 86\'d (Click to Restock)' : '✓ In Stock (Click to 86)'}
        </button>
        <div class="chef-card-right-actions">
          <button class="btn-dish-adjust-price" data-id="${dish.id}" title="Adjust item price">
            💰 Adjust Price
          </button>
          <button class="btn-dish-delete" data-id="${dish.id}" title="Remove Dish">
            🗑️
          </button>
        </div>
      </div>
    `;

    card.querySelectorAll('.btn-chef-price-badge, .btn-dish-adjust-price').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.openAdjustPriceModal(dish);
      });
    });

    card.querySelector('.btn-toggle-stock').addEventListener('click', () => {
      dish.isOutOfStock = !dish.isOutOfStock;
      playRestaurantChime('tap');
      showToast(dish.isOutOfStock ? `🚫 "${dish.name}" marked 86'd (Sold Out)` : `✓ "${dish.name}" restocked & live on guest menu!`);
      renderChefDishesList();
      renderCustomerMenu();
    });

    card.querySelector('.btn-dish-delete').addEventListener('click', () => {
      const idx = state.menu.findIndex(d => d.id === dish.id);
      if (idx !== -1) {
        state.menu.splice(idx, 1);
        playRestaurantChime('tap');
        showToast(`🗑️ Removed "${dish.name}" from Maa Chief Kitchen menu`);
        renderChefDishesList();
        renderCustomerMenu();
        renderOwnerPortal();
      }
    });

    container.appendChild(card);
  });
}

function renderChefStations() {
  const container = document.getElementById('chefStationsStrip');
  if (!container) return;
  container.innerHTML = '';

  const stations = [
    { name: '🔥 Charcoal Grill Line', load: 85, color: 'linear-gradient(90deg, #ff416c, #ff4b2b)' },
    { name: '🍕 Wood-Fired Stone Oven', load: 60, color: 'linear-gradient(90deg, #f59e0b, #d97706)' },
    { name: '⚡ Sauté & Wok Dragon', load: 45, color: 'linear-gradient(90deg, #f43f5e, #ec4899)' },
    { name: '🍟 Deep Fryer Station', load: 35, color: 'linear-gradient(90deg, #eab308, #ca8a04)' },
    { name: '🥗 Cold Garde Manger', load: 20, color: 'linear-gradient(90deg, #10b981, #059669)' }
  ];

  stations.forEach(st => {
    const card = document.createElement('div');
    card.className = 'chef-station-card';
    card.innerHTML = `
      <div class="chef-station-header">
        <span>${st.name}</span>
        <span style="font-family: var(--font-mono); color: ${st.load > 70 ? '#f43f5e' : '#34d399'};">${st.load}% Load</span>
      </div>
      <div class="gauge-bar-bg">
        <div class="gauge-bar-fill" style="width: ${st.load}%; background: ${st.color};"></div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderChefOrders() {
  const container = document.getElementById('chefOrderCardsContainer');
  const countEl = document.getElementById('chefOrdersCount');
  const chefBadgeCount = document.getElementById('chefBadgeCount');

  if (!container) return;
  container.innerHTML = '';

  let list = state.orders;
  if (state.chefFilter === 'prepping') list = list.filter(o => o.step === 2);
  else if (state.chefFilter === 'cooking') list = list.filter(o => o.step === 3);
  else if (state.chefFilter === 'ready') list = list.filter(o => o.step === 4);

  countEl.textContent = state.orders.length;
  if (chefBadgeCount) chefBadgeCount.textContent = state.orders.length;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem 1rem; color:var(--text-dim); background:var(--surface-glass); border-radius:var(--radius-lg);">
        <div style="font-size:2.5rem; margin-bottom:0.4rem;">🎉</div>
        <h3>No active orders in this cooking stage</h3>
        <p style="font-size:0.85rem;">All tickets are currently clear!</p>
      </div>
    `;
    return;
  }

  const stepLabels = ['Placed', 'In Prep', 'Cooking', 'Ready 🛎️'];

  list.forEach(order => {
    const card = document.createElement('div');
    card.className = 'tracker-order-card';

    const isDelivery = order.diningType === 'Delivery';
    const progressPercent = ((order.step - 1) / 3) * 100;
    const isUrgent = order.elapsedMinutes > 12 && order.step < 4;

    const stepLabels = isDelivery
      ? ['Placed', 'Prepping', 'With Rider 🛵', 'Delivered 🎉']
      : ['Placed', 'In Prep', 'Cooking', 'Ready 🛎️'];

    let stepperNodes = stepLabels.map((label, idx) => {
      const stepNum = idx + 1;
      let statusClass = '';
      if (stepNum < order.step) statusClass = 'completed';
      else if (stepNum === order.step) statusClass = 'current';

      return `
        <div class="step-node ${statusClass}">
          <div class="step-circle">${stepNum < order.step ? '✓' : stepNum}</div>
          <span class="step-label">${label}</span>
        </div>
      `;
    }).join('');

    let itemsChips = order.items.map(item => `
      <span class="tracker-dish-chip">
        <strong>${item.qty}×</strong> ${item.name}
      </span>
    `).join('');

    let actionBtnText = '';
    if (order.step === 1) actionBtnText = '👨‍🍳 Begin Prep';
    else if (order.step === 2) actionBtnText = isDelivery ? '📦 Pack for Rider' : '🔥 Move to Cooking';
    else if (order.step === 3) actionBtnText = isDelivery ? '🛵 Handover to Rider' : '🛎️ Mark Ready to Serve';
    else actionBtnText = isDelivery ? '🎉 Confirm Delivery' : '✓ Serve & Complete';

    card.innerHTML = `
      <div class="tracker-card-top">
        <div class="tracker-order-title">
          <span class="tracker-order-id">#${order.id}</span>
          <span class="tracker-table-badge">${order.table}</span>
          <span class="tracker-dining-type" style="${isDelivery ? 'background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; font-weight: 800;' : ''}">
            ${isDelivery ? '🛵 Home Delivery' : `Guest: ${order.guest}`}
          </span>
        </div>
        <span class="tracker-timer-badge ${isUrgent ? 'urgent' : ''}">
          ⏱️ Ticket Age: ${order.elapsedMinutes}m
        </span>
      </div>

      <div class="order-stepper-wrap">
        <div class="stepper-line">
          <div class="stepper-line-fill" style="width: ${progressPercent}%;"></div>
        </div>
        ${stepperNodes}
      </div>

      <div class="tracker-items-chips">
        ${itemsChips}
      </div>

      <div class="tracker-card-actions">
        <span class="tracker-note-text">${order.notes ? `<strong>Chef Note:</strong> ${order.notes}` : ''}</span>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <button type="button" class="btn-tracker-receipt" style="font-size: 0.74rem; padding: 0.35rem 0.65rem;" data-id="${order.id}">
            🧾 Receipt
          </button>
          <button class="btn-advance-step" data-id="${order.id}">
            ${actionBtnText}
          </button>
        </div>
      </div>
    `;

    card.querySelector('.btn-tracker-receipt')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openReceiptModal(order);
    });

    card.querySelector('.btn-advance-step').addEventListener('click', () => {
      advanceChefOrder(order.id);
    });

    container.appendChild(card);
  });
}

function advanceChefOrder(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  const isDelivery = order.diningType === 'Delivery';

  if (order.step < 3) {
    order.step++;
    playRestaurantChime('tap');
    showToast(isDelivery
      ? `🛵 Order #${order.id} packed & ready for delivery rider dispatch!`
      : `Order #${order.id} advanced to "${order.step === 2 ? 'In Prep' : 'Cooking'}"`);
  } else if (order.step === 3) {
    order.step = 4;
    playRestaurantChime('ready');
    launchConfettiCelebration(1800);
    showToast(isDelivery
      ? `🎉 Order #${order.id} handed to rider Kabir and is now Out for Delivery!`
      : `🛎️ Order #${order.id} marked as READY for service!`);
  } else {
    const idx = state.orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      state.orders.splice(idx, 1);
      playRestaurantChime('ready');
      launchConfettiCelebration(1400);
      showToast(isDelivery
        ? `✅ Order #${orderId} marked successfully delivered to customer doorstep!`
        : `✅ Order #${orderId} served and closed!`);
    }
  }

  renderChefOrders();
  renderCustomerTracker();
  renderAdaptiveMetrics();
}


function renderChefPantry() {
  const container = document.getElementById('chefPantryMiniGrid');
  if (!container) return;
  container.innerHTML = '';

  state.pantry.forEach(item => {
    const card = document.createElement('div');
    card.className = 'pantry-mini-card';

    const is86 = item.status === '86';
    card.innerHTML = `
      <div class="pantry-mini-left">
        <span class="pantry-mini-icon">${item.icon}</span>
        <div>
          <div class="pantry-mini-name">${item.name}</div>
          <div class="pantry-mini-stock">${item.stock} / ${item.max} units • Station: ${item.station}</div>
        </div>
      </div>
      <button class="btn-pantry-toggle ${is86 ? 'is-86' : 'is-ok'}">
        ${is86 ? '🚫 86\'d' : '✓ Stocked'}
      </button>
    `;

    card.querySelector('.btn-pantry-toggle').addEventListener('click', () => {
      if (item.status === '86') {
        item.status = 'OK';
        item.stock = item.max;
        showToast(`✅ "${item.name}" restocked and available on menu`);
      } else {
        item.status = '86';
        item.stock = 0;
        showToast(`🚫 "${item.name}" marked 86'd across menu`);
      }
      playRestaurantChime('tap');
      renderChefPantry();
    });

    container.appendChild(card);
  });
}

// --------------------------------------------------------------------------
// 11. RESTAURANT OWNER PORTAL
// --------------------------------------------------------------------------
function initOwnerPortal() {
  const discountBtn = document.getElementById('ownerDiscountToggleBtn');
  if (discountBtn) {
    discountBtn.addEventListener('click', () => {
      state.isPromoActive = !state.isPromoActive;
      discountBtn.textContent = state.isPromoActive ? '✓ 15% Happy Hour Promo Active' : '⚡ Apply 15% Happy Hour Promo';
      discountBtn.classList.toggle('btn-primary', state.isPromoActive);
      discountBtn.classList.toggle('btn-secondary', !state.isPromoActive);

      playRestaurantChime('ready');
      if (state.isPromoActive) launchConfettiCelebration(1800);
      showToast(state.isPromoActive ? '🎉 15% Promo applied to all customer menu prices!' : '🔄 Promo ended, standard pricing restored.');

      renderOwnerPortal();
      renderCustomerMenu();
      updateCustomerCartUI();
    });
  }

  const exportBtn = document.getElementById('ownerExportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      playRestaurantChime('tap');
      showToast(`📥 Financial Report generated in ${currentCurrency}! Download simulated.`);
    });
  }

  // Kitchen Home Address & Delivery Operations setup
  const kitchenInputIds = [
    'ownerKitchenName', 'ownerKitchenStreet', 'ownerKitchenLandmark',
    'ownerKitchenCity', 'ownerKitchenPhone', 'ownerDeliveryRadius',
    'ownerDeliveryFee', 'ownerFreeDeliveryMin'
  ];

  kitchenInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateKitchenSettingsLivePreview);
    }
  });

  const saveKitchenAddressBtn = document.getElementById('saveKitchenAddressBtn');
  if (saveKitchenAddressBtn) {
    saveKitchenAddressBtn.addEventListener('click', () => {
      const name = document.getElementById('ownerKitchenName')?.value.trim();
      const street = document.getElementById('ownerKitchenStreet')?.value.trim();
      const landmark = document.getElementById('ownerKitchenLandmark')?.value.trim() || '';
      const city = document.getElementById('ownerKitchenCity')?.value.trim() || '';
      const phone = document.getElementById('ownerKitchenPhone')?.value.trim() || '';
      const radius = document.getElementById('ownerDeliveryRadius')?.value.trim() || '8.5 km';
      const feeVal = parseFloat(document.getElementById('ownerDeliveryFee')?.value);
      const freeMinVal = parseFloat(document.getElementById('ownerFreeDeliveryMin')?.value);

      if (!name) {
        showToast('⚠️ Please provide a Kitchen Brand Name.');
        document.getElementById('ownerKitchenName')?.focus();
        return;
      }
      if (!street) {
        showToast('⚠️ Please provide the Kitchen Street Address.');
        document.getElementById('ownerKitchenStreet')?.focus();
        return;
      }

      state.kitchenSettings = {
        name,
        street,
        landmark,
        city,
        phone,
        radius,
        deliveryFeeUSD: isNaN(feeVal) || feeVal < 0 ? 2.50 : feeVal,
        freeDeliveryMinUSD: isNaN(freeMinVal) || freeMinVal < 0 ? 35.00 : freeMinVal
      };

      try {
        localStorage.setItem('maa_kitchen_settings', JSON.stringify(state.kitchenSettings));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }

      updateKitchenSettingsLivePreview();
      updateCustomerCartUI();

      playRestaurantChime('ready');
      launchConfettiCelebration(2200);
      showToast(`🏠 Kitchen Home Address & Delivery settings saved! Orders will dispatch from ${name}.`);
    });
  }

  syncKitchenSettingsForm();
  renderOwnerPortal();
}

function syncKitchenSettingsForm() {
  const ks = state.kitchenSettings;
  if (!ks) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) {
      el.value = val !== undefined && val !== null ? val : '';
    }
  };

  setVal('ownerKitchenName', ks.name);
  setVal('ownerKitchenStreet', ks.street);
  setVal('ownerKitchenLandmark', ks.landmark);
  setVal('ownerKitchenCity', ks.city);
  setVal('ownerKitchenPhone', ks.phone);
  setVal('ownerDeliveryRadius', ks.radius);
  setVal('ownerDeliveryFee', ks.deliveryFeeUSD);
  setVal('ownerFreeDeliveryMin', ks.freeDeliveryMinUSD);

  updateKitchenSettingsLivePreview();
}

function updateKitchenSettingsLivePreview() {
  const ks = state.kitchenSettings || {};
  const name = document.getElementById('ownerKitchenName')?.value.trim() || ks.name || 'Maa Chief Kitchen & Culinary Hearth';
  const street = document.getElementById('ownerKitchenStreet')?.value.trim() || ks.street || '42 Culinary Boulevard';
  const landmark = document.getElementById('ownerKitchenLandmark')?.value.trim() || ks.landmark || 'Level 2, Artisan Food Plaza';
  const city = document.getElementById('ownerKitchenCity')?.value.trim() || ks.city || 'Downtown District, NY 10012';
  const phone = document.getElementById('ownerKitchenPhone')?.value.trim() || ks.phone || '+1 (555) 789-2433';
  const radius = document.getElementById('ownerDeliveryRadius')?.value.trim() || ks.radius || '8.5 km (5.3 miles)';
  const feeUSD = parseFloat(document.getElementById('ownerDeliveryFee')?.value) || (ks.deliveryFeeUSD !== undefined ? ks.deliveryFeeUSD : 2.50);
  const freeMinUSD = parseFloat(document.getElementById('ownerFreeDeliveryMin')?.value) || (ks.freeDeliveryMinUSD !== undefined ? ks.freeDeliveryMinUSD : 35.00);

  const fullAddressEl = document.getElementById('previewKitchenFullAddress');
  if (fullAddressEl) {
    const segments = [name, street, landmark, city].filter(Boolean);
    fullAddressEl.textContent = segments.join(' • ');
  }

  const phoneEl = document.getElementById('previewKitchenPhone');
  if (phoneEl) phoneEl.textContent = phone;

  const radiusEl = document.getElementById('previewDeliveryRadius');
  if (radiusEl) radiusEl.textContent = radius;

  const feeEl = document.getElementById('previewDeliveryFee');
  if (feeEl) feeEl.textContent = formatMoney(feeUSD);

  const freeThresholdEl = document.getElementById('previewFreeThreshold');
  if (freeThresholdEl) freeThresholdEl.textContent = formatMoney(freeMinUSD);

  const feeConvertedEl = document.getElementById('ownerDeliveryFeeConverted');
  if (feeConvertedEl) feeConvertedEl.textContent = `≈ ${formatMoney(feeUSD)}`;

  const freeConvertedEl = document.getElementById('ownerFreeDeliveryConverted');
  if (freeConvertedEl) freeConvertedEl.textContent = `≈ ${formatMoney(freeMinUSD)}`;

  const dispatchKitchenDisplay = document.getElementById('dispatchKitchenAddressDisplay');
  if (dispatchKitchenDisplay) {
    dispatchKitchenDisplay.textContent = `${name}, ${street}`;
  }
}

function renderOwnerPortal() {
  const ownerCurrencyDisplay = document.getElementById('ownerCurrencyDisplay');
  if (ownerCurrencyDisplay) {
    ownerCurrencyDisplay.textContent = `${currencyConfig[currentCurrency].flag} ${currentCurrency} (${currencyConfig[currentCurrency].symbol})`;
  }

  updateKitchenSettingsLivePreview();


  const baseGrossUSD = 4820.00;
  const netProfitUSD = baseGrossUSD * 0.68;
  const aovUSD = 48.20;
  const foodCostUSD = baseGrossUSD * 0.24;

  document.getElementById('kpiGrossSales').textContent = formatMoney(baseGrossUSD);
  document.getElementById('kpiNetProfit').textContent = formatMoney(netProfitUSD);
  document.getElementById('kpiAvgOrderValue').textContent = formatMoney(aovUSD);
  document.getElementById('kpiFoodCost').textContent = formatMoney(foodCostUSD);

  const hourlyValuesUSD = [140, 380, 740, 1120, 960, 650, 390, 160];
  hourlyValuesUSD.forEach((val, i) => {
    const barEl = document.getElementById(`barVal${i + 1}`);
    if (barEl) barEl.textContent = formatMoney(val);
  });

  renderOwnerTopDishes();
  renderOwnerCurrencyBreakdown(baseGrossUSD);
}

function renderOwnerTopDishes() {
  const container = document.getElementById('ownerTopDishesList');
  if (!container) return;
  container.innerHTML = '';

  const dishes = [...state.menu].sort((a, b) => (b.soldToday * b.basePriceUSD) - (a.soldToday * a.basePriceUSD)).slice(0, 5);

  dishes.forEach((dish, idx) => {
    const revenueUSD = dish.soldToday * dish.basePriceUSD;
    const formattedRevenue = formatMoney(revenueUSD);
    const pct = Math.round((dish.soldToday / 60) * 100);

    const row = document.createElement('div');
    row.className = 'top-dish-item';
    row.innerHTML = `
      <div class="top-dish-info">
        <span>#${idx + 1} ${dish.name} (${dish.soldToday} sold)</span>
        <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${formattedRevenue}</strong>
      </div>
      <div class="top-dish-bar-bg">
        <div class="top-dish-bar-fill" style="width: ${pct}%;"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderOwnerCurrencyBreakdown(baseGrossUSD) {
  const container = document.getElementById('ownerCurrencyBreakdownList');
  if (!container) return;
  container.innerHTML = '';

  Object.keys(currencyConfig).forEach(code => {
    const curr = currencyConfig[code];
    const converted = baseGrossUSD * curr.rate;
    const formatted = curr.decimals === 0 ? `${curr.symbol}${Math.round(converted).toLocaleString()}` : `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const row = document.createElement('div');
    row.className = 'currency-row';
    row.innerHTML = `
      <span>${curr.flag} ${curr.code} (Rate: 1 USD = ${curr.rate} ${curr.code})</span>
      <strong>${formatted}</strong>
    `;
    container.appendChild(row);
  });
}

// --------------------------------------------------------------------------
// 12. ADAPTIVE METRICS BAR
// --------------------------------------------------------------------------
function renderAdaptiveMetrics() {
  const bar = document.getElementById('metricsBar');
  if (!bar) return;

  if (currentRole === 'customer') {
    bar.innerHTML = `
      <div class="metric-card">
        <div class="metric-icon blue">🍽️</div>
        <div class="metric-data">
          <span class="metric-value">12 Specialties</span>
          <span class="metric-label">Menu Variety</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon orange">⏱️</div>
        <div class="metric-data">
          <span class="metric-value">12-15 min</span>
          <span class="metric-label">Avg Table Speed</span>
        </div>
        <span class="metric-badge success">Fresh to Order</span>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">⭐</div>
        <div class="metric-data">
          <span class="metric-value">4.92 / 5.0</span>
          <span class="metric-label">Guest Satisfaction</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon purple">💱</div>
        <div class="metric-data">
          <span class="metric-value">${currencyConfig[currentCurrency].flag} ${currentCurrency}</span>
          <span class="metric-label">Active Currency</span>
        </div>
      </div>
    `;
  } else if (currentRole === 'chef') {
    const activeLineCount = state.orders.length;
    const cookingNowCount = state.orders.filter(o => o.step === 3).length;
    const delayedCount = state.orders.filter(o => o.elapsedMinutes > 12).length;

    bar.innerHTML = `
      <div class="metric-card">
        <div class="metric-icon blue">👨‍🍳</div>
        <div class="metric-data">
          <span class="metric-value">${activeLineCount} Tickets</span>
          <span class="metric-label">Active Cooking Line</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon orange">🔥</div>
        <div class="metric-data">
          <span class="metric-value">${cookingNowCount} Dishes</span>
          <span class="metric-label">In Sauté / Fire Now</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">⏱️</div>
        <div class="metric-data">
          <span class="metric-value">${delayedCount}</span>
          <span class="metric-label">Delayed (>12 min)</span>
        </div>
        <span class="metric-badge success">${delayedCount === 0 ? 'On Time' : 'Attention'}</span>
      </div>
      <div class="metric-card">
        <div class="metric-icon purple">📦</div>
        <div class="metric-data">
          <span class="metric-value">${state.pantry.filter(p => p.status === '86').length} Items</span>
          <span class="metric-label">86'd Sold Out</span>
        </div>
      </div>
    `;
  } else if (currentRole === 'owner') {
    const baseGrossUSD = 4820.00;
    const netProfitUSD = baseGrossUSD * 0.68;

    bar.innerHTML = `
      <div class="metric-card">
        <div class="metric-icon green">💰</div>
        <div class="metric-data">
          <span class="metric-value">${formatMoney(baseGrossUSD)}</span>
          <span class="metric-label">Today's Gross Sales</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon orange">📈</div>
        <div class="metric-data">
          <span class="metric-value">${formatMoney(netProfitUSD)}</span>
          <span class="metric-label">Net Profit (68% Margin)</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon blue">🧾</div>
        <div class="metric-data">
          <span class="metric-value">${formatMoney(48.20)}</span>
          <span class="metric-label">Average Order Spend</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon purple">🥩</div>
        <div class="metric-data">
          <span class="metric-value">24% Ratio</span>
          <span class="metric-label">Food & Beverage Cost</span>
        </div>
        <span class="metric-badge success">Target Met</span>
      </div>
    `;
  }
}

// --------------------------------------------------------------------------
// 13. CULINARY DISH MODAL
// --------------------------------------------------------------------------
let selectedModalDish = null;

function initDishModal() {
  const modal = document.getElementById('dishModal');
  const closeBtns = document.querySelectorAll('#closeDishModalBtn, #closeDishModalBtn2');

  closeBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('active')));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  const addBtn = document.getElementById('modalAddToCartBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (selectedModalDish) {
        addDishToCart(selectedModalDish);
        modal.classList.remove('active');
      }
    });
  }
}

function openDishDetailsModal(dish) {
  selectedModalDish = dish;
  const modal = document.getElementById('dishModal');
  document.getElementById('modalDishName').textContent = dish.name;
  document.getElementById('modalDishCategory').textContent = `${dish.emoji} ${dish.category.toUpperCase()}`;
  document.getElementById('modalDishPrice').textContent = formatMoney(getDishEffectivePriceUSD(dish));

  const bodyEl = document.getElementById('modalDishBody');
  bodyEl.innerHTML = `
    <p style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 1rem; line-height: 1.6;">${dish.desc}</p>
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;">
      <span style="background: rgba(255,255,255,0.06); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--accent-cyan); font-weight: 700;">⏱️ ${dish.time}</span>
      <span style="background: rgba(255,255,255,0.06); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: #fff;">🔥 ${dish.calories}</span>
      <span style="background: rgba(255,255,255,0.06); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: #fca5a5;">Allergens: ${dish.allergens}</span>
    </div>
    <div style="background: rgba(0,0,0,0.25); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.06);">
      <h5 style="color: #fff; font-size: 0.85rem; margin-bottom: 0.3rem;">Chef's Plating Technique:</h5>
      <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">Made completely from scratch using fresh organic cuts. Fired to precision line temperatures and garnished with fresh herb oil and smoked sea salt.</p>
    </div>
  `;

  modal.classList.add('active');
}

// --------------------------------------------------------------------------
// 14. GUEST SIMULATION (HEADER BUTTON)
// --------------------------------------------------------------------------
function initGuestSimulation() {
  const btn = document.getElementById('simulateCustomerBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const randomPick = state.menu[Math.floor(Math.random() * state.menu.length)];
    const tableNum = `Table ${Math.floor(Math.random() * 18 + 1)}`;
    const newOrderId = `ORD-${Math.floor(Math.random() * 800 + 200)}`;

    const newOrder = {
      id: newOrderId,
      table: tableNum,
      guest: ['Sophia T.', 'Julian R.', 'Elena M.', 'Chef VIP'][Math.floor(Math.random() * 4)],
      diningType: 'Dine-In',
      step: 1,
      elapsedMinutes: 0,
      notes: 'New guest dining order',
      items: [
        { name: randomPick.name, qty: Math.floor(Math.random() * 2 + 1), basePriceUSD: randomPick.basePriceUSD }
      ]
    };

    state.orders.unshift(newOrder);
    playRestaurantChime('bell');
    showToast(`⚡ New guest order #${newOrder.id} placed for ${tableNum}!`);

    renderCustomerTracker();
    renderChefOrders();
    renderAdaptiveMetrics();
  });
}

// --------------------------------------------------------------------------
// 15. TOAST NOTIFICATIONS (WITH TIMED PROGRESS BAR)
// --------------------------------------------------------------------------
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px) scale(0.95)';
    toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// --------------------------------------------------------------------------
// 16. INITIAL RENDER
// --------------------------------------------------------------------------
function renderAllPortals() {
  renderAdaptiveMetrics();
  renderCustomerMenu();
  updateCustomerCartUI();
  renderCustomerTracker();
  renderChefPortal();
  renderOwnerPortal();
  const priceInput = document.getElementById('newDishPrice');
  const convertedSpan = document.getElementById('newDishPriceConverted');
  if (priceInput && convertedSpan) {
    convertedSpan.textContent = `≈ ${formatMoney(parseFloat(priceInput.value) || 0)}`;
  }
}

// --------------------------------------------------------------------------
// 17. INTERACTIVE RECEIPT & INVOICE MODAL
// --------------------------------------------------------------------------
let activeReceiptOrder = null;

function initReceiptModal() {
  const modal = document.getElementById('receiptModal');
  const closeBtns = document.querySelectorAll('#closeReceiptModalBtn, #closeReceiptModalBtn2');

  closeBtns.forEach(btn => btn?.addEventListener('click', () => modal?.classList.remove('active')));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  const printBtn = document.getElementById('printReceiptBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const copyBtn = document.getElementById('copyReceiptTextBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!activeReceiptOrder) return;
      const ks = state.kitchenSettings || {};
      const subtotalUSD = activeReceiptOrder.items.reduce((s, i) => s + (i.qty * i.basePriceUSD), 0);
      const isDelivery = activeReceiptOrder.diningType === 'Delivery';
      const feeUSD = isDelivery ? (subtotalUSD >= (ks.freeDeliveryMinUSD || 35) ? 0 : (ks.deliveryFeeUSD || 2.50)) : 0;
      const taxUSD = subtotalUSD * 0.10;
      const grandTotalUSD = subtotalUSD + feeUSD + taxUSD;

      let text = `==============================\n`;
      text += `🥘 ${ks.name || 'MAA CHIEF KITCHEN'}\n`;
      text += `${ks.street || '42 Culinary Blvd'}, ${ks.city || 'NY 10012'}\n`;
      text += `Helpline: ${ks.phone || '+1 (555) 789-2433'}\n`;
      text += `==============================\n`;
      text += `Receipt No: #MCK-${activeReceiptOrder.id.replace('ORD-', '')}\n`;
      text += `Order Ref: #${activeReceiptOrder.id}\n`;
      text += `Service: ${isDelivery ? 'Home Delivery' : activeReceiptOrder.diningType}\n`;
      if (isDelivery && activeReceiptOrder.deliveryStreet) {
        text += `Delivery Address: ${activeReceiptOrder.deliveryStreet}\n`;
        text += `Phone: ${activeReceiptOrder.deliveryPhone || 'N/A'}\n`;
      }
      text += `------------------------------\nITEMS:\n`;
      activeReceiptOrder.items.forEach(item => {
        text += `- ${item.qty}x ${item.name} (${formatMoney(item.basePriceUSD * item.qty)})\n`;
      });
      text += `------------------------------\n`;
      text += `Subtotal: ${formatMoney(subtotalUSD)}\n`;
      if (isDelivery) {
        text += `Delivery Fee: ${feeUSD === 0 ? 'FREE' : formatMoney(feeUSD)}\n`;
      }
      text += `Service & Tax (10%): ${formatMoney(taxUSD)}\n`;
      text += `TOTAL: ${formatMoney(grandTotalUSD)} (${currentCurrency})\n`;
      text += `==============================\n`;
      text += `Thank you for dining with Maa Chief Kitchen!\n`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('📋 Receipt invoice copied to clipboard!');
          playRestaurantChime('ready');
        }).catch(() => {
          showToast('📋 Invoice generated and ready to print.');
        });
      } else {
        showToast('📋 Invoice generated and ready to print.');
      }
    });
  }
}

function openReceiptModal(order) {
  activeReceiptOrder = order;
  const modal = document.getElementById('receiptModal');
  if (!modal) return;

  const ks = state.kitchenSettings || {};
  const isDelivery = order.diningType === 'Delivery';

  const addressEl = document.getElementById('receiptKitchenAddress');
  if (addressEl) {
    const parts = [ks.street, ks.landmark, ks.city].filter(Boolean);
    addressEl.textContent = parts.join(', ') || '42 Culinary Boulevard, Gourmet Haven, NY 10012';
  }

  const phoneEl = document.getElementById('receiptKitchenPhone');
  if (phoneEl) {
    phoneEl.textContent = `Helpline: ${ks.phone || '+1 (555) 789-2433'}`;
  }

  const receiptIdEl = document.getElementById('receiptId');
  if (receiptIdEl) {
    receiptIdEl.textContent = `#MCK-${order.id.replace('ORD-', '')}${Math.floor(Math.random() * 89 + 10)}`;
  }

  const orderIdEl = document.getElementById('receiptOrderId');
  if (orderIdEl) {
    orderIdEl.textContent = `#${order.id}`;
  }

  const dateTimeEl = document.getElementById('receiptDateTime');
  if (dateTimeEl) {
    const now = new Date();
    dateTimeEl.textContent = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  const diningTypeEl = document.getElementById('receiptDiningType');
  if (diningTypeEl) {
    diningTypeEl.textContent = isDelivery ? '🛵 Home Delivery' : `🍽️ ${order.diningType} (${order.table})`;
  }

  const deliveryBlock = document.getElementById('receiptDeliveryBlock');
  if (deliveryBlock) {
    if (isDelivery) {
      deliveryBlock.style.display = 'block';
      const destAddr = document.getElementById('receiptDeliveryAddress');
      const destPhone = document.getElementById('receiptDeliveryPhone');
      const destNotes = document.getElementById('receiptDeliveryNotes');
      if (destAddr) destAddr.textContent = order.deliveryStreet || 'Customer Address';
      if (destPhone) destPhone.textContent = order.deliveryPhone || 'N/A';
      if (destNotes) {
        if (order.deliveryDoorNotes) {
          destNotes.style.display = 'block';
          destNotes.textContent = `💬 Note: ${order.deliveryDoorNotes}`;
        } else {
          destNotes.style.display = 'none';
        }
      }
    } else {
      deliveryBlock.style.display = 'none';
    }
  }

  const tbody = document.getElementById('receiptItemsBody');
  if (tbody) {
    tbody.innerHTML = '';
    order.items.forEach(item => {
      const itemTotalUSD = item.qty * item.basePriceUSD;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="item-title">${item.name}</span></td>
        <td style="text-align: center;">${item.qty}×</td>
        <td style="text-align: right;">${formatMoney(item.basePriceUSD)}</td>
        <td style="text-align: right; font-weight: 700;">${formatMoney(itemTotalUSD)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const subtotalUSD = order.items.reduce((sum, item) => sum + (item.qty * item.basePriceUSD), 0);
  let feeUSD = 0;
  const deliveryRow = document.getElementById('receiptDeliveryRow');
  const deliveryFeeEl = document.getElementById('receiptDeliveryFee');

  if (isDelivery) {
    const freeMinUSD = ks.freeDeliveryMinUSD !== undefined ? ks.freeDeliveryMinUSD : 35.00;
    if (subtotalUSD >= freeMinUSD) {
      feeUSD = 0;
      if (deliveryFeeEl) deliveryFeeEl.textContent = 'FREE 🎉 (Over Threshold)';
    } else {
      feeUSD = ks.deliveryFeeUSD !== undefined ? ks.deliveryFeeUSD : 2.50;
      if (deliveryFeeEl) deliveryFeeEl.textContent = formatMoney(feeUSD);
    }
    if (deliveryRow) deliveryRow.style.display = 'flex';
  } else {
    if (deliveryRow) deliveryRow.style.display = 'none';
  }

  const taxUSD = subtotalUSD * 0.10;
  const grandTotalUSD = subtotalUSD + feeUSD + taxUSD;

  const subtotalEl = document.getElementById('receiptSubtotal');
  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotalUSD);

  const taxEl = document.getElementById('receiptTax');
  if (taxEl) taxEl.textContent = formatMoney(taxUSD);

  const grandTotalEl = document.getElementById('receiptGrandTotal');
  if (grandTotalEl) grandTotalEl.textContent = formatMoney(grandTotalUSD);

  const currencyNotice = document.getElementById('receiptCurrencyNotice');
  if (currencyNotice) {
    currencyNotice.innerHTML = `Settled in: <strong>${currencyConfig[currentCurrency].flag} ${currentCurrency} (${currencyConfig[currentCurrency].symbol})</strong> • Live Forex Multi-Currency Engine`;
  }

  const barcodeEl = document.getElementById('receiptBarcodeNumber');
  if (barcodeEl) {
    barcodeEl.textContent = `${order.id.replace('ORD-', '')}-MAA-CHIEF-${currentCurrency}`;
  }

  playRestaurantChime('tap');
  modal.classList.add('active');
}

// --------------------------------------------------------------------------
// 18. LIVE DELIVERY RIDER ROUTE & GPS SIMULATOR
// --------------------------------------------------------------------------
let activeGpsOrder = null;
let currentGpsStage = 2; // 1: Kitchen, 2: Transit, 3: Neighborhood, 4: Delivered

function initDeliveryGpsModal() {
  const modal = document.getElementById('deliveryGpsModal');
  const closeBtns = document.querySelectorAll('#closeDeliveryGpsModalBtn, #closeDeliveryGpsModalBtn2');

  closeBtns.forEach(btn => btn?.addEventListener('click', () => modal?.classList.remove('active')));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  const callRiderBtn = document.getElementById('callRiderBtn');
  if (callRiderBtn) {
    callRiderBtn.addEventListener('click', () => {
      playRestaurantChime('ready');
      showToast('📞 Calling Rider Kabir (+1 555-0182)... "Hello! I have your fresh food safely in the thermal bag!"');
    });
  }

  const advanceBtn = document.getElementById('simAdvanceStageBtn');
  if (advanceBtn) {
    advanceBtn.addEventListener('click', () => {
      let nextStage = currentGpsStage + 1;
      if (nextStage > 4) nextStage = 4;
      setGpsStage(nextStage);
    });
  }

  const instantBtn = document.getElementById('simInstantDeliverBtn');
  if (instantBtn) {
    instantBtn.addEventListener('click', () => {
      setGpsStage(4);
    });
  }

  const resetBtn = document.getElementById('simResetRouteBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      setGpsStage(1);
    });
  }

  const viewReceiptBtn = document.getElementById('gpsViewReceiptBtn');
  if (viewReceiptBtn) {
    viewReceiptBtn.addEventListener('click', () => {
      if (activeGpsOrder) {
        modal?.classList.remove('active');
        setTimeout(() => openReceiptModal(activeGpsOrder), 200);
      }
    });
  }
}

function openDeliveryGpsModal(order) {
  activeGpsOrder = order;
  const modal = document.getElementById('deliveryGpsModal');
  if (!modal) return;

  const ks = state.kitchenSettings || {};

  const titleEl = document.getElementById('gpsModalTitle');
  if (titleEl) titleEl.textContent = `Tracking Delivery for Order #${order.id}`;

  const hubEl = document.getElementById('gpsHubName');
  if (hubEl) hubEl.textContent = ks.name || 'Maa Chief Kitchen';

  const destEl = document.getElementById('gpsDestName');
  if (destEl) destEl.textContent = order.deliveryStreet || 'Customer Residence';

  // Align stage with order status
  let initialStage = 2;
  if (order.step === 1 || order.step === 2) initialStage = 1;
  else if (order.step === 3) initialStage = 2;
  else if (order.step === 4) initialStage = 4;

  setGpsStage(initialStage, false);

  playRestaurantChime('tap');
  modal.classList.add('active');
}

function setGpsStage(stageNum, announce = true) {
  currentGpsStage = stageNum;

  const roadFill = document.getElementById('gpsRoadFill');
  const scooterMarker = document.getElementById('gpsScooterMarker');
  const speedTag = document.getElementById('gpsSpeedTag');
  const etaText = document.getElementById('gpsEtaText');
  const headlineEl = document.getElementById('gpsStageHeadline');
  const subtextEl = document.getElementById('gpsStageSubtext');
  const progressPctEl = document.getElementById('gpsProgressPct');

  let pct = 20;
  let eta = '~28 mins';
  let speed = '0 km/h';
  let headline = 'Freshly Packed at Kitchen Hub';
  let subtext = '• Order sealed in thermal insulated carrier';

  if (stageNum === 1) {
    pct = 12;
    eta = '~28 mins';
    speed = '0 km/h';
    headline = 'Freshly Packed at Kitchen Hub';
    subtext = '• Order sealed in thermal insulated carrier';
  } else if (stageNum === 2) {
    pct = 45;
    eta = '~16 mins';
    speed = '34 km/h';
    headline = 'Cruising down Artisan Boulevard';
    subtext = '• 1.8 km remaining to destination';
  } else if (stageNum === 3) {
    pct = 80;
    eta = '~5 mins';
    speed = '18 km/h';
    headline = 'Entering Your Neighborhood';
    subtext = '• Approaching customer street & landmark';
  } else if (stageNum === 4) {
    pct = 100;
    eta = 'Arrived! 🎉';
    speed = '0 km/h';
    headline = 'Delivered to Doorstep';
    subtext = '• Handed over with warm greetings! Enjoy!';
  }

  if (roadFill) roadFill.style.width = `${pct}%`;
  if (scooterMarker) scooterMarker.style.left = `${pct}%`;
  if (speedTag) speedTag.textContent = speed;
  if (etaText) etaText.textContent = eta;
  if (headlineEl) headlineEl.textContent = headline;
  if (subtextEl) subtextEl.textContent = subtext;
  if (progressPctEl) progressPctEl.textContent = `${pct}% Route Completed`;

  // Update waypoints
  for (let i = 1; i <= 4; i++) {
    const wp = document.getElementById(`wp${i}`);
    if (wp) {
      wp.classList.remove('completed', 'current');
      if (i < stageNum) wp.classList.add('completed');
      else if (i === stageNum) wp.classList.add('current');
    }
  }

  if (activeGpsOrder && stageNum === 4) {
    activeGpsOrder.step = 4;
    renderCustomerTracker();
    renderChefOrders();
    if (announce) {
      playRestaurantChime('bell');
      launchConfettiCelebration(2500);
      showToast(`🎉 Order #${activeGpsOrder.id} has been delivered to your door!`);
    }
  } else if (announce) {
    playRestaurantChime('tap');
    showToast(`🛵 Stage updated: ${headline}`);
  }
}

