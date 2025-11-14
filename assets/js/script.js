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
function showPage(pageName, isInitialLoad = false) {
  for (let j = 0; j < pages.length; j++) {
    if (pages[j].dataset.page && pageName === pages[j].dataset.page) {
      pages[j].classList.add("active");
      // Add no-transition class on initial load to prevent animation
      if (isInitialLoad) {
        pages[j].classList.add("no-transition");
        // Remove it after a short delay so future transitions work
        setTimeout(() => pages[j].classList.remove("no-transition"), 50);
      }
    } else {
      pages[j].classList.remove("active");
    }
  }
  for (let k = 0; k < navigationLinks.length; k++) {
    if (navigationLinks[k].textContent.trim().toLowerCase() === pageName) {
      navigationLinks[k].classList.add("active");
    } else {
      navigationLinks[k].classList.remove("active");
    }
  }
  window.scrollTo(0, 0);
}

if (navigationLinks.length > 0 && pages.length > 0) {
  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      const clickedPage = this.textContent.trim().toLowerCase();
      showPage(clickedPage);
      window.location.hash = '#' + clickedPage;
    });
  }
  // On page load, check hash and show correct tab
  let initialPage = 'about';
  if (window.location.hash) {
    const hashPage = window.location.hash.replace('#', '').toLowerCase();
    if ([...pages].some(p => p.dataset.page === hashPage)) {
      initialPage = hashPage;
    }
  }
  showPage(initialPage, true);
}



// blog posts loading functionality
function loadBlogPosts() {
  const blogPostsList = document.getElementById('blog-posts-list');
  
  if (!blogPostsList || typeof articles === 'undefined') {
    return;
  }

  // Sort articles by date (most recent first)
  const sortedArticles = [...articles].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // Generate HTML for each article
  sortedArticles.forEach(article => {
    const li = document.createElement('li');
    li.className = 'blog-post-item';

    // Format date for datetime attribute (YYYY-MM-DD)
    const dateObj = new Date(article.date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    
    // Format date for display
    const displayDate = article.date;

    li.innerHTML = `
      <a href="${article.link}" class="blog-post-link" target="_blank" rel="noopener noreferrer">
        <figure class="blog-banner-box">
          <img
            src="${article.image}"
            alt="${article.title}"
            loading="lazy"
          />
        </figure>

        <div class="blog-content">
          <div class="blog-meta">
            <p class="blog-category">${article.category}</p>

            <span class="dot"></span>

            <time datetime="${formattedDate}">${displayDate}</time>
          </div>

          <h3 class="h3 blog-item-title">
            ${article.title}
          </h3>

          <p class="blog-text">
            ${article.excerpt}
          </p>
        </div>
      </a>
    `;

    blogPostsList.appendChild(li);
  });
}

// Load blog posts when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadBlogPosts);
} else {
  loadBlogPosts();
}