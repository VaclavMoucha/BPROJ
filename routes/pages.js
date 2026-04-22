const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

function loadPartial(filePath) {
  return fs.readFileSync(path.join(__dirname, "../res/html", filePath), "utf8");
}

function renderPage(pageFile) {
  const header = loadPartial("header.html");
  const footer = loadPartial("footer.html");

  let html = fs.readFileSync(path.join(__dirname, "../res/html", pageFile), "utf8");
  html = html.replace('<header id="header"></header>', `<header id="header">${header}</header>`);
  html = html.replace('<footer id="footer"></footer>', `<footer id="footer">${footer}</footer>`);

  return html;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("cs-CZ");
}
router.get("/", (req, res) => {
  res.send(renderPage("index.html"));
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
router.get("/article/:id", (req, res) => {
  res.send(renderPage("article.html"));
});
module.exports = router;