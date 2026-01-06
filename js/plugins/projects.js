/**
 * projects.js (swup-safe)
 * projects.html template içinde JSON'dan içeriği basar.
 * Swup ile geçişlerde DOM timing sorunlarını çözer.
 */

;(function () {
  "use strict"

  const JSON_PATH = window.PROJECTS_JSON_PATH || "/data/projects.json"

  // Bu scriptin gerçekten proje template'inde olup olmadığını DOM üzerinden anla
  function isProjectTemplate() {
    // Swup main içinde bu id'ler varsa, doğru sayfadayız demektir
    return !!document.querySelector("#swupMain #projectTitle, #projectTitle")
  }

  function raf2() {
    return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  }

  function waitForEls(selectors, { timeout = 4000 } = {}) {
    const start = Date.now()

    return new Promise((resolve, reject) => {
      const ok = () => selectors.every(s => document.querySelector(s))
      if (ok()) return resolve(true)

      const obs = new MutationObserver(() => {
        if (ok()) {
          obs.disconnect()
          resolve(true)
        } else if (Date.now() - start > timeout) {
          obs.disconnect()
          reject(new Error("waitForEls timeout: " + selectors.join(", ")))
        }
      })

      obs.observe(document.documentElement, { childList: true, subtree: true })

      // timeout fallback
      setTimeout(() => {
        if (!ok()) {
          obs.disconnect()
          reject(new Error("waitForEls timeout: " + selectors.join(", ")))
        }
      }, timeout)
    })
  }

  async function loadProjectFromJson() {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get("slug")
    if (!slug) return

    const res = await fetch(JSON_PATH, { cache: "no-store", credentials: "same-origin" })
    if (!res.ok) throw new Error("projects.json yüklenemedi")

    const projects = await res.json()
    const project = projects.find(p => p.slug === slug)
    if (!project) throw new Error("Proje bulunamadı: " + slug)

    // Breadcrumb + Title
    const bc = document.getElementById("projectBreadcrumb")
    if (bc) bc.textContent = project.breadcrumb || "PROJE"

    const title = document.getElementById("projectTitle")
    if (title) {
      title.innerHTML = `${project.titleMain || ""} <span class="mil-thin">${project.titleThin || ""}</span>`
    }

    // Info
    const client = document.getElementById("clientName")
    const date = document.getElementById("projectDate")
    const owner = document.getElementById("projectOwner")
    const link = document.getElementById("webSiteLink").attributes.href
    if (client) client.textContent = project.client || "-"
    if (date) date.textContent = project.date || "-"
    if (owner) owner.textContent = project.owner || "-"
    if (link) link.textContent = project.link || "-"

    // Cover
    const coverImg = document.getElementById("coverImg")
    const coverZoom = document.getElementById("coverZoom")
    if (coverImg && project.cover) coverImg.src = project.cover
    if (coverZoom && project.cover) coverZoom.href = project.cover

    // Gallery (g2-g7)
    const ids = ["g2", "g3", "g4", "g5", "g6", "g7"]
    if (Array.isArray(project.gallery)) {
      ids.forEach((id, i) => {
        const img = document.getElementById(id + "Img")
        const zoom = document.getElementById(id + "Zoom")
        const src = project.gallery[i]
        if (img && src) img.src = src
        if (zoom && src) zoom.href = src
      })
    }

    // Content
    const sectionTitle = document.getElementById("sectionTitle")
    if (sectionTitle) sectionTitle.textContent = project.sectionTitle || "-"

    const sectionBody = document.getElementById("sectionBody")
    if (sectionBody) {
      sectionBody.innerHTML = ""
      ;(project.content || []).forEach(block => {
        if (block.type === "p") {
          const p = document.createElement("p")
          p.className = "mil-up mil-mb-30"
          p.innerHTML = block.html || ""
          sectionBody.appendChild(p)
        }
        if (block.type === "ul") {
          const ul = document.createElement("ul")
          ;(block.items || []).forEach(itemHtml => {
            const li = document.createElement("li")
            li.innerHTML = itemHtml
            ul.appendChild(li)
          })
          sectionBody.appendChild(ul)
        }
      })
    }

    // İstersen SEO title da güncellenebilir:
    // document.title = (project.seoTitle || project.titleMain || "Proje") + " | CFTC BrandTech";
  }

  let initLock = false

  async function initProjectPage() {
    // yanlış sayfada çalışma
    if (!isProjectTemplate()) return

    // aynı anda 2 kere çalışmasın
    if (initLock) return
    initLock = true

    try {
      // swup replace sonrası DOM'un "gerçekten" oturmasını bekle
      await raf2()

      // kritik elementler gelene kadar bekle (ilk gelişte boş kalma sebebin bu)
      await waitForEls(["#projectTitle", "#clientName", "#projectDate", "#projectOwner"], { timeout: 6000 })

      await loadProjectFromJson()
    } catch (e) {
      console.error("[projects.js] init error:", e)
    } finally {
      initLock = false
    }
  }

  // Normal giriş
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectPage, { passive: true })
  } else {
    initProjectPage()
  }

  // Swup geçişleri
  document.addEventListener("swup:contentReplaced", initProjectPage)
  document.addEventListener("swup:pageView", initProjectPage)
})()
