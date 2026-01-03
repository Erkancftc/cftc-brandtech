const form = document.getElementById("contactForm")
const btn = document.getElementById("sendBtn")
const msgBox = document.getElementById("formMsg")
const label = btn.querySelector(".btn-label")

const FUNCTION_URL = "https://coinwdmofzqhobmqzniv.supabase.co/functions/v1/send-contact"
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-IOZRI2zsxDArrl8Sy11Bg_7iNbLGs3"

form.addEventListener("submit", async e => {
  e.preventDefault()
  if (btn.disabled) return

  // reCAPTCHA widget hazır mı?
  if (window.recaptchaWidgetId === null || !window.grecaptcha) {
    msgBox.textContent = "❌ reCAPTCHA henüz yüklenmedi. Lütfen 1-2 saniye bekleyin."
    return
  }

  const recaptchaToken = grecaptcha.getResponse(window.recaptchaWidgetId)
  if (!recaptchaToken) {
    msgBox.textContent = "❌ Lütfen 'Ben robot değilim' doğrulamasını yapın."
    return
  }

  btn.disabled = true
  btn.classList.add("is-loading")
  if (label) label.textContent = "Gönderiliyor..."
  msgBox.textContent = ""

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    message: document.getElementById("message").value.trim(),
    recaptcha_token: recaptchaToken,
  }

  try {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || "Gönderim başarısız.")

    msgBox.textContent = "✅ Mesajınız alındı. En kısa sürede dönüş yapacağız."
    form.reset()

    // checkbox reset
    grecaptcha.reset(window.recaptchaWidgetId)

    msgBox.classList.add("show")
    setTimeout(() => msgBox.classList.add("fade"), 3500)
    setTimeout(() => {
      msgBox.textContent = ""
      msgBox.classList.remove("show", "fade")
    }, 4200)
  } catch (err) {
    msgBox.textContent = "❌ " + (err.message || "Bir hata oluştu.")
  } finally {
    btn.disabled = false
    btn.classList.remove("is-loading")
    if (label) label.textContent = "MESAJ GÖNDER"
  }
})
// ======================
// reCAPTCHA (global)
// ======================
window.recaptchaWidgetId = null;

window.renderRecaptcha = function () {
  // Google script yüklenmediyse çık
  if (!window.grecaptcha) return;

  const el = document.getElementById("recaptcha-container");
  if (!el) return; // contact sayfasında değiliz

  // container temizle ve tekrar render et
  el.innerHTML = "";
  window.recaptchaWidgetId = grecaptcha.render(el, {
    sitekey: "6LfwAj8sAAAAAOFYr9hCMZALZ7pdyq4NWrvW3zx_",
  });
};

// reCAPTCHA script callback
window.onRecaptchaLoad = function () {
  window.renderRecaptcha();
};

// Swup geçişlerinden sonra (contact’a gelince) tekrar render
document.addEventListener("swup:contentReplaced", () => {
  // her geçişte widget resetle ve gerekiyorsa render et
  window.recaptchaWidgetId = null;
  window.renderRecaptcha();
});
