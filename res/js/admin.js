let blocks_en = [];
let blocks_cs = [];
let uploadedImgUrl = "";
let editingId = null;
const dropzone = document.getElementById("main-drop-zone");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("img", file);
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error("Chyba při uploadu souboru", err);
    return "";
  }
}
async function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    preview.src = e.target.result;
    preview.hidden = false;
  };
  reader.readAsDataURL(file);
  uploadFile(file).then((url) => {
    uploadedImgUrl = url;
  });
}

fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});

function addBlock(lang, type) {
  const blocks = lang === "cs" ? blocks_cs : blocks_en;
  const id = Date.now();
  blocks.push({ id, type, content: "" });
  renderBlocks(lang);
}

function updateBlock(lang, id, value) {
  const blocks = lang === "cs" ? blocks_cs : blocks_en;
  const block = blocks.find((b) => b.id === id);
  if (block) block.content = value;
}
function removeBlock(lang, id) {
  if (lang === "cs") blocks_cs = blocks_cs.filter((b) => b.id !== id);
  else blocks_en = blocks_en.filter((b) => b.id !== id);
  renderBlocks(lang);
}
function renderBlocks(lang) {
  const blocks = lang === "cs" ? blocks_cs : blocks_en;
  const container = document.getElementById(`blocks-${lang}`);
  if (!container) return;
  container.innerHTML = blocks
    .map(
      (block) => `
    <div class="block-item" data-id="${block.id}">
      <div class="block-header">
        <span>${block.type === "text" ? "Text" : "Obrázek"}</span>
        <button type="button" onclick="removeBlock('${lang}', ${block.id})">x</button>
      </div>
      ${
        block.type === "text"
          ? `<textarea class = "admin-text-area" onchange="updateBlock('${lang}', ${block.id}, this.value)" placeholder="Text odstavce...">${block.content}</textarea>`
          : `<div id="drop-block-${block.id}" class="drop-zone">
     Přetáhni obrázek sem, nebo
     <label for="file-block-${block.id}">vyber soubor</label>
     <input type="file" id="file-block-${block.id}" accept="image/*" hidden />
   </div>
   ${block.content ? `<img src="${block.content}" style="max-height:100px;margin-top:0.5rem;border-radius:6px;" />` : ""}
  `
      }
    </div>
  `,
    )
    .join("");
  blocks
    .filter((block) => block.type === "image")
    .forEach((block) => {
      const input = document.getElementById(`file-block-${block.id}`);
      const dropzone = document.getElementById(`drop-block-${block.id}`);
      if (!input || !dropzone) return;

      input.addEventListener("change", () =>
        handleBlockFile(lang, block.id, input.files[0]),
      );
      dropzone.addEventListener("click", (e) => {
        if (e.target.tagName !== "LABEL") input.click();
      });
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
      dropzone.addEventListener("dragleave", () =>
        dropzone.classList.remove("dragover"),
      );
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        handleBlockFile(lang, block.id, e.dataTransfer.files[0]);
      });
    });
}
async function handleBlockFile(lang, blockId, file) {
  if (!file || !file.type.startsWith("image/")) return;
  const url = await uploadFile(file);
  updateBlock(lang, blockId, url);
  renderBlocks(lang);
}
async function loadAdminArticles() {
  try {
    const res = await fetch("/api/articles");
    const articles = await res.json();
    const list = document.getElementById("admin-article-list");
    list.innerHTML = articles
      .map(
        (article) => `
    <div class="admin-article-item">
      <span data-cs="${article.title_cs}" data-en="${article.title_en}">${article.title_cs}</span>
      <span class="article-date">${formatDate(article.date)}</span>
      <div class="admin-article-btns">
        <button class="admin-action-btn" onclick="editArticle('${article._id}')" data-cs="Upravit" data-en="Edit">Upravit</button>
        <button class="admin-action-btn" onclick="deleteArticle('${article._id}')" data-cs="Smazat" data-en="Delete">Smazat</button>
      </div>
    </div>
  `,
      )
      .join("");
  } catch (err) {
    console.error("Chyba při načítání článků", err);
  }
}
async function editArticle(id) {
  try {
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
  } catch (err) {
    console.error("Chyba při načítání článku pro editaci", err);
  }
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

async function deleteArticle(id) {
  try {
    if (!confirm("Opravdu chcete tento článek smazat?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (editingId === id) {
      cancelEdit();
    }
    loadAdminArticles();
  } catch (err) {
    console.error("Chyba při mazání článku", err);
    alert("Nepodařilo se smazat článek. Zkuste to znovu.");
  }
}

document
  .getElementById("article-form")
  .addEventListener("submit", async (e) => {
    try {
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
    } catch (err) {
      console.error("Chyba při ukládání článku", err);
    }
  });
loadAdminArticles();
