/* animations.js - Decorative + interactive animation layer
   - Uses tsparticles, gsap, lottie (CDN loaded in index.html)
   - Non-destructive: pointer-events none for backgrounds, doesn't mutate your core Firebase code.
*/

// wait until DOM ready
document.addEventListener('DOMContentLoaded', () => {

  // 1) particles background
  if (typeof tsParticles !== 'undefined') {
    tsParticles.load("tsparticles-canvas", {
      fullScreen: { enable: false },
      background: { color: "transparent" },
      fpsLimit: 60,
      particles: {
        number: { value: 40 },
        color: { value: ["#ff6b6b","#ffd93d","#7afcff","#b694ff"] },
        shape: { type: "circle" },
        opacity: { value: 0.18, random: true },
        size: { value: { min: 6, max: 36 } },
        move: { enable: true, speed: 0.6, direction: "bottom", outModes: "bounce" },
        links: { enable: false }
      },
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" }, onClick: { enable: true, mode: "push" } },
        modes: { repulse: { distance: 140 }, push: { quantity: 4 } }
      }
    }).catch(console.warn);
  }

  // 2) Lottie floating animations
  const lottieEls = document.querySelectorAll('.lottie');
  if (lottieEls.length > 0 && typeof lottie !== 'undefined') {
    lottieEls.forEach((el, idx) => {
      const src = el.dataset.src;
      try {
        lottie.loadAnimation({
          container: el, renderer: 'svg', loop: true, autoplay: true, path: src
        });
        // slight float animation using GSAP if available
        if (typeof gsap !== 'undefined') {
          gsap.to(el, { y: -12 - (idx*4), duration: 6 + idx, repeat: -1, yoyo: true, ease: "sine.inOut" });
        }
      } catch(e) { console.warn('lottie error', e); }
    });
  }

  // 3) subtle blob morph
  const blob = document.getElementById('blob-layer');
  if (blob && typeof gsap !== 'undefined') {
    gsap.to(blob, { duration: 20, x: 80, y: -50, rotate: 18, ease: "sine.inOut", repeat: -1, yoyo: true });
  }

  // 4) Populate project info quick summary (safe short extracts)
  const docOverviewEl = document.getElementById('docOverview');
  const docFeaturesEl = document.getElementById('docFeatures');
  const docBOMEl = document.getElementById('docBOM');

  if (docOverviewEl) {
    docOverviewEl.innerText = "AI-Driven Smart Home: real-time control & monitoring of fan, light, PIR light with gas emergency shutdown. Edge AI + Firebase real-time sync with privacy-first design.";
  }
  const feats = ['Realtime occupancy & sensor monitoring', 'Gas emergency shutdown & auto-relay', 'Auto/Manual modes via Firebase', 'Edge ML for events (scream/gas)'];
  feats.forEach(f => { const li = document.createElement('li'); li.innerText = f; if (docFeaturesEl) docFeaturesEl.appendChild(li); });

  const boms = ['ESP8266/ESP32', 'BME680 / DHT11', 'MQ2 gas sensor', 'Relays 3-channel', 'Power supply 5V/12V'];
  boms.forEach(b => { const li = document.createElement('li'); li.innerText = b; if (docBOMEl) docBOMEl.appendChild(li); });

  // 5) micro-interactions: animate cards into view
  if (typeof gsap !== 'undefined') {
    gsap.from(".card", { duration: 1, y: 24, opacity: 0, stagger: 0.08, ease: "power2.out" });
  }

  // 6) Pulse visuals synchronized with real values (reads your element values but won't change them)
  function syncPulse() {
    // gas value highlighting
    const gasEl = document.getElementById('gasVal');
    const aiEl = document.getElementById('aiStatus');
    if (gasEl) {
      const raw = gasEl.innerText || "";
      // if gas contains numbers > threshold, trigger glow
      const num = parseInt(raw.replace(/[^\d]/g, '')) || 0;
      const parentCard = gasEl.closest('.status-tile');
      if (num > 300) {
        if (parentCard) parentCard.style.boxShadow = "0 0 40px rgba(255,61,0,0.12)";
      } else {
        if (parentCard) parentCard.style.boxShadow = "";
      }
    }
    // AI status breathing
    if (aiEl && typeof gsap !== 'undefined') {
      const text = (aiEl.innerText || "").toLowerCase();
      const container = aiEl.closest('.ai-box') || aiEl;
      if (text.includes('gas') || text.includes('alert') || text.includes('danger')) {
        gsap.to(container, { boxShadow: "0 0 40px #ff3d00", duration: 0.8, repeat: -1, yoyo: true });
      } else {
        gsap.to(container, { boxShadow: "0 0 10px rgba(0,235,255,0.06)", duration: 1, repeat: 0 });
      }
    }
  }
  setInterval(syncPulse, 1200);

  // 7) demo buttons (simulate events) - they only dispatch DOM events so your script.js can hook into them if designed for it
  const demoGas = document.getElementById('demoGas');
  if (demoGas) {
    demoGas.addEventListener('click', () => {
      // visual flash
      if (typeof gsap !== 'undefined') {
        gsap.fromTo("#main", { filter: "hue-rotate(0deg)" }, { duration: 0.5, filter: "hue-rotate(30deg)", yoyo:true, repeat:1 });
      }
      // push an alert item locally
      const feed = document.getElementById('eventsFeed');
      if (feed) {
        const ev = document.createElement('div'); ev.className = 'event critical';
        ev.innerHTML = `<strong>Gas Alert</strong><div>Simulated gas spike at ${new Date().toLocaleTimeString()}</div>`;
        feed.prepend(ev);
      }
      // optional: announce for a11y
      const aria = document.getElementById('ariaAnnouncements');
      if (aria) aria.innerText = 'Simulated gas alarm triggered';
    });
  }

  const demoClean = document.getElementById('demoClean');
  if (demoClean) {
    demoClean.addEventListener('click', () => {
      const feed = document.getElementById('eventsFeed');
      if (feed) {
        const ev = document.createElement('div'); ev.className = 'event';
        ev.innerHTML = `<strong>Cleaning Ticket</strong><div>Auto generated at ${new Date().toLocaleTimeString()}</div>`;
        feed.prepend(ev);
      }
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(".card-large", { y: 0 }, { duration: 0.45, y: -8, yoyo:true, repeat:1 });
      }
      const aria = document.getElementById('ariaAnnouncements');
      if (aria) aria.innerText = 'Cleaning ticket created';
    });
  }

  // 8) info panel toggle
  const infoToggle = document.getElementById('infoToggle');
  if (infoToggle) {
    infoToggle.addEventListener('click', () => {
      const card = document.getElementById('infoCard');
      if (card) card.classList.toggle('hidden');
    });
  }

});
