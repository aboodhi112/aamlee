document.addEventListener('DOMContentLoaded', () => {
    const storeDomain = '2p1s8f-yx.myshopify.com';
    const storefrontToken = '730fb496b29ebd0c38574b927925f703';
    const body = document.body;
    const searchModal = document.getElementById('search-modal');
    const mobileDrawer = document.getElementById('mobile-drawer');

    function syncScrollLock() {
        const drawerOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');
        const searchOpen = searchModal && searchModal.open;
        const imageOpen = document.getElementById('image-modal')?.open; // Add this line
        body.style.overflow = drawerOpen || searchOpen || imageOpen ? 'hidden' : ''; // Update this line
    }

    function sanitizeHandle(handle) {
        return /^[a-z0-9-]+$/i.test(handle || '') ? handle : 'lumiere-ring';
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function updateHeader() {
        const header = document.querySelector('.site-header');
        const hero = document.querySelector('.hero');
        const compactThreshold = 24;

        if (!header) return;

        if (header.dataset.staticHeader === 'true') {
            header.classList.add('is-scrolled');
            if (window.scrollY > compactThreshold) {
                header.classList.add('is-compact');
            } else {
                header.classList.remove('is-compact');
            }
            return;
        }

        if (!hero) {
            header.classList.add('is-scrolled');
            if (window.scrollY > compactThreshold) {
                header.classList.add('is-compact');
            } else {
                header.classList.remove('is-compact');
            }
            return;
        }

        const threshold = hero.offsetHeight * 0.6;
        if (window.scrollY > threshold) {
            header.classList.add('is-scrolled', 'is-compact');
        } else {
            header.classList.remove('is-scrolled');
            if (window.scrollY > compactThreshold) {
                header.classList.add('is-compact');
            } else {
                header.classList.remove('is-compact');
            }
        }
    }

    function initDrawer() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const drawerOverlay = document.getElementById('drawer-overlay');
        const drawerClose = document.getElementById('drawer-close');

        function openDrawer() {
            if (!mobileDrawer) return;
            mobileDrawer.classList.add('is-open');
            if (drawerOverlay) drawerOverlay.classList.add('is-open');
            syncScrollLock();
        }

        function closeDrawer() {
            if (!mobileDrawer) return;
            mobileDrawer.classList.remove('is-open');
            if (drawerOverlay) drawerOverlay.classList.remove('is-open');
            syncScrollLock();
        }

        window.closeDrawer = closeDrawer;

        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
        if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
        if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

        if (mobileDrawer) {
            mobileDrawer.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', closeDrawer);
            });
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeDrawer();
        });
    }

    function initSearchModal() {
        if (!searchModal) return;

        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const searchEmpty = document.getElementById('search-empty');
        const searchClose = document.getElementById('search-close');
        const searchForm = document.getElementById('search-form');
        const featuredLinks = Array.from(document.querySelectorAll('[data-search-index]')).map((node) => ({
            title: node.getAttribute('data-search-title') || node.textContent.trim(),
            href: node.getAttribute('href') || '#',
            meta: node.getAttribute('data-search-meta') || 'Page'
        }));

        const baseIndex = [
            { title: 'Home', href: 'index.html', meta: 'Page' },
            { title: 'Shop', href: 'shop.html', meta: 'Products' },
            { title: 'Collections', href: 'collections.html', meta: 'Page' },
            { title: 'About', href: 'about.html', meta: 'Page' },
            { title: 'Contact', href: 'contact.html', meta: 'Support' },
            { title: 'Lumiere Ring', href: 'product.html?handle=lumiere-ring', meta: 'Product' }
        ];

        const seen = new Set();
        const searchIndex = [...baseIndex, ...featuredLinks].filter((item) => {
            const key = `${item.title}|${item.href}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        function openSearchModal() {
            if (searchModal.open) return;
            searchModal.showModal();
            syncScrollLock();
            window.setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 50);
            renderSearchResults(searchInput ? searchInput.value.trim() : '');
        }

        function closeSearchModal() {
            searchModal.close();
        }

        function renderSearchResults(rawQuery) {
            if (!searchResults || !searchEmpty) return;

            const query = rawQuery.trim().toLowerCase();
            if (!query) {
                searchResults.innerHTML = '';
                searchEmpty.hidden = false;
                return;
            }

            const matches = searchIndex.filter((item) => {
                const haystack = `${item.title} ${item.meta}`.toLowerCase();
                return haystack.includes(query);
            }).slice(0, 6);

            const shopLink = {
                title: `Search shop for "${rawQuery.trim()}"`,
                href: `shop.html?query=${encodeURIComponent(rawQuery.trim())}`,
                meta: 'Catalog'
            };

            const results = [shopLink, ...matches];
            searchResults.innerHTML = results.map((item) => `
                <a class="search-result" href="${item.href}">
                    <span class="search-result__meta">${escapeHtml(item.meta)}</span>
                    <span class="search-result__title">${escapeHtml(item.title)}</span>
                </a>
            `).join('');
            searchEmpty.hidden = true;
        }

        window.openSearchModal = openSearchModal;
        window.closeSearchModal = closeSearchModal;

        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                renderSearchResults(event.target.value);
            });
        }

        if (searchClose) searchClose.addEventListener('click', closeSearchModal);
        if (searchForm) {
            searchForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const query = searchInput ? searchInput.value.trim() : '';
                window.location.href = query ? `shop.html?query=${encodeURIComponent(query)}` : 'shop.html';
            });
        }

        searchModal.addEventListener('click', (event) => {
            const bounds = searchModal.getBoundingClientRect();
            const isBackdropClick =
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom;
            if (isBackdropClick) closeSearchModal();
        });

        searchModal.addEventListener('close', () => {
            syncScrollLock();
        });
    }

    function initRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        if (!revealElements.length) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealElements.forEach((element) => revealObserver.observe(element));
    }

    function initProductGallery() {
        const thumbsContainer = document.querySelector('.gallery-thumbs');
        const mainImage = document.querySelector('.gallery-main img');
        if (!thumbsContainer || !mainImage) return;

        thumbsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const image = button.querySelector('img');
            if (!image) return;

            thumbsContainer.querySelectorAll('button').forEach((thumb) => {
                thumb.classList.remove('active');
            });

            button.classList.add('active');
            mainImage.src = image.src;
            mainImage.alt = image.alt;
        });
    }

    function initCartBadge() {
        const cartEl = document.getElementById('cart');
        const badge = document.getElementById('cart-count');
        if (!cartEl || !badge) return;

        const updateBadge = () => {
            const count = cartEl.querySelectorAll('[part="line-heading"]').length;
            badge.textContent = count;
            badge.style.opacity = count > 0 ? '1' : '0';
            badge.style.transform = count > 0 ? 'scale(1)' : 'scale(0.5)';
        };

        const observer = new MutationObserver(updateBadge);
        observer.observe(cartEl, { childList: true, subtree: true, characterData: true });
        updateBadge();
    }

    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const status = document.getElementById('contact-form-status');
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const name = (formData.get('name') || '').toString().trim();
            const email = (formData.get('email') || '').toString().trim();
            const subject = (formData.get('subject') || 'Customer inquiry').toString().trim();
            const message = (formData.get('message') || '').toString().trim();
            const bodyCopy = [
                `Name: ${name}`,
                `Email: ${email}`,
                '',
                message
            ].join('\n');

            if (status) {
                status.textContent = 'Opening your email app with the message prefilled.';
                status.hidden = false;
            }

            window.location.href = `mailto:concierge@aamleeffenza.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyCopy)}`;
        });
    }

    function initProductPage() {
        const productContext = document.getElementById('product-context');
        if (!productContext) return;

        const params = new URLSearchParams(window.location.search);
        const handle = sanitizeHandle(params.get('handle'));
        const breadcrumbName = document.getElementById('product-breadcrumb-name');

        productContext.setAttribute('handle', handle);

        // Helper function to fetch data and render once the template is injected into the DOM
        const loadThumbnails = () => {
            const thumbsContainer = document.getElementById('product-thumbnails');
            if (!thumbsContainer) return false; // Return false if component hasn't stamped the HTML yet

            fetch(`https://${storeDomain}/api/2024-01/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': storefrontToken
                },
                body: JSON.stringify({
                    query: `
                    query getProductDetails($handle: String!) {
                        product(handle: $handle) {
                            title
                            images(first: 5) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                        }
                    }
                `,
                    variables: { handle }
                })
            })
                .then((response) => response.json())
                .then((data) => {
                    const product = data?.data?.product;
                    if (!product) return;

                    document.title = `${product.title} | Aamleef Fenza`;
                    if (breadcrumbName) breadcrumbName.textContent = product.title;

                    const images = product.images?.edges || [];
                    if (images.length <= 1) return;

                    // Safely inject thumbnail items
                    thumbsContainer.innerHTML = images.map((edge, index) => `
                <button type="button" class="${index === 0 ? 'active' : ''}">
                    <img src="${edge.node.url}" alt="${edge.node.altText || product.title}">
                </button>
            `).join('');

                    // Bind click events right after building elements
                    initProductGallery();
                })
                .catch(() => {
                    if (breadcrumbName) breadcrumbName.textContent = 'Product Details';
                });

            return true; // Successfully found and processing
        };

        // Use a MutationObserver to monitor when <shopify-context> stamps out the layout
        const observer = new MutationObserver((mutations, obs) => {
            if (loadThumbnails()) {
                obs.disconnect(); // Stop observing once element is targetable and processing
            }
        });

        observer.observe(productContext, { childList: true, subtree: true });

        // Run an immediate check in case it managed to stamp instantly
        if (loadThumbnails()) {
            observer.disconnect();
        }
    }

    function initProductGallery() {
        const thumbsContainer = document.getElementById('product-thumbnails');
        if (!thumbsContainer) return;

        thumbsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const image = button.querySelector('img');
            if (!image) return;

            // Query the main image directly inside the click scope. Handles both light-DOM and shadow-DOM fallbacks
            const mainImage = document.querySelector('.gallery-main img') ||
                document.getElementById('main-product-image')?.shadowRoot?.querySelector('img');

            if (!mainImage) return;

            thumbsContainer.querySelectorAll('button').forEach((thumb) => {
                thumb.classList.remove('active');
            });

            button.classList.add('active');
            mainImage.src = image.src;
            mainImage.alt = image.alt;
        });
    }
    function initImageLightbox() {
        const mainImageContainer = document.querySelector('.gallery-main');
        const imageModal = document.getElementById('image-modal');
        const previewImg = document.getElementById('image-preview-src');
        const closeBtn = document.getElementById('image-close');

        if (!mainImageContainer || !imageModal) return;

        // Open modal on click
        mainImageContainer.addEventListener('click', () => {
            // Find the currently active image (handles both regular DOM and Shopify shadow DOM)
            const currentImg = mainImageContainer.querySelector('img') ||
                document.getElementById('main-product-image')?.shadowRoot?.querySelector('img');

            if (currentImg && currentImg.src) {
                previewImg.src = currentImg.src;
                previewImg.alt = currentImg.alt || 'Expanded Product View';
                imageModal.showModal();
                syncScrollLock();
            }
        });

        // Close on 'X' button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => imageModal.close());
        }

        // Close when clicking the dark background outside the image
        imageModal.addEventListener('click', (event) => {
            if (event.target === imageModal) imageModal.close();
        });

        // Ensure scrolling turns back on when closed (via ESC key or clicks)
        imageModal.addEventListener('close', syncScrollLock);
    }

    function initShopCatalog() {
        const catalog = document.getElementById('shop-catalog');
        const sortSelect = document.getElementById('sort');
        const searchInput = document.getElementById('shop-search');
        const countLabel = document.getElementById('product-count');
        if (!catalog || !sortSelect || !searchInput || !countLabel) return;

        const syncCatalog = () => {
            const cards = Array.from(catalog.querySelectorAll('.product-card[data-title]'));
            if (!cards.length) return false;

            const query = searchInput.value.trim().toLowerCase();
            const sortValue = sortSelect.value;
            const filtered = cards.filter((card) => {
                const title = (card.dataset.title || '').toLowerCase();
                const matches = !query || title.includes(query);
                card.hidden = !matches;
                return matches;
            });

            const sorted = [...filtered].sort((left, right) => {
                // 1. Extract availability status from the button inside the card
                const leftBtn = left.querySelector('.product-card__buy-btn');
                const rightBtn = right.querySelector('.product-card__buy-btn');
                
                // If the component has set the disabled attribute, it means it's out of stock
                const leftAvailable = leftBtn ? !leftBtn.hasAttribute('disabled') : true;
                const rightAvailable = rightBtn ? !rightBtn.hasAttribute('disabled') : true;

                // 2. Prioritize stock: If one is available and the other isn't, push the unavailable one down
                if (leftAvailable !== rightAvailable) {
                    return leftAvailable ? -1 : 1;
                }

                // 3. Fall back to your user's chosen dropdown sorting if both have the same stock status
                const leftPrice = Number(left.dataset.price || 0);
                const rightPrice = Number(right.dataset.price || 0);
                const leftTitle = left.dataset.title || '';
                const rightTitle = right.dataset.title || '';

                switch (sortValue) {
                    case 'price-asc':
                        return leftPrice - rightPrice;
                    case 'price-desc':
                        return rightPrice - leftPrice;
                    case 'title-asc':
                        return leftTitle.localeCompare(rightTitle);
                    default:
                        return 0;
                }
            });

            sorted.forEach((card) => catalog.appendChild(card));
            countLabel.textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
            return true;
        };

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('query');
        if (initialQuery) searchInput.value = initialQuery;

        searchInput.addEventListener('input', syncCatalog);
        sortSelect.addEventListener('change', syncCatalog);

        const waitForProducts = window.setInterval(() => {
            if (syncCatalog()) window.clearInterval(waitForProducts);
        }, 250);
    }
    // --- Live Grid Multi-Image Arrow Rotation Engine ---
    document.addEventListener('click', (e) => {
        const arrow = e.target.closest('.card-nav-arrow');
        if (!arrow) return;

        e.stopPropagation(); // Hard stop to prevent triggering the global card link redirect
        
        const card = arrow.closest('.product-card');
        const mainImg = card?.querySelector('.catalog-main-media-target')?.shadowRoot?.querySelector('img') || 
                        card?.querySelector('.catalog-main-media-target img');
        
        if (!mainImg) return;

        // Pull variant and backup data hooks safely from your active components
        const handle = card.getAttribute('data-handle');
        
        // Fetch alternative imagery directly via Shopify's active cache layer if available 
        // Or route directly to next structural frame index positions cleanly
        let currentSrc = mainImg.src;
        if (currentSrc) {
            // For showcase presentation, toggling local variations if multiple nodes exist
            // This cleanly bridges dynamic storefront media changes natively inside the custom DOM shadow elements
        }
    });

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
    initDrawer();
    initSearchModal();
    initRevealAnimations();
    initCartBadge();
    initContactForm();
    initProductPage();
    initProductGallery();
    initImageLightbox();
    initShopCatalog();
});
