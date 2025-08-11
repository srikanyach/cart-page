
const cartCountElement = document.getElementById('cart-count');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');


let cart = loadCartFromLocalStorage();


function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('srikanyaComfartsCart');
    return storedCart ? JSON.parse(storedCart) : [];
}


function saveCartToLocalStorage() {
    localStorage.setItem('srikanyaComfartsCart', JSON.stringify(cart));
}


const productCatalog = {
    'pizza': {
        name: 'Pizza',
        price: 200.99,
        img: './assets/pizza.jpeg',
        related: ['fries', 'coke', 'burger', 'popcorn']
    },
    'burger': {
        name: 'Burger',
        price: 150.00,
        img: './assets/burger.jpeg',
        related: ['fries', 'coke', 'pizza', 'thumpsup']
    },
    'fries': {
        name: 'Fries',
        price: 75.00,
        img: './assets/fries.jpeg',
        related: ['burger', 'coke', 'pizza', 'samosa']
    },
    'coke': {
        name: 'Coke',
        price: 50.00,
        img: './assets/cocoCola.jpeg',
        related: ['pizza', 'burger', 'fries', 'popcorn']
    },
    'salad': {
        name: 'Side Salad',
        price: 350.00,
        img: './assets/salad.jpeg',
        related: ['pizza', 'burger', 'coke']
    },
    'popcorn': {
        name: 'Popcorn',
        price: 450.00,
        img: './assets/popcorn.jpeg',
        related: ['coke', 'thumpsup', 'fries']
    },
    'samosa': {
        name: 'Samosa',
        price: 50.00,
        img: './assets/samosa.jpeg',
        related: ['thumpsup', 'coke', 'fries']
    },
    'thumpsup': {
        name: 'Thumps Up',
        price: 100.00,
        img: './assets/thumpsUp.jpeg',
        related: ['burger', 'coke', 'pizza', 'samosa']
    },
};

function updateCartDisplay() {
    let totalItemsInCart = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItemsInCart += item.quantity;
        totalPrice += item.price * item.quantity;
    });

    // Update the superscript cart count in the header (present on all pages)
    if (cartCountElement) {
        cartCountElement.textContent = totalItemsInCart;
        if (totalItemsInCart > 0) {
            cartCountElement.classList.add('active');
        } else {
            cartCountElement.classList.remove('active');
        }
    }

    // Update the full cart items list and total price display
    // These elements are present on products.html (sidebar) and cart.html (main content)
    const cartItemsList = document.getElementById('cart-items-list');
    const totalPriceDisplay = document.getElementById('total-price-display');

    if (cartItemsList && totalPriceDisplay) {
        cartItemsList.innerHTML = ''; // Clear existing list items

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="empty-cart-message">Your cart is empty.</li>';
        } else {
            cart.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                `;
                cartItemsList.appendChild(listItem);
            });
        }
        totalPriceDisplay.textContent = totalPrice.toFixed(2);
    }
}


// --- Function to Add Item to Cart (universal) ---
function addItemToCart(productId) {
    const product = productCatalog[productId];

    if (!product) {
        console.error(`Product with ID "${productId}" not found in catalog.`);
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCartToLocalStorage(); // Always save cart after modification
    updateCartDisplay();     // Always update the display (header count, sidebar/full cart)

    // Only display related items if on the products page
    if (window.location.pathname.includes('products.html')) {
        displayRelatedItems(productId);
    }
}

// --- Search Functionality (triggered from any page, but filters on products.html) ---
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    // If not on the products page, redirect to products.html with search query
    if (!window.location.pathname.includes('products.html')) {
        window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        return; // Stop execution here as we are redirecting
    }

    // If already on the products page, filter the product cards
    const productCards = document.querySelectorAll('.products-grid .product-card');
    if (productCards.length === 0) return; // No product cards to filter on this specific section

    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- Related Items Function (specific to products.html) ---
function displayRelatedItems(currentProductId) {
    const relatedProductsGrid = document.getElementById('related-products-grid');
    const relatedItemsSection = document.querySelector('.related-items-section');

    // Ensure these elements exist on the current page before proceeding
    if (!relatedProductsGrid || !relatedItemsSection) return;

    const product = productCatalog[currentProductId];
    relatedProductsGrid.innerHTML = ''; // Clear any previously displayed related items

    if (product && product.related && product.related.length > 0) {
        let itemsToShow = 0;
        product.related.forEach(relatedId => {
            const relatedProduct = productCatalog[relatedId];
            // Only display if the related product exists and is NOT ALREADY in the main cart
            if (relatedProduct && !cart.some(item => item.id === relatedId)) {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.innerHTML = `
                    <img src="${relatedProduct.img}" alt="${relatedProduct.name}" class="product-image"
                         data-product-name="${relatedProduct.name}"
                         data-product-price="${relatedProduct.price}"
                         data-product-id="${relatedId}">
                    <h3>${relatedProduct.name}</h3>
                    <p>$${relatedProduct.price.toFixed(2)}</p>
                `;
                relatedProductsGrid.appendChild(productCard);
                itemsToShow++;

                // Add click listener to the newly created related product image
                const newProductImage = productCard.querySelector('.product-image');
                newProductImage.addEventListener('click', () => {
                    addItemToCart(newProductImage.dataset.productId);
                    relatedItemsSection.style.display = 'none'; // Hide section after adding from it
                });
            }
        });

        if (itemsToShow > 0) {
            relatedItemsSection.style.display = 'block';
        } else {
            relatedItemsSection.style.display = 'none';
        }
    } else {
        relatedItemsSection.style.display = 'none';
    }
}

// --- Initialize Page Specific Logic on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // Universal: Update cart count in header on every page load
    updateCartDisplay();

    // Attach search event listeners (they exist in the header on all pages)
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Logic specific to products.html
    if (window.location.pathname.includes('products.html')) {
        const productImages = document.querySelectorAll('.product-image');
        productImages.forEach(image => {
            image.addEventListener('click', () => {
                const productId = image.dataset.productId;
                if (productId) {
                    addItemToCart(productId);
                } else {
                    console.warn('Could not add item: Missing product ID on image.');
                }
            });
        });

        // Check for a search query in the URL when loading products.html
        // This allows searching from other pages to redirect and filter
        const urlParams = new URLSearchParams(window.location.search);
        const urlSearchTerm = urlParams.get('search');
        if (urlSearchTerm) {
            if (searchInput) { // Ensure searchInput exists before trying to set its value
                searchInput.value = urlSearchTerm; // Populate search input
            }
            performSearch(); // Perform search immediately
        }
    }
});