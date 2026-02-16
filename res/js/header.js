function initHeader(){
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".dropdownMenu");
const button = document.getElementById("langButton");
const button2 = document.getElementById("langButton2");

let lang = localStorage.getItem("lang") || "cs";

const buttons = [button, button2];

function updateLanguage() {
  document.querySelectorAll("[data-en]").forEach((el) => {
    if (el.tagName === "IMG") {
      el.src = el.getAttribute(`data-${lang}`);
      return;
    }

    el.textContent = el.getAttribute(`data-${lang}`);
  });
}

updateLanguage();

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (lang === "cs") {
      lang = "en";
    } else {
      lang = "cs";
    }

    localStorage.setItem("lang", lang);

    updateLanguage();
  });
});
hamburger.addEventListener("click", () => {
  console.log("click");
  if (navMenu.style.display === "flex") {
    navMenu.style.display = "none";
  } else {
    navMenu.style.display = "flex";
  }
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 1520) {
    navMenu.style.display = "none";
  }
});
}