(function () {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbzxlY8wFSXpgtyP9TVFwFM2BCrzfihbkmEOjYd5PROmEubX3B4NLxOhYOvZxeg7zZbc1w/exec";
  const form = document.getElementById("reservationForm");
  const submitButton = document.getElementById("reservationSubmit");
  const successPanel = document.getElementById("reservationSuccess");
  const formError = document.getElementById("form-error");
  const formPanel = document.getElementById("reservationFormPanel");
  const openFormButton = document.getElementById("openReservationForm");

  if (!form || !submitButton || !successPanel || !formError || !formPanel || !openFormButton) return;

  window.lucide?.createIcons();

  const dateInputs = [1, 2, 3].map((number) => document.getElementById(`date${number}`));
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInputs.forEach((input) => {
    if (input) input.min = localToday;
  });

  const params = new URLSearchParams(window.location.search);
  const sourceParts = ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
    .map((key) => params.get(key) ? `${key}=${params.get(key)}` : "")
    .filter(Boolean);
  document.getElementById("source").value = sourceParts.join(" / ") || "reservation_page";

  openFormButton.addEventListener("click", () => {
    formPanel.hidden = false;
    openFormButton.setAttribute("aria-expanded", "true");
    formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("name")?.focus({ preventScroll: true }), 450);
  });

  function setError(id, message) {
    const field = document.getElementById(id);
    const error = document.getElementById(`${id}-error`);
    if (field) field.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  }

  function clearErrors() {
    form.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
    form.querySelectorAll(".reserve-error").forEach((error) => { error.textContent = ""; });
    formError.textContent = "";
  }

  function validate() {
    clearErrors();
    let firstInvalid = null;
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const date1 = document.getElementById("date1");
    const time1 = document.getElementById("time1");
    const consent = document.getElementById("consent");
    const replyMethod = document.getElementById("replyMethod");

    if (!name.value.trim()) {
      setError("name", "お名前を入力してください。");
      firstInvalid ||= name;
    }
    if (!/^[0-9\-()＋+\s]{10,18}$/.test(phone.value.trim())) {
      setError("phone", "連絡可能な電話番号を入力してください。");
      firstInvalid ||= phone;
    }
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError("email", "メールアドレスの形式をご確認ください。");
      firstInvalid ||= email;
    }
    if (replyMethod.value === "メール" && !email.value.trim()) {
      setError("email", "メールでの返信をご希望の場合は、メールアドレスを入力してください。");
      firstInvalid ||= email;
    }
    if (!date1.value || !time1.value) {
      date1.setAttribute("aria-invalid", "true");
      time1.setAttribute("aria-invalid", "true");
      document.getElementById("date-error").textContent = "第1希望の日付と時間帯を選択してください。";
      firstInvalid ||= date1;
    }
    [1, 2, 3].forEach((number) => {
      const date = document.getElementById(`date${number}`);
      const time = document.getElementById(`time${number}`);
      if (date.value && new Date(`${date.value}T00:00:00`).getDay() === 0) {
        date.setAttribute("aria-invalid", "true");
        document.getElementById("date-error").textContent = "日曜日は定休日です。月曜日から土曜日の間でお選びください。";
        firstInvalid ||= date;
      } else if ((date.value && !time.value) || (!date.value && time.value)) {
        date.setAttribute("aria-invalid", "true");
        time.setAttribute("aria-invalid", "true");
        document.getElementById("date-error").textContent = `第${number}希望の日付と時間帯を両方選択してください。`;
        firstInvalid ||= date;
      }
    });
    if (!consent.checked) {
      document.getElementById("consent-error").textContent = "内容をご確認のうえ、同意欄にチェックしてください。";
      firstInvalid ||= consent;
    }
    return firstInvalid;
  }

  function formatDate(value) {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${year}年${Number(month)}月${Number(day)}日`;
  }

  function preparePayload() {
    const choices = [1, 2, 3].map((number) => {
      const date = document.getElementById(`date${number}`).value;
      const time = document.getElementById(`time${number}`).value;
      return date ? `第${number}希望：${formatDate(date)} ${time || "時間帯未指定"}` : "";
    }).filter(Boolean);

    document.getElementById("preferredDate").value = choices.join(" / ");
    const email = document.getElementById("email").value.trim();
    const note = document.getElementById("reservationNote").value.trim();
    document.getElementById("message").value = [
      `主なお悩み：${document.getElementById("symptom").value}`,
      `希望する返信方法：${document.getElementById("replyMethod").value}`,
      email ? `メールアドレス：${email}` : "",
      note ? `相談内容：${note}` : ""
    ].filter(Boolean).join("\n");
  }

  async function submitForm() {
    const body = new URLSearchParams(new FormData(form)).toString();
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : null;
    if (!response.ok || payload?.ok === false || payload?.status === "error") {
      throw new Error(payload?.message || `HTTP ${response.status}`);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (document.getElementById("website").value) return;

    const invalid = validate();
    if (invalid) {
      invalid.focus();
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    preparePayload();
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButton.querySelector("span").textContent = "送信しています…";

    try {
      await submitForm();
      window.hkTrackEvent?.("reservation_request_submit", { content_group: "reservation" });
      window.hkTrackConversion?.("form_submit");
      form.hidden = true;
      successPanel.hidden = false;
      successPanel.focus();
      successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error("Reservation request submit error:", error);
      formError.textContent = "送信できませんでした。時間をおいて再度お試しいただくか、LINEまたは電話をご利用ください。";
      formError.focus();
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButton.querySelector("span").textContent = "予約希望日時を送信する";
    }
  });

  form.addEventListener("input", (event) => {
    if (event.target instanceof HTMLElement) event.target.removeAttribute("aria-invalid");
  });
})();
