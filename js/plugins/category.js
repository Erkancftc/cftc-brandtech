// js/plugins/category.js
(function () {
  "use strict";

  const normalize = (s) => (s || "").toLocaleLowerCase("tr-TR").trim();

  function applyCategoryFilter(categoryName) {
    const list = document.querySelector(".js-posts");
    if (!list) return;

    const cols = list.querySelectorAll(".col-lg-12");
    const active = categoryName && normalize(categoryName) !== "all";

    cols.forEach((col) => {
      const post = col.querySelector(".js-post");
      if (!post) return;

      const postCat = normalize(post.dataset.category || "");
      const match = !active || postCat === normalize(categoryName);

      if (match) {
        // Bu kategoriye ait olanları göster
        col.style.display = "";
        col.classList.remove("kategori-hidden", "lm-hidden", "author-hidden");
        col.removeAttribute("aria-hidden");
      } else {
        // Diğerlerini gizle
        col.style.display = "none";
        col.classList.add("kategori-hidden");
        col.setAttribute("aria-hidden", "true");
      }
    });

    const loadMore = document.getElementById("loadMore");
    if (loadMore) {
      if (active) {
        // Filtre varken "Daha Fazla" tamamen saklansın
        loadMore.style.display = "none";
      } else {
        // Tüm kategoriler açıkken load-more tekrar devrede
        loadMore.style.display = "";
        if (typeof window.__loadMoreInit === "function") {
          window.__loadMoreInit();
        }
      }
    }

    // 🔴 ASIL KRİTİK KISIM: **BURADA** OLMALI
    if (typeof window.refreshBlogAnimations === "function") {
      window.refreshBlogAnimations();
    }
  }

  // Dışarıdan çağırmak için
  window.searchByCategory = function (name) {
    applyCategoryFilter(name || "");
  };

  function initCategoryUI() {
    const catList = document.querySelector(".mil-Kategori-list");
    if (!catList) return;

    catList.addEventListener("click", function (ev) {
      const a = ev.target.closest("a");
      if (!a) return;

      ev.preventDefault();

      const catAttr = a.dataset.category || "";
      const text = (a.textContent || "").trim();
      const cat = catAttr || text;
      const isAll = !cat || normalize(cat) === "all";

      // Aktif class'ları güncelle
      catList.querySelectorAll("a").forEach((x) =>
        x.classList.remove("mil-active", "kategori-active")
      );
      a.classList.add("mil-active");
      if (!isAll) a.classList.add("kategori-active");

      if (isAll) {
        // Tüm kategoriler → filtreyi temizle
        applyCategoryFilter("");
      } else {
        applyCategoryFilter(cat);
      }
    });
  }

  // Use global content ready utility (handles DOMContentLoaded and swup:contentReplaced)
  if (typeof window.onContentReady === "function") {
    window.onContentReady(initCategoryUI);
  } else {
    // Fallback if swup-utils.js hasn't loaded yet
    document.addEventListener("DOMContentLoaded", initCategoryUI);
    document.addEventListener("swup:contentReplaced", initCategoryUI);
  }
})();
