(function () {
  const normalize = s => (s || '').toLocaleLowerCase('tr').trim();

  let postsContainer = null;
  let loadMoreBtn = null;
  let initialBatch = 4;

  function getCols() {
    if (!postsContainer) return [];
    return Array.from(postsContainer.querySelectorAll('.col-lg-12')).filter(c => c.querySelector('.js-post'));
  }

  function getAuthorFromCol(col) {
    const post = col.querySelector('.js-post');
    return (post && (post.dataset.author || post.getAttribute('data-author'))) ||
           (col.querySelector('.author-link') && (col.querySelector('.author-link').dataset.author || col.querySelector('.author-link').textContent)) ||
           '';
  }

  function getCategoryFromCol(col) {
    const acc = col.querySelector('.mil-labels .mil-label.mil-accent');
    if (acc) return acc.textContent || '';
    const first = col.querySelector('.mil-labels .mil-label');
    return (first && first.textContent) || '';
  }

  function refreshAnimations() {
    try {
      if (window.ScrollTrigger && typeof ScrollTrigger.refresh === 'function') { ScrollTrigger.refresh(true); return; }
      if (window.gsap && typeof gsap.delayedCall === 'function') { gsap.delayedCall(0.02, () => window.dispatchEvent(new Event('scroll'))); return; }
    } catch (e) {}
    window.dispatchEvent(new Event('scroll'));
  }

  function clearFilterUI() {
    const cols = getCols();
    cols.forEach((col, i) => {
      if (i < initialBatch) {
        col.style.display = '';
        col.classList.remove('mil-hidden', 'hidden', 'd-none');
        col.removeAttribute('aria-hidden');
      } else {
        col.style.display = 'none';
        col.classList.add('mil-hidden');
        col.setAttribute('aria-hidden', 'true');
      }
    });
    if (loadMoreBtn) loadMoreBtn.style.display = (cols.length > initialBatch ? '' : 'none');
    refreshAnimations();
  }

  function applyCombinedFilter(authorName, categoryName) {
    const qA = normalize(authorName || '');
    const qC = normalize(categoryName || '');
    if (!qA && !qC) { clearFilterUI(); return -1; }

    const cols = getCols();
    let found = 0;
    cols.forEach(col => {
      const a = normalize(getAuthorFromCol(col));
      const c = normalize(getCategoryFromCol(col));
      const matches = (!qA || a.includes(qA)) && (!qC || c.includes(qC));
      if (matches) {
        col.style.display = '';
        col.classList.remove('mil-hidden', 'hidden', 'd-none');
        col.removeAttribute('aria-hidden');
        found++;
      } else {
        col.style.display = 'none';
        col.classList.add('mil-hidden');
        col.setAttribute('aria-hidden', 'true');
      }
    });

    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    refreshAnimations();
    return found;
  }

  function waitForMutation(timeout = 900) {
    return new Promise(resolve => {
      if (!postsContainer) return resolve(false);
      const obs = new MutationObserver(muts => {
        if (muts.length) { obs.disconnect(); resolve(true); }
      });
      obs.observe(postsContainer, { childList: true, subtree: true });
      setTimeout(() => { try { obs.disconnect(); } catch(e){}; resolve(false); }, timeout);
    });
  }

  async function expandUntilFound(authorName, categoryName, maxAttempts = 6) {
    if (!loadMoreBtn) return 0;
    let attempts = 0;
    while (attempts < maxAttempts) {
      attempts++;
      const style = window.getComputedStyle(loadMoreBtn);
      if (style.display === 'none' || loadMoreBtn.disabled) break;
      try { loadMoreBtn.click(); } catch (e) { break; }
      await waitForMutation(1000);
      const found = applyCombinedFilter(authorName, categoryName);
      if (found > 0) return found;
      const afterStyle = window.getComputedStyle(loadMoreBtn);
      if (afterStyle.display === 'none' || loadMoreBtn.disabled) break;
    }
    return 0;
  }

  async function applyFilterWork(authorName, categoryName) {
    const found = applyCombinedFilter(authorName, categoryName);
    if (found === 0) {
      await expandUntilFound(authorName, categoryName);
    }
  }

  function init() {
    postsContainer = document.querySelector('.js-posts');
    if (!postsContainer) return;
    loadMoreBtn = document.getElementById('loadMore');
    initialBatch = Math.max(1, parseInt(postsContainer.dataset.batch || '4', 10));
    clearFilterUI();

    const catList = document.querySelector('.mil-Kategori-list');
    if (catList) {
      catList.addEventListener('click', async (ev) => {
        const a = ev.target.closest('a');
        if (!a) return;
        ev.preventDefault();

        // remove visual state from all
        catList.querySelectorAll('a').forEach(x => x.classList.remove('kategori-active', 'mil-active'));

        // apply both marker classes to clicked item so existing .mil-active CSS is used
        a.classList.add('mil-active');

        // call your filter (existing API): treat "Tüm Kategorİler" as clear
        const txt = (a.textContent || '').trim();
        const isAll = /tüm|tum/i.test(txt);
        if (window.searchByCategory) {
          await window.searchByCategory(isAll ? '' : txt);
        } else if (window.filterByAuthorInit) {
          // fallback: re-init then clear/apply
          window.filterByAuthorInit();
          if (isAll) window.searchByCategory && window.searchByCategory('');
        }
      });
    }

    if (window.swup && typeof window.swup.on === 'function') {
      try { window.swup.on('contentReplaced', init); } catch (e) {}
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  window.searchByCategory = async function (cat) {
    const activeAuthorEl = document.querySelector('.author-link.author-active');
    const authorName = activeAuthorEl ? (activeAuthorEl.dataset.author || activeAuthorEl.textContent).replace(/Yazar:\s*/i,'').trim() : '';
    if (!cat) return applyFilterWork(authorName || '', '');
    return applyFilterWork(authorName || '', cat);
  };
})();
