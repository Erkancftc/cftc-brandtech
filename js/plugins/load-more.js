(function () {
  // Blog kartlarının animasyonlarını yenile
  window.refreshBlogAnimations = function () {
    try {
      if (window.ScrollTrigger && typeof ScrollTrigger.refresh === "function") {
        ScrollTrigger.refresh(true);
      } else if (window.gsap && typeof gsap.delayedCall === "function") {
        gsap.delayedCall(0.02, function () {
          window.dispatchEvent(new Event("scroll"));
        });
      } else {
        window.dispatchEvent(new Event("scroll"));
      }
    } catch (e) {}
  };

  function getList() {
    return document.querySelector(".js-posts");
  }
  function getBtn() {
    return document.getElementById("loadMore");
  }

  function getCols(list) {
    return Array.from(list.children || []).filter(
      (node) =>
        node.classList &&
        node.classList.contains("col-lg-12") &&
        node.querySelector(".js-post")
    );
  }

  function placeButtonAfterList(list, btn) {
    const btnRow = btn.closest(".col-lg-12") || btn.parentElement;
    if (!btnRow || !list.parentNode) return;
    try {
      list.parentNode.insertBefore(btnRow, list.nextSibling);
    } catch (e) {}
    btnRow.style.display = "";
  }

  function initBatchState() {
    const list = getList();
    const btn = getBtn();
    if (!list || !btn) return;

    const BATCH = Math.max(1, Number(list.dataset.batch || 4));
    const cols = getCols(list);

    cols.forEach((col, i) => {
      if (i < BATCH) {
        col.classList.remove("lm-hidden");
        col.style.display = "";
        col.removeAttribute("aria-hidden");
      } else {
        col.classList.add("lm-hidden");
        col.style.display = "none";
        col.setAttribute("aria-hidden", "true");
      }
    });

    btn.style.display = cols.length > BATCH ? "" : "none";
    btn.disabled = false;
    btn.removeAttribute("aria-disabled");

    placeButtonAfterList(list, btn);

    if (typeof window.refreshBlogAnimations === "function") {
      window.refreshBlogAnimations();
    }
  }

  function revealNextBatch() {
    const list = getList();
    const btn = getBtn();
    if (!list || !btn) return;

    const BATCH = Math.max(1, Number(list.dataset.batch || 4));
    const cols = getCols(list);

    const hidden = cols.filter((c) => c.classList.contains("lm-hidden"));
    const toShow = hidden.slice(0, BATCH);

    toShow.forEach((col) => {
      col.classList.remove("lm-hidden");
      col.style.display = "";
      col.removeAttribute("aria-hidden");
    });

    placeButtonAfterList(list, btn);

    if (cols.filter((c) => c.classList.contains("lm-hidden")).length === 0) {
      btn.style.display = "none";
      btn.disabled = true;
      btn.setAttribute("aria-disabled", "true");
    }

    if (typeof window.refreshBlogAnimations === "function") {
      window.refreshBlogAnimations();
    }
  }

  // Tek bir yerden init (swup dahil)
  function boot() {
    initBatchState();
    setTimeout(initBatchState, 180);
    setTimeout(initBatchState, 800);
  }

  // İlk yükleme
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Swup sonrası içerik değişince
  document.addEventListener("swup:contentReplaced", boot);

  // Click delegation: yeni buton gelse bile çalışır
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("#loadMore");
    if (!btn) return;
    e.preventDefault();
    revealNextBatch();
    try {
      btn.scrollIntoView({ behavior: "smooth", block: "end" });
    } catch (e) {}
  });

  // Debug
  window.__loadMoreInit = initBatchState;
})();
