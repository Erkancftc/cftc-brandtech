// js/plugins/filterbyauthor.js
(function () {
  "use strict";

  const normalize = (s) => (s || "").toLocaleLowerCase("tr-TR").trim();

  function applyAuthorFilter(authorName) {
    const list = document.querySelector(".js-posts");
    if (!list) return;

    const cols = list.querySelectorAll(".col-lg-12");
    const active = authorName && normalize(authorName) !== "";

    cols.forEach((col) => {
      const post = col.querySelector(".js-post");
      if (!post) return;

      const dataAuthor = post.dataset.author || "";
      const link = col.querySelector(".author-link");
      const linkAuthor = link ? (link.dataset.author || link.textContent || "") : "";

      const candidate = dataAuthor || linkAuthor;
      const match = !active || normalize(candidate).includes(normalize(authorName));

      if (match) {
        col.style.display = "";
        col.classList.remove("author-hidden");
        col.removeAttribute("aria-hidden");
      } else {
        col.style.display = "none";
        col.classList.add("author-hidden");
        col.setAttribute("aria-hidden", "true");
      }
    });

    const loadMore = document.getElementById("loadMore");
    if (loadMore) {
      if (active) {
        loadMore.style.display = "none";
      } else {
        loadMore.style.display = "";
        if (typeof window.__loadMoreInit === "function") {
          window.__loadMoreInit();
        }
      }
    }

    // Refresh animations
    if (typeof window.refreshBlogAnimations === "function") {
      window.refreshBlogAnimations();
    }
  }

  // Dışarıdan da çağrılabilir
  window.searchByAuthor = function (name) {
    applyAuthorFilter(name || "");
  };

  function initAuthorUI() {
    const list = document.querySelector(".js-posts");
    if (!list) return;

    list.addEventListener("click", function (ev) {
      const a = ev.target.closest(".author-link");
      if (!a) return;

      ev.preventDefault();
      ev.stopPropagation();

      // "Yazar: " kısmını temizle
      const raw = (a.dataset.author || a.textContent || "").replace(/Yazar:\s*/i, "");
      const name = raw.trim();
      if (!name) return;

      const wasActive = a.classList.contains("author-active");

      // Tüm author-link'lerden active'i kaldır
      list.querySelectorAll(".author-link").forEach((x) =>
        x.classList.remove("author-active")
      );

      if (wasActive) {
        // Aynı yazara tekrar tıklandı → filtreyi kaldır
        window.searchByAuthor("");
        return;
      }

      a.classList.add("author-active");
      window.searchByAuthor(name);
    });
  }

  /**
   * Check URL for author query parameter and auto-filter
   */
  function checkAuthorQueryParam() {
    const params = new URLSearchParams(window.location.search);
    const author = params.get("author");

    if (author) {
      // Auto-filter by this author
      window.searchByAuthor(decodeURIComponent(author));
    }
  }

  /**
   * Initialize both UI and auto-filter
   */
  function initAll() {
    initAuthorUI();
    checkAuthorQueryParam();
  }

  // Use global content ready utility (handles DOMContentLoaded and swup:contentReplaced)
  if (typeof window.onContentReady === "function") {
    window.onContentReady(initAll);
  } else {
    // Fallback if swup-utils.js hasn't loaded yet
    document.addEventListener("DOMContentLoaded", initAll);
    document.addEventListener("swup:contentReplaced", initAll);
  }
})();
