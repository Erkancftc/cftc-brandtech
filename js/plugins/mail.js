const form = document.getElementById("contactForm")
const btn = document.getElementById("sendBtn")
const msgBox = document.getElementById("formMsg")

const label = btn.querySelector(".btn-label") // <-- önemli
const FUNCTION_URL = "https://coinwdmofzqhobmqzniv.supabase.co/functions/v1/send-contact"
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-IOZRI2zsxDArrl8Sy11Bg_7iNbLGs3"

form.addEventListener("submit", async e => {
  e.preventDefault()
  if (btn.disabled) return
  // reCAPTCHA kontrolü (BURASI)
  const recaptchaToken = grecaptcha.getResponse()
  if (!recaptchaToken) {
    msgBox.textContent = "❌ Lütfen 'Ben robot değilim' doğrulamasını yapın."
    btn.disabled = false
    btn.classList.remove("is-loading")
    if (label) label.textContent = "MESAJ GÖNDER"
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
   recaptcha_token: recaptchaToken, // <-- EKLENEN SATIR
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
    grecaptcha.reset()


    // mesajı 3.5 sn sonra fade-out (opsiyonel)
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

