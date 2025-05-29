const searchInput = document.querySelector('.search-inp');
const originalPlaceholder = "Search destinations";
const compactPlaceholder = "Search";

function updatePlaceholder() {
    if (window.innerWidth <= 389.98) {
        searchInput.placeholder = compactPlaceholder;
    } else {
        searchInput.placeholder = originalPlaceholder;
    }
}

document.addEventListener('DOMContentLoaded', updatePlaceholder);

window.addEventListener('resize', updatePlaceholder);