// Copied from ../scripts/main.js header and page-top behavior for symptom pages.
(() => {
  const stickyHeader = document.querySelector('.site-header__lower');
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const pageTopButton = document.querySelector('.page-top-button');

  const syncHeaderHeight = () => {
    const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 58;
    document.documentElement.style.setProperty('--header-h', String(headerHeight) + 'px');
  };

  const setMenuState = (open) => {
    if (!menuBtn || !mobileNav) return;
    mobileNav.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '\u30e1\u30cb\u30e5\u30fc\u3092\u9589\u3058\u308b' : '\u30e1\u30cb\u30e5\u30fc\u3092\u958b\u304f');
  };

  const setupMobileMenuLinks = () => {
    if (!mobileNav) return;
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });
  };

  const setupHeaderSymptomDropdown = () => {
    const dropdownItems = document.querySelectorAll('.site-nav__item--has-dropdown');
    dropdownItems.forEach((item) => {
      const trigger = item.querySelector('.site-nav__trigger');
      if (!trigger) return;

      const setDropdownState = (open) => {
        item.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
      };

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        setDropdownState(!item.classList.contains('is-open'));
      });

      document.addEventListener('click', (event) => {
        if (!item.contains(event.target)) {
          setDropdownState(false);
        }
      });

      item.addEventListener('mouseleave', () => {
        if (!item.matches(':focus-within')) {
          setDropdownState(false);
        }
      });
    });
  };

  const setupPageTopButton = () => {
    if (!(pageTopButton instanceof HTMLElement)) return;

    const syncVisibility = () => {
      pageTopButton.classList.toggle('is-visible', window.scrollY > 300);
    };

    pageTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    syncVisibility();
    window.addEventListener('scroll', syncVisibility, { passive: true });
  };

  const setupFlowSlider = () => {
    document.querySelectorAll('[data-flow-slider]').forEach((slider) => {
      const slides = [...slider.querySelectorAll('[data-flow-slide]')];
      const dots = [...slider.querySelectorAll('[data-flow-dot]')];
      const prevButton = slider.querySelector('[data-flow-prev]');
      const nextButton = slider.querySelector('[data-flow-next]');
      const currentEl = slider.querySelector('[data-flow-current]');
      const totalEl = slider.querySelector('[data-flow-total]');

      if (!slides.length) return;

      const total = slides.length;
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
  };

  const setupPricingDeadline = () => {
    const deadlineEl = document.querySelector('[data-deadline]');
    const remainingEl = document.querySelector('[data-remaining]');
    const totalEl = document.querySelector('[data-total]');
    if (!deadlineEl && !remainingEl && !totalEl) return;

    const weeksConfig = [
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
    const config = weeksConfig[((weekIndex % weeksConfig.length) + weeksConfig.length) % weeksConfig.length];

    if (totalEl) {
      totalEl.dataset.total = String(config.total);
      totalEl.textContent = String(config.total);
    }

    if (remainingEl) {
      remainingEl.dataset.remaining = String(config.remaining);
      remainingEl.textContent = `残り${config.remaining}名様`;
    }
  };

  syncHeaderHeight();
  setMenuState(false);
  setupHeaderSymptomDropdown();
  setupMobileMenuLinks();
  setupPageTopButton();
  setupFlowSlider();
  setupPricingDeadline();

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      setMenuState(!isOpen);
    });
  }

  const onScroll = () => {
    if (stickyHeader) {
      stickyHeader.classList.toggle('is-stuck', window.scrollY > 4);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', syncHeaderHeight);
  onScroll();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
})();
