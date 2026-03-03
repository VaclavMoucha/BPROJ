async function loadAdminArticles() {
  const res = await fetch('/api/articles')
  const articles = await res.json()
  const list = document.getElementById('admin-article-list')

  list.innerHTML = articles.map(a => `
    <div class="admin-article-item">
      <span>${a.title_cs} – ${new Date(a.date).toLocaleDateString('cs-CZ')}</span>
      <button class="delete-btn" onclick="deleteArticle('${a._id}')">Smazat</button>
    </div>
  `).join('')
}

async function deleteArticle(id) {
  if (!confirm('Opravdu smazat?')) return
  await fetch(`/api/articles/${id}`, { method: 'DELETE' })
  loadAdminArticles()
}

document.getElementById('article-form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const article = {
    title_cs: document.getElementById('title_cs').value,
    title_en: document.getElementById('title_en').value,
    perex_cs: document.getElementById('perex_cs').value,
    perex_en: document.getElementById('perex_en').value,
    content_cs: document.getElementById('content_cs').value,
    content_en: document.getElementById('content_en').value,
    img: document.getElementById('img').value,
  }

  await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
  })

  e.target.reset()
  loadAdminArticles()
})

loadAdminArticles()