require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const multer = require("multer");
const Article = require("./models/Article");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "res/img/uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "res")));

app.use(
  session({
    secret: "adminadmin",
    resave: false,
    saveUninitialized: false,
  }),
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB připojeno"))
  .catch((err) => console.error(err));

function loadPartial(filePath) {
  return fs.readFileSync(path.join(__dirname, "res/html", filePath), "utf8");
}

function renderPage(pageFile) {
  const header = loadPartial("header.html");
  const footer = loadPartial("footer.html");

  let html = fs.readFileSync(
    path.join(__dirname, "res/html", pageFile),
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

app.get("/", async (req, res) => {
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
    console.error(err);
    res.status(500).send("Chyba serveru");
  }
});

app.get("/article/:id", async (req, res) => {
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
    console.error(err);
    res.status(500).send("Chyba serveru nebo špatné ID článku");
  }
});

app.get("/article", (req, res) => {
  const id = req.query.id;
  if (id) return res.redirect(301, `/article/${id}`);
  res.redirect("/");
});

app.get("/about", (req, res) => {
  res.send(renderPage("about.html"));
});

app.get("/contacts", (req, res) => {
  res.send(renderPage("contacts.html"));
});

app.get("/partners", (req, res) => {
  res.send(renderPage("partners.html"));
});

app.get("/login", (req, res) => {
  res.send(renderPage("login.html"));
});

app.get("/admin", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");
  res.send(renderPage("admin.html"));
});

app.post("/api/upload", upload.single("img"), (req, res) => {
  const url = "/img/uploads/" + req.file.filename;
  res.json({ url });
});

app.get("/api/articles", async (req, res) => {
  const articles = await Article.find().sort({ date: -1 });
  res.json(articles);
});

app.get("/api/articles/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Neplatné ID" });
  }
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ error: "Článek nenalezen" });
  res.json(article);
});

app.post("/api/articles", async (req, res) => {
  const article = new Article(req.body);
  await article.save();
  res.json(article);
});

app.delete("/api/articles/:id", async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "adminadmin") {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});
app.put("/api/articles/:id", async (req, res) => {
  const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(article);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
