const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Article = require("../models/Article");
function loadPartial(filePath) {
  return fs.readFileSync(path.join(__dirname, "../res/html", filePath), "utf8");
}
function renderBlocks(blocks, fallbackContent) {
  if (blocks && blocks.length > 0) {
    return blocks
      .map((b) => {
        if (b.type === "text")
          return `<p class="article-block-text">${b.content}</p>`;
        if (b.type === "image")
          return `<img class="article-block-img" src="${b.content}" alt="" />`;
        return "";
      })
      .join("");
  }
  return fallbackContent
    ? `<p class="article-block-text">${fallbackContent}</p>`
    : "";
}
function renderPage(pageFile) {
  const header = loadPartial("header.html");
  const footer = loadPartial("footer.html");

  let html = fs.readFileSync(
    path.join(__dirname, "../res/html", pageFile),
    "utf8",
  );
  html = html.replace(
    '<header id="header"></header>',
    `<header id="header">${header}</header>`,
  );
  html = html.replace(
    '<footer id="footer"></footer>',
    `<footer id="footer">${footer}</footer>`,
  );

  return html;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("cs-CZ");
}

router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    const articleListHTML =
      articles.length > 0
        ? articles
            .map(
              (a) => `
          <a href="/article/${a._id}" class="article-card">
            <img src="${a.img || "/img/placeholder.jpg"}" alt="${a.title_cs}" />
            <div class="article-info">
              <h2 data-cs="${a.title_cs}" data-en="${a.title_en}">${a.title_cs}</h2>
              <span class="article-date">${formatDate(a.date)}</span>
              <p data-cs="${a.perex_cs}" data-en="${a.perex_en}">${a.perex_cs}</p>
            </div>
          </a>
        `,
            )
            .join("")
        : "<p>Žádné články zatím nejsou.</p>";

    let html = renderPage("index.html");
    html = html.replace(
      /<div class="article-list">[\s\S]*?<\/div>/,
      `<div class="article-list">${articleListHTML}</div>`,
    );
    res.send(html);
  } catch (err) {
    res.status(500).send("Chyba serveru");
  }
});
router.get("/about", (req, res) => {
  res.send(renderPage("about.html"));
});

router.get("/contacts", (req, res) => {
  res.send(renderPage("contacts.html"));
});

router.get("/partners", (req, res) => {
  res.send(renderPage("partners.html"));
});

router.get("/login", (req, res) => {
  res.send(renderPage("login.html"));
});

router.get("/admin", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");
  res.send(renderPage("admin.html"));
});
router.get("/article/:id", async (req, res) => {
  try {
     
    const article = await Article.findById(req.params.id);
    
    if (!article) return res.status(404).send("Článek nenalezen");

    const detailHTML = `
      <h1 data-cs="${article.title_cs}" data-en="${article.title_en}">${article.title_cs}</h1>
      <span class="article-date">${formatDate(article.date)}</span>
      <img src="${article.img || "/img/placeholder.jpg"}" alt="${article.title_cs}" />
      <div class="article-content">
        ${renderBlocks(article.blocks_cs, article.content_cs)}
      </div>
    `;

    let html = renderPage("article.html");
    html = html.replace(
      /<div class="article-detail">[\s\S]*?<\/div>/,
      `<div class="article-detail">${detailHTML}</div>`,
    );
    res.send(html);
  } catch (err) {
    res.status(500).send("Chyba serveru");
  }
});
module.exports = router;
