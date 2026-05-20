import os

files = ['index.html', 'shop.html', 'product.html', 'collections.html', 'about.html', 'contact.html']

BADGE_STYLE = ' position: relative;'
BADGE_SPAN = '<span id="cart-count" style="position: absolute; top: 2px; right: 2px; background: #c6a06a; color: #210708; font-family: Inter, sans-serif; font-size: 0.6rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0; transition: opacity 0.3s, transform 0.3s; transform: scale(0.5);">0</span>'

CART_SCRIPT = '''
    <script>
        // Cart count observer
        function updateCartCount() {
            const cartEl = document.getElementById('cart');
            if (!cartEl) return;
            const badge = document.getElementById('cart-count');
            if (!badge) return;
            // Use MutationObserver to watch for cart changes
            const observer = new MutationObserver(() => {
                const lines = cartEl.querySelectorAll('[part="line-heading"]');
                const count = lines ? lines.length : 0;
                badge.textContent = count;
                if (count > 0) {
                    badge.style.opacity = '1';
                    badge.style.transform = 'scale(1)';
                } else {
                    badge.style.opacity = '0';
                    badge.style.transform = 'scale(0.5)';
                }
            });
            observer.observe(cartEl, { childList: true, subtree: true, characterData: true });
        }
        // Poll until cart element is ready
        const cartReadyInterval = setInterval(() => {
            if (document.getElementById('cart')) {
                updateCartCount();
                clearInterval(cartReadyInterval);
            }
        }, 500);
    </script>
'''

for f in files:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # Add position: relative to the cart button so the badge can be positioned
    old_cart_btn = 'aria-label="Cart" onclick="document.getElementById(\'cart\').showModal()" style="display: flex; align-items: center; justify-content: center; padding: 0;">'
    new_cart_btn = 'aria-label="Cart" onclick="document.getElementById(\'cart\').showModal()" style="display: flex; align-items: center; justify-content: center; padding: 0; position: relative;">' + BADGE_SPAN

    if old_cart_btn in content and 'cart-count' not in content:
        content = content.replace(old_cart_btn, new_cart_btn)
        # Add the cart count script before </body>
        content = content.replace('</body>', CART_SCRIPT + '</body>')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'{f}: badge added')
    else:
        print(f'{f}: skipped (already has badge or pattern not found)')
