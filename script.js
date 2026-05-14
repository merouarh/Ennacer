/* ===================================================
   CLINIQUE ENNASR CHLEF — script.js  v2
   =================================================== */
'use strict';

/* ─────────────────────────────────────────
   1. PRELOADER
───────────────────────────────────────── */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  setTimeout(() => {
    pre.classList.add('hidden');
    setTimeout(() => pre.remove(), 700);
  }, 1200);
});

/* ─────────────────────────────────────────
   2. LANGUAGE SWITCHER  FR ↔ AR
───────────────────────────────────────── */
let lang = 'fr';
const htmlEl    = document.documentElement;
const langToggle = document.getElementById('lang-toggle');
const langLabel  = document.getElementById('lang-label');

function applyLang(l) {
  lang = l;
  if (l === 'ar') {
    htmlEl.setAttribute('lang','ar');
    htmlEl.setAttribute('dir','rtl');
    document.body.classList.add('lang-ar');
    if (langLabel) langLabel.textContent = 'Français';
  } else {
    htmlEl.setAttribute('lang','fr');
    htmlEl.setAttribute('dir','ltr');
    document.body.classList.remove('lang-ar');
    if (langLabel) langLabel.textContent = 'العربية';
  }
  document.querySelectorAll('[data-fr],[data-ar]').forEach(el => {
    const v = l === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-fr');
    if (!v) return;
    if (el.childElementCount === 0) {
      el.textContent = v;
    } else {
      const nodes = [...el.childNodes].filter(n => n.nodeType === 3);
      if (nodes.length) nodes[nodes.length - 1].textContent = ' ' + v;
    }
  });
  // Update slide captions after lang switch
  slideshowUpdateCaptions();
  localStorage.setItem('clinique-lang', l);
}

if (langToggle) {
  langToggle.addEventListener('click', () => applyLang(lang === 'fr' ? 'ar' : 'fr'));
}
const saved = localStorage.getItem('clinique-lang');
if (saved && saved !== 'fr') applyLang(saved);

/* ─────────────────────────────────────────
   3. NAVBAR
───────────────────────────────────────── */
const navbar   = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a, .mobile-menu a');

window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}, { passive: true });

/* ─────────────────────────────────────────
   4. HAMBURGER
───────────────────────────────────────── */
const ham  = document.getElementById('hamburger');
const mmenu = document.getElementById('mobile-menu');

function closeMenu() {
  ham?.classList.remove('open');
  mmenu?.classList.remove('open');
  ham?.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
}
if (ham && mmenu) {
  ham.addEventListener('click', () => {
    const open = mmenu.classList.toggle('open');
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', e => { if (!navbar?.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) {
      e.preventDefault();
      const h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      window.scrollTo({ top: t.offsetTop - h, behavior: 'smooth' });
    }
  });
});

/* ─────────────────────────────────────────
   5. SCROLL REVEAL
───────────────────────────────────────── */
const revEls = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const sibs = [...e.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
    const delay = Math.min(sibs.indexOf(e.target) * 80, 400);
    setTimeout(() => e.target.classList.add('visible'), delay);
    revObs.unobserve(e.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revEls.forEach(el => revObs.observe(el));

/* ─────────────────────────────────────────
   6. COUNTERS
───────────────────────────────────────── */
function animCount(el, target, dur = 1800) {
  let v = 0;
  const step = target / (dur / 16);
  const t = setInterval(() => {
    v += step;
    if (v >= target) { el.textContent = target.toLocaleString(); clearInterval(t); }
    else el.textContent = Math.floor(v).toLocaleString();
  }, 16);
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting || e.target.dataset.animated) return;
    e.target.dataset.animated = '1';
    const t = parseInt(e.target.dataset.target, 10);
    if (!isNaN(t)) animCount(e.target, t);
    cntObs.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter,.stat-num').forEach(el => cntObs.observe(el));

/* ─────────────────────────────────────────
   7. DOCTOR FILTER + VOIR PLUS
───────────────────────────────────────── */
const DOCTORS_VISIBLE = 6;
const filterBtns  = document.querySelectorAll('.filter-btn');
const docCards    = document.querySelectorAll('.doctor-card');
const docVoirPlus = document.getElementById('doc-voir-plus');
let   docExpanded = false;
let   activeFilter = 'all';

function getVisibleCards() {
  return [...docCards].filter(c => {
    if (c.classList.contains('hidden')) return false;
    if (activeFilter === 'all') return true;
    return c.dataset.cat === activeFilter;
  });
}

function applyDocFilter(filter) {
  activeFilter = filter;
  docExpanded  = false;
  if (docVoirPlus) {
    docVoirPlus.querySelector('span').textContent = lang === 'ar' ? 'عرض المزيد من الأطباء' : 'Voir plus de médecins';
    docVoirPlus.querySelector('i').className = 'fas fa-plus-circle';
    docVoirPlus.classList.remove('expanded');
  }
  let shown = 0;
  docCards.forEach(c => {
    const match = filter === 'all' || c.dataset.cat === filter;
    if (!match) {
      c.classList.add('hidden');
      return;
    }
    c.classList.remove('hidden');
    if (shown < DOCTORS_VISIBLE) {
      c.style.display = '';
      shown++;
    } else {
      c.style.display = 'none';
    }
  });
  // show/hide voir-plus button
  const total = [...docCards].filter(c => filter === 'all' || c.dataset.cat === filter).length;
  if (docVoirPlus) docVoirPlus.closest('.voir-plus-wrap').style.display = total > DOCTORS_VISIBLE ? '' : 'none';
  // trigger reveal
  setTimeout(() => {
    [...docCards].filter(c => !c.classList.contains('hidden') && c.style.display !== 'none')
      .forEach((c,i) => { c.classList.remove('visible'); setTimeout(() => c.classList.add('visible'), i * 60); });
  }, 50);
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    applyDocFilter(btn.dataset.filter);
  });
});

if (docVoirPlus) {
  docVoirPlus.addEventListener('click', () => {
    docExpanded = !docExpanded;
    let shown = 0;
    docCards.forEach(c => {
      if (c.classList.contains('hidden')) return;
      if (docExpanded) {
        c.style.display = '';
      } else {
        shown++;
        c.style.display = shown <= DOCTORS_VISIBLE ? '' : 'none';
      }
    });
    const sp = docVoirPlus.querySelector('span');
    const ic = docVoirPlus.querySelector('i');
    if (docExpanded) {
      sp.textContent = lang === 'ar' ? 'عرض أقل' : 'Voir moins';
      ic.className = 'fas fa-minus-circle';
      docVoirPlus.classList.add('expanded');
    } else {
      sp.textContent = lang === 'ar' ? 'عرض المزيد من الأطباء' : 'Voir plus de médecins';
      ic.className = 'fas fa-plus-circle';
      docVoirPlus.classList.remove('expanded');
    }
    setTimeout(() => {
      [...docCards].filter(c => !c.classList.contains('hidden') && c.style.display !== 'none')
        .forEach((c,i) => { c.classList.remove('visible'); setTimeout(() => c.classList.add('visible'), i * 50); });
    }, 50);
  });
}

// Init
applyDocFilter('all');

/* ─────────────────────────────────────────
   8. SPECIALITIES VOIR PLUS
───────────────────────────────────────── */
const SPEC_VISIBLE = 6;
const specCards    = document.querySelectorAll('.spec-card');
const specVoir     = document.getElementById('spec-voir-plus');
let   specExpanded = false;

function initSpec() {
  specCards.forEach((c, i) => {
    c.style.display = i < SPEC_VISIBLE ? '' : 'none';
  });
  const wrap = specVoir?.closest('.voir-plus-wrap');
  if (wrap) wrap.style.display = specCards.length > SPEC_VISIBLE ? '' : 'none';
}
initSpec();

if (specVoir) {
  specVoir.addEventListener('click', () => {
    specExpanded = !specExpanded;
    specCards.forEach((c, i) => {
      c.style.display = specExpanded || i < SPEC_VISIBLE ? '' : 'none';
    });
    const sp = specVoir.querySelector('span');
    const ic = specVoir.querySelector('i');
    if (specExpanded) {
      sp.textContent = lang === 'ar' ? 'عرض أقل' : 'Voir moins';
      ic.className = 'fas fa-minus-circle';
      specVoir.classList.add('expanded');
    } else {
      sp.textContent = lang === 'ar' ? 'عرض المزيد من التخصصات' : 'Voir plus de spécialités';
      ic.className = 'fas fa-plus-circle';
      specVoir.classList.remove('expanded');
    }
    setTimeout(() => {
      [...specCards].filter(c => c.style.display !== 'none')
        .forEach((c,i) => { c.classList.remove('visible'); setTimeout(() => c.classList.add('visible'), i * 60); });
    }, 50);
  });
}

/* ─────────────────────────────────────────
   9. TECHNOLOGY VOIR PLUS
───────────────────────────────────────── */
const techExtra  = document.getElementById('tech-extra');
const techVoir   = document.getElementById('tech-voir-plus');
let   techExpanded = false;

if (techVoir) {
  techVoir.addEventListener('click', () => {
    techExpanded = !techExpanded;
    if (techExtra) techExtra.classList.toggle('visible', techExpanded);
    const sp = techVoir.querySelector('span');
    const ic = techVoir.querySelector('i');
    if (techExpanded) {
      sp.textContent = lang === 'ar' ? 'عرض أقل' : 'Voir moins';
      ic.className = 'fas fa-minus-circle';
      techVoir.classList.add('expanded');
      // trigger reveal on newly shown items
      if (techExtra) {
        techExtra.querySelectorAll('.reveal').forEach((el,i) => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), i * 100);
        });
      }
    } else {
      sp.textContent = lang === 'ar' ? 'عرض المزيد من التقنيات' : 'Voir plus de technologies';
      ic.className = 'fas fa-plus-circle';
      techVoir.classList.remove('expanded');
    }
    // smooth scroll to voir plus button
    setTimeout(() => techVoir.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  });
}

/* ─────────────────────────────────────────
   10. GALLERY SLIDESHOW
───────────────────────────────────────── */
const slides = document.querySelectorAll('.slide');
const dotsWrap  = document.getElementById('slide-dots');
const thumbsWrap = document.getElementById('slide-thumbs');
const curEl  = document.getElementById('slide-current');
const totEl  = document.getElementById('slide-total');
const prevBtn = document.querySelector('.slide-prev');
const nextBtn = document.querySelector('.slide-next');

let curSlide = 0;
let slideTimer = null;
const SLIDE_INTERVAL = 4500;

const slideData = [
  { icon:'fas fa-concierge-bell', grad:'linear-gradient(135deg,#2F2D82,#4ABBB5)', fr:'Réception',           ar:'الاستقبال' },
  { icon:'fas fa-scalpel',        grad:'linear-gradient(135deg,#2a9d8f,#264653)', fr:'Bloc opératoire',      ar:'قاعة العمليات' },
  { icon:'fas fa-baby',           grad:'linear-gradient(135deg,#e9c46a,#f4a261)', fr:'Maternité',            ar:'قسم الأمومة' },
  { icon:'fas fa-stethoscope',    grad:'linear-gradient(135deg,#6564A2,#2F2D82)', fr:'Équipements médicaux', ar:'المعدات الطبية' },
  { icon:'fas fa-flask',          grad:'linear-gradient(135deg,#4ABBB5,#2a9d8f)', fr:'Laboratoire',          ar:'المخبر' },
  { icon:'fas fa-bed',            grad:'linear-gradient(135deg,#e76f51,#c1121f)', fr:'Chambres',             ar:'الغرف' },
  { icon:'fas fa-baby-carriage',  grad:'linear-gradient(135deg,#264653,#4ABBB5)', fr:'Unité Néonatale',      ar:'وحدة حديثي الولادة' },
  { icon:'fas fa-notes-medical',  grad:'linear-gradient(135deg,#f4a261,#e76f51)', fr:'Salles de consultation',ar:'غرف الكشف' },
];

function slideshowUpdateCaptions() {
  slides.forEach((s, i) => {
    const h4 = s.querySelector('.slide-caption h4');
    const p  = s.querySelector('.slide-caption p');
    if (h4 && slideData[i]) h4.textContent = lang === 'ar' ? (slideData[i].ar||'') : (slideData[i].fr||'');
  });
}

function goSlide(idx) {
  slides[curSlide]?.classList.remove('active');
  slides[curSlide]?.classList.add('prev');
  curSlide = (idx + slides.length) % slides.length;
  slides.forEach(s => s.classList.remove('prev'));
  slides[curSlide].classList.add('active');
  if (curEl) curEl.textContent = curSlide + 1;
  // dots
  document.querySelectorAll('.slide-dot').forEach((d,i) => d.classList.toggle('active', i === curSlide));
  // thumbs
  document.querySelectorAll('.slide-thumb').forEach((t,i) => t.classList.toggle('active', i === curSlide));
}

function startAuto() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => goSlide(curSlide + 1), SLIDE_INTERVAL);
}
function stopAuto() { clearInterval(slideTimer); }

// Build dots + thumbs
if (dotsWrap && slides.length) {
  if (totEl) totEl.textContent = slides.length;
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i+1));
    dot.addEventListener('click', () => { goSlide(i); startAuto(); });
    dotsWrap.appendChild(dot);
  });
}

if (thumbsWrap && slides.length) {
  slideData.forEach((d, i) => {
    const th = document.createElement('div');
    th.className = 'slide-thumb' + (i === 0 ? ' active' : '');
    th.style.background = d.grad;
    th.innerHTML = `<i class="${d.icon}"></i>`;
    th.setAttribute('role', 'button');
    th.setAttribute('aria-label', d.fr);
    th.tabIndex = 0;
    th.addEventListener('click', () => { goSlide(i); startAuto(); });
    th.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { goSlide(i); startAuto(); } });
    thumbsWrap.appendChild(th);
  });
}

prevBtn?.addEventListener('click', () => { goSlide(curSlide - 1); startAuto(); });
nextBtn?.addEventListener('click', () => { goSlide(curSlide + 1); startAuto(); });

// Keyboard
const ssContainer = document.querySelector('.slideshow-container');
ssContainer?.addEventListener('keydown', e => {
  if (e.key==='ArrowLeft')  { goSlide(curSlide - 1); startAuto(); }
  if (e.key==='ArrowRight') { goSlide(curSlide + 1); startAuto(); }
});

// Touch swipe
let tsX = 0;
ssContainer?.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; stopAuto(); }, { passive:true });
ssContainer?.addEventListener('touchend', e => {
  const diff = tsX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) { diff > 0 ? goSlide(curSlide + 1) : goSlide(curSlide - 1); }
  startAuto();
}, { passive:true });

// Pause on hover
ssContainer?.addEventListener('mouseenter', stopAuto);
ssContainer?.addEventListener('mouseleave', startAuto);

if (slides.length) { goSlide(0); startAuto(); }

/* ─────────────────────────────────────────
   11. FAQ ACCORDION
───────────────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-question');
  const a = item.querySelector('.faq-answer');
  if (!q || !a) return;
  q.addEventListener('click', () => {
    const open = a.classList.contains('open');
    document.querySelectorAll('.faq-answer').forEach(x => x.classList.remove('open'));
    document.querySelectorAll('.faq-question').forEach(x => x.setAttribute('aria-expanded','false'));
    if (!open) { a.classList.add('open'); q.setAttribute('aria-expanded','true'); }
  });
});

/* ─────────────────────────────────────────
   12. CONTACT FORM → GOOGLE SHEET
   Replace SHEET_URL with your Apps Script
   web app URL after deployment
───────────────────────────────────────── */
const SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

const form    = document.getElementById('contact-form');
const formMsg = document.getElementById('form-msg');

if (form && formMsg) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('c-name')?.value.trim();
    const phone   = document.getElementById('c-phone')?.value.trim();
    const email   = document.getElementById('c-email')?.value.trim();
    const service = document.getElementById('c-service')?.value;
    const message = document.getElementById('c-message')?.value.trim();

    if (!name || !phone) {
      formMsg.textContent = lang === 'ar' ? 'يرجى ملء الحقول المطلوبة.' : 'Veuillez remplir les champs obligatoires.';
      formMsg.className = 'form-message error';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${lang==='ar'?'جارٍ الإرسال...':'Envoi en cours...'}`;
    }
    formMsg.textContent = '';
    formMsg.className = 'form-message';

    const payload = { name, phone, email, service, message, date: new Date().toLocaleString('fr-DZ') };

    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode:   'no-cors',
        headers:{ 'Content-Type': 'application/json' },
        body:   JSON.stringify(payload),
      });
      formMsg.textContent = lang==='ar'
        ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
        : 'Message envoyé avec succès ! Nous vous contacterons bientôt.';
      formMsg.className = 'form-message success';
      form.reset();
    } catch {
      formMsg.textContent = lang==='ar'
        ? 'حدث خطأ، يرجى المحاولة مجدداً أو الاتصال بنا.'
        : 'Une erreur est survenue. Veuillez réessayer ou nous appeler.';
      formMsg.className = 'form-message error';
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-paper-plane"></i> ${lang==='ar'?'إرسال الرسالة':'Envoyer le message'}`;
      }
    }
  });
}

/* ─────────────────────────────────────────
   13. SCROLL-TO-TOP
───────────────────────────────────────── */
const scrollTopBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', () => {
  scrollTopBtn?.classList.toggle('visible', window.scrollY > 400);
}, { passive:true });
scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

/* ─────────────────────────────────────────
   14. FLOATING BUTTONS fade-in
───────────────────────────────────────── */
const fwa  = document.getElementById('float-whatsapp');
const fcall = document.getElementById('float-call');
[fwa,fcall].forEach(b => { if (b) b.style.transition='opacity .4s ease,transform .3s ease,box-shadow .3s ease'; });
window.addEventListener('scroll', () => {
  const v = window.scrollY > 300 ? '1' : '0';
  if (fwa)   fwa.style.opacity   = v;
  if (fcall) fcall.style.opacity = v;
}, { passive:true });

/* ─────────────────────────────────────────
   15. HERO PARALLAX (subtle)
───────────────────────────────────────── */
const shapes = document.querySelectorAll('.shape');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  shapes.forEach((s,i) => { s.style.transform = `translateY(${y * (0.04 + i*0.015)}px)`; });
}, { passive:true });

/* ─────────────────────────────────────────
   16. FOOTER YEAR
───────────────────────────────────────── */
const fy = document.getElementById('footer-year');
if (fy) fy.textContent = new Date().getFullYear();

console.log('%cClinique Ennasr Chlef ✦ v2 Ready', 'color:#4ABBB5;font-size:14px;font-weight:bold;');
