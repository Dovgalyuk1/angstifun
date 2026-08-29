/* ==========================================================================
   AngstiFun ($ANGSTIFUN) — script.js
   Впиши CA / соцсети сюда, когда токен заминтится — остальное подключится
   само (кнопки, копирование CA, live-статы через DexScreener).
   ========================================================================== */

const CONFIG = {
  CA: "",                 // например "Ea5C...pump" — пока пусто = "not minted yet"
  BUY_URL: "",             // например "https://pump.fun/coin/<CA>"
  CHART_URL: "",           // например "https://dexscreener.com/solana/<CA>"
  X_URL: "",                // ссылка на твиттер/X
  TELEGRAM_URL: "",         // ссылка на телеграм
};

document.addEventListener("DOMContentLoaded", () => {
  initCA();
  initButtons();
  initBurgerMenu();
  initCopy();
  initSound();
  initFloaters();
  initReveal();
  initFlightGlow();
  initDustCounter();
  initLiveStats();
});

/* ---------------- toast ---------------- */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------------- CA display ---------------- */
function initCA() {
  const display = CONFIG.CA ? shortenCA(CONFIG.CA) : "not minted yet";
  document.querySelectorAll("#caValue, #caValueFooter").forEach((el) => {
    el.textContent = display;
  });
}

function shortenCA(ca) {
  if (ca.length <= 14) return ca;
  return ca.slice(0, 6) + "..." + ca.slice(-6);
}

/* ---------------- copy CA ---------------- */
function initCopy() {
  document.querySelectorAll("#copyCaBtn, #copyCaBtnFooter").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!CONFIG.CA) {
        showToast("No capsule minted yet ✦");
        return;
      }
      try {
        await navigator.clipboard.writeText(CONFIG.CA);
        showToast("Contract copied to clipboard");
      } catch {
        showToast("Couldn't copy — long-press to select manually");
      }
    });
  });
}

/* ---------------- buttons (buy / chart / x / tg) ---------------- */
function initButtons() {
  wireLink(["buyBtn", "buyHeaderBtn"], CONFIG.BUY_URL, "The delivery hasn't shipped yet — no token minted");
  wireLink(["chartBtn", "footerChartBtn"], CONFIG.CHART_URL, "No chart yet — dispatch is still quiet");
  wireLink(["xBtn", "footerXBtn"], CONFIG.X_URL, "X account coming soon");
  wireLink(["footerTgBtn"], CONFIG.TELEGRAM_URL, "Telegram coming soon");
}

function wireLink(ids, url, fallbackMsg) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", (e) => {
      if (!url) {
        e.preventDefault();
        showToast(fallbackMsg);
        return;
      }
      el.setAttribute("href", url);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  });
}

/* ---------------- burger menu ---------------- */
function initBurgerMenu() {
  const burger = document.getElementById("burgerBtn");
  const nav = document.getElementById("mainNav");
  if (!burger || !nav) return;
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
}

/* ---------------- sound (little chime, synthesized) ---------------- */
let audioCtx = null;
let soundOn = false;

function initSound() {
  const btn = document.getElementById("soundToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    soundOn = !soundOn;
    btn.textContent = soundOn ? "🔊" : "🔇";
    if (soundOn) playChime();
  });
}

function playChime() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = [1046, 1318, 1568]; // a little sparkle arpeggio
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = audioCtx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch (e) {
    /* audio not available — silently ignore */
  }
}

/* ---------------- floating stars ---------------- */
function initFloaters() {
  const wrap = document.getElementById("floaters");
  if (!wrap) return;
  const glyphs = ["✦", "✧", "⋆"];
  const count = window.innerWidth < 760 ? 8 : 16;
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "floater-star";
    span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    span.style.left = Math.random() * 100 + "vw";
    span.style.fontSize = 10 + Math.random() * 16 + "px";
    span.style.animationDuration = 16 + Math.random() * 18 + "s";
    span.style.animationDelay = -(Math.random() * 24) + "s";
    wrap.appendChild(span);
  }
}

/* ---------------- reveal-on-scroll ---------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------------- glow flash on "The Flight" step ---------------- */
function initFlightGlow() {
  const step = document.getElementById("flightStep");
  if (!step) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerGlow();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  io.observe(step);

  function triggerGlow() {
    step.classList.add("impact-glow");
    if (soundOn) playChime();
    setTimeout(() => step.classList.remove("impact-glow"), 650);
  }

  setInterval(() => {
    const rect = step.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      step.classList.add("impact-glow");
      setTimeout(() => step.classList.remove("impact-glow"), 650);
    }
  }, 3400);
}

/* ---------------- fake "dust sprinkled tonight" counter ---------------- */
function initDustCounter() {
  const el = document.getElementById("dustCounter");
  if (!el) return;
  const target = 41200 + Math.floor(Math.random() * 4000);
  let current = 0;
  const step = Math.max(1, Math.round(target / 90));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tick();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(el);

  function tick() {
    current = Math.min(target, current + step);
    el.textContent = current.toLocaleString("en-US");
    if (current < target) requestAnimationFrame(() => setTimeout(tick, 16));
  }
}

/* ---------------- live stats via DexScreener ---------------- */
function initLiveStats() {
  if (!CONFIG.CA) return; // stays on N/A placeholders until a CA is set

  fetchLive();
  setInterval(fetchLive, 30000);

  async function fetchLive() {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONFIG.CA}`);
      const data = await res.json();
      const pair = data && data.pairs && data.pairs[0];
      if (!pair) return;

      setStat("price", pair.priceUsd ? `$${Number(pair.priceUsd).toFixed(6)}` : "N/A");
      setStat("mcap", formatUsd(pair.fdv || pair.marketCap));
      setStat("liquidity", formatUsd(pair.liquidity && pair.liquidity.usd));
      setStat("volume", formatUsd(pair.volume && pair.volume.h24));
    } catch (e) {
      /* DexScreener unavailable — leave placeholders as-is */
    }
  }
}

function setStat(key, value) {
  const el = document.querySelector(`[data-stat="${key}"]`);
  if (el && value) el.textContent = value;
}

function formatUsd(n) {
  if (!n && n !== 0) return "N/A";
  n = Number(n);
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}
