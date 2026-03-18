function getLang() {
  return localStorage.getItem("lang") || "cs";
}

function applyLang(lang) {
  document.querySelectorAll("[data-cs][data-en]").forEach((el) => {
    el.textContent = el.dataset[lang] || el.textContent;
  });
}

function renderBlocksClient(blocks, fallback) {
  if (blocks && blocks.length > 0) {
    return blocks.map(b => {
      if (b.type === 'text') return `<p class="article-block-text">${b.content}</p>`
      if (b.type === 'image') return `<img class="article-block-img" src="${b.content}" alt="" />`
      return ''
    }).join('')
  }
  return fallback ? `<p class="article-block-text">${fallback}</p>` : ''
}

async function renderList() {
  const list = document.querySelector(".article-list");
  if (!list) return;

  try {
    const res = await fetch("/api/articles");
    const articles = await res.json();
    const lang = getLang();

    list.innerHTML = articles
      .map(
        (a) => `
      <a href="/article/${a._id}" class="article-card">
        <img src="${a.img || "/img/placeholder.jpg"}" alt="${a["title_" + lang]}" />
        <div class="article-info">
          <h2 data-cs="${a.title_cs}" data-en="${a.title_en}">${a["title_" + lang]}</h2>
          <span class="article-date">${new Date(a.date).toLocaleDateString("cs-CZ")}</span>
          <p data-cs="${a.perex_cs}" data-en="${a.perex_en}">${a["perex_" + lang]}</p>
        </div>
      </a>
    `,
      )
      .join("");
  } catch (err) {
    console.warn("articles.js: fetch selhal, používám SSR obsah", err);
  }
}

async function renderDetail() {
  const detail = document.querySelector(".article-detail");
  if (!detail) return;

  const id = window.location.pathname.split("/").pop();
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) return;

  try {
    const res = await fetch(`/api/articles/${id}`);
    const article = await res.json();
    const lang = getLang();

    detail.innerHTML = `
      <h1 data-cs="${article.title_cs}" data-en="${article.title_en}">${article["title_" + lang]}</h1>
      <span class="article-date">${new Date(article.date).toLocaleDateString("cs-CZ")}</span>
      <img src="${article.img || "/img/placeholder.jpg"}" alt="${article["title_" + lang]}" />
      <div class="article-content">
        ${renderBlocksClient(article["blocks_" + lang], article["content_" + lang])}
      </div>
    `;
  } catch (err) {
    console.warn("articles.js: fetch selhal, používám SSR obsah", err);
  }
}

renderList();
renderDetail();