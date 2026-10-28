/**
 * VYRO by Aditya — Studio & Portfolio Interactive Engine
 * High-performance 60fps animations, interactive screenshot dropzone,
 * scope calculator, sound synthesizer, and ambient particle canvas.
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initProjectDropzones();
  initDeviceViewSwitchers();
  initCard3DTilt();
  initScrollSpyAndNav();
  initEstimatorCalculator();
  initCaseStudyModal();
  initContactForm();
  initAudioSystem();
  initClipboardHandlers();
  initScrollReveal();
});

/* ==========================================================================
   1. Interactive Screenshot Upload & Dropzone (STRICT IMAGE REQUIREMENT)
   Allows Aditya to drag & drop or select real project screenshots directly,
   previewing them immediately and saving to localStorage.
   ========================================================================== */
function initProjectDropzones() {
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach((card) => {
    const projectId = card.getAttribute('data-project-id');
    const dropzone = card.querySelector('.vyro-placeholder-screen');
    const fileInput = card.querySelector('.project-file-input');
    const previewImg = card.querySelector('.user-uploaded-img');
    const resetBtn = card.querySelector('.btn-reset-img');
    const replaceBtn = card.querySelector('.btn-replace-img');
    const previewBtn = card.querySelector('.btn-preview-img');

    // 1. Check if user already saved an image in localStorage
    try {
      const savedImage = localStorage.getItem(`vyro_screenshot_${projectId}`);
      if (savedImage && previewImg) {
        displayUploadedImage(previewImg, dropzone, savedImage);
      }
    } catch (e) {
      console.warn('LocalStorage not available for project images:', e);
    }

    if (!dropzone || !fileInput) return;

    // Trigger file chooser when clicking placeholder
    dropzone.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
      playSfx('click');
    });

    if (replaceBtn) {
      replaceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
        playSfx('click');
      });
    }

    // Handle File Selection via Input
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        processImageFile(file, projectId, previewImg, dropzone);
      }
    });

    // Drag & Drop Listeners
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files && dt.files[0];
      if (file && file.type.startsWith('image/')) {
        processImageFile(file, projectId, previewImg, dropzone);
      } else {
        showToast('Please drop a valid image file (PNG, JPG, WebP).');
      }
    });

    // Reset back to VYRO branded placeholder
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          localStorage.removeItem(`vyro_screenshot_${projectId}`);
        } catch (err) {}
        previewImg.src = '';
        previewImg.classList.remove('active');
        dropzone.style.display = 'flex';
        showToast('Screenshot reset to VYRO placeholder frame.');
        playSfx('click');
      });
    }

    // Lightbox preview of uploaded image
    if (previewBtn) {
      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (previewImg && previewImg.src) {
          openImageLightbox(previewImg.src, card.querySelector('.project-title')?.innerText || 'Project Preview');
        }
      });
    }
  });
}

function processImageFile(file, projectId, previewImg, dropzone) {
  // Read with FileReader
  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    displayUploadedImage(previewImg, dropzone, dataUrl);

    // Save to LocalStorage with fallback if quota exceeded
    try {
      localStorage.setItem(`vyro_screenshot_${projectId}`, dataUrl);
    } catch (err) {
      console.warn('Screenshot too large for localStorage, keeping in session memory.', err);
    }
    showToast('Project screenshot applied successfully!');
    playSfx('success');
  };
  reader.readAsDataURL(file);
}

function displayUploadedImage(previewImg, dropzone, dataUrl) {
  if (!previewImg) return;
  previewImg.src = dataUrl;
  previewImg.classList.add('active');
  if (dropzone) {
    dropzone.style.display = 'none';
  }
}

/* ==========================================================================
   2. Ambient Particle & Floating Ember Dust Canvas
   60fps lightweight particles simulating burnt orange ember sparks
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 45;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 0.8;
      this.speedY = Math.random() * 0.6 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.fadeSpeed = Math.random() * 0.003 + 0.002;
      this.hue = Math.random() > 0.3 ? 24 : 18; // burnt orange / amber hues
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.opacity -= this.fadeSpeed;

      if (this.y < -10 || this.opacity <= 0 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 95%, 60%, ${this.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff6b2c';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================================================
   3. 3D Card Parallax & Smooth Tilt on Hover
   ========================================================================== */
function initCard3DTilt() {
  const cards = document.querySelectorAll('.service-card, .estimator-card, .about-card-container');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* ==========================================================================
   4. ScrollSpy, Active Navigation, and Mobile Drawer
   ========================================================================== */
function initScrollSpyAndNav() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-menu-drawer');

  // Mobile drawer toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      playSfx('click');
    });

    // Close on link click
    mobileDrawer.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileDrawer.classList.remove('open');
      }
    });
  }

  // ScrollSpy highlight active section
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // Back to top smooth scroll
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playSfx('click');
    });
  }
}

/* ==========================================================================
   5. Interactive Project Estimator & Scope Calculator
   Allows visitors to test scopes, timelines, and auto-fills inquiry
   ========================================================================== */
function initEstimatorCalculator() {
  const typeBtns = document.querySelectorAll('.type-option');
  const speedBtns = document.querySelectorAll('.speed-option');
  const featureBtns = document.querySelectorAll('.feature-option');

  let selectedType = 'Modern Website & Landing Page';
  let selectedSpeed = 'Standard (3-4 Weeks)';
  let selectedFeatures = ['Responsive UI', 'SEO Optimization'];

  function updateEstimatorUI() {
    const summaryType = document.getElementById('summary-type');
    const summarySpeed = document.getElementById('summary-speed');
    const summaryFeatures = document.getElementById('summary-features');
    const summaryTimeline = document.getElementById('summary-timeline-val');

    if (summaryType) summaryType.textContent = selectedType;
    if (summarySpeed) summarySpeed.textContent = selectedSpeed;
    if (summaryFeatures) summaryFeatures.textContent = selectedFeatures.join(', ') || 'Core Baseline';
    if (summaryTimeline) summaryTimeline.textContent = selectedSpeed;
  }

  typeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      typeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.getAttribute('data-value');
      updateEstimatorUI();
      playSfx('click');
    });
  });

  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSpeed = btn.getAttribute('data-value');
      updateEstimatorUI();
      playSfx('click');
    });
  });

  featureBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const val = btn.getAttribute('data-value');
      if (btn.classList.contains('active')) {
        if (!selectedFeatures.includes(val)) selectedFeatures.push(val);
      } else {
        selectedFeatures = selectedFeatures.filter((f) => f !== val);
      }
      updateEstimatorUI();
      playSfx('click');
    });
  });

  // "Apply Scope to Contact Form" Button
  const applyBtn = document.getElementById('btn-apply-estimate');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const serviceSelect = document.getElementById('contact-service');
      const messageInput = document.getElementById('contact-message');

      if (serviceSelect) {
        if (selectedType.includes('Website')) serviceSelect.value = 'website';
        else if (selectedType.includes('Application')) serviceSelect.value = 'app';
        else if (selectedType.includes('AI')) serviceSelect.value = 'ai';
      }

      if (messageInput) {
        messageInput.value = `Hi Aditya,\n\nI used the VYRO Project Scope Calculator:\n- Project Type: ${selectedType}\n- Desired Timeline: ${selectedSpeed}\n- Target Features: ${selectedFeatures.join(', ')}\n\nLooking forward to discussing details!`;
      }

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Scope copied to Inquiry form! Fill in your details below.');
      playSfx('success');
    });
  }
}

/* ==========================================================================
   6. Case Study Details Modal
   ========================================================================== */
const caseStudiesData = {
  farmsetu: {
    title: 'FarmSetu — Direct Kisan Marketplace & Weather Telemetry',
    category: 'Full-Stack AgriTech Platform • Next.js, OpenWeather API & AI Quality Scan',
    challenge: 'Indian farmers routinely suffer from opaque middleman price cuts (up to 40%), volatile weather unpredictability, and fragmented access to farming machinery. FarmSetu required a robust, dual-device architecture providing real-time local weather radar, a direct-to-buyer crop marketplace, and machinery sharing, engineered to work effortlessly even on low-bandwidth rural networks.',
    solution: 'Designed and deployed an end-to-end synchronized web & mobile platform. Integrated OpenWeather REST API with live GPS auto-detection, a multi-category crop catalogue (Fruits, Vegetables, Grains with dynamic INR/kg pricing), equipment sharing scheduling, and a FarmCheck AI crop disease scanner. Designed with offline-ready PWA caching and bilingual interface support.',
    metrics: [
      '100% direct broker-free profit retention for local farmers',
      'Live OpenWeather radar API with sub-100ms update cycle',
      'Under 50KB initial JS footprint for 3G rural network resilience',
      'Over 5+ produce categories supported with real-time stock indicators',
    ],
    stack: ['React / Next.js', 'OpenWeather API', 'Tailwind CSS', 'Node.js', 'PWA / Service Workers', 'Cloudinary CDN'],
  },
  bachelors: {
    title: 'The Bachelors Cafe — Artisanal Menu & Instant Table Booking',
    category: 'Hospitality Web App & Culinary Showcase • Minimalist Editorial Design',
    challenge: 'A high-end boutique specialty cafe required a unique digital presence reflecting their craft culinary philosophy ("Pick your poison, partner"). Needed to streamline weekend table reservations, showcase daily artisanal specialties (Artisan Avocado, Truffle Forest, Sourdough Benedict), and cut down manual reservation phone inquiries.',
    solution: 'Engineered an ultra-clean editorial dining platform with custom typography, instant category switching between Quick Bites & Specialty Brews, real-time dietary availability dots, and an integrated reservation engine. Backed by lightweight vanilla JavaScript with zero runtime framework overhead.',
    metrics: [
      '+65% increase in advance online table bookings',
      '99 Google Lighthouse Performance & Accessibility score',
      'Zero layout shift (CLS: 0.00) with sub-second First Contentful Paint',
      'Real-time dietary tags (Vegetarian/Chef Specials) with live pricing',
    ],
    stack: ['HTML5 / Vanilla JavaScript', 'Modern CSS Grid & Flexbox', 'Web Animations API', 'Glassmorphism Design System', 'Local Storage Engine'],
  },
  khauboy: {
    title: 'Urban Khauboy — Squad Dining & Interactive Ordering',
    category: 'Dynamic Dining Web App • Group Reservations & Interactive Concierge',
    challenge: 'Urban Khauboy, an energetic urban dining lounge, needed a high-conversion digital portal to capture large party weekend reservations ("Gather Your Favorite Squad"), showcase high-margin signature dishes with rich visual appeal, and offer real-time customer menu guidance.',
    solution: 'Engineered a cinematic, high-contrast web portal featuring dark-mode hero visuals, rapid squad group table booking workflows, an interactive digital menu, and a floating "Chat with Khauboy" interactive concierge widget for instant dish recommendations.',
    metrics: [
      '+45% surge in weekend large-party group bookings',
      'Sub-800ms initial load time via responsive WebP image optimization',
      '80%+ mobile visitor engagement through the interactive chat concierge',
      'Integrated smooth multi-section navigation across Menu, Vibe, and Location',
    ],
    stack: ['Modern JavaScript', 'CSS3 Backdrop Filter', 'Interactive Concierge Widget', 'Responsive Web Architecture', 'Formspree API'],
  },
  'farmsetu-arch': {
    title: 'FarmSetu Architecture — Multi-Device Synchronized Telemetry',
    category: 'Systems Architecture & Cross-Platform UI/UX Engineering',
    challenge: 'Designing a cohesive system architecture capable of scaling seamlessly between field-level mobile phones used under direct sunlight and high-density multi-column desktop displays used in regional trading offices, without duplicating frontend codebases.',
    solution: 'Architected a shared design token and component system with adaptive responsive drawer navigation, fluid viewport typography, high-contrast outdoor UI modes, and synchronized state management linking mobile field inputs with desktop oversight telemetry.',
    metrics: [
      'Flawless 60fps responsive scaling from 360px mobile to 4K ultra-wide monitors',
      'Sub-120ms roundtrip data synchronization latency across devices',
      'Consistent design token system with zero layout breaking across breakpoints',
      'Low memory footprint suitable for budget Android smartphones',
    ],
    stack: ['Responsive Component Architecture', 'CSS Variables & Grid', 'OpenWeather Geolocation API', 'State Synchronization'],
  },
  nexus: {
    title: 'NexusAI — Autonomous Multi-Agent Workspace',
    category: 'AI Platform & LLM Orchestration',
    challenge: 'A stealth startup required an ultra-fast dashboard allowing non-technical enterprise teams to configure, execute, and monitor multi-agent LLM workflows without code.',
    solution: 'Engineered a real-time reactive interface using Next.js 14 and Tailwind, hooked into a Python FastAPI asynchronous background worker pool with streaming responses and vector indexing.',
    metrics: ['Sub-50ms API streaming latency', '99.98% pipeline uptime', '4.9/5 enterprise pilot feedback'],
    stack: ['Next.js 14', 'Python FastAPI', 'LangChain', 'Tailwind CSS', 'Redis', 'OpenAI API'],
  },
  zenith: {
    title: 'Zenith Pay — Global Cross-Border Gateway',
    category: 'Full-Stack Fintech Application',
    challenge: 'Modernizing B2B global remittances across 35 currencies with instant settlement tracking, multi-signature corporate approvals, and automated fraud alerts.',
    solution: 'Designed and shipped a secure, banking-grade responsive web portal powered by Supabase row-level security, Stripe Connect infrastructure, and automated PDF invoice generation.',
    metrics: ['$1.2M+ simulated transaction volume tested', '0 security vulnerabilities in penetration tests', '100% compliant responsive design'],
    stack: ['React', 'Supabase', 'TypeScript', 'Stripe API', 'Tailwind CSS', 'Vercel'],
  },
  aura: {
    title: 'Aura Studio — High-Fashion 3D Digital Showcase',
    category: 'Creative eCommerce & WebGL',
    challenge: 'A luxury apparel label needed an experiential web platform to launch their seasonal digital drop, demanding cinema-grade lighting, micro-interactions, and instant page speeds.',
    solution: 'Built a lightweight 3D canvas engine with custom shaders, smooth momentum scrolling, dynamic glassmorphism cards, and an integrated headless Shopify checkout.',
    metrics: ['+140% user session duration', '98 Google Lighthouse Performance score', 'Zero layout shift (CLS: 0.00)'],
    stack: ['Three.js / WebGL', 'Vanilla JS & CSS', 'Shopify Storefront API', 'GSAP', 'Vite'],
  },
  pulse: {
    title: 'Pulse Flow — Real-Time Developer Observability',
    category: 'Cloud Infrastructure & Microservices',
    challenge: 'Engineering teams needed unified visibility into Kubernetes microservice deployments, build pipeline status, and container health metrics in one command center.',
    solution: 'Crafted a high-density, low-latency telemetry dashboard with live WebSocket feeds, dark-mode terminal logs, and configurable Slack alerts.',
    metrics: ['Real-time 60fps graph rendering', '<120ms roundtrip WebSocket latency', 'Adopted by 5 open-source teams'],
    stack: ['React', 'TypeScript', 'Node.js', 'WebSockets', 'Chart.js', 'Docker'],
  },
};

function initCaseStudyModal() {
  const modal = document.getElementById('case-study-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const triggers = document.querySelectorAll('.case-study-btn');

  triggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const studyKey = btn.getAttribute('data-study');
      const data = caseStudiesData[studyKey];

      if (data && modal) {
        document.getElementById('modal-title').textContent = data.title;
        document.getElementById('modal-category').textContent = data.category;
        document.getElementById('modal-challenge').textContent = data.challenge;
        document.getElementById('modal-solution').textContent = data.solution;

        const metricsList = document.getElementById('modal-metrics');
        if (metricsList) {
          metricsList.innerHTML = data.metrics.map((m) => `<li>✨ ${m}</li>`).join('');
        }

        const stackRow = document.getElementById('modal-stack');
        if (stackRow) {
          stackRow.innerHTML = data.stack.map((s) => `<span class="tech-mini-pill">${s}</span>`).join('');
        }

        modal.classList.add('active');
        playSfx('open');
      }
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      playSfx('click');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

// Lightbox for image preview
function openImageLightbox(imgSrc, title) {
  let lightbox = document.getElementById('img-lightbox-modal');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'img-lightbox-modal';
    lightbox.className = 'modal-overlay';
    lightbox.innerHTML = `
      <div class="modal-content-box" style="max-width: 900px; padding: 1.5rem; text-align: center;">
        <button class="modal-close-btn" id="lightbox-close">&times;</button>
        <h3 id="lightbox-title" style="color: #fff; margin-bottom: 1rem; font-size: 1.2rem;"></h3>
        <img id="lightbox-img" src="" style="width: 100%; max-height: 75vh; object-fit: contain; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
      </div>
    `;
    document.body.appendChild(lightbox);

    lightbox.querySelector('#lightbox-close').addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('active');
    });
  }

  lightbox.querySelector('#lightbox-title').textContent = title;
  lightbox.querySelector('#lightbox-img').src = imgSrc;
  lightbox.classList.add('active');
  playSfx('open');
}

/* Device View Switcher for PC / Mobile Responsive Showcase */
function initDeviceViewSwitchers() {
  const switchBtns = document.querySelectorAll('.dev-switch-btn');
  switchBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.project-card');
      if (!card) return;

      const view = btn.getAttribute('data-view');
      const siblings = card.querySelectorAll('.dev-switch-btn');
      siblings.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const img = card.querySelector('.project-display-img');
      const pill = card.querySelector('.view-pill-text');
      const urlText = card.querySelector('.url-display-text');
      const container = card.querySelector('.project-screen-container');

      if (!img) return;

      let newSrc = '';
      let newUrl = '';
      let newPillText = '';
      let isMobile = false;

      if (view === 'pc') {
        newSrc = img.getAttribute('data-pc-src');
        newUrl = img.getAttribute('data-pc-url') || 'vyro.studio/projects/view';
        newPillText = 'PC Desktop View';
      } else if (view === 'mobile') {
        newSrc = img.getAttribute('data-mobile-src');
        newUrl = img.getAttribute('data-mobile-url') || 'vyro.studio/m/view';
        newPillText = 'Mobile Smartphone View';
        isMobile = true;
      } else if (view === 'market') {
        newSrc = img.getAttribute('data-market-src');
        newUrl = img.getAttribute('data-market-url') || 'vyro.studio/m/market';
        newPillText = 'Mobile Produce Marketplace';
        isMobile = true;
      }

      if (newSrc) {
        img.style.opacity = '0';
        setTimeout(() => {
          img.src = newSrc;
          img.style.opacity = '1';
        }, 140);
      }

      if (container) {
        if (isMobile) {
          container.classList.add('is-mobile-view');
        } else {
          container.classList.remove('is-mobile-view');
        }
      }

      if (pill && newPillText) pill.textContent = newPillText;
      if (urlText && newUrl) urlText.textContent = newUrl;

      playSfx('click');
    });
  });

  // Expand Preview buttons & direct image click
  const previewBtns = document.querySelectorAll('.expand-preview-btn');
  previewBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.project-card');
      const img = card?.querySelector('.project-display-img');
      const title = card?.querySelector('.project-title')?.textContent || 'Project Screenshot';
      if (img && img.src) {
        openImageLightbox(img.src, title);
      }
    });
  });

  const displayImgs = document.querySelectorAll('.project-display-img');
  displayImgs.forEach((img) => {
    img.addEventListener('click', () => {
      const card = img.closest('.project-card');
      const title = card?.querySelector('.project-title')?.textContent || 'Project Screenshot';
      if (img.src) {
        openImageLightbox(img.src, title);
      }
    });
  });
}

/* ==========================================================================
   7. Contact Form Handling & Validation
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('project-inquiry-form');
  const submitBtn = document.getElementById('btn-submit-inquiry');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const service = document.getElementById('contact-service')?.value;
    const timeline = document.getElementById('contact-timeline')?.value;
    const message = document.getElementById('contact-message')?.value.trim();

    if (!name || !email || !message) {
      showToast('Please provide your name, email, and project message.');
      return;
    }

    // Submit state — show loading
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Transmitting to Aditya...</span> <div class="pulse-indicator"></div>`;
    submitBtn.disabled = true;

    try {
      // Send to Web3Forms → emails adityarw2025@gmail.com
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        // Also save locally as backup
        try {
          const inquiries = JSON.parse(localStorage.getItem('vyro_inquiries') || '[]');
          inquiries.unshift({ name, email, service, timeline, message, date: new Date().toISOString() });
          localStorage.setItem('vyro_inquiries', JSON.stringify(inquiries));
        } catch (err) {}

        submitBtn.innerHTML = `✓ Inquiry Dispatched!`;
        submitBtn.style.background = '#10b981';
        playSfx('success');
        showToast(`Thank you ${name}! Aditya has received your inquiry.`);

        setTimeout(() => {
          form.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 4000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      submitBtn.innerHTML = `✗ Sending Failed`;
      submitBtn.style.background = '#ef4444';
      showToast('Something went wrong. Please try again or email directly.');

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    }
  });
}

/* ==========================================================================
   8. Audio Micro-Interactions (Synthesized with Web Audio API)
   Zero audio file dependencies, pure programmatic sound synthesis.
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioSystem() {
  const toggleBtn = document.getElementById('btn-audio-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const drawerToggleBtn = document.getElementById('btn-audio-toggle-drawer');
  const drawerSoundIcon = document.getElementById('sound-icon-drawer');
  const drawerSoundLabel = document.getElementById('sound-label-drawer');

  function updateAudioState(newState) {
    soundEnabled = newState;
    const iconHtml = soundEnabled
      ? `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`
      : `<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;

    if (soundIcon) soundIcon.innerHTML = iconHtml;
    if (drawerSoundIcon) drawerSoundIcon.innerHTML = iconHtml;
    if (drawerSoundLabel) {
      drawerSoundLabel.textContent = soundEnabled ? 'Studio Sound FX: Enabled' : 'Studio Sound FX: Muted';
    }

    showToast(soundEnabled ? 'Studio Sound Effects: Enabled' : 'Studio Sound Effects: Muted');
    if (soundEnabled) playSfx('click');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => updateAudioState(!soundEnabled));
  }
  if (drawerToggleBtn) {
    drawerToggleBtn.addEventListener('click', () => updateAudioState(!soundEnabled));
  }
}

function playSfx(type = 'click') {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'open') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    // Audio context not allowed until first user gesture
  }
}

/* ==========================================================================
   9. Clipboard & Copy Handlers with Toast
   ========================================================================== */
function initClipboardHandlers() {
  const copyEmailBtns = document.querySelectorAll('.btn-copy-email');

  copyEmailBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'adityarw2025@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('✓ Email adityarw2025@gmail.com copied to clipboard!');
        playSfx('success');
      }).catch(() => {
        showToast('adityarw2025@gmail.com');
      });
    });
  });

  const copyPhoneBtns = document.querySelectorAll('.btn-copy-phone');

  copyPhoneBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = '+91 7709523070';
      navigator.clipboard.writeText('7709523070').then(() => {
        showToast('✓ Mobile +91 7709523070 copied to clipboard!');
        playSfx('success');
      }).catch(() => {
        showToast('+91 7709523070');
      });
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('vyro-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vyro-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   10. Scroll Reveal Animations (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '100px 0px 50px 0px' }
  );

  elements.forEach((el) => {
    observer.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 150) {
      el.classList.add('revealed');
    }
  });
}
