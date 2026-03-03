function getLang() {
  return localStorage.getItem('lang') || 'cs'
}

async function renderList() {
  const res = await fetch('/api/articles')
  const articles = await res.json()
  const list = document.querySelector('.article-list')
  if (!list) return

  list.innerHTML = articles.map(a => `
    <a href="/article?id=${a._id}" class="article-card">
      <img src="${a.img || '/img/placeholder.jpg'}" alt="${a['title_' + getLang()]}" />
      <div class="article-info">
        <h2>${a['title_' + getLang()]}</h2>
        <span class="article-date">${new Date(a.date).toLocaleDateString('cs-CZ')}</span>
        <p>${a['perex_' + getLang()]}</p>
      </div>
    </a>
  `).join('')
}

async function renderDetail() {
  const detail = document.querySelector('.article-detail')
  if (!detail) return

  const id = new URL(window.location.href).searchParams.get('id')
  const res = await fetch(`/api/articles/${id}`)
  const article = await res.json()

  detail.innerHTML = `
    <h1>${article['title_' + getLang()]}</h1>
    <span class="article-date">${new Date(article.date).toLocaleDateString('cs-CZ')}</span>
    <img src="${article.img || '/img/placeholder.jpg'}" alt="${article['title_' + getLang()]}" />
    <div class="article-content">${article['content_' + getLang()]}</div>
  `
}

renderList()
renderDetail()