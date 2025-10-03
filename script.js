const qs = (s, el = document) => el.querySelector(s),
      qsa = (s, el = document) => [...el.querySelectorAll(s)];

const themeBtn = qs('#theme-toggle');
const root = document.documentElement;

const setIcon = () => {
  themeBtn.innerHTML =
    (root.getAttribute('data-theme') || '').toLowerCase() === 'dark'
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
};

const saved = localStorage.getItem('theme');

if (saved === 'light' || saved === 'dark') {
  root.setAttribute('data-theme', saved);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  root.setAttribute('data-theme', 'dark');
} else {
  root.setAttribute('data-theme', 'light');
}

setIcon();

themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  setIcon();
});

const menuBtn = qs('#menu-toggle');
const navList = qs('header .nav ul');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navList.style.display === 'flex';
    navList.style.display = isOpen ? 'none' : 'flex';
  });
}

qsa('header .nav a').forEach(a =>
  a.addEventListener('click', () => {
    if (window.innerWidth < 640) navList.style.display = 'none';
  })
);

const form = qs('#formInterest'),
      okMsg = qs('#okMsg');

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.nome || !data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return alert('Preencha nome e um e-mail válido.');

  const list = JSON.parse(localStorage.getItem('fetec2025_leads') || '[]');
  list.push({ ...data, ts: Date.now() });
  localStorage.setItem('fetec2025_leads', JSON.stringify(list));

  okMsg.style.display = 'block';
  form.reset();
  window.scrollTo({
    top: okMsg.getBoundingClientRect().top + window.scrollY - 120,
    behavior: 'smooth'
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('.map-loupe');
  if (!box) return;

  const img = box.querySelector('img');
  const lens = box.querySelector('.loupe');
  const zoom = parseFloat(box.dataset.zoom || '2');
  let active = false;

  const setLensBG = () => {
    const w = img.clientWidth,
          h = img.clientHeight;
    lens.style.backgroundImage = `url(${img.src})`;
    lens.style.backgroundSize = `${w * zoom}px ${h * zoom}px`;
  };

  const moveLens = e => {
    const rect = img.getBoundingClientRect();
    const pageX = e.touches ? e.touches[0].clientX : e.clientX;
    const pageY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = pageX - rect.left;
    const y = pageY - rect.top;

    const cx = Math.max(0, Math.min(x, rect.width));
    const cy = Math.max(0, Math.min(y, rect.height));

    const lw = lens.offsetWidth,
          lh = lens.offsetHeight;

    lens.style.left = `${img.offsetLeft + cx - lw / 2}px`;
    lens.style.top = `${img.offsetTop + cy - lh / 2}px`;

    const bgX = (cx / rect.width) * (rect.width * zoom - lw);
    const bgY = (cy / rect.height) * (rect.height * zoom - lh);
    lens.style.backgroundPosition = `-${bgX}px -${bgY}px`;
  };

  const show = () => {
    setLensBG();
    lens.style.display = 'block';
    box.classList.add('is-zooming');
    active = true;
  };

  const hide = () => {
    lens.style.display = 'none';
    box.classList.remove('is-zooming');
    active = false;
  };

  if (img.complete) setLensBG();
  else img.addEventListener('load', setLensBG);

  // desktop
  box.addEventListener('mouseenter', show);
  box.addEventListener('mouseleave', hide);
  box.addEventListener('mousemove', e => {
    if (active) moveLens(e);
  });

  // mobile
  box.addEventListener(
    'touchstart',
    e => {
      e.preventDefault();
      if (!active) show();
      moveLens(e);
    },
    { passive: false }
  );

  box.addEventListener(
    'touchmove',
    e => {
      if (active) moveLens(e);
    },
    { passive: false }
  );

  box.addEventListener('touchend', () => hide(), { passive: true });

  window.addEventListener('resize', () => {
    if (active) setLensBG();
  });
});
