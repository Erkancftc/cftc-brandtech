
// global yardımcı: blog kartlarının animasyonlarını yenile
window.refreshBlogAnimations = function () {
  try {
    if (window.ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
      ScrollTrigger.refresh(true);
    } else if (window.gsap && typeof gsap.delayedCall === 'function') {
      gsap.delayedCall(0.02, function () {
        window.dispatchEvent(new Event('scroll'));
      });
    } else {
      window.dispatchEvent(new Event('scroll'));
    }
  } catch (e) {
    // sessizce geç
  }
};



document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.js-posts');
  if (!list) return;
  const btn = document.getElementById('loadMore');
  if (!btn) return;
  const btnRow = btn.closest('.col-lg-12') || btn.parentElement;
  const BATCH = Math.max(1, Number(list.dataset.batch || 4));

  const getCols = () =>
    Array.from(list.children || []).filter(node =>
      node.classList && node.classList.contains('col-lg-12') && node.querySelector('.js-post')
    );

  function placeButtonAfterList() {
    if (!btnRow || !list.parentNode) return;
    try { list.parentNode.insertBefore(btnRow, list.nextSibling); } catch (e) {}
    btnRow.style.display = '';
  }

  function initBatchState() {
    const cols = getCols();
    cols.forEach((col, i) => {
      if (i < BATCH) {
        col.classList.remove('lm-hidden');
        col.style.display = '';
        col.removeAttribute('aria-hidden');
      } else {
        col.classList.add('lm-hidden');
        col.style.display = 'none';
        col.setAttribute('aria-hidden', 'true');
      }
    });
    btn.style.display = (cols.length > BATCH) ? '' : 'none';
    btn.disabled = false;
    btn.removeAttribute('aria-disabled');
    placeButtonAfterList();
  }

    function revealNextBatch() {
  const cols = getCols();
  const hidden = cols.filter(c => c.classList.contains('lm-hidden'));
  const toShow = hidden.slice(0, BATCH);

  toShow.forEach(col => {
    col.classList.remove('lm-hidden');
    col.style.display = '';
    col.removeAttribute('aria-hidden');
  });

  placeButtonAfterList();

  if (cols.filter(c => c.classList.contains('lm-hidden')).length === 0) {
    btn.style.display = 'none';
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
  }

  // 👇 yeni: layout değişti, animasyonları yenile
  if (typeof window.refreshBlogAnimations === 'function') {
    window.refreshBlogAnimations();
  }
}


  // run init after other scripts — multiple times to be defensive
  function boot() {
    initBatchState();
    // reapply after a short delay (overrides other scripts that toggle display)
    setTimeout(initBatchState, 180);
    // final guard after images/layout settle
    setTimeout(initBatchState, 800);
  }
   window.__loadMoreInit = initBatchState;

  requestAnimationFrame(boot);
  window.addEventListener('load', boot);

  requestAnimationFrame(boot);
  window.addEventListener('load', boot);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    revealNextBatch();
    try { btn.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch (e) {}
  });

  const mo = new MutationObserver(() => {
    const filterActive = document.querySelector('.author-link.author-active') || document.querySelector('.kategori-active');
    if (!filterActive) initBatchState();
  });
  mo.observe(list, { childList: true, subtree: true });

  if (window.swup && typeof window.swup.on === 'function') {
    try { window.swup.on('contentReplaced', boot); } catch (e) {}
  }

  // debug helper
  window.__loadMoreStatus = () => {
    const cols = getCols();
    return { total: cols.length, visible: cols.filter(c => !c.classList.contains('lm-hidden') && c.style.display !== 'none').length, batch: BATCH };
  };
});

