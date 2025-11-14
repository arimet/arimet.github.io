'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebarBtn && sidebar) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
if (navigationLinks.length > 0 && pages.length > 0) {
  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      const clickedPage = this.innerHTML.toLowerCase();

      for (let j = 0; j < pages.length; j++) {
        if (pages[j].dataset.page && clickedPage === pages[j].dataset.page) {
          pages[j].classList.add("active");
        } else {
          pages[j].classList.remove("active");
        }
      }

      for (let k = 0; k < navigationLinks.length; k++) {
        navigationLinks[k].classList.remove("active");
      }
      this.classList.add("active");

      window.scrollTo(0, 0);
    });
  }
}