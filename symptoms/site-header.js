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

  const setupContactForm = () => {
    const contactForm = document.getElementById('contactForm');
    if (!(contactForm instanceof HTMLFormElement)) return;

    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('successMessage');
    const formError = document.getElementById('form-error');
    const gasUrl = 'https://script.google.com/macros/s/AKfycbzxlY8wFSXpgtyP9TVFwFM2BCrzfihbkmEOjYd5PROmEubX3B4NLxOhYOvZxeg7zZbc1w/exec';

    const refreshIcons = (scope) => {
      if (!window.lucide || typeof window.lucide.createIcons !== 'function') return;
      if (scope) {
        window.lucide.createIcons({ nodes: scope.querySelectorAll('[data-lucide]') });
        return;
      }
      window.lucide.createIcons();
    };

    const clearFieldError = (id) => {
      const field = document.getElementById(id);
      const error = document.getElementById(`${id}-error`);
      field?.setAttribute('aria-invalid', 'false');
      error?.classList.add('hidden');
    };

    const setFieldError = (id, message) => {
      const field = document.getElementById(id);
      const error = document.getElementById(`${id}-error`);
      field?.setAttribute('aria-invalid', 'true');
      if (error) {
        error.textContent = message;
        error.classList.remove('hidden');
      }
    };

    const setFormError = (message) => {
      if (!formError) return;
      formError.textContent = message;
      formError.classList.remove('hidden');
      formError.focus();
    };

    const clearFormError = () => {
      if (!formError) return;
      formError.textContent = '';
      formError.classList.add('hidden');
    };

    const validateForm = () => {
      const validations = [
        {
          id: 'name',
          message: 'お名前を入力してください。',
          valid: (value) => value.trim().length > 0
        },
        {
          id: 'phone',
          message: '電話番号を正しく入力してください。',
          valid: (value) => /^[0-9\-()+\s]{10,15}$/.test(value.trim())
        }
      ];

      let firstInvalid = null;
      clearFormError();

      validations.forEach(({ id, message, valid }) => {
        const input = document.getElementById(id);
        if (!(input instanceof HTMLInputElement)) return;
        clearFieldError(id);
        if (!valid(input.value)) {
          setFieldError(id, message);
          if (!firstInvalid) firstInvalid = input;
        }
      });

      return firstInvalid;
    };

    const setSubmitBusy = (isBusy) => {
      if (!(submitBtn instanceof HTMLButtonElement)) return;
      submitBtn.disabled = isBusy;
      submitBtn.setAttribute('aria-busy', String(isBusy));
      submitBtn.innerHTML = isBusy
        ? '<i data-lucide="loader-2" class="h-5 w-5" aria-hidden="true"></i> 送信中…'
        : '<i data-lucide="send" class="h-5 w-5" aria-hidden="true"></i> メールフォームを送信する';
      refreshIcons(submitBtn);
    };

    ['name', 'phone'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
    });

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const firstInvalid = validateForm();
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      setSubmitBusy(true);
      clearFormError();

      try {
        const response = await fetch(gasUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: new URLSearchParams(new FormData(contactForm)).toString()
        });
        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json') ? await response.json() : null;

        if (!response.ok || payload?.ok === false || payload?.status === 'error') {
          throw new Error(payload?.message || '送信に失敗しました。');
        }

        contactForm.classList.add('hidden');
        successMsg?.classList.remove('hidden');
        successMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        successMsg?.focus({ preventScroll: true });
        window.setTimeout(() => {
          window.location.assign('/thanks.html');
        }, 350);
      } catch (error) {
        console.error('Contact form submit error:', error);
        setFormError('送信に失敗しました。時間をおいて再送するか、LINE予約・お電話をご利用ください。');
      } finally {
        setSubmitBusy(false);
      }
    });
  };

  syncHeaderHeight();
  setMenuState(false);
  setupHeaderSymptomDropdown();
  setupMobileMenuLinks();
  setupPageTopButton();
  setupFlowSlider();
  setupPricingDeadline();
  setupContactForm();

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
