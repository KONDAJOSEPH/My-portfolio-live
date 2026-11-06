const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 1. Mobile menu */
const menuIcon = $("#menu-icon");
const navLinks = $("#nav-links");
const links = $$("a", navLinks);

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  menuIcon.setAttribute("aria-expanded", open);
  menuIcon.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  const icon = $("i", menuIcon);
  icon.classList.toggle("fa-bars", !open);
  icon.classList.toggle("fa-xmark", open);
}
menuIcon.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
links.forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

/* 2. Highlight the nav link of the section on screen */
const setActive = (id) => links.forEach((a) => a.classList.toggle("active", a.hash === "#" + id));
const observer = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
  { rootMargin: "-45% 0px -45% 0px" }
);
$$("section[id]").forEach((s) => observer.observe(s));

/* 3. Scroll progress bar, back-to-top button, last-section highlight */
const bar = $("#scroll-progress");
const toTop = $("#to-top");
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  toTop.classList.toggle("show", scrollY > 600);
  if (innerHeight + scrollY >= document.body.offsetHeight - 2) setActive("contact");
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

/* 4. Dark / light theme */
const root = document.documentElement;
const themeBtn = $("#theme-toggle");
const isDark = () =>
  root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;

function renderThemeButton() {
  const dark = isDark();
  const icon = $("i", themeBtn);
  icon.classList.toggle("fa-moon", !dark);
  icon.classList.toggle("fa-sun", dark);
  themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}
themeBtn.addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
  renderThemeButton();
});
renderThemeButton();

/* 5. Copy email / phone buttons */
$$(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const label = btn.textContent;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "Copied!";
    } catch {
      btn.textContent = "Copy failed";
    }
    setTimeout(() => (btn.textContent = label), 1500);
  });
});

/* 6. Contact form: validate, then open the visitor's email app with the message filled in */
const form = $("#contact-form");
const status = $("#form-status");
const RECIPIENT = "kondajoseph019@gmail.com";

function fieldError(input, message) {
  $(`.error[data-for="${input.id}"]`).textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}
function validate() {
  const name = form.elements.name;
  const email = form.elements.email;
  const message = form.elements.message;
  let ok = true;
  const check = (input, bad, text) => {
    fieldError(input, bad ? text : "");
    if (bad) ok = false;
  };
  check(name, name.value.trim().length < 2, "Enter your name.");
  check(email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), "Enter a valid email address, like name@example.com.");
  check(message, message.value.trim().length < 10, "Write at least 10 characters so I know how to help.");
  return ok;
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  status.textContent = "";
  if (!validate()) {
    $('[aria-invalid="true"]', form).focus();
    return;
  }
  const { name, email, message } = form.elements;
  const subject = `Portfolio message from ${name.value.trim()}`;
  const body = `${message.value.trim()}\n\n${name.value.trim()}\n${email.value.trim()}`;
  location.href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = "Your email app should open with the message ready to send. If it does not, email " + RECIPIENT + " directly.";
  form.reset();
});
form.addEventListener("input", (e) => e.target.matches("input, textarea") && fieldError(e.target, ""));

/* 7. Count-up for the numbers in the stats bar (runs once) */
const counters = $$("[data-count]");
if (!reduceMotion && "IntersectionObserver" in window) {
  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 900, 1);
        el.textContent = Math.round(end * p) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => countObs.observe(c));
}

/* 8. Hide the LinkedIn icon until a real profile URL is set in index.html */
const linkedin = $("#linkedin-link");
if (linkedin && linkedin.getAttribute("href") === "#") linkedin.hidden = true;

/* 9. Footer year */
$("#year").textContent = new Date().getFullYear();
