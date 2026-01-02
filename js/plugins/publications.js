/**
 * publications.js
 * Tek bir HTML şablonunda (publication.html) hem liste hem de detay görünümünü
 * JSON verisiyle üretir. Query param: ?slug=... varsa detay, yoksa liste.
 *
 * Klasör yapısı (öneri):
 * /assets/js/publications.js
 * /data/publications.json  (ya da kökte publications.json)
 */

(function () {
  "use strict";

  const ROOT_ID = "swupMain";
  const JSON_PATH = (window.PUBLICATIONS_JSON_PATH || "/data/publications.json");

  /** Basit yardımcılar **/
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const esc = (s) =>
    String(s || "").replace(/[&<>"']/g, (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m])
    );

  function getParams() {
    const p = new URLSearchParams(window.location.search);
    return {
      slug: p.get("slug") || null,
    };
  }

  // Bu JS'in gerçekten publication sayfasında çalışıp çalışmayacağını kontrol et
  function isPublicationPage() {
    const path = window.location.pathname || "";
    // Örn: /publication.html veya /tr/publication.html vs.
    return /publication\.html$/i.test(path);
  }

  async function getPublications() {
    const res = await fetch(JSON_PATH, { credentials: "same-origin" });
    if (!res.ok) throw new Error("JSON yüklenemedi: " + res.status);
    return await res.json();
  }

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function updateSEO(meta) {
    if (!meta) return;
    if (meta.title) {
      document.title = meta.title;
    }
    const set = (sel, attr, val) => {
      let el = $(sel);
      if (el && val) {
        el.setAttribute(attr, val);
      }
    };
    set('meta[name="description"]', "content", meta.description || "");
    set('meta[property="og:title"]', "content", meta.title || "");
    set('meta[property="og:description"]', "content", meta.description || "");
    set('meta[property="og:image"]', "content", meta.image || "");
    set('meta[name="twitter:title"]', "content", meta.title || "");
    set('meta[name="twitter:description"]', "content", meta.description || "");
    set('meta[name="twitter:image"]', "content", meta.image || "");
  }

  function renderBreadcrumbs() {
    return `
    <div class="container">
      <ul class="mil-breadcrumbs mil-center mil-mb-60">
        <li><a href="index.html">Anasayfa</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="publication.html">Yayınlar</a></li>
      </ul>
    </div>
    `;
  }

  function renderList(items) {
    const cards = items
      .map(
        (it) => `
      <article class="mil-blog-card">
        <a class="mil-card-cover" href="publication.html?slug=${encodeURIComponent(
          it.slug
        )}" aria-label="${esc(it.title)}">
          <img src="${esc(it.cover)}" alt="${esc(it.title)}">
        </a>
        <div class="mil-card-body">
          <h3 class="mil-card-title">
            <a href="publication.html?slug=${encodeURIComponent(
              it.slug
            )}">${esc(it.title)}</a>
          </h3>
          <p class="mil-card-meta">
            <div>Kategori: &nbsp;<span class="mil-dark">${esc(
              it.category
            )}</span></div>
            <time datetime="${esc(it.date)}">${esc(fmtDate(it.date))}</time>
            · ${esc(it.author || "CFTC BrandTech")} · ${esc(
          it.readingMinutes || 5
        )} dk
          </p>
          <p class="mil-card-excerpt">${esc(it.excerpt || "")}</p>
          <a class="mil-link mil-arrow" href="publication.html?slug=${encodeURIComponent(
            it.slug
          )}"><span>Oku</span></a>
        </div>
      </article>
    `
      )
      .join("");

    return `
      <section class="container">
        <div class="mil-inner-banner">
          <div class="mil-banner-content mil-center mil-up">
            ${renderBreadcrumbs()}
            <h2><span class="mil-thin">Blog</span></h2>
          </div>
        </div>

        <div class="mil-list-grid">
          ${cards}
        </div>
      </section>
    `;
  }

  function renderDetail(it) {
    return `
    <section id="blog">
      <div class="container mil-p-120-90">
        <div class="row justify-content-center">
          <div class="col-lg-12">
            <div class="mil-image-frame mil-horizontal mil-up">
              <img
                src="${esc(it.cover)}"
                alt="${esc(it.title)}"
                class="mil-scale"
                data-value-1=".90"
                data-value-2="1.15"/>
            </div>

            <div class="mil-info mil-up mil-mb-90">
              <div>Kategori: &nbsp;<span class="mil-dark">${esc(
                it.category
              )}</span></div>
              <div>Tarih: &nbsp;<span class="mil-dark">${esc(
                it.date
              )}</span></div>
              <div>
                <a class="author-link" href="/blog.html?author=${encodeURIComponent(
                  it.author
                )}" title="Yazarın Makaleleri">
                  Yazar: <span class="mil-accent">${esc(it.author)}</span>
                </a>
              </div>
            </div>
          </div>
          
          <!-- İçerik burada render edilecek -->
          <div id="article" class="col-lg-8"></div>
        </div>
      </div>
    </section>
  `;
  }

  // Sadece publication sayfasında root oluştur / güncelle
 function mount(html) {
  const root = document.getElementById(ROOT_ID);
  if (!root) return;
  root.innerHTML = html;
}

  async function main() {
    // Blog ve diğer sayfalarda hiç çalışmasın
    if (!isPublicationPage()) {
      return;
    }

    try {
      const { slug } = getParams();
      const items = await getPublications();

      if (slug) {
        const it = items.find((p) => p.slug === slug);
        if (!it) {
          mount(
            `<section class="container"><p>İçerik bulunamadı.</p><a href="publication.html" class="mil-link mil-arrow"><span>Listeye dön</span></a></section>`
          );
          return;
        }
        updateSEO(
          it.seo || {
            title: it.title,
            description: it.excerpt,
            image: it.cover,
          }
        );

        // 1) İskeleti bas
        mount(renderDetail(it));

        // 2) İçeriği #article içine yerleştir
        const root = document.getElementById(ROOT_ID);
        const articleMount = root ? root.querySelector("#article") : null;
        if (articleMount && it.contentHtml) {
          const frag = document
            .createRange()
            .createContextualFragment(it.contentHtml);
          articleMount.replaceChildren(frag);
        }

        // Gerekirse burada sayfa-özel animasyon/init çağır (GSAP korumalı)
      } else {
        updateSEO({
          title: "Yayınlar | CFTC BrandTech",
          description: "CFTC BrandTech yayınları ve makaleler.",
          image: (items[0] && items[0].cover) || "",
        });
        mount(renderList(items));
      }
    } catch (err) {
      console.error(err);
      mount(
        `<section class="container"><p>Yayınlar yüklenirken bir sorun oluştu.</p></section>`
      );
    }
  }

  // Swup yoksa normal DOM load'da çalış
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }

  // Swup kullanıyorsan içerik değişince tekrar çalışsın
  document.addEventListener("swup:contentReplaced", main);
})();
