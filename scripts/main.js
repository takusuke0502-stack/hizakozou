const stickyHeader = document.querySelector('.site-header__lower');
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const successMsg = document.getElementById('successMessage');
const formError = document.getElementById('form-error');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const pageTopButton = document.querySelector('.page-top-button');
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzxlY8wFSXpgtyP9TVFwFM2BCrzfihbkmEOjYd5PROmEubX3B4NLxOhYOvZxeg7zZbc1w/exec';
const googleReviews = [
  {
    name: "梶谷武志様",
    rating: 5,
    text: "私も前院からお世話になってます。極度の腰痛になってしまい、川上院長の施術を受けるようになりました。丁寧なヒアリングと施術の進め方について詳しく説明を受けて安心して通院できました。腰痛については、２〜３週間でかなり改善し、普通に歩けるようになりました。私は、元自衛官なのですが訓練で痛めた万年膝痛でも苦しんでいましたが、院長の的確な施術とストレッチ指導で極度の痛みは出ないようになり、歩くのも辛くなくなりました。穏やかで優しい院長ですので、相談、質問は施術の際に遠慮なく聞かれた方が良いと思います。院長のおかげで自衛隊も無事に定年退職し、今は身体の総合的なメンテナンスのため通院しています。川上院長、これからもよろしくお願いします。"
  },
  {
    name: "K様",
    rating: 5,
    text: "前院からお世話になっています。腕が上がらなくなり日常生活に支障があったため、通院し始めました。どのような問題があり、どのようなアプローチをしていくのか、細かく丁寧に説明していただけるので、安心して施術してもらうことができます。びっくりするくらい、腕もスムーズに上がるようになりました。日常生活でのトレーニングも教えていただいたことで、全体的な筋力も向上し、テニスでのパフォーマンスもよくなりました。穏やかで、とてもお話ししやすく、親身に相談に乗ってくれる先生です。"
  },
  {
    name: "平川智江美様",
    rating: 5,
    text: "職業柄今まで、沢山の整体にかかりましたが、その時は良いのですが、直ぐに元の体に戻ってしまいます。こちらの整体は、痛い所の元から直してくれて、暫く良い状態が続きます。こちらの先生との出会いに、感謝してます。"
  },
  {
    name: "Kyoko T",
    rating: 5,
    text: "イスから立ち上がる時や歩行時に右膝から太ももあたりに強い痛みがあり、治療を受けました。痛みのメカニズムを説明していただき、歪みを直したり、筋肉をほぐす治療を数回行った結果、辛い痛みが嘘のようにおさまり、今では立ち上がるのも歩行もスムーズで快適です。当日の施術だけではなく、原因改善のためのストレッチも教えて下さるので、家でのセルフケアも行えて助かってます。独立されて、マンションの1室の隠れ家的な整体院になった今でも、身体のメンテナンスの為に、定期的にお世話になっています。"
  },
  {
    name: "F.M.様",
    rating: 5,
    text: "３０代の頃から、時折、真っ直ぐに立てなくなるほどの腰痛に悩まされてきましたが、自分は長身だから仕方がないと諦めていました。しかし、２年前に川上先生に初めて診ていただき、側弯症からくる身体のねじれが痛みの原因であることを初めて知りました。以来、先生に、身体のねじれが起きないように、筋肉の弱い箇所の鍛え方や呼吸法等を教わりながら、先生による施術と自宅でのトレーニングでひどい腰痛に悩むことはなくなりました。腰痛以外にも、ジョギング後の膝の痛みや脚のしびれ等、不安に思うことを相談していますが、毎回的確なアドバイスをいただけるのでとても安心できます。痛いからと身体を甘やかすのではなく、正しく身体を動かし鍛えることで痛みを防いで良い姿勢でいられることを教えていただいて、とても前向きな気持ちで自分の身体に向き合えることができています。これからも継続して診ていただきたいと思います。"
  },
  {
    name: "Rit K様",
    rating: 5,
    text: "こちらの川上先生のおかげで長年苦しんでいた腰椎分離症、坐骨神経痛、すべり症などが混ざり合った症状をほぼすっかり改善することができました。本当にであえてよかったと感謝しています。長年整形外科に通いましたがだんだん悪くなり、しまいには加齢ですねと、諦めに近い診断を受けたりしていました。先生は涼しい顔でよくなりますと優しく言ってくださり、約3ヶ月間指導の通りの筋トレを続け、先生の施術を受けているうちにあるべきところに筋肉がなかったことがわかり、段々に筋肉がつくことで悪い症状が消えていきました。今も筋トレは続けています。それを続けていれば今後もひどくなることなくやっていけそうだといまは安心して暮らせています。その後、頚椎ヘルニアの症状についてもみていただき、改善しています。行動の幅も広がりました。先生の的確な見立てと施術、そして根気の良い指導とわたし自身も筋トレを続けられたことでよくなり、とても感謝しています。自信を持っておすすめできます。ありがとうございました。(50代女性)"
  },
  {
    name: "K.K.様",
    rating: 5,
    text: "坐骨神経痛、膝の痛み、腰の痛みなどで、夜も眠れないほど痛み、寝返りが出来ず、歩けなくなり、座れず立って食事するほど、大変な経験をしました。どこへ行っても治して貰えませんでした。そんな時に川上院長にお会い出来たのは私にとって奇跡でした。川上院長は痛みのポイントを的確に一発で抑えて施術してくれました。友人から『本当に痛みが取れるの？』と聞かれますが、自信を持って『取れるんです』と答えています。その後の運動療法も必ず教えてくださり励みとなります。今では好きなガーデニングが出来るまでになり、感謝の思いで一杯です。"
  },
  {
    name: "NAO FUCHI様",
    rating: 4,
    text: "初めてで少し緊張していましたが、何をするのかその都度説明してくださったので安心できました。体の状態を確認しながら進めてくれて、自分でもここに負担がかかっていたんだと分かりやすかったです。悩みをじっくり相談したい方に合うと思います。施術とあわせて運動の指導もあり、今後のケアのイメージが持てました。"
  }
];

let triggerEl = null;
let toastTimer = null;

function refreshIcons(scope) {
  if (!window.lucide?.createIcons) return;
  if (scope) {
    window.lucide.createIcons({ nodes: scope.querySelectorAll('[data-lucide]') });
    return;
  }
  window.lucide.createIcons();
}

function syncHeaderHeight() {
  const height = stickyHeader?.offsetHeight || 58;
  document.documentElement.style.setProperty('--header-h', `${height}px`);
}

function setMenuState(open) {
  mobileNav?.classList.toggle('hidden', !open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  menuBtn?.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
}

function setupMobileMenuLinks() {
  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });
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

function showToast(message, type = 'success') {
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.toggle('is-success', type === 'success');
  toast.classList.toggle('is-error', type === 'error');
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  if (toastIcon) {
    toastIcon.setAttribute('data-lucide', type === 'error' ? 'alert-circle' : 'check-circle-2');
  }

  toast.classList.remove('hidden');
  refreshIcons(toast);

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 5200);
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

  if (payload && (payload.ok === false || payload.status === 'error')) {
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

function getGoogleReviewInitial(name) {
  const plainName = String(name).replace(/様$/, '').trim();
  const alphaChars = plainName.match(/[A-Za-z]/g);
  if (alphaChars?.length) return alphaChars.slice(0, 2).join('').toUpperCase();
  return plainName.slice(0, 1) || 'G';
}

function renderGoogleStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < safeRating;
    const className = isFilled
      ? 'google-review-card__star google-review-card__star--filled'
      : 'google-review-card__star';
    return `<span class="${className}" aria-hidden="true">${isFilled ? '★' : '☆'}</span>`;
  }).join('');
}

function renderGoogleReviewCard(review, index) {
  const name = escapeHtml(review.name);
  const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
  const text = escapeHtml(review.text);
  const initial = escapeHtml(getGoogleReviewInitial(review.name));
  const textId = `google-review-text-${index + 1}`;

  return `<article class="google-review-card">
    <div class="google-review-card__head">
      <span class="google-review-card__avatar" aria-hidden="true">${initial}</span>
      <div>
        <h3 class="google-review-card__name">${name}</h3>
        <span class="google-review-card__label">Google口コミ</span>
      </div>
    </div>
    <div class="google-review-card__rating" aria-label="${rating} / 5 の星評価">
      ${renderGoogleStars(rating)}
    </div>
    <p id="${textId}" class="google-review-card__text" data-google-review-text>${text}</p>
    <button class="google-review-card__toggle" type="button" data-google-review-toggle aria-expanded="false" aria-controls="${textId}">続きを読む</button>
  </article>`;
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
    : '<i data-lucide="send" class="w-5 h-5" aria-hidden="true"></i> メールフォームを送信する';
  refreshIcons(submitBtn);
}

function redirectToThanksPage() {
  window.location.assign("/thanks.html");
}

function trackFormSubmitAndRedirect() {
  let redirected = false;
  const redirect = () => {
    if (redirected) return;
    redirected = true;
    redirectToThanksPage();
  };

  if (typeof window.hkTrackConversion === "function") {
    window.hkTrackConversion("form_submit", {
      eventCallback: redirect,
      eventTimeout: 900
    });
    window.setTimeout(redirect, 1200);
    return;
  }

  window.setTimeout(redirect, 350);
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
      const headerOffset = stickyHeader?.offsetHeight || 0;
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 16;
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'auto'
      });
      window.requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      });
    });
  });
}

function setupPageTopButton() {
  if (!(pageTopButton instanceof HTMLElement)) return;

  const syncVisibility = () => {
    pageTopButton.classList.toggle('is-visible', window.scrollY > 300);
  };

  pageTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  syncVisibility();
  window.addEventListener('scroll', syncVisibility, { passive: true });
}

function setupFlowSlider() {
  document.querySelectorAll('[data-flow-slider]').forEach((slider) => {
    const slides = [...slider.querySelectorAll('[data-flow-slide]')];
    const dots = [...slider.querySelectorAll('[data-flow-dot]')];
    const prevButton = slider.querySelector('[data-flow-prev]');
    const nextButton = slider.querySelector('[data-flow-next]');
    const currentEl = slider.querySelector('[data-flow-current]');
    const totalEl = slider.querySelector('[data-flow-total]');
    const slideArea = slider.querySelector('.flow-slider__slides');

    if (!slides.length) return;

    const total = slides.length;
    const swipeMinDistance = 44;
    const swipeMaxVerticalDrift = 70;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let isSwipeTracking = false;
    let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    if (totalEl) {
      totalEl.textContent = String(total).padStart(2, '0');
    }

    const setSlide = (nextIndex) => {
      currentIndex = (nextIndex + total) % total;

      slides.forEach((slide, index) => {
        const isActive = index === currentIndex;
        slide.classList.toggle('is-active', isActive);
        slide.hidden = !isActive;
        slide.setAttribute('aria-hidden', String(!isActive));
      });

      dots.forEach((dot, index) => {
        const isActive = index === currentIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
        dot.tabIndex = isActive ? 0 : -1;
      });

      if (currentEl) {
        currentEl.textContent = String(currentIndex + 1).padStart(2, '0');
      }
    };

    prevButton?.addEventListener('click', () => setSlide(currentIndex - 1));
    nextButton?.addEventListener('click', () => setSlide(currentIndex + 1));

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => setSlide(index));
    });

    slideArea?.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
      isSwipeTracking = true;
      slideArea.setPointerCapture?.(event.pointerId);
    });

    slideArea?.addEventListener('pointerup', (event) => {
      if (!isSwipeTracking) return;
      isSwipeTracking = false;
      slideArea.releasePointerCapture?.(event.pointerId);

      const deltaX = event.clientX - swipeStartX;
      const deltaY = event.clientY - swipeStartY;
      if (Math.abs(deltaX) < swipeMinDistance || Math.abs(deltaY) > swipeMaxVerticalDrift) return;

      setSlide(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
    });

    slideArea?.addEventListener('pointercancel', () => {
      isSwipeTracking = false;
    });

    slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSlide(currentIndex - 1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSlide(currentIndex + 1);
      }
    });

    slider.classList.add('is-enhanced');
    setSlide(currentIndex);
  });
}

function setupHeaderSymptomDropdown() {
  document.querySelectorAll('.site-nav__item--has-dropdown').forEach((item) => {
    const trigger = item.querySelector('.site-nav__trigger');
    const menu = item.querySelector('.site-nav__dropdown');
    if (!(trigger instanceof HTMLElement) || !(menu instanceof HTMLElement)) return;

    const setOpen = (open) => {
      item.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(!item.classList.contains('is-open'));
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
        menu.querySelector('a')?.focus();
      }
    });

    item.addEventListener('mouseenter', () => setOpen(true));
    item.addEventListener('mouseleave', () => setOpen(false));

    item.addEventListener('focusout', (event) => {
      const nextTarget = event.relatedTarget;
      if (!(nextTarget instanceof Node) || !item.contains(nextTarget)) {
        setOpen(false);
      }
    });

    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.focus();
    });

    document.addEventListener('click', (event) => {
      if (event.target instanceof Node && !item.contains(event.target)) {
        setOpen(false);
      }
    });
  });
}

(() => {
  const deadlineEl = document.querySelector('[data-deadline]');
  const remainingEl = document.querySelector('[data-remaining]');
  const totalEl = document.querySelector('[data-total]');
  if (!deadlineEl && !remainingEl && !totalEl) return;

  const WEEKS_CONFIG = [
    { remaining: 2, total: 6 },
    { remaining: 1, total: 6 },
    { remaining: 3, total: 6 },
    { remaining: 4, total: 6 }
  ];

  const now = new Date();
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
  const deadline = new Date(now);
  deadline.setDate(now.getDate() + daysUntilSaturday);

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  if (deadlineEl) {
    deadlineEl.textContent = `${deadline.getMonth() + 1}月${deadline.getDate()}日(${weekdays[deadline.getDay()]})`;
  }

  const weekStart = new Date(now);
  const daysSinceMonday = (now.getDay() + 6) % 7;
  weekStart.setDate(now.getDate() - daysSinceMonday);
  weekStart.setHours(0, 0, 0, 0);

  const baseMonday = new Date(2026, 0, 5);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekIndex = Math.floor((weekStart.getTime() - baseMonday.getTime()) / msPerWeek);
  const config = WEEKS_CONFIG[((weekIndex % WEEKS_CONFIG.length) + WEEKS_CONFIG.length) % WEEKS_CONFIG.length];

  if (totalEl) {
    totalEl.dataset.total = String(config.total);
    totalEl.textContent = String(config.total);
  }

  if (remainingEl) {
    remainingEl.dataset.remaining = String(config.remaining);
    remainingEl.textContent = `残り${config.remaining}名様`;
  }
})();

async function hydrateBlogPreview() {
  const container = document.getElementById('blog-preview-container');
  if (!container) return;
  if (container.children.length) {
    refreshIcons(container);
    return;
  }

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

function setupGoogleReviewScroller() {
  const track = document.querySelector('[data-google-review-track]');
  if (!track) return;

  track.innerHTML = googleReviews.map(renderGoogleReviewCard).join('');

  const scrollByCard = (direction) => {
    const firstCard = track.querySelector('.google-review-card');
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 18;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : track.clientWidth * 0.9;
    track.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  document.querySelector('[data-google-review-prev]')?.addEventListener('click', () => scrollByCard(-1));
  document.querySelector('[data-google-review-next]')?.addEventListener('click', () => scrollByCard(1));

  track.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('[data-google-review-toggle]');
    if (!(button instanceof HTMLButtonElement) || !track.contains(button)) return;

    const card = button.closest('.google-review-card');
    if (!card) return;

    const isExpanded = card.classList.toggle('is-expanded');
    button.setAttribute('aria-expanded', String(isExpanded));
    button.textContent = isExpanded ? '閉じる' : '続きを読む';
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByCard(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByCard(1);
    }
  });
}

function setupTopPageTracking() {
  const guidance = document.querySelector('[data-top-medical-guidance]');
  if (guidance && typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      window.hkTrackEvent?.('top_medical_guidance_view', {
        content_group: 'top_medical_guidance'
      });
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(guidance);
  }

  let formStarted = false;
  contactForm?.addEventListener('input', () => {
    if (formStarted) return;
    formStarted = true;
    window.hkTrackEvent?.('top_contact_form_start', {
      content_group: 'top_contact'
    });
  }, { passive: true });
}

refreshIcons();
syncHeaderHeight();
setMenuState(false);
setupHeaderSymptomDropdown();
setupSmoothScroll();
setupMobileMenuLinks();
setupPageTopButton();
setupFlowSlider();
setupGalleryTriggers();
setupGoogleReviewScroller();
hydrateBlogPreview();
setupTopPageTracking();

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    stickyHeader?.classList.toggle('is-stuck', window.scrollY > 50);
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
    showToast('入力内容をご確認ください。', 'error');
    firstInvalid.focus();
    return;
  }

  window.hkTrackEvent?.('top_contact_form_submit', {
    content_group: 'top_contact'
  });

  setSubmitBusy(true);
  clearFormError();

  try {
    await submitViaCors(contactForm);
    contactForm.classList.add('hidden');
    successMsg?.classList.remove('hidden');
    showToast('送信が完了しました。24時間以内に折り返しご連絡いたします。');
    successMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    successMsg?.focus({ preventScroll: true });
    trackFormSubmitAndRedirect();
  } catch (error) {
    console.error('Contact form submit error:', error);
    setFormError('送信に失敗しました。時間をおいて再送するか、LINE予約・お電話をご利用ください。');
    showToast('送信に失敗しました。LINE予約・お電話もご利用ください。', 'error');
  } finally {
    setSubmitBusy(false);
  }
});
