/**
 * site.js — shared logic for all esaLab pages
 * No jQuery. No dependencies. Vanilla ES6.
 */

// ── Copyright year 
document.querySelectorAll(".js-year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ── Scroll-reveal: .reveal and .reveal-slide 
const revealEls = document.querySelectorAll(".reveal, .reveal-slide");

if (revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target); 
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
}

//  Active nav link 
const currentFile = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-link").forEach((a) => {
  const href = a.getAttribute("href");
  if (href === currentFile || (currentFile === "" && href === "index.html")) {
    a.classList.add("active");
    a.setAttribute("aria-current", "page");
  }
});

//  Welcome message rotator 
const welcomeEl = document.getElementById("welcome-message");
if (welcomeEl) {
  const msgs = ["Welcome!", "Bienvenue!", "Willkommen!", "Woezɔ!", "Akwaaba!"];
  let idx = 0;
  const rotate = () => {
    welcomeEl.style.opacity = "0";
    setTimeout(() => {
      idx = (idx + 1) % msgs.length;
      welcomeEl.textContent = msgs[idx];
      welcomeEl.style.opacity = "1";
    }, 400);
  };
  setInterval(rotate, 4000);
}

//  Spinner fade (triggered by globe bundle loading) 
const spinner = document.querySelector(".spinner-container");
if (spinner) {
  window.addEventListener("load", () => {
    spinner.classList.add("spinner--hidden");
  });
}
