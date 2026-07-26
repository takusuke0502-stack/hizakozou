(function () {
  const config = window.HK_TRACKING_CONFIG || {};
  const ga4MeasurementId = String(config.ga4MeasurementId || "").trim();
  const googleAdsConversionId = String(config.googleAdsConversionId || "").trim();
  const conversionLabels = {
    line: "",
    phone: "",
    form: "",
    reservation: "",
    thanks: "",
    ...(config.conversionLabels || {})
  };
  const hasGoogleTag = Boolean(ga4MeasurementId || googleAdsConversionId);
  const sentArticleEvents = new Set();

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  function appendGoogleTagScript(tagId) {
    if (!tagId || document.querySelector("script[data-hk-google-tag]")) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
    script.dataset.hkGoogleTag = "true";
    document.head.appendChild(script);
  }

  function scheduleGoogleTagScript(tagId) {
    const loadScript = () => appendGoogleTagScript(tagId);
    const loadWhenIdle = () => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadScript, { timeout: 2000 });
        return;
      }
      window.setTimeout(loadScript, 0);
    };

    if (document.readyState === "complete") {
      loadWhenIdle();
      return;
    }
    window.addEventListener("load", loadWhenIdle, { once: true });
  }

  if (hasGoogleTag) {
    scheduleGoogleTagScript(ga4MeasurementId || googleAdsConversionId);
    window.gtag("js", new Date());

    if (ga4MeasurementId) {
      window.gtag("config", ga4MeasurementId, { send_page_view: true });
    }

    if (googleAdsConversionId) {
      window.gtag("config", googleAdsConversionId, {
        allow_enhanced_conversions: true
      });
    }
  }

  const conversions = {
    line: {
      eventName: "line_consult_click",
      label: conversionLabels.line
    },
    phone: {
      eventName: "phone_click",
      label: conversionLabels.phone
    },
    form_submit: {
      eventName: "form_submit",
      label: conversionLabels.form
    },
    thanks: {
      eventName: "generate_lead",
      label: conversionLabels.reservation || conversionLabels.thanks
    }
  };

  function cleanParams(params) {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    );
  }

  function buildSendTo(label) {
    if (!googleAdsConversionId || !label) return "";
    return `${googleAdsConversionId}/${label}`;
  }

  function runOnce(callback) {
    let called = false;
    return function once() {
      if (called) return;
      called = true;
      if (typeof callback === "function") callback();
    };
  }

  function getSymptomSlug() {
    const match = window.location.pathname.match(/\/symptoms\/([^/]+?)(?:\.html)?\/?$/);
    return match ? match[1] : "";
  }

  function getCtaLocation(link) {
    if (!link) return "";
    if (link.dataset.trackingLocation) return link.dataset.trackingLocation;

    const container = link.closest("[data-tracking-section], section, header, footer, nav");
    if (!container) return "";
    if (container.dataset.trackingSection) return container.dataset.trackingSection;
    if (container.id) return container.id;

    return Array.from(container.classList).find((name) =>
      /(cta|consult|contact|pricing|header|footer|mobile|hero)/.test(name)
    ) || "";
  }

  window.hkTrackConversion = function hkTrackConversion(type, options = {}) {
    const conversion = conversions[type];
    const eventCallback = options.eventCallback;
    const eventTimeout = Number(options.eventTimeout || 800);
    const complete = runOnce(eventCallback);

    if (!conversion || !hasGoogleTag || typeof window.gtag !== "function") {
      complete();
      return false;
    }

    const sendTo = buildSendTo(conversion.label);
    const commonParams = cleanParams({
      event_category: "conversion",
      event_label: type,
      link_url: options.linkUrl,
      link_text: options.linkText,
      cta_location: options.ctaLocation,
      symptom_slug: getSymptomSlug(),
      page_location: window.location.href
    });

    if (conversion.eventName) {
      window.gtag(
        "event",
        conversion.eventName,
        cleanParams({
          ...commonParams,
          event_callback: sendTo ? undefined : complete,
          event_timeout: sendTo ? undefined : eventTimeout
        })
      );
    }

    if (sendTo) {
      window.gtag(
        "event",
        "conversion",
        cleanParams({
          send_to: sendTo,
          value: 1.0,
          currency: "JPY",
          event_callback: complete,
          event_timeout: eventTimeout
        })
      );
    }

    if (!conversion.eventName && !sendTo) {
      complete();
    }

    if (eventCallback) {
      window.setTimeout(complete, eventTimeout + 200);
    }

    return true;
  };

  window.hkTrackEvent = function hkTrackEvent(eventName, params = {}) {
    if (!eventName || !ga4MeasurementId || typeof window.gtag !== "function") {
      return false;
    }

    window.gtag(
      "event",
      eventName,
      cleanParams({
        ...params,
        symptom_slug: getSymptomSlug(),
        page_location: window.location.href
      })
    );
    return true;
  };

  function getClickedLink(target) {
    if (!(target instanceof Element)) return null;
    return target.closest("a[href]");
  }

  function isLineLink(href, text) {
    const normalizedHref = href.toLowerCase();
    const normalizedText = text.toLowerCase();
    return (
      normalizedHref.includes("lin.ee") ||
      normalizedHref.includes("line.me") ||
      normalizedHref.includes("liff.line.me") ||
      normalizedText.includes("line")
    );
  }

  function getArticleSlug() {
    const match = window.location.pathname.match(/\/blog\/posts\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function getArticleCategory() {
    return (document.querySelector(".article-card .article-meta .pill")?.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getArticleDeviceType() {
    return window.matchMedia?.("(max-width: 767px)").matches ? "smartphone" : "pc";
  }

  function getArticleTargetSlug(href) {
    try {
      const url = new URL(href, window.location.href);
      const blogMatch = url.pathname.match(/\/blog\/posts\/([^/]+)\/?$/);
      if (blogMatch) return decodeURIComponent(blogMatch[1]);

      const symptomMatch = url.pathname.match(/\/symptoms\/([^/]+?)(?:\.html)?\/?$/);
      if (symptomMatch) return decodeURIComponent(symptomMatch[1]);

      if (url.hash) return decodeURIComponent(url.hash.slice(1));

      const pathName = url.pathname.replace(/\/+$/, "").split("/").pop() || "";
      return decodeURIComponent(pathName.replace(/\.html$/, ""));
    } catch (error) {
      return "";
    }
  }

  function getArticleLinkPosition(link) {
    if (link.closest("[data-article-toc]")) return "toc";
    if (link.closest(".article-trust-panel")) return "staff_profile";
    if (link.closest(".article-related")) return "related_articles";
    if (link.closest(".article-mid-cta")) return "article_mid_cta";
    if (link.closest(".article-side")) return "article_side";
    if (link.closest(".pricing-cta")) return "article_end_cta";
    if (link.closest(".article-readable-lead")) return "article_lead";
    if (link.closest(".article-readable-overview")) return "article_overview";
    if (link.closest(".faq-block")) return "article_faq";
    if (link.closest(".article-section--symptoms")) return "related_symptoms";
    if (link.closest(".article-content")) return "article_body";
    return getCtaLocation(link) || "article_page";
  }

  function isInternalArticleLink(href) {
    try {
      const url = new URL(href, window.location.href);
      return ["http:", "https:", "file:"].includes(url.protocol) && url.origin === window.location.origin;
    } catch (error) {
      return false;
    }
  }

  function buildArticleEventParams(options = {}) {
    return {
      article_slug: getArticleSlug(),
      article_category: getArticleCategory(),
      target_slug: options.targetSlug || getArticleSlug(),
      link_position: options.linkPosition || "article_page",
      device_type: getArticleDeviceType(),
      link_url: options.linkUrl,
      link_text: options.linkText,
      scroll_percent: options.scrollPercent,
      content_group: "blog_article"
    };
  }

  function trackArticleEventOnce(eventName, options = {}) {
    if (!getArticleSlug() || sentArticleEvents.has(eventName)) return false;

    const sent = window.hkTrackEvent(eventName, buildArticleEventParams(options));
    if (sent) sentArticleEvents.add(eventName);
    return sent;
  }

  function trackArticleLink(link, href, text) {
    if (!getArticleSlug()) return;

    const commonOptions = {
      targetSlug: getArticleTargetSlug(href),
      linkPosition: getArticleLinkPosition(link),
      linkUrl: href,
      linkText: text
    };

    if (isLineLink(href, text) && link.closest(".article-content, .article-side, .pricing-cta")) {
      trackArticleEventOnce("article_line_click", commonOptions);
      return;
    }

    if (link.closest("[data-article-toc]")) {
      trackArticleEventOnce("article_toc_click", commonOptions);
      return;
    }

    if (link.closest(".article-trust-panel") && /\/staff(?:\.html)?\/?(?:[?#].*)?$/.test(href)) {
      trackArticleEventOnce("article_staff_profile_click", commonOptions);
      return;
    }

    if (link.closest(".article-related")) {
      trackArticleEventOnce("article_related_click", commonOptions);
      return;
    }

    if (link.closest(".article-content") && isInternalArticleLink(href)) {
      trackArticleEventOnce("article_internal_link_click", commonOptions);
    }
  }

  function initializeArticleTracking() {
    if (!getArticleSlug() || !document.body.classList.contains("article-page")) return;

    trackArticleEventOnce("article_view", { linkPosition: "page_load" });

    const article = document.querySelector(".article-content");
    if (!article) return;

    let frame = 0;
    const measureReadDepth = () => {
      frame = 0;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = Math.max(rect.height, article.scrollHeight, 1);
      const viewedHeight = window.scrollY + window.innerHeight - articleTop;
      const progress = Math.max(0, Math.min(1, viewedHeight / articleHeight));

      if (progress >= 0.5) {
        trackArticleEventOnce("article_scroll_50", {
          linkPosition: "article_body",
          scrollPercent: 50
        });
      }
      if (progress >= 0.9) {
        trackArticleEventOnce("article_scroll_90", {
          linkPosition: "article_body",
          scrollPercent: 90
        });
      }
    };
    const requestReadDepthMeasure = () => {
      if (!frame) frame = window.requestAnimationFrame(measureReadDepth);
    };

    window.addEventListener("scroll", requestReadDepthMeasure, { passive: true });
    window.addEventListener("resize", requestReadDepthMeasure);
    measureReadDepth();
  }

  function getTargetSymptomSlug(href) {
    const match = href.match(/(?:^|\/)([^/?#]+?)(?:\.html)?(?:[?#].*)?$/);
    if (!match) return "";
    const slug = match[1];
    return slug === "index" ? "" : slug;
  }

  function getExplorationEvent(link) {
    if (link.matches("[data-top-symptom-link]")) return "top_symptom_link_click";
    if (link.matches("[data-top-all-symptoms]")) return "top_all_symptoms_click";
    if (link.classList.contains("symptom-directory__link")) return "symptom_directory_link_click";
    if (link.classList.contains("symptom-page-toc__link")) return "symptom_toc_click";
    if (link.classList.contains("related-symptom-card")) return "related_symptom_click";
    if (
      link.classList.contains("related-articles-slider__card") ||
      link.classList.contains("related-article-card")
    ) {
      return "related_article_click";
    }
    if (link.classList.contains("symptom-trust__reference")) return "medical_reference_click";
    if (link.classList.contains("symptom-trust__reviewer-link")) return "staff_profile_click";
    return "";
  }

  document.addEventListener(
    "click",
    (event) => {
      const modeButton = event.target instanceof Element
        ? event.target.closest("[data-directory-mode]")
        : null;
      if (modeButton) {
        window.hkTrackEvent("symptom_directory_mode_select", {
          directory_mode: modeButton.dataset.directoryMode,
          content_group: "symptom_directory"
        });
      }

      const link = getClickedLink(event.target);
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const text = (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
      const ctaLocation = getCtaLocation(link);

      trackArticleLink(link, href, text);

      if (href.toLowerCase().startsWith("tel:")) {
        window.hkTrackConversion("phone", { linkUrl: href, linkText: text, ctaLocation });
        return;
      }

      if (isLineLink(href, text)) {
        window.hkTrackConversion("line", { linkUrl: href, linkText: text, ctaLocation });
        return;
      }

      const explorationEvent = getExplorationEvent(link);
      if (explorationEvent) {
        window.hkTrackEvent(explorationEvent, {
          link_url: href,
          link_text: text,
          cta_location: ctaLocation,
          directory_mode: link.closest("[data-directory-panel]")?.dataset.directoryPanel,
          target_symptom_slug: link.dataset.symptomSlug || getTargetSymptomSlug(href),
          content_group: link.dataset.trackingContentGroup || ""
        });
      }
    },
    { capture: true }
  );

  initializeArticleTracking();

  if (/\/thanks(?:\.html)?$/.test(window.location.pathname.replace(/\/+$/, ""))) {
    window.hkTrackConversion("thanks");
  }
})();
