const form = document.getElementById("contactForm")
const btn = document.getElementById("sendBtn")
const msgBox = document.getElementById("formMsg")
const label = btn.querySelector(".btn-label")

const FUNCTION_URL = "https://coinwdmofzqhobmqzniv.supabase.co/functions/v1/send-contact"
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-IOZRI2zsxDArrl8Sy11Bg_7iNbLGs3"

// ✅ reCAPTCHA widget id GLOBAL olmalı
let recaptchaWidgetId = null

// ✅ Google script onload bunu çağıracak
window.onRecaptchaLoad = function () {
  const container = document.getElementById("recaptcha-container")
  if (!container) return

  // Daha önce render edildiyse tekrar render etme
  if (recaptchaWidgetId !== null) return

  recaptchaWidgetId = grecaptcha.render(container, {
    sitekey: "6LfwAj8sAAAAAOFYr9hCMZALZ7pdyq4NWrvW3zx_", // SITE KEY
  })
}

form.addEventListener("submit", async e => {
  e.preventDefault()
  if (btn.disabled) return

  // ✅ Widget daha render olmadıysa: kullanıcıya net mesaj
  if (recaptchaWidgetId === null) {
    msgBox.textContent = "❌ reCAPTCHA henüz yüklenmedi. Sayfayı yenileyip tekrar deneyin."
    return
  }

  // ✅ Token al
  const recaptchaToken = grecaptcha.getResponse(recaptchaWidgetId)
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

    // ✅ Checkbox’ı sıfırla
    grecaptcha.reset(recaptchaWidgetId)

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
