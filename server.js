require('dotenv').config()
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const session = require('express-session')
const Article = require('./models/Article')
const fs = require("fs");
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'res')))


function loadPartial(filePath) {
  return fs.readFileSync(path.join(__dirname, "res/html", filePath), "utf8");
}

function renderPage(pageFile) {
  const header = loadPartial('header.html');
  const footer = loadPartial('footer.html');
  
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

app.use(session({
  secret: 'adminadmin',
  resave: false,
  saveUninitialized: false
}))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB připojeno'))
  .catch(err => console.error(err))

//Pages
app.get("/", (req, res) => {
  res.send(renderPage("index.html"));
});

app.get("/about", (req, res) => {
  res.send(renderPage("About.html"));
});
app.get("/contacts", (req, res) => {
  res.send(renderPage("contacts.html"));
});

app.get('/admin', (req, res) => {
  if (!req.session.admin) return res.redirect('/login')  
  res.send(renderPage("admin.html"))
})
app.get('/article', (req, res) => {
  res.send(renderPage("article.html"))
})
app.get('/login', (req, res) => {
  res.send(renderPage("login.html"))
})
app.get('/partners', (req, res) => {
  res.send(renderPage("partners.html"))
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'adminadmin') {
    req.session.admin = true
    res.json({ success: true })
  } else {
    res.status(401).json({ success: false })
  }
})

//api
app.get('/api/articles', async (req, res) => {
  const articles = await Article.find().sort({ date: -1 })
  res.json(articles)
})
app.get('/api/articles/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.json(article)
})
app.post('/api/articles', async (req, res) => {
  const article = new Article(req.body)
  await article.save()
  res.json(article)
})
app.delete('/api/articles/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});