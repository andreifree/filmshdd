// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Burger Menu Toggle
  const burgerMenu = document.getElementById("burgerMenu");
  const mobileMenu = document.getElementById("mobileMenu");

  if (burgerMenu && mobileMenu) {
    // Toggle menu
    burgerMenu.addEventListener("click", (e) => {
      e.stopPropagation();

      burgerMenu.classList.toggle("open");
      mobileMenu.classList.toggle("open");
    });

    // Close menu when clicking on a link
    const mobileLinks = document.querySelectorAll(".mobile-nav a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        burgerMenu.classList.remove("open");
        mobileMenu.classList.remove("open");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        burgerMenu.classList.contains("open") &&
        !mobileMenu.contains(e.target) &&
        !burgerMenu.contains(e.target)
      ) {
        burgerMenu.classList.remove("open");
        mobileMenu.classList.remove("open");
      }
    });
  }
});

document
  .getElementById("customDiskForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const comments = document.getElementById("comments").value;

    // Bu yerda formani serverga yuborish logikasi bo'ladi
    console.log("Form yuborildi:", { email, name, comments });

    alert("Спасибо! Ваш запрос отправлен.");
    this.reset();
  });
