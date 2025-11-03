document.addEventListener('DOMContentLoaded', () => {
  function initAll() {
    try { if (typeof window.loadMoreInit === 'function') window.loadMoreInit(); } catch(e) {}
    try { if (typeof window.filterByAuthorInit === 'function') window.filterByAuthorInit(); } catch(e) {}
    try { if (typeof window.initCategory === 'function') window.initCategory(); } catch(e) {}
    // any other plugin inits:
    try { if (typeof window.setMilCurrentPageActive === 'function') window.setMilCurrentPageActive(); } catch(e) {}
  }

  // run on first load
  initAll();

  // run after swup replaces content
  if (window.swup && typeof window.swup.on === 'function') {
    try { window.swup.on('contentReplaced', initAll); } catch (e) {}
  }
});