const header = document.getElementById('header');
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const successMsg = document.getElementById('successMessage');
const formError = document.getElementById('form-error');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const GAS_URL = 'https://script.google.com/macros/s/AKfycbz-Q7v0Ghc39ha-rjnVCyLn3ZPq101dHHANCAfjobDqmTvTicii8zQ6VCXhDCYBpFeS/exec';

let triggerEl = null;

function refreshIcons(scope) {
  if (!window.lucide?.createIcons) return;
  if (scope) {
    window.lucide.createIcons({ nodes: scope.querySelectorAll('[data-lucide]') });
    return;
  }
  window.lucide.createIcons();
}

function syncHeaderHeight() {
  const height = header?.offsetHeight || 80;
  document.documentElement.style.setProperty('--header-h', `${height}px`);
}

function setMenuState(open) {
  mobileNav?.classList.toggle('hidden', !open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  menuBtn?.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
}

function clearFieldError(id) {
  const field = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  field?.setAttribute('aria-invalid', 'false');
  error?.classList.add('hidden');
}

function setFieldError(id, message) {
  const field = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  field?.setAttribute('aria-invalid', 'true');
  if (error) {
    error.textContent = message;
    error.classList.remove('hidden');
  }
}

function clearFormError() {
  if (!formError) return;
  formError.textContent = '';
  formError.classList.add('hidden');
}

function setFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.classList.remove('hidden');
  formError.focus();
}

function validateForm() {
  const validations = [
    {
      id: 'name',
      message: 'お名前を入力してください。',
      valid: (value) => value.trim().length > 0
    },
    {
      id: 'phone',
      message: '電話番号を正しく入力してください。',
      valid: (value) => /^[0-9\-()\+\s]{10,15}$/.test(value.trim())
    }
  ];

  let firstInvalid = null;
  clearFormError();

  validations.forEach(({ id, message, valid }) => {
    const input = document.getElementById(id);
    if (!input) return;
    clearFieldError(id);
    if (!valid(input.value)) {
      setFieldError(id, message);
      if (!firstInvalid) firstInvalid = input;
    }
  });

  return firstInvalid;
}

async function submitViaCors(form) {
  const body = new URLSearchParams(new FormData(form)).toString();
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || `HTTP ${response.status}`);
  }

  if (payload && payload.ok === false) {
    throw new Error(payload.message || '送信に失敗しました。');
  }

  return payload || { ok: true };
}

function getResponsiveImageMarkup(src) {
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
  return {
    src: cleanSrc,
    srcset: '',
    sizes: ''
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderBlogCard(post) {
  const date = new Date(post.date).toLocaleDateString('ja-JP').replace(/\//g, '.');
  const image = getResponsiveImageMarkup(post.eyecatch || 'image/medical-interview.webp');
  const url = `blog/posts/${post.slug}/`;
  const title = escapeHtml(post.title || '');
  const description = escapeHtml(post.description || '');
  const readingTime = escapeHtml(post.readingTime || '');
  const categoryLabel = ({
    'knee-pain': '膝痛',
    'lower-back-pain': '腰痛',
    'exercise-therapy': '運動療法'
  })[post.category] || 'ブログ';

  return `<a href="${url}" class="group block bg-white rounded-3xl overflow-hidden card-shadow hover:shadow-xl transition-all duration-300 border border-slate-100">
    <div class="h-48 overflow-hidden bg-slate-100">
      <img src="${image.src}" ${image.srcset ? `srcset="${image.srcset}" sizes="${image.sizes}"` : ''} alt="${title} | 整体院ひざこぞうブログ" class="w-full h-full object-contain group-hover:scale-105 transition duration-500" loading="lazy" decoding="async" width="600" height="400">
    </div>
    <div class="p-6">
      <div class="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold">
        <span class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">${categoryLabel}</span>
        <span class="text-slate-300">/</span>
        <span class="text-slate-500">${readingTime}</span>
      </div>
      <p class="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
        <i data-lucide="calendar" class="w-3 h-3" aria-hidden="true"></i>
        <time datetime="${post.date}">${date}</time>
      </p>
      <h3 class="text-base font-black text-slate-800 leading-tight group-hover:text-blue-600 transition">${title}</h3>
      <p class="mt-3 text-sm font-bold leading-relaxed text-slate-500">${description}</p>
    </div>
  </a>`;
}

function renderCompactBlogCard(post) {
  const date = new Date(post.date).toLocaleDateString('ja-JP').replace(/\//g, '.');
  const image = getResponsiveImageMarkup(post.eyecatch || 'image/medical-interview.webp');
  const url = `blog/posts/${post.slug}/`;
  const title = escapeHtml(post.title || '');
  const description = escapeHtml(post.description || '');
  const readingTime = escapeHtml(post.readingTime || '');
  const categoryLabel = ({
    'knee-pain': '膝痛',
    'lower-back-pain': '腰痛',
    'hip-pain': '股関節痛',
    'neck-shoulder-hand': '首・肩・手',
    'numbness': 'しびれ',
    'exercise-therapy': '運動療法'
  })[post.category] || 'ブログ';

  return `<a href="${url}" class="blog-b-card group">
    <span class="blog-b-thumb" aria-hidden="true">
      <img src="${image.src}" alt="${title}" loading="lazy" decoding="async" width="1200" height="900">
    </span>
    <span class="blog-b-text">
      <span class="blog-b-meta">
        <span class="blog-b-cat">${categoryLabel}</span>
        <span>${readingTime}</span>
      </span>
      <span class="blog-b-title">${title}</span>
      <span class="blog-b-desc">${description}</span>
    </span>
    <span class="blog-b-side">
      <span class="blog-b-date">${date}</span>
      <span aria-hidden="true" class="blog-b-arrow">›</span>
    </span>
  </a>`;
}

function setSubmitBusy(isBusy) {
  if (!submitBtn) return;
  submitBtn.disabled = isBusy;
  submitBtn.classList.toggle('opacity-70', isBusy);
  submitBtn.setAttribute('aria-busy', String(isBusy));
  submitBtn.innerHTML = isBusy
    ? '<i data-lucide="loader-2" class="w-5 h-5 animate-spin" aria-hidden="true"></i> 送信中…'
    : '<i data-lucide="send" class="w-5 h-5" aria-hidden="true"></i> 送信する';
  refreshIcons(submitBtn);
}

function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg || !lightboxClose) return;
  triggerEl = document.activeElement;
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    lightbox.classList.remove('opacity-0');
    lightboxImg.classList.remove('scale-95');
    lightboxClose.focus();
  });
}

function closeLightbox() {
  if (!lightbox || !lightboxImg) return;
  lightbox.classList.add('opacity-0');
  lightboxImg.classList.add('scale-95');
  window.setTimeout(() => {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (triggerEl instanceof HTMLElement) triggerEl.focus();
  }, 300);
}

function setupGalleryTriggers() {
  document.querySelectorAll('.gallery-trigger').forEach((button) => {
    const img = button.querySelector('img');
    if (!img) return;
    button.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      setMenuState(false);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

async function hydrateBlogPreview() {
  const container = document.getElementById('blog-preview-container');
  if (!container) return;

  try {
    const response = await fetch('data/blog-posts.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const posts = Array.isArray(data.posts) ? data.posts.slice(0, 3) : [];

    if (!posts.length) {
      if (!container.children.length) {
        container.innerHTML = '<p class="text-center text-slate-500 col-span-3 font-bold py-10">記事を準備中です。</p>';
      }
      return;
    }

    container.innerHTML = posts.map(renderCompactBlogCard).join('');

    refreshIcons(container);
  } catch (error) {
    console.error('Blog data fetch error:', error);
    if (!container.children.length) {
      container.innerHTML = '<p class="text-center text-slate-500 col-span-3 font-bold py-10">記事を読み込めませんでした。</p>';
    }
  }
}

refreshIcons();
syncHeaderHeight();
setMenuState(false);
setupSmoothScroll();
setupGalleryTriggers();
hydrateBlogPreview();

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    header?.classList.toggle('shadow-md', window.scrollY > 50);
    scrollTicking = false;
  });
}, { passive: true });

window.addEventListener('resize', syncHeaderHeight, { passive: true });

menuBtn?.addEventListener('click', () => {
  const isOpen = mobileNav && !mobileNav.classList.contains('hidden');
  setMenuState(!isOpen);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (lightbox?.style.display === 'flex') {
      closeLightbox();
      return;
    }
    setMenuState(false);
  }
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox?.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const focusable = [...lightbox.querySelectorAll('button,[tabindex]:not([tabindex="-1"])')];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

['name', 'phone'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
});

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstInvalid = validateForm();
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  setSubmitBusy(true);
  clearFormError();

  try {
    await submitViaCors(contactForm);
    contactForm.classList.add('hidden');
    successMsg?.classList.remove('hidden');
    successMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    console.error('Contact form submit error:', error);
    setFormError('送信に失敗しました。時間をおいて再送するか、LINE予約・お電話をご利用ください。');
  } finally {
    setSubmitBusy(false);
  }
});
