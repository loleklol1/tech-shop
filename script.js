document.addEventListener('DOMContentLoaded', () => {
    
    // Star Rating Component
    function generateStars(rating) {
        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                starsHTML += '<i class="fa-solid fa-star"></i>';
            } else {
                starsHTML += '<i class="fa-regular fa-star"></i>';
            }
        }
        return starsHTML;
    }

    // Product Card Template
    function createProductCard(product) {
        return `
            <div class="product-card">
                <button class="wishlist-btn"><i class="fa-regular fa-heart"></i></button>
                <img src="${product.img}" alt="${product.name}" class="product-img">
                <h3 class="product-title">${product.name}</h3>
                <div class="price-container">
                    <span class="new-price">$${product.discountPrice}</span>
                    <span class="old-price">$${product.price}</span>
                </div>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span class="reviews">(${product.reviews})</span>
                </div>
            </div>
        `;
    }

    // Fetch and Render Content
    fetch('data.json')
.then(response => response.json())
    .then(data => {
        const sections = data.sections;

        const newLaunchesGrid = document.getElementById('new-launches-grid');
        if (newLaunchesGrid && sections.newLaunches) {
            newLaunchesGrid.innerHTML = sections.newLaunches.map(createProductCard).join('');
        }

        const insOfferGrid = document.getElementById('ins-offer-grid');
        if (insOfferGrid && sections.insOffer) {
            insOfferGrid.innerHTML = sections.insOffer.map(createProductCard).join('');
        }

        const bestSellersGrid = document.getElementById('best-sellers-grid');
        if (bestSellersGrid && sections.bestSellers) {
            bestSellersGrid.innerHTML = sections.bestSellers.map(createProductCard).join('');
        }
    })
    .catch(error => console.error('Помилка завантаження JSON:', error));
});