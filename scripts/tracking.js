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

  if (hasGoogleTag) {
    appendGoogleTagScript(ga4MeasurementId || googleAdsConversionId);
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

  document.addEventListener(
    "click",
    (event) => {
      const link = getClickedLink(event.target);
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const text = link.textContent || "";

      if (href.toLowerCase().startsWith("tel:")) {
        window.hkTrackConversion("phone", { linkUrl: href });
        return;
      }

      if (isLineLink(href, text)) {
        window.hkTrackConversion("line", { linkUrl: href });
      }
    },
    { capture: true }
  );

  if (/\/thanks(?:\.html)?$/.test(window.location.pathname.replace(/\/+$/, ""))) {
    window.hkTrackConversion("thanks");
  }
})();
