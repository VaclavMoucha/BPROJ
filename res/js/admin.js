const dropZone = document.getElementById("main-drop-zone");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
let uploadedImgUrl = "";
let editingId = null;
let blocks_cs = [];
let blocks_en = [];
dropZone.addEventListener("click", (e) => {
  if (e.target.tagName !== "LABEL") fileInput.click();
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", () => {
  handleFile(fileInput.files[0]);
});

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.hidden = false;
  };
  reader.readAsDataURL(file);

  uploadFile(file).then((url) => {
    uploadedImgUrl = url;
  });
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("img", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  return data.url;
}

function addBlock(lang, type) {
  const blocks = lang === "cs" ? blocks_cs : blocks_en;
  const id = Date.now();
  blocks.push({ id, type, content: "" });
  renderBlocks(lang);
}

function removeBlock(lang, id) {
  if (lang === "cs") blocks_cs = blocks_cs.filter((b) => b.id !== id);
  else blocks_en = blocks_en.filter((b) => b.id !== id);
  renderBlocks(lang);
}

function updateBlock(lang, id, value) {
  const blocks = lang === "cs" ? blocks_cs : blocks_en;
  const block = blocks.find((b) => b.id === id);
  if (block) block.content = value;
}

function renderBlocks(lang) {
  const blocks = lang === "cs" ? blocks_cs : blocks_en;
  const container = document.getElementById(`blocks-${lang}`);
  if (!container) return;

  container.innerHTML = blocks
    .map(
      (b) => `
    <div class="block-item" data-id="${b.id}">
      <div class="block-header">
        <span>${b.type === "text" ? "Text" : "Obrázek"}</span>
        <button type="button" onclick="removeBlock('${lang}', ${b.id})">x</button>
      </div>
      ${
        b.type === "text"
          ? `<textarea class = "admin-text-area" onchange="updateBlock('${lang}', ${b.id}, this.value)" placeholder="Text odstavce...">${b.content}</textarea>`
          : `<div id="drop-block-${b.id}" class="drop-zone">
     Přetáhni obrázek sem, nebo
     <label for="file-block-${b.id}">vyber soubor</label>
     <input type="file" id="file-block-${b.id}" accept="image/*" hidden />
   </div>
   ${b.content ? `<img src="${b.content}" style="max-height:100px;margin-top:0.5rem;border-radius:6px;" />` : ""}
  `
      }
    </div>
  `,
    )
    .join("");

  blocks
    .filter((b) => b.type === "image")
    .forEach((b) => {
      const input = document.getElementById(`file-block-${b.id}`);
      const dz = document.getElementById(`drop-block-${b.id}`);
      if (!input || !dz) return;

      input.addEventListener("change", () =>
        handleBlockFile(lang, b.id, input.files[0]),
      );
      dz.addEventListener("click", (e) => {
        if (e.target.tagName !== "LABEL") input.click();
      });
      dz.addEventListener("dragover", (e) => {
        e.preventDefault();
        dz.classList.add("dragover");
      });
      dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
      dz.addEventListener("drop", (e) => {
        e.preventDefault();
        dz.classList.remove("dragover");
        handleBlockFile(lang, b.id, e.dataTransfer.files[0]);
      });
    });
}

async function handleBlockFile(lang, id, file) {
  if (!file || !file.type.startsWith("image/")) return;
  const url = await uploadFile(file);
  updateBlock(lang, id, url);
  renderBlocks(lang);
}

async function editArticle(id) {
  const res = await fetch(`/api/articles/${id}`);
  const article = await res.json();

  document.getElementById("title_cs").value = article.title_cs || "";
  document.getElementById("title_en").value = article.title_en || "";
  document.getElementById("perex_cs").value = article.perex_cs || "";
  document.getElementById("perex_en").value = article.perex_en || "";

  blocks_cs = (article.blocks_cs || []).map((b) => ({
    ...b,
    id: Date.now() + Math.random(),
  }));
  blocks_en = (article.blocks_en || []).map((b) => ({
    ...b,
    id: Date.now() + Math.random(),
  }));
  renderBlocks("cs");
  renderBlocks("en");

  if (article.img) {
    preview.src = article.img;
    preview.hidden = false;
    uploadedImgUrl = article.img;
  }

  editingId = id;
  const submitBtn = document.querySelector(
    '#article-form button[type="submit"]',
  );
  submitBtn.textContent = "Uložit změny";
  submitBtn.dataset.cs = "Uložit změny";
  submitBtn.dataset.en = "Save changes";

  document
    .getElementById("article-form")
    .scrollIntoView({ behavior: "smooth" });
}

function cancelEdit() {
  editingId = null;
  uploadedImgUrl = "";
  blocks_cs = [];
  blocks_en = [];
  renderBlocks("cs");
  renderBlocks("en");
  document.getElementById("article-form").reset();
  preview.hidden = true;

  const submitBtn = document.querySelector(
    '#article-form button[type="submit"]',
  );
  submitBtn.textContent = "Přidat článek";
  submitBtn.dataset.cs = "Přidat článek";
  submitBtn.dataset.en = "Add article";

  const cancelBtn = document.getElementById("cancel-edit-btn");
  if (cancelBtn) cancelBtn.hidden = true;
}

async function loadAdminArticles() {
  const res = await fetch("/api/articles");
  const articles = await res.json();
  const list = document.getElementById("admin-article-list");

  list.innerHTML = articles
    .map(
      (a) => `
    <div class="admin-article-item">
      <span data-cs="${a.title_cs}" data-en="${a.title_en}">${a.title_cs}</span>
      <span class="article-date">${new Date(a.date).toLocaleDateString("cs-CZ")}</span>
      <div class="admin-article-btns">
        <button class="admin-action-btn" onclick="editArticle('${a._id}')" data-cs="Upravit" data-en="Edit">Upravit</button>
        <button class="admin-action-btn" onclick="deleteArticle('${a._id}')" data-cs="Smazat" data-en="Delete">Smazat</button>
      </div>
    </div>
  `,
    )
    .join("");
}

async function deleteArticle(id) {
  if (!confirm("Opravdu smazat?")) return;
  await fetch(`/api/articles/${id}`, { method: "DELETE" });
  if (editingId === id) cancelEdit();
  loadAdminArticles();
}

document
  .getElementById("article-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    blocks_cs.forEach((b) => {
      if (b.type === "text") {
        const el = document.querySelector(`[data-id="${b.id}"] textarea`);
        if (el) b.content = el.value;
      }
    });
    blocks_en.forEach((b) => {
      if (b.type === "text") {
        const el = document.querySelector(`[data-id="${b.id}"] textarea`);
        if (el) b.content = el.value;
      }
    });

    const article = {
      title_cs: document.getElementById("title_cs").value,
      title_en: document.getElementById("title_en").value,
      perex_cs: document.getElementById("perex_cs").value,
      perex_en: document.getElementById("perex_en").value,
      blocks_cs: blocks_cs.map(({ type, content }) => ({ type, content })),
      blocks_en: blocks_en.map(({ type, content }) => ({ type, content })),
      img: uploadedImgUrl || "",
    };

    if (editingId) {
      await fetch(`/api/articles/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      cancelEdit();
    } else {
      await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      e.target.reset();
      preview.hidden = true;
      uploadedImgUrl = "";
      blocks_cs = [];
      blocks_en = [];
      renderBlocks("cs");
      renderBlocks("en");
    }

    loadAdminArticles();
  });

loadAdminArticles();
