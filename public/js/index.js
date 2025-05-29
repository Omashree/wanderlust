let taxSwitch = document.getElementById("switchCheckDefault");
taxSwitch.addEventListener("click", () => {
    let taxInfo = document.getElementsByClassName("tax-info");
    for (let info of taxInfo) {
        info.classList.toggle("show");
    }
});

let filters = document.querySelectorAll(".filter");
filters.forEach(filter => {
    filter.addEventListener("click", () => {
        let category = filter.getAttribute("data-category");
        if (category === "Trending") {
            window.location.href = "/";
        } else {
            window.location.href = `/?category=${category}`;
        }
    });
});

const filtersContainer = document.getElementById('filters');
const scrollArrowLeft = document.getElementById('scroll-arrow-left');
const scrollArrowRight = document.getElementById('scroll-arrow-right');

function scrollFilters(amount) {
    filtersContainer.scrollBy({
        left: amount,
        behavior: 'smooth'
    });
}

function updateScrollArrows() {
    setTimeout(() => {
        const scrollLeft = filtersContainer.scrollLeft;
        const clientWidth = filtersContainer.clientWidth;
        const scrollWidth = filtersContainer.scrollWidth;

        if (scrollLeft > 5) {
            scrollArrowLeft.classList.add('active');
        } else {
            scrollArrowLeft.classList.remove('active');
        }

        if (Math.round(scrollLeft + clientWidth) < Math.round(scrollWidth) - 5) {
            scrollArrowRight.classList.add('active');
        } else {
            scrollArrowRight.classList.remove('active');
        }
    }, 100);
}

filtersContainer.addEventListener('scroll', updateScrollArrows);

document.addEventListener('DOMContentLoaded', () => {
    updateScrollArrows();
    if (taxSwitch.checked) {
        let taxInfo = document.getElementsByClassName("tax-info");
        for (let info of taxInfo) {
            info.classList.add("show");
        }
    }
});

window.addEventListener('resize', updateScrollArrows);