(() => {
  const form = document.getElementById("site-contact-form");
  if (!form) return;

  // Match the existing deployment: email replies are included in the message.
  const GAS_URL = "https://script.google.com/macros/s/AKfycbzxlY8wFSXpgtyP9TVFwFM2BCrzfihbkmEOjYd5PROmEubX3B4NLxOhYOvZxeg7zZbc1w/exec";
  const status = document.getElementById("contact-form-status");
  const submit = form.querySelector('button[type="submit"]');
  const fields = {
    name: document.getElementById("contact-name"),
    email: document.getElementById("contact-email"),
    phone: document.getElementById("contact-phone"),
    message: document.getElementById("contact-message"),
    consent: document.getElementById("contact-consent"),
  };

  const setError = (key, message) => {
    fields[key].setAttribute("aria-invalid", message ? "true" : "false");
    document.getElementById(`contact-${key}-error`).textContent = message;
  };

  const validate = () => {
    Object.keys(fields).forEach((key) => setError(key, ""));
    let firstInvalid = null;
    const invalid = (key, message) => {
      setError(key, message);
      firstInvalid ||= fields[key];
    };
    if (!fields.name.value.trim()) invalid("name", "お名前を入力してください。");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim())) invalid("email", "メールアドレスを確認してください。");
    if (fields.phone.value.trim() && !/^[0-9+＋()\-\s]{10,18}$/.test(fields.phone.value.trim())) invalid("phone", "電話番号を確認してください。");
    if (!fields.message.value.trim()) invalid("message", "お問い合わせ内容を入力してください。");
    if (!fields.consent.checked) invalid("consent", "個人情報の取り扱いを確認し、同意してください。");
    return firstInvalid;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const firstInvalid = validate();
    if (firstInvalid) {
      status.textContent = "入力内容を確認してください。メールは送信していません。";
      firstInvalid.focus();
      return;
    }

    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    status.textContent = "送信しています…";
    const data = new URLSearchParams({
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim() || "未記入（メールで返信）",
      message: `返信先メール：${fields.email.value.trim()}\n\n${fields.message.value.trim()}`,
    });
    try {
      const response = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: data.toString(),
      });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok || result?.ok !== true || result?.status !== "success") throw new Error("送信できませんでした。");
      form.reset();
      status.textContent = "送信を受け付けました。返信をお待ちください。";
    } catch {
      status.textContent = "送信できませんでした。LINEまたは電話でご連絡ください。";
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    }
  });
})();
