// Existing tax toggle code...
let taxSwitch = document.getElementById("flexSwitchCheckDefault");
taxSwitch.addEventListener("click", () => {
  let taxInfo = document.getElementsByClassName("tax-info");
  for (let info of taxInfo) {
    if (info.style.display !== "inline") {
      info.style.display = "inline";
    } else {
      info.style.display = "none";
    }
  }
});

const filtersContainer = document.getElementById("filters");
const scrollLeftBtn = document.getElementById("scrollLeftBtn");
const scrollRightBtn = document.getElementById("scrollRightBtn");

function updateButtonVisibility() {
  // How far have we scrolled from the left?
  const scrollLeft = filtersContainer.scrollLeft;
  // The total scrollable width minus the visible width:
  const maxScrollLeft =
    filtersContainer.scrollWidth - filtersContainer.clientWidth;

  // Show previous button if we are not at the very left.
  if (scrollLeft > 0) {
    scrollLeftBtn.style.display = "block";
  } else {
    scrollLeftBtn.style.display = "none";
  }

  // Show next button if we are not at the very right.
  if (scrollLeft < maxScrollLeft) {
    scrollRightBtn.style.display = "block";
  } else {
    scrollRightBtn.style.display = "none";
  }
}

// Scroll event on filters container.
filtersContainer.addEventListener("scroll", updateButtonVisibility);

// Button click events.
scrollRightBtn.addEventListener("click", () => {
  // Scroll to the right by a fixed amount.
  filtersContainer.scrollBy({
    left: 200, // Adjust as needed
    behavior: "smooth",
  });
});

scrollLeftBtn.addEventListener("click", () => {
  // Scroll to the left by a fixed amount.
  filtersContainer.scrollBy({
    left: -200, // Adjust as needed
    behavior: "smooth",
  });
});

// Update visibility on load and on resize.
window.addEventListener("resize", updateButtonVisibility);
document.addEventListener("DOMContentLoaded", updateButtonVisibility);

const filters = document.querySelectorAll(".filter");
const listingLinks = document.querySelectorAll(".listing-link");

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const category = filter.getAttribute("data-filter");

    filters.forEach((f) => f.classList.remove("active"));
    filter.classList.add("active");

    listingLinks.forEach((link) => {
      const card = link.querySelector(".listing-card");
      if (
        category === "All" ||
        card.getAttribute("data-category") === category
      ) {
        link.style.display = "block";
      } else {
        link.style.display = "none";
      }
    });
  });
});
