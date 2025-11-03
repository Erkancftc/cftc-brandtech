// ...existing code...
(function () {
  const postsContainer = document.querySelector('.js-posts');
  if (!postsContainer) return;

  const loadMoreBtn = document.getElementById('loadMore');
  const initialBatch = Math.max(1, parseInt(postsContainer.dataset.batch || '4', 10));
  const cols = () => Array.from(postsContainer.querySelectorAll('.col-lg-12'));
  const normalize = s => (s || '').toLocaleLowerCase('tr').trim();

  function refreshAnimations() {
    try {
      if (window.ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
        ScrollTrigger.refresh(true);
        return;
      }
      if (window.gsap && typeof gsap.delayedCall === 'function') {
        gsap.delayedCall(0.02, () => window.dispatchEvent(new Event('scroll')));
        return;
      }
    } catch (e) { /* ignore */ }
    window.dispatchEvent(new Event('scroll'));
  }

  function clearFilter() {
    const allCols = cols();
    allCols.forEach((col, i) => {
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
    if (loadMoreBtn) loadMoreBtn.style.display = (cols().length > initialBatch ? '' : 'none');
    refreshAnimations();
  }

  // returns number of matches, and shows matched cols
  function applyFilterRaw(name) {
    const q = normalize(name || '');
    if (!q) { clearFilter(); return -1; }
    const allCols = cols();
    let found = 0;
    allCols.forEach(col => {
      const post = col.querySelector('.js-post');
      const authorFromPost = post && (post.dataset.author || post.getAttribute('data-author') || '');
      const link = col.querySelector('.author-link');
      const authorFromLink = (link && (link.dataset.author || '') ) || '';
      const authorText = authorFromPost || authorFromLink || col.textContent || '';
      if (normalize(authorText).includes(q)) {
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
    if (found === 0 && allCols.length === 0) return 0;
    return found;
  }

  // wait for DOM mutations under postsContainer or timeout
  function waitForMutation(timeout = 800) {
    return new Promise(resolve => {
      const obs = new MutationObserver((mutations) => {
        if (mutations.length) {
          obs.disconnect();
          resolve(true);
        }
      });
      obs.observe(postsContainer, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(false); }, timeout);
    });
  }

  // try clicking loadMore until match found or no more attempts
  async function expandUntilFound(name, maxAttempts = 6) {
    if (!loadMoreBtn) return 0;
    let attempts = 0;
    while (attempts < maxAttempts) {
      attempts++;
      // if button hidden / not actionable, stop
      const style = window.getComputedStyle(loadMoreBtn);
      if (style.display === 'none' || loadMoreBtn.disabled) break;
      // click the load more button (plugin should append/show posts)
      try { loadMoreBtn.click(); } catch (e) { break; }
      // wait for DOM change or short timeout
      await waitForMutation(900);
      // check matches again
      const found = applyFilterRaw(name);
      if (found > 0) return found;
      // if button became hidden after click, break
      const afterStyle = window.getComputedStyle(loadMoreBtn);
      if (afterStyle.display === 'none' || loadMoreBtn.disabled) break;
    }
    return 0;
  }

  async function applyFilter(name) {
    const q = normalize(name || '');
    if (!q) { clearFilter(); return; }
    let found = applyFilterRaw(name);
    if (found === 0) {
      // attempt to reveal more items via load-more until a match appears
      found = await expandUntilFound(name);
    }
    // hide load more during filtered view
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    refreshAnimations();
    return found;
  }

  document.addEventListener('DOMContentLoaded', () => clearFilter());

  // delegated click so dynamically loaded items work
  postsContainer.addEventListener('click', async (ev) => {
    const a = ev.target.closest('.author-link');
    if (!a) return;
    ev.preventDefault();
    ev.stopPropagation();
    const raw = (a.dataset.author || a.textContent || '').replace(/Yazar:\s*/i, '').trim();
    if (!raw) return;

    const active = postsContainer.querySelector('.author-link.author-active');
    const norm = normalize(raw);
    if (active && normalize(active.dataset.author || active.textContent || '') === norm) {
      postsContainer.querySelectorAll('.author-link').forEach(x => x.classList.remove('author-active'));
      clearFilter();
      return;
    }

    postsContainer.querySelectorAll('.author-link').forEach(x => {
      const xa = normalize(x.dataset.author || x.textContent || '');
      x.classList.toggle('author-active', xa.includes(norm));
    });

    await applyFilter(raw);
  });

  // expose for console usage
  window.searchByAuthor = async function (name) {
    if (!name) return clearFilter();
    return applyFilter(name);
  };
  
  // if another page set an author to filter, apply it once on load and then clear the flag
  (async function applyPendingAuthor() {
    try {
      const pending = sessionStorage.getItem('filterAuthor');
      if (!pending) return;
      // remove it immediately so repeated loads don't reapply
      sessionStorage.removeItem('filterAuthor');
      // ensure the filter function exists and invoke it
      if (typeof window.searchByAuthor === 'function') {
        // small delay so other init tasks finish (load-more, mutations)
        setTimeout(() => { window.searchByAuthor(pending); }, 60);
      }
    } catch (e) { /* ignore */ }
  })();

})();