(function () {
  const normalize = s => (s || '').toLocaleLowerCase('tr').trim();

  function getCatList() { return document.querySelector('.mil-Kategori-list'); }
  function findAllAnchor(list) {
    return list && (list.querySelector('a[data-category="all"]') || list.querySelector('a.js-clear-filters'));
  }

  // Prevent href="#" jump for the "TÜM KATEGORİLER" anchor immediately (capture phase)
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a.js-clear-filters');
    if (!a) return;
    e.preventDefault();
  }, true);

  function ensureInitialActive() {
    const list = getCatList();
    if (!list) return;
    const allAnchor = findAllAnchor(list);
    // if any category (other than "all") already marked active, don't override
    const otherActive = Array.from(list.querySelectorAll('a')).some(a => {
      if (!a) return false;
      if (a === allAnchor) return false;
      return a.classList.contains('mil-active') || a.classList.contains('kategori-active') || a.classList.contains('kategori-selected');
    });
    if (!otherActive && allAnchor) {
      // ensure visual selected state
      list.querySelectorAll('a').forEach(x => x.classList.remove('kategori-active'));
      allAnchor.classList.add('mil-active', 'kategori-active');
    }
  }

  async function clearAllFiltersAndUI() {
    // remove visual states
    const list = getCatList();
    if (list) list.querySelectorAll('a').forEach(x => x.classList.remove('mil-active', 'kategori-active'));
    const allAnchor = findAllAnchor(list);
    if (allAnchor) allAnchor.classList.add('mil-active', 'kategori-active');

    // clear filters via exposed APIs if present
    try { sessionStorage.removeItem('filterAuthor'); } catch(e) {}
    if (typeof window.searchByCategory === 'function') await window.searchByCategory('');
    if (typeof window.searchByAuthor === 'function') await window.searchByAuthor('');
  }

  function attachHandlers() {
    const list = getCatList();
    if (!list) return;

    list.addEventListener('click', async (ev) => {
      const a = ev.target.closest && ev.target.closest('a');
      if (!a) return;
      ev.preventDefault();

      // normalize UI: remove existing active state
      list.querySelectorAll('a').forEach(x => x.classList.remove('mil-active', 'kategori-active'));

      const catAttr = (a.dataset.category || '').toString().toLowerCase();
      const txt = (a.textContent || '').trim();
      const isAll = catAttr === 'all' || /tüm|tum/i.test(txt) || a.classList.contains('js-clear-filters');

      if (isAll) {
        // mark all as active visually and clear filters
        a.classList.add('mil-active', 'kategori-active');
        await clearAllFiltersAndUI();
        return;
      }

      // activate clicked category visually
      a.classList.add('mil-active', 'kategori-active');

      // call category filter API (prefer data-category)
      const catToSend = a.dataset.category ? a.dataset.category : txt;
      if (typeof window.searchByCategory === 'function') {
        await window.searchByCategory(catToSend);
      } else {
        // fallback: preserve author filter if present
        const activeAuthorEl = document.querySelector('.author-link.author-active');
        const authorName = activeAuthorEl ? (activeAuthorEl.dataset.author || activeAuthorEl.textContent).replace(/Yazar:\s*/i,'').trim() : '';
        if (typeof window.searchByAuthor === 'function') await window.searchByAuthor(authorName || '');
      }
    });
  }

  function init() {
    ensureInitialActive();
    attachHandlers();
  }

  document.addEventListener('DOMContentLoaded', init);
  if (window.swup && typeof window.swup.on === 'function') {
    try { window.swup.on('contentReplaced', init); } catch (e) {}
  }

  // expose for external calls
  window.clearAllFiltersAndURL = clearAllFiltersAndUI;
})();
// Prevent default jump-to-top for "TÜM KATEGORİLER" anchors immediately (capture phase)
document.addEventListener('click', function (e) {
  const a = e.target.closest('a.js-clear-filters');
  if (!a) return;
  e.preventDefault(); // stops href="#" from scrolling to top
}, true);
document.addEventListener('click', (e) => {
          const btn = e.target.closest('.js-clear-filters');
          if (!btn) return;
          e.preventDefault();
          clearAllFiltersAndURL();
          // ensure visual active state after other handlers run
          setTimeout(() => {
            document.querySelectorAll('.mil-Kategori-list a').forEach(x => x.classList.remove('mil-active', 'kategori-active'));
            btn.classList.add('mil-active', 'kategori-active');
          }, 0);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, true); // capture=true -> başka handler'lar engelleyemez

document.addEventListener('DOMContentLoaded', () => {
  const catList = document.querySelector('.mil-Kategori-list');
  if (!catList) return;

  // Prevent href="#" jump for the "TÜM KATEGORİLER" anchor immediately (capture phase)
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a.js-clear-filters');
    if (!a) return;
    e.preventDefault();
  }, true);

  // ensure "TÜM KATEGORİLER" appears selected on first arrival (unless a filter is pending)
  const allAnchor = catList.querySelector('a[data-category="all"], a.js-clear-filters');
  const pendingAuthor = (() => {
    try { return sessionStorage.getItem('filterAuthor'); } catch (e) { return null; }
  })();
  const urlParams = (() => {
    try { return new URL(window.location.href).searchParams; } catch (e) { return new URLSearchParams(); }
  })();

  const hasActiveFilter = !!pendingAuthor || urlParams.get('author') || urlParams.get('category') ||
    !!document.querySelector('.author-link.author-active') || !!catList.querySelector('a.kategori-active, a:not([data-category="all"]).mil-active');

  if (allAnchor && !hasActiveFilter) {
    // use existing CSS class so styling matches other selected items
    allAnchor.classList.add('mil-active', 'kategori-active');
    // ensure UI state matches cleared filters
    if (typeof window.clearAllFiltersAndURL === 'function') {
      // run in next tick to avoid interfering with other inits
      setTimeout(() => window.clearAllFiltersAndURL(), 0);
    }
  }

  // existing category click handler (keep original behavior)
  catList.addEventListener('click', async (ev) => {
    const a = ev.target.closest && ev.target.closest('a');
    if (!a) return;
    ev.preventDefault();

    // remove previous visual state
    catList.querySelectorAll('a').forEach(x => x.classList.remove('mil-active', 'kategori-active'));

    // determine if "all" control
    const catAttr = (a.dataset.category || '').toString().toLowerCase();
    const txt = (a.textContent || '').trim();
    const isAll = catAttr === 'all' || /tüm|tum/i.test(txt) || a.classList.contains('js-clear-filters');

    if (isAll) {
      a.classList.add('mil-active', 'kategori-active');
      if (typeof window.clearAllFiltersAndURL === 'function') {
        window.clearAllFiltersAndURL();
      } else {
        if (typeof window.searchByCategory === 'function') await window.searchByCategory('');
        if (typeof window.searchByAuthor === 'function') await window.searchByAuthor('');
      }
      return;
    }

    // activate clicked category visually
    a.classList.add('mil-active', 'kategori-active');

    // keep author active if present
    const activeAuthorEl = document.querySelector('.author-link.author-active');
    const authorName = activeAuthorEl ? (activeAuthorEl.dataset.author || activeAuthorEl.textContent).replace(/Yazar:\s*/i,'').trim() : '';

    const catToSend = a.dataset.category ? a.dataset.category : txt;
    if (typeof window.searchByCategory === 'function') {
      await window.searchByCategory(catToSend);
    } else if (typeof window.searchByAuthor === 'function') {
      await window.searchByAuthor(authorName || '');
    }
  });
});