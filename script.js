const menuIcon = document.getElementById("menu-icon");
const navLinks = document.querySelector(".nav-links");
const links = navLinks.querySelectorAll("a");

// 1. Mobile menu: open/close, and close after tapping a link
function setMenu(open) {
  navLinks.classList.toggle("open", open);
  menuIcon.classList.toggle("fa-bars", !open);
  menuIcon.classList.toggle("fa-xmark", open);
}
menuIcon.onclick = () => setMenu(!navLinks.classList.contains("open"));
links.forEach((a) => (a.onclick = () => setMenu(false)));

// 2. Highlight the nav link of the section on screen
const setActive = (id) => links.forEach((a) => a.classList.toggle("active", a.hash === "#" + id));
const observer = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
  { rootMargin: "-45% 0px -45% 0px" }
);
document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
window.addEventListener("scroll", () => {
  if (innerHeight + scrollY >= document.body.offsetHeight - 2) setActive("contact");
});

// 3. Copy email / phone buttons
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.onclick = async () => {
    const label = btn.textContent;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "Copied!";
    } catch {
      btn.textContent = "Copy failed";
    }
    setTimeout(() => (btn.textContent = label), 1500);
  };
});

// 4. Footer year
document.getElementById("year").textContent = new Date().getFullYear();
