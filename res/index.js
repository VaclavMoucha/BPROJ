const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".SecondHeaderContainer");
const button = document.getElementById("langButton");
const button2 = document.getElementById("langButton2");
const buttons = [button, button2];
let lang = "cs";

buttons.forEach(btn =>{btn.addEventListener("click", () => {
  console.log("click");
  if (lang === "cs") {
    lang = "en";
  } else {
    lang = "cs";
  }
  document.querySelectorAll("[data-en]").forEach((el) => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
   document.querySelectorAll("[data-en]").forEach((el) => {
    if (el.tagName === "IMG") {
      el.src = el.getAttribute(`data-${lang}`);
    }
  });
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
