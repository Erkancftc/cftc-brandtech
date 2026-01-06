  async function loadProjectFromJson() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    // slug yoksa istersen default bırakabilirsin
    if (!slug) return;

    const res = await fetch("/data/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error("projects.json yüklenemedi");
    const projects = await res.json();

    const project = projects.find(p => p.slug === slug);
    if (!project) throw new Error("Proje bulunamadı: " + slug);

    // Breadcrumb + Title
    const bc = document.getElementById("projectBreadcrumb");
    if (bc) bc.textContent = project.breadcrumb || "PROJE";

    const title = document.getElementById("projectTitle");
    if (title) {
      title.innerHTML = `${project.titleMain || ""} <span class="mil-thin">${project.titleThin || ""}</span>`;
    }

    // Info
    const client = document.getElementById("clientName");
    const date = document.getElementById("projectDate");
    const owner = document.getElementById("projectOwner");
    if (client) client.textContent = project.client || "-";
    if (date) date.textContent = project.date || "-";
    if (owner) owner.textContent = project.owner || "-";

    // Cover
    const coverImg = document.getElementById("coverImg");
    const coverZoom = document.getElementById("coverZoom");
    if (coverImg && project.cover) coverImg.src = project.cover;
    if (coverZoom && project.cover) coverZoom.href = project.cover;

    // Gallery (6 adet bekliyoruz: 2-7)
    const ids = ["g2","g3","g4","g5","g6","g7"];
    if (Array.isArray(project.gallery)) {
      ids.forEach((id, i) => {
        const img = document.getElementById(id + "Img");
        const zoom = document.getElementById(id + "Zoom");
        const src = project.gallery[i];
        if (img && src) img.src = src;
        if (zoom && src) zoom.href = src;
      });
    }

    // Content
    const sectionTitle = document.getElementById("sectionTitle");
    if (sectionTitle) sectionTitle.textContent = project.sectionTitle || "-";

    const sectionBody = document.getElementById("sectionBody");
    if (sectionBody) {
      sectionBody.innerHTML = "";
      (project.content || []).forEach(block => {
        if (block.type === "p") {
          const p = document.createElement("p");
          p.className = "mil-up mil-mb-30";
          p.innerHTML = block.html || "";
          sectionBody.appendChild(p);
        }
        if (block.type === "ul") {
          const ul = document.createElement("ul");
          (block.items || []).forEach(itemHtml => {
            const li = document.createElement("li");
            li.innerHTML = itemHtml;
            ul.appendChild(li);
          });
          sectionBody.appendChild(ul);
        }
      });
    }

    // Fancybox bazen dinamik değişince yeniden bağlamak gerekebilir.
    // Eğer fancybox'ın global init'i main.js içinde yapılıyorsa genelde gerekmez.
  }

  // Normal load
  document.addEventListener("DOMContentLoaded", () => {
    loadProjectFromJson().catch(console.error);
  });

  // Swup varsa, sayfa geçişlerinde tekrar çalıştır
  document.addEventListener("swup:contentReplaced", () => {
    loadProjectFromJson().catch(console.error);
  });
