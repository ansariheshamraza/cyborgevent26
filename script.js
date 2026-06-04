/* =====================================================
   AUDIO ENGINE
===================================================== */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(freq, type, duration, gainVal, attack, decay) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainVal || 0.08, ctx.currentTime + (attack || 0.01));
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (duration || 0.15));
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (duration || 0.15));
  } catch(e) {}
}

function playClick() {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    src.buffer = buf;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    src.start(ctx.currentTime);
  } catch(e) {}
}

function playHover() { playTone(1200, 'sine', 0.06, 0.04, 0.005, 0.06); }
function playNavClick() { playTone(440, 'square', 0.12, 0.06, 0.005, 0.12); playTone(660, 'sine', 0.1, 0.04, 0.02, 0.1); }
function playSectionEnter() { playTone(220, 'sawtooth', 0.2, 0.03, 0.01, 0.2); }
function playScrollBeep() { playTone(880, 'sine', 0.05, 0.03, 0.003, 0.05); }
function playEngineRev(intensity = 0.5) {
  try {
    const ctx = getAudioCtx();
    const duration = 0.4;
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    
    // Create engine rumble sound with multiple harmonics
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      const baseFreq = 150 + intensity * 320;
      const harmonic1 = Math.sin(2 * Math.PI * baseFreq * t);
      const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.4;
      const harmonic3 = Math.sin(2 * Math.PI * baseFreq * 0.7 * t) * 0.3;
      
      // Add pitch increase over time for acceleration effect
      const pitchEnvelope = Math.sin(2 * Math.PI * (baseFreq + t * 400 * intensity) * t);
      const envelope = (1 - t * 0.7) * (0.3 + intensity * 0.7);
      
      data[i] = (harmonic1 + harmonic2 + harmonic3 + pitchEnvelope) * envelope * 0.25;
    }
    
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400 + intensity * 600;
    src.buffer = buf;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15 * intensity, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.start(ctx.currentTime);
  } catch(e) {}
}
/* =====================================================
   SCROLL - NORMAL BEHAVIOR (Lenis removed)
===================================================== */
// Normal scroll behavior - no smooth scroll library

/* =====================================================
   HAMBURGER MENU
===================================================== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  console.log('Hamburger menu initialized');
  
  navToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Hamburger clicked, toggling menu');
    
    this.classList.toggle('active');
    navLinks.classList.toggle('active');
    
    console.log('Menu is now:', navLinks.classList.contains('active') ? 'open' : 'closed');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      console.log('Nav link clicked, closing menu');
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
} else {
  console.error('Hamburger menu elements not found');
}

/* =====================================================
   GSAP INIT
===================================================== */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* =====================================================
   HERO CANVAS — Neural net
===================================================== */
(function() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  function draw() {
    // Draw gradient background only (no particles)
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, 'rgba(10, 10, 18, 0.9)');
    gradient.addColorStop(0.5, 'rgba(15, 10, 30, 0.95)');
    gradient.addColorStop(1, 'rgba(5, 5, 15, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Center glow overlay
    if (w > 0 && h > 0) {
      const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * .55);
      g.addColorStop(0, 'rgba(0,245,255,0.02)');
      g.addColorStop(1, 'rgba(5,5,9,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* =====================================================
   ROTATING HERO SCENARIOS
===================================================== */
const heroScenarios = [
  {
    heading: "Innovate",
    subheading: "2026",
    tagline: "Push the boundaries of what is possible with cutting-edge technology."
  },
  {
    heading: "Collaborate",
    subheading: "2026",
    tagline: "Connect with brilliant minds and create extraordinary things together."
  },
  {
    heading: "Create",
    subheading: "2026",
    tagline: "Transform ideas into reality through creativity and technical expertise."
  }
];

let currentScenario = 0;

function rotateHeroScenario() {
  const scenario = heroScenarios[currentScenario];
  const text1El = document.getElementById('heroText1');
  const text2El = document.getElementById('heroText2');
  const subtitleEl = document.getElementById('heroSubtitle');
  
  if (!text1El || !text2El || !subtitleEl) {
    console.warn('[Hero Rotation] Could not find hero elements');
    return;
  }
  
  console.log('[Hero Rotation] Switching to scenario:', currentScenario, scenario);
  
  // Animate out
  gsap.to([text1El, text2El], {
    opacity: 0,
    y: -20,
    duration: 0.5,
    ease: 'power2.in',
    onComplete: () => {
      // Update heading and subheading
      text1El.textContent = scenario.heading;
      text2El.textContent = scenario.subheading;
      
      // Animate in
      gsap.to([text1El, text2El], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out'
      });
    }
  });
  
  // Fade subtitle out/in separately
  gsap.to(subtitleEl, {
    opacity: 0.3,
    duration: 0.5,
    ease: 'power2.in'
  });
  
  setTimeout(() => {
    subtitleEl.textContent = scenario.tagline;
    gsap.to(subtitleEl, {
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out'
    });
  }, 500);
  
  // Move to next scenario
  currentScenario = (currentScenario + 1) % heroScenarios.length;
}

// Start rotation after entrance animation completes (wait ~2.5s for all animations)
setTimeout(() => {
  console.log('[Hero Rotation] Starting scenario rotation');
  setInterval(rotateHeroScenario, 6000);
}, 2500);

/* =====================================================
   HERO GSAP ENTRANCE
===================================================== */
gsap.timeline({ delay: .3 })
  .to('.hero-title .line span', { y: '0%', duration: 1.1, stagger: .1, ease: 'power4.out' })
  .to('.hero-eyebrow',    { opacity: 1, duration: .7, ease: 'power3.out' }, '-=.7')
  .to('.hero-sub',        { opacity: 1, duration: .7, ease: 'power3.out' }, '-=.4')
  .to('.hero-cta-row',    { opacity: 1, duration: .6, ease: 'power3.out' }, '-=.3')
  .to('.hero-scroll-hint',{ opacity: 1, duration: .5 }, '-=.1');
/* =====================================================
   HEX BACKGROUND TEXT
===================================================== */
(function() {
  const el = document.getElementById('hexBg');
  if (!el) return;
  const chars = '0123456789ABCDEF ';
  let text = '';
  for (let i = 0; i < 800; i++) text += chars[Math.floor(Math.random() * chars.length)];
  el.textContent = text;
})();

/* =====================================================
   QUOTE — WORD REVEAL WHEN CENTERED IN VIEW
===================================================== */
ScrollTrigger.create({
  trigger: '#quote',
  start: 'center center',
  end: 'center center+=2000',
  onUpdate: (self) => {
    const words = document.querySelectorAll('.quote-text .word');
    const scrollProgress = self.progress; // 0 to 1
    const totalWords = words.length;
    
    // Calculate how many words should be revealed
    const revealedWords = Math.floor(scrollProgress * totalWords);
    
    words.forEach((word, index) => {
      if (index < revealedWords) {
        // Reveal this word
        gsap.to(word, { y: '0%', opacity: 1, duration: 0.15, overwrite: 'auto' });
      } else {
        // Keep this word hidden
        gsap.to(word, { y: '110%', opacity: 0, duration: 0.15, overwrite: 'auto' });
      }
    });
    
    // Animate line and attribution after words
    if (scrollProgress > 0.95) {
      gsap.to('#quoteLine', { width: '80px', opacity: 1, duration: 0.3 });
      gsap.to('#quoteAttr', { opacity: 1, y: 0, duration: 0.3 });
    } else {
      gsap.to('#quoteLine', { width: '0px', opacity: 0, duration: 0.3 });
      gsap.to('#quoteAttr', { opacity: 0, y: 20, duration: 0.3 });
    }
  }
});


/* =====================================================
   F1 — THREE.JS + SCROLL ANIMATION
===================================================== */
(function() {
  // Check if we're on desktop before initializing scroll effects
  const isDesktop = window.innerWidth > 768;
  const canvas = document.getElementById('f1-canvas');
  
  // If not desktop, disable scroll-triggered animation
  if (!isDesktop) {
    canvas.style.height = '100vh';
  }
  
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x050509, 1);  // Dark background, fully opaque
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050509, 0.02);  // Reduced fog density
  
  // Create gradient background texture
  const canvas2d = document.createElement('canvas');
  canvas2d.width = 512;
  canvas2d.height = 512;
  const ctx2d = canvas2d.getContext('2d');
  
  // Create gradient for background
  const gradient = ctx2d.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#0a0a12');
  gradient.addColorStop(0.5, '#151525');
  gradient.addColorStop(1, '#050509');
  ctx2d.fillStyle = gradient;
  ctx2d.fillRect(0, 0, 512, 512);
  
  // Add some subtle patterns
  ctx2d.strokeStyle = 'rgba(0, 245, 255, 0.05)';
  ctx2d.lineWidth = 1;
  for (let i = 0; i < 512; i += 64) {
    ctx2d.beginPath();
    ctx2d.moveTo(i, 0);
    ctx2d.lineTo(i, 512);
    ctx2d.stroke();
    ctx2d.beginPath();
    ctx2d.moveTo(0, i);
    ctx2d.lineTo(512, i);
    ctx2d.stroke();
  }
  
  const bgTexture = new THREE.CanvasTexture(canvas2d);
  bgTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = bgTexture;

  const camera = new THREE.PerspectiveCamera(60, 16/9, 0.1, 500);
  camera.position.set(0, 2, 8);
  camera.lookAt(0, 1, 0);

  function resizeF1() {
    // Get the f1-sticky element which is the actual container
    const sticky = document.querySelector('.f1-sticky');
    let W = window.innerWidth;
    let H = window.innerHeight;
    
    if (sticky && sticky.clientWidth > 0 && sticky.clientHeight > 0) {
      W = sticky.clientWidth;
      H = sticky.clientHeight;
    } else if (canvas.parentElement && canvas.parentElement.clientWidth > 0 && canvas.parentElement.clientHeight > 0) {
      W = canvas.parentElement.clientWidth;
      H = canvas.parentElement.clientHeight;
    }
    
    renderer.setSize(W, H, false);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    
    console.log('[F1] Canvas resized:', W, 'x', H, 'Aspect:', camera.aspect);
  }
  requestAnimationFrame(resizeF1);
  setTimeout(resizeF1, 50);
  setTimeout(resizeF1, 300);
  window.addEventListener('resize', resizeF1);

  /* LIGHTING */
  scene.add(new THREE.AmbientLight(0x111133, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.position.set(8, 12, 6);
  sun.castShadow = true;
  scene.add(sun);
  const redFill = new THREE.PointLight(0xe8001c, 8, 18);
  redFill.position.set(-5, 2, 3);
  scene.add(redFill);
  const cyanRim = new THREE.PointLight(0x00f5ff, 5, 14);
  cyanRim.position.set(5, 4, -3);
  scene.add(cyanRim);
  const underGlow = new THREE.PointLight(0xe8001c, 3, 6);
  underGlow.position.set(0, -1, 0);
  scene.add(underGlow);
  /* MATERIALS */
  const redMat    = new THREE.MeshStandardMaterial({ color: 0xe8001c, metalness: .85, roughness: .12 });
  const darkMat   = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: .9, roughness: .08 });
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x181818, metalness: .5, roughness: .35 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 1, roughness: .04 });
  const tireMat   = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .92 });
  const rimMat    = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: .92, roughness: .08 });

  /* CAR GROUP */
  const car = new THREE.Group();
  scene.add(car);
  console.log('[F1] Car group created and added to scene');

  /* LOAD FERRARI F1 MODEL */
  // NOTE: Ferrari model loading commented out due to file path issues
  // The procedural car works well as fallback
  
  console.log('[F1] Using procedural car geometry (Ferrari model disabled for stability)');

  function box(w, h, d, mat, x, y, z, rx, ry, rz) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x||0, y||0, z||0);
    if(rx) m.rotation.x = rx;
    if(ry) m.rotation.y = ry;
    if(rz) m.rotation.z = rz;
    m.castShadow = true;
    car.add(m); return m;
  }
  function cyl(rt, rb, h, seg, mat, x, y, z, rx, ry, rz) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x||0, y||0, z||0);
    if(rx) m.rotation.x = rx;
    if(ry) m.rotation.y = ry;
    if(rz) m.rotation.z = rz;
    m.castShadow = true;
    car.add(m); return m;
  }

  // Main body
  box(5, .5, 1.5, redMat, 0, .25, 0);
  // Nose cone
  cyl(.16, .38, 1.5, 8, redMat, 3.2, .25, 0, 0, 0, Math.PI/2);
  // Cockpit
  box(1.3, .6, 1, carbonMat, -.2, .68, 0);
  // Halo
  const haloGeo = new THREE.TorusGeometry(.4, .045, 8, 24, Math.PI);
  const halo = new THREE.Mesh(haloGeo, chromeMat);
  halo.position.set(-.1, .92, 0); car.add(halo);
  // Sidepods
  box(2.1, .38, .55, redMat, -.3, .2,  .72);
  box(2.1, .38, .55, redMat, -.3, .2, -.72);
  // Floor / diffuser
  box(3.8, .08, 1.7, carbonMat, -.6, -.22, 0);
  // Bargeboards
  box(.08, .3, .3, darkMat, 1.2, .2, .78);
  box(.08, .3, .3, darkMat, 1.2, .2, -.78);
  // Front wing
  box(.08, .05, 2.8, darkMat, 3.7, .04, 0);
  box(.5, .3, .07, darkMat, 3.5, .16, 1.4);
  box(.5, .3, .07, darkMat, 3.5, .16, -1.4);
  // Front wing flaps
  box(.08, .04, 2.6, darkMat, 3.55, .09, 0);

  // Rear wing main plane
  box(.1, .07, 2.2, redMat, -2.7, 1.18, 0);
  // Rear wing DRS flap
  box(.08, .05, 2.1, darkMat, -2.7, 1.1, 0);
  // Rear wing endplates
  box(.55, .7, .06, darkMat, -2.7, .82, 1.1);
  box(.55, .7, .06, darkMat, -2.7, .82, -1.1);
  // Wing stays
  box(.04, .7, .04, darkMat, -2.7, .78, .6);
  box(.04, .7, .04, darkMat, -2.7, .78, -.6);
  // Beam wing
  box(.04, .32, 2.2, darkMat, -2.7, .42, 0);

  // Exhaust
  cyl(.06, .07, .4, 8, chromeMat, -3, .5, 0, Math.PI/2);

  /* WHEELS */
  const wheelGroups = [];
  [[2.1, 0, .96], [2.1, 0, -.96], [-1.9, 0, .94], [-1.9, 0, -.94]].forEach(([x, y, z]) => {
    const g = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .55, 28), tireMat);
    tire.rotation.x = Math.PI/2;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .58, 14), rimMat);
    rim.rotation.x = Math.PI/2;
    // Brake disc glow
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .1, 12), new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: .5, roughness: .3 }));
    disc.rotation.x = Math.PI/2;
    g.add(tire); g.add(rim); g.add(disc);
    g.position.set(x, y, z);
    car.add(g);
    wheelGroups.push(g);
  });
  // Suspension arms
  [[2.1, .02, .65], [2.1, .02, -.65], [-1.9, .02, .65], [-1.9, .02, -.65]].forEach(([x,y,z]) => {
    box(.9, .04, .04, chromeMat, x * .6, y, z * .85);
  });

  car.position.y = .45;
  car.rotation.y = Math.PI * .08;
  /* GROUND TRACK */
  const trackGeo = new THREE.PlaneGeometry(100, 20);
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: .9, metalness: .05 });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.rotation.x = -Math.PI/2;
  track.position.y = -.08;
  track.receiveShadow = true;
  scene.add(track);
  // Track stripe
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(100, .08), new THREE.MeshStandardMaterial({ color: 0xe8001c, roughness: .8 }));
  stripe.rotation.x = -Math.PI/2;
  stripe.position.set(0, -.07, 0);
  scene.add(stripe);

  /* SPEED LINES */
  const LINE_COUNT = 40; /* reduced from 60 */
  const lPos = new Float32Array(LINE_COUNT * 6);
  function resetLine(i) {
    lPos[i*6]   = 12 + Math.random() * 6;
    lPos[i*6+1] = (Math.random() - .5) * 5;
    lPos[i*6+2] = (Math.random() - .5) * 10;
    const len = 1.5 + Math.random() * 3.5;
    lPos[i*6+3] = lPos[i*6] + len;
    lPos[i*6+4] = lPos[i*6+1];
    lPos[i*6+5] = lPos[i*6+2];
  }
  for (let i = 0; i < LINE_COUNT; i++) resetLine(i);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  const speedLines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xe8001c, transparent: true, opacity: .18 }));
  scene.add(speedLines);

  /* PARTICLE SYSTEM (spark trail) */
  const SPARK_COUNT = 50; /* reduced from 80 */
  const sparkPos = new Float32Array(SPARK_COUNT * 3);
  for (let i = 0; i < SPARK_COUNT; i++) {
    sparkPos[i*3]   = -3 + (Math.random() - .5) * .5;
    sparkPos[i*3+1] = .3 + Math.random() * .5;
    sparkPos[i*3+2] = (Math.random() - .5) * .3;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({ color: 0xff6600, size: .06, transparent: true, opacity: .7 });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparks);
  /* SCROLL-DRIVEN ANIMATION STATE */
  let scrollProg = 0; // Initialize to 0
  let t = 0;
  let lastScrollProg = 0;
  let engineSoundCounter = 0;
  const speedEl = document.getElementById('speedVal');
  const progressEl = document.getElementById('f1Progress');

  // Scroll-triggered animation works on all devices now (desktop + mobile)
  ScrollTrigger.create({
    trigger: '.f1-sticky-wrap',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: self => {
      scrollProg = self.progress;
      // Update progress bar
      if (progressEl) progressEl.style.width = (scrollProg * 100) + '%';
      // Speed HUD - update when value changes
      if (speedEl) {
        const spd = Math.round(scrollProg * 340);
        const currentText = speedEl.textContent;
        const newText = String(spd).padStart(3, '0');
        if (currentText !== newText) {
          speedEl.textContent = newText;
          // Play engine rev sound when speed changes
          const speedDelta = Math.abs(scrollProg - lastScrollProg);
          if (speedDelta > 0.02) { // Only play if significant change
            const intensity = Math.min(speedDelta * 15, 1);
            playEngineRev(intensity);
          }
          lastScrollProg = scrollProg;
        }
      }
      
      // Play continuous engine rumble when scrolling in F1 section
      engineSoundCounter++;
      if (engineSoundCounter % 12 === 0 && scrollProg > 0 && scrollProg < 1) {
        const intensity = Math.min(scrollProg * 1.1, 1);
        playEngineRev(intensity * 0.6);
      }
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    t += .016;
    
    // Log first frame to verify rendering
    if (t < 0.05) console.log('[F1] Animation started. Car Y:', car.position.y, 'Camera Z:', camera.position.z);

    // Scroll-driven camera orbit + zoom (works on all devices)
    const targetCamX = 0 - scrollProg * 8;   // pan left as car passes
    const targetCamY = 2.5 - scrollProg * 0.8;
    const targetCamZ = 8 - scrollProg * 3;
    camera.position.x += (targetCamX - camera.position.x) * .04;
    camera.position.y += (targetCamY - camera.position.y) * .04;
    camera.position.z += (targetCamZ - camera.position.z) * .04;
    
    camera.lookAt(car.position.x, 1, 0);

    // Car motion driven by scroll (works on all devices)
    car.position.x = scrollProg * -3;
    car.position.z = 0;
    
    car.position.y = .45 + Math.sin(t * 1.2) * .04;
    car.rotation.y = Math.PI * .08 - scrollProg * .4 + Math.sin(t * .3) * .02;
    car.rotation.z = scrollProg * .04 + Math.sin(t * 1.5) * .008;

    // Wheel spin
    const spinRate = .06 + (scrollProg * .25);
    wheelGroups.forEach(g => { g.rotation.z += spinRate; });

    // Speed lines - only update every 2 frames for performance
    if (t % 2 < 1) {
      const lineSpeed = .25 + scrollProg * .8;
      for (let i = 0; i < LINE_COUNT; i++) {
        lPos[i*6]   -= lineSpeed;
        lPos[i*6+3] -= lineSpeed;
        if (lPos[i*6+3] < -15) resetLine(i);
      }
      lineGeo.attributes.position.needsUpdate = true;
    }
    speedLines.material.opacity = .08 + scrollProg * .25;

    // Sparks - only update every 3 frames for performance
    if (t % 3 < 1) {
      const sp = sparkGeo.attributes.position.array;
      for (let i = 0; i < SPARK_COUNT; i++) {
        sp[i*3]   += (Math.random() - .5) * .08 - .05;
        sp[i*3+1] += (Math.random() - .1) * .06;
        sp[i*3+2] += (Math.random() - .5) * .06;
        const ox = -3 + car.position.x;
        if (sp[i*3] < ox - 3 || sp[i*3+1] < 0) {
          sp[i*3]   = car.position.x - 2.5 + (Math.random() - .5) * .4;
          sp[i*3+1] = .3 + Math.random() * .4;
          sp[i*3+2] = (Math.random() - .5) * .25;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
    }
    sparks.material.opacity = .3 + scrollProg * .6;

    // Pulsing lights - reduce calculations
    redFill.intensity  = 6 + Math.sin(t * 2.2) * 2 + scrollProg * 5;
    cyanRim.intensity  = 4 + Math.sin(t * 1.6 + 1) * 1.5;
    underGlow.position.x = car.position.x;
    underGlow.intensity = 2 + scrollProg * 4;

    renderer.render(scene, camera);
  }
  
  console.log('[F1] Starting animation loop');
  animate();
})();

/* =====================================================
   CA STEPS SCROLL
===================================================== */
const caSteps = document.querySelectorAll('.ca-step');
const caHeaders = document.querySelectorAll('.ca-header > *');

gsap.from(caSteps, {
  scrollTrigger: { trigger: '#ca', start: 'top 68%' },
  x: -36, opacity: 0, duration: .8, stagger: .14, ease: 'power3.out',
  onStart: playSectionEnter
});
gsap.from(caHeaders, {
  scrollTrigger: { trigger: '#ca', start: 'top 72%' },
  y: 28, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out'
});



/* =====================================================
   NAV HIDE ON SCROLL DOWN
===================================================== */
let lastY = 0;
let lastNavUpdate = 0;
const navThrottle = 100; // ms
window.addEventListener('scroll', () => {
  const now = Date.now();
  if (now - lastNavUpdate < navThrottle) return;
  
  const nav = document.getElementById('nav');
  const y = window.scrollY;
  nav.style.transform = y > lastY && y > 100 ? 'translateY(-100%)' : 'translateY(0)';
  lastY = y;
  lastNavUpdate = now;
}, { passive: true });