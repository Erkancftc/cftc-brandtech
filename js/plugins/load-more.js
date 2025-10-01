
document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.js-posts');                 // liste kapsayıcısı
  const items = Array.from(list.querySelectorAll('.js-post'));      // tüm kartlar
  const btn   = document.getElementById('loadMore');                // buton
  const btnRow = btn.closest('.row') || btn.parentElement;          // butonun içinde bulunduğu satır
  const BATCH = Number(list.dataset.batch || 4);                    // her seferde 4

  // Başlangıçta sadece ilk 4'ü göster
  items.forEach((el, i) => { el.hidden = i >= BATCH; });
  let shown = Math.min(BATCH, items.length);

  btn.addEventListener('click', () => {
    // Sonraki 4'ü aç
    const next = Math.min(shown + BATCH, items.length);
    for (let i = shown; i < next; i++) items[i].hidden = false;
    shown = next;

    // Butonu, liste kapsayıcısından hemen sonraya taşı (section sonunda dursun)
    // Böylece yeni açılan kartların da altında kalır.
    list.parentNode.insertBefore(btnRow, list.nextSibling);

    // Ekranı butona kaydır (buton görünür kalsın)
    btn.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // Hepsi yüklendiyse butonu pasifleştir (görünmeye devam etsin)
    if (shown >= items.length) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.textContent = 'HEPSİ YÜKLENDİ';
    }
  });
});

