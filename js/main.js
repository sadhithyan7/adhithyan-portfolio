/* Adhithyan S portfolio: interface behaviour (themes, menu, toggles, stamps, scroll-spy, copy email).
   Plain JavaScript, no build step. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Themes: paper (light), mono, night (dark) */
  const store = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };
  const themeBtns = [...document.querySelectorAll('.themes button')];
  function applyTheme(t){
    if (t) root.dataset.theme = t; else delete root.dataset.theme;
    const active = t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    themeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === active)));
  }
  const saved = store.get('theme');
  applyTheme(['light','dark','mono'].includes(saved) ? saved : null);
  themeBtns.forEach(b => b.addEventListener('click', () => { applyTheme(b.dataset.set); store.set('theme', b.dataset.set); }));


  /* Portrait: if assets/photo.jpg exists it replaces the AS placeholder; if not, nothing breaks. */
  const photo = document.getElementById('portraitPhoto');
  if (photo) {
    const show = () => { photo.hidden = false; document.getElementById('portraitImg').classList.add('has-photo'); };
    if (photo.complete && photo.naturalWidth) show();
    else photo.addEventListener('load', show, { once: true });
  }

  /* Mobile menu */
  const menuBtn = document.getElementById('menuBtn'), menu = document.getElementById('mobileMenu');
  const setMenu = open => { menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* JARVIS waveform */
  const wave = document.getElementById('wave');
  [30,55,80,45,95,60,35,70,90,50,25,65,85,40,75,55,30,60,45,20,50,70,35,25].forEach((h,i) => {
    const s = document.createElement('span'); s.style.setProperty('--h', h); s.style.setProperty('--i', i); wave.appendChild(s);
  });

  /* Detail toggles */
  document.querySelectorAll('.toggle').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    panel.inert = true;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('open', open);
      panel.inert = !open;
    });
  });

  /* Stamps land when their card scrolls into view */
  const stampIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.querySelector('.stamp')?.classList.add('in'); stampIO.unobserve(e.target); } });
  }, { threshold: .45 });
  document.querySelectorAll('.entry').forEach(el => stampIO.observe(el));

  /* Active tab */
  const links = [...document.querySelectorAll('.tabs a')];
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting){ links.forEach(a => a.removeAttribute('aria-current')); const a = links.find(l => l.getAttribute('href') === '#' + e.target.id); if (a) a.setAttribute('aria-current','true'); } });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['work','experience','about','toolbox','credentials','contact'].forEach(id => navIO.observe(document.getElementById(id)));

  /* Copy email */
  const copyBtn = document.getElementById('copyBtn');
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('sadhithyan06@gmail.com'); copyBtn.textContent = 'Copied!'; }
    catch(e){ copyBtn.textContent = 'Press Ctrl+C'; }
    setTimeout(() => copyBtn.textContent = 'Copy email', 1800);
  });
})();
