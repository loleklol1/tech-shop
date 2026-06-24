document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEYS = {
        wishlist: 'techsale_wishlist',
        cart: 'techsale_cart'
    };

    let storeData = null;
    let products = [];

    function getFromStorage(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) || fallback;
        } catch (error) {
            return fallback;
        }
    }

    function saveToStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getWishlist() {
        return getFromStorage(STORAGE_KEYS.wishlist, []);
    }

    function setWishlist(value) {
        saveToStorage(STORAGE_KEYS.wishlist, value);
    }

    function getCart() {
        return getFromStorage(STORAGE_KEYS.cart, []);
    }

    function setCart(value) {
        saveToStorage(STORAGE_KEYS.cart, value);
    }

    function formatPrice(value) {
        return `$${Number(value).toLocaleString('en-US')}`;
    }

    function findProduct(id) {
        return products.find(product => String(product.id) === String(id));
    }

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

    function updateHeaderCounters() {
        const wishlistCount = getWishlist().length;
        const cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0);

        document.querySelectorAll('.wishlist-count').forEach(el => el.textContent = wishlistCount);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartCount);
    }

    function addToCart(id, quantity = 1) {
        const product = findProduct(id);
        if (!product) return;

        const cart = getCart();
        const existingItem = cart.find(item => String(item.id) === String(id));

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: String(id), quantity });
        }

        setCart(cart);
        updateHeaderCounters();
    }

    function changeCartQuantity(id, delta) {
        const cart = getCart();
        const item = cart.find(cartItem => String(cartItem.id) === String(id));
        if (!item) return;

        item.quantity += delta;
        if (item.quantity < 1) item.quantity = 1;

        setCart(cart);
        renderCartPage();
        updateHeaderCounters();
    }

    function removeFromCart(id) {
        const cart = getCart().filter(item => String(item.id) !== String(id));
        setCart(cart);
        renderCartPage();
        updateHeaderCounters();
    }

    function toggleWishlist(id) {
        const wishlist = getWishlist();
        const productId = String(id);

        if (wishlist.includes(productId)) {
            setWishlist(wishlist.filter(itemId => itemId !== productId));
        } else {
            wishlist.push(productId);
            setWishlist(wishlist);
        }

        updateWishlistButtons();
        updateHeaderCounters();
        renderWishlistPage();
    }

    function removeFromWishlist(id) {
        setWishlist(getWishlist().filter(itemId => String(itemId) !== String(id)));
        updateWishlistButtons();
        updateHeaderCounters();
        renderWishlistPage();
    }

    function updateWishlistButtons() {
        const wishlist = getWishlist();
        document.querySelectorAll('[data-wishlist-id]').forEach(button => {
            const productId = String(button.dataset.wishlistId);
            const isActive = wishlist.includes(productId);
            button.classList.toggle('active', isActive);
            button.innerHTML = isActive
                ? '<i class="fa-solid fa-heart"></i>'
                : '<i class="fa-regular fa-heart"></i>';
        });
    }

    function createProductCard(product) {
        return `
            <div class="product-card" data-product-id="${product.id}">
                <button class="wishlist-btn" data-wishlist-id="${product.id}" aria-label="Add to wishlist">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <img src="${product.img}" alt="${product.name}" class="product-img">
                <h3 class="product-title">${product.name}</h3>
                <div class="price-container">
                    <span class="new-price">${formatPrice(product.discountPrice)}</span>
                    <span class="old-price">${formatPrice(product.price)}</span>
                </div>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span class="reviews">(${product.reviews})</span>
                </div>
                <button class="card-cart-btn" data-add-cart="${product.id}">Add to Cart</button>
            </div>
        `;
    }

    function renderHomeSections(query = '') {
        if (!storeData || !document.getElementById('new-launches-grid')) return;

        const normalizedQuery = query.trim().toLowerCase();
        const sections = storeData.sections;
        let totalFound = 0;

        const renderSection = (gridId, sectionProducts = []) => {
            const grid = document.getElementById(gridId);
            if (!grid) return;

            const filteredProducts = normalizedQuery
                ? sectionProducts.filter(product =>
                    product.name.toLowerCase().includes(normalizedQuery) ||
                    (product.category || '').toLowerCase().includes(normalizedQuery)
                )
                : sectionProducts;

            totalFound += filteredProducts.length;
            grid.innerHTML = filteredProducts.length
                ? filteredProducts.map(createProductCard).join('')
                : '<p class="empty-section">No products found</p>';
        };

        renderSection('new-launches-grid', sections.newLaunches);
        renderSection('ins-offer-grid', sections.insOffer);
        renderSection('best-sellers-grid', sections.bestSellers);

        const searchInfo = document.getElementById('search-result-info');
        if (searchInfo) {
            searchInfo.textContent = normalizedQuery
                ? `Search result for "${query}": ${totalFound} product(s)`
                : '';
        }

        updateWishlistButtons();
    }

    function initHomeSearch() {
        const searchInput = document.getElementById('productSearch');
        if (!searchInput) return;

        const params = new URLSearchParams(window.location.search);
        const queryFromUrl = params.get('search') || '';
        if (queryFromUrl) {
            searchInput.value = queryFromUrl;
        }

        renderHomeSections(searchInput.value);

        searchInput.addEventListener('input', () => {
            renderHomeSections(searchInput.value);
        });
    }

    function initHeaderLinks() {
        document.querySelectorAll('.js-wishlist-link').forEach(link => {
            link.addEventListener('click', () => window.location.href = 'wishlist.html');
        });

        document.querySelectorAll('.js-cart-link').forEach(link => {
            link.addEventListener('click', () => window.location.href = 'cart.html');
        });

        document.querySelectorAll('.search-div input').forEach(input => {
            if (input.id === 'productSearch') return;
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && input.value.trim()) {
                    window.location.href = `index.html?search=${encodeURIComponent(input.value.trim())}`;
                }
            });
        });
    }

    function initGlobalActions() {
        document.body.addEventListener('click', (event) => {
            const wishlistButton = event.target.closest('[data-wishlist-id]');
            if (wishlistButton) {
                event.preventDefault();
                event.stopPropagation();
                toggleWishlist(wishlistButton.dataset.wishlistId);
                return;
            }

            const addCartButton = event.target.closest('[data-add-cart]');
            if (addCartButton) {
                event.preventDefault();
                event.stopPropagation();
                addToCart(addCartButton.dataset.addCart, Number(addCartButton.dataset.quantity || 1));
                addCartButton.textContent = 'Added';
                setTimeout(() => addCartButton.textContent = addCartButton.classList.contains('add-cart-btn') ? 'Add to Cart' : 'Add to Cart', 800);
                return;
            }

            const buyButton = event.target.closest('[data-buy-now]');
            if (buyButton) {
                event.preventDefault();
                event.stopPropagation();
                addToCart(buyButton.dataset.buyNow, Number(buyButton.dataset.quantity || 1));
                window.location.href = 'cart.html';
                return;
            }

            const card = event.target.closest('.product-card[data-product-id]');
            if (card) {
                window.location.href = `product.html?id=${card.dataset.productId}`;
            }
        });
    }

    function renderProductPage() {
        const productContainer = document.getElementById('product-details');
        if (!productContainer) return;

        const productId = new URLSearchParams(window.location.search).get('id') || products[0]?.id;
        const product = findProduct(productId);

        if (!product) {
            productContainer.innerHTML = '<p class="empty-page">Product not found.</p>';
            return;
        }

        document.title = `${product.name} - Tech Store`;
        const colors = product.colors || ['Black'];
        const specs = product.specs || { RAM: '8 GB', Storage: '128 GB' };

        productContainer.innerHTML = `
            <div class="product-detail-grid">
                <div class="product-gallery">
                    <div class="main-product-image">
                        <img id="mainProductImage" src="${product.img}" alt="${product.name}">
                    </div>
                    <div class="thumb-row">
                        ${[1,2,3,4].map(() => `<button class="thumb-btn"><img src="${product.img}" alt="${product.name}"></button>`).join('')}
                    </div>
                </div>

                <div class="product-info-panel">
                    <div class="breadcrumb product-breadcrumb"><a href="index.html">Home</a> / <span>${product.category || 'Product'}</span> / <span>${product.name}</span></div>
                    <h1>${product.name}</h1>
                    <div class="product-meta-row">
                        <span class="rating product-rating">${generateStars(product.rating)}</span>
                        <span class="reviews">Reviews (${product.reviews})</span>
                        <span class="stock-status">${product.stock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                    <p class="product-short-desc">${product.description}</p>
                    <h2 class="product-detail-price">${formatPrice(product.discountPrice)}</h2>
                    <p class="product-spec"><strong>Specification:</strong> RAM: ${specs.RAM || '8 GB'} <span>|</span> ${specs.Storage || '128 GB'}</p>
                    <div class="color-row"><strong>Colors:</strong> ${colors.map(color => `<span class="color-dot" title="${color}"></span>`).join('')}</div>
                    <div class="detail-actions">
                        <div class="qty-control" data-product-qty>
                            <button type="button" data-qty-minus>-</button>
                            <span data-qty-value>1</span>
                            <button type="button" data-qty-plus>+</button>
                        </div>
                        <button class="detail-wishlist-btn wishlist-btn" data-wishlist-id="${product.id}" aria-label="Wishlist"><i class="fa-regular fa-heart"></i></button>
                    </div>
                    <div class="detail-buttons">
                        <button class="buy-now-btn" data-buy-now="${product.id}" data-quantity="1">Buy Now</button>
                        <button class="add-cart-btn" data-add-cart="${product.id}" data-quantity="1">Add to Cart</button>
                    </div>
                </div>
            </div>

            <div class="product-tabs">
                <button class="tab-btn active" data-tab="description">Description</button>
                <button class="tab-btn" data-tab="additional">Additional Information</button>
                <button class="tab-btn" data-tab="reviews">Reviews [${product.reviews}]</button>
            </div>
            <div class="tab-content" id="description-tab">${product.description} Powered by a modern product architecture, ${product.name} delivers smooth performance, stylish design and reliable everyday use.</div>
            <div class="tab-content hidden" id="additional-tab">Category: ${product.category || 'Tech'}<br>RAM: ${specs.RAM || '8 GB'}<br>Storage: ${specs.Storage || '128 GB'}<br>Available colors: ${colors.join(', ')}</div>
            <div class="tab-content hidden" id="reviews-tab">Customers rated this product ${product.rating} out of 5. Total reviews: ${product.reviews}.</div>

            <div class="product-bottom-images">
                <img src="${product.img}" alt="${product.name}">
                <img src="${product.img}" alt="${product.name}">
            </div>
        `;

        updateWishlistButtons();
        initProductQuantity(product.id);
        initTabs();
    }

    function initProductQuantity(productId) {
        const qtyBlock = document.querySelector('[data-product-qty]');
        if (!qtyBlock) return;

        const qtyValue = qtyBlock.querySelector('[data-qty-value]');
        const addCartBtn = document.querySelector(`[data-add-cart="${productId}"]`);
        const buyNowBtn = document.querySelector(`[data-buy-now="${productId}"]`);
        let quantity = 1;

        const updateQty = () => {
            qtyValue.textContent = quantity;
            if (addCartBtn) addCartBtn.dataset.quantity = quantity;
            if (buyNowBtn) buyNowBtn.dataset.quantity = quantity;
        };

        qtyBlock.querySelector('[data-qty-minus]').addEventListener('click', () => {
            quantity = Math.max(1, quantity - 1);
            updateQty();
        });

        qtyBlock.querySelector('[data-qty-plus]').addEventListener('click', () => {
            quantity += 1;
            updateQty();
        });
    }

    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
                button.classList.add('active');
                document.getElementById(`${button.dataset.tab}-tab`)?.classList.remove('hidden');
            });
        });
    }

    function renderWishlistPage() {
        const wishlistList = document.getElementById('wishlist-list');
        if (!wishlistList || !products.length) return;

        const wishlist = getWishlist();
        const wishlistProducts = wishlist.map(findProduct).filter(Boolean);

        if (!wishlistProducts.length) {
            wishlistList.innerHTML = '<p class="empty-page">Wishlist is empty. Add products with the heart button.</p>';
            return;
        }

        wishlistList.innerHTML = wishlistProducts.map(product => `
            <div class="wishlist-item">
                <img src="${product.img}" alt="${product.name}">
                <div class="wishlist-info">
                    <h3>${product.name}</h3>
                    <div class="rating">${generateStars(product.rating)} <span class="reviews">review (${product.reviews})</span></div>
                    <div class="price-container">
                        <span class="new-price">${formatPrice(product.discountPrice)}</span>
                        <span class="old-price">${formatPrice(product.price)}</span>
                    </div>
                    <button class="buy-now-btn small" data-buy-now="${product.id}">Buy Now</button>
                </div>
                <button class="trash-btn" data-remove-wishlist="${product.id}" aria-label="Remove"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    }

    function initWishlistPage() {
        const wishlistList = document.getElementById('wishlist-list');
        if (!wishlistList) return;

        renderWishlistPage();

        wishlistList.addEventListener('click', (event) => {
            const removeButton = event.target.closest('[data-remove-wishlist]');
            if (removeButton) {
                removeFromWishlist(removeButton.dataset.removeWishlist);
            }
        });

        const moveAllButton = document.getElementById('move-all-cart');
        if (moveAllButton) {
            moveAllButton.addEventListener('click', () => {
                getWishlist().forEach(id => addToCart(id));
                setWishlist([]);
                renderWishlistPage();
                updateWishlistButtons();
                updateHeaderCounters();
                window.location.href = 'cart.html';
            });
        }
    }

    function renderCartPage() {
        const cartList = document.getElementById('cart-list');
        if (!cartList || !products.length) return;

        const cart = getCart();
        const cartItems = cart
            .map(item => ({ product: findProduct(item.id), quantity: item.quantity }))
            .filter(item => item.product);

        const summaryBox = document.getElementById('cart-summary');

        if (!cartItems.length) {
            cartList.innerHTML = '<p class="empty-page">Cart is empty. Add products from the catalog.</p>';
            if (summaryBox) {
                summaryBox.innerHTML = '<p>Price (0 items)</p><p><strong>Total Amount:</strong> $0</p><button class="buy-now-btn">Proceed to payment</button>';
            }
            return;
        }

        cartList.innerHTML = `
            <div class="cart-header">
                <span>Product</span>
                <span>price</span>
                <span>Quantity</span>
                <span>subtotal</span>
                <span></span>
            </div>
            ${cartItems.map(({ product, quantity }) => `
                <div class="cart-row">
                    <div class="cart-product">
                        <img src="${product.img}" alt="${product.name}">
                        <span>${product.name}</span>
                    </div>
                    <span>${formatPrice(product.discountPrice)}</span>
                    <div class="qty-control cart-qty">
                        <button type="button" data-cart-minus="${product.id}">-</button>
                        <span>${quantity}</span>
                        <button type="button" data-cart-plus="${product.id}">+</button>
                    </div>
                    <strong>${formatPrice(product.discountPrice * quantity)}</strong>
                    <button class="trash-btn" data-remove-cart="${product.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('')}
        `;

        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = cartItems.reduce((sum, item) => sum + item.product.discountPrice * item.quantity, 0);

        if (summaryBox) {
            summaryBox.innerHTML = `
                <p>Price (${totalQuantity} items)</p>
                <p><strong>Total Amount:</strong> ${formatPrice(totalAmount)}</p>
                <button class="buy-now-btn">Proceed to payment</button>
            `;
        }
    }

    function initCartPage() {
        const cartList = document.getElementById('cart-list');
        if (!cartList) return;

        renderCartPage();

        cartList.addEventListener('click', (event) => {
            const plusButton = event.target.closest('[data-cart-plus]');
            const minusButton = event.target.closest('[data-cart-minus]');
            const removeButton = event.target.closest('[data-remove-cart]');

            if (plusButton) changeCartQuantity(plusButton.dataset.cartPlus, 1);
            if (minusButton) changeCartQuantity(minusButton.dataset.cartMinus, -1);
            if (removeButton) removeFromCart(removeButton.dataset.removeCart);
        });
    }

    async function loadData() {
        try {
            const response = await fetch('data.json');
            storeData = await response.json();
            products = Object.values(storeData.sections).flat();

            initHeaderLinks();
            initHomeSearch();
            initGlobalActions();
            renderProductPage();
            initWishlistPage();
            initCartPage();
            updateWishlistButtons();
            updateHeaderCounters();
        } catch (error) {
            console.error('Помилка завантаження JSON:', error);
        }
    }

    loadData();
});
