document.addEventListener('DOMContentLoaded', () => {
    // =================================================
    // =========== SELETORES DE ELEMENTOS DOM ==========
    // =================================================

    const addProductBtn = document.getElementById('addProductBtn');
    const removeProductBtn = document.getElementById('removeProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const addProductForm = document.getElementById('addProductForm');
    const cartModal = document.getElementById('cartModal');
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');
    const profileSection = document.querySelector('.profile-section');
    const profileImageBtn = document.getElementById('profileImageBtn');
    const loginBtnHeader = document.getElementById('loginBtnHeader');
    const registerBtnHeader = document.getElementById('registerBtnHeader');
    const createStoreBtn = document.getElementById('createStoreBtn');
    const myStoreBtn = document.getElementById('myStoreBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginRegisterModal = document.getElementById('loginRegisterModal');
    const loginRegisterContainer = document.getElementById('loginRegisterContainer');
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const createStoreModal = document.getElementById('createStoreModal');
    const createStoreForm = document.getElementById('createStoreForm');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const colorblindModeToggle = document.getElementById('colorblindModeToggle');
    const lightModeToggle = document.getElementById('lightModeToggle');
    const productList = document.getElementById('product-list'); // [NOVO] Seletor para a lista de produtos

    // =================================================
    // ============= ESTADO DA APLICAÇÃO (CLIENT-SIDE) =
    // =================================================

    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
    let isRemoveModeActive = false; // [NOVO] Estado para controlar o modo de remoção

    // =================================================
    // ================== FUNÇÕES ======================
    // =================================================

    const openModal = (modal) => { if (modal) modal.style.display = 'flex'; };
    const closeModal = (modal) => { if (modal) modal.style.display = 'none'; };

    function updateProfileOptionsVisibility() {
        if (!loginBtnHeader) return;
        const isLoggedIn = !!currentUser;

        loginBtnHeader.style.display = isLoggedIn ? 'none' : 'block';
        registerBtnHeader.style.display = isLoggedIn ? 'none' : 'block';
        logoutBtn.style.display = isLoggedIn ? 'block' : 'none';

        const hasStore = isLoggedIn && currentUser.storeId;
        createStoreBtn.style.display = isLoggedIn && !hasStore ? 'block' : 'none';
        myStoreBtn.style.display = isLoggedIn && hasStore ? 'block' : 'none';
        addProductBtn.style.display = isLoggedIn && hasStore ? 'block' : 'none';
        if (removeProductBtn) removeProductBtn.style.display = isLoggedIn && hasStore ? 'block' : 'none';
    }

    function setTheme(theme) {
        document.body.className = '';
        if (theme !== 'light') document.body.classList.add(theme);
        localStorage.setItem('theme', theme);

        if (darkModeToggle) {
            darkModeToggle.style.display = theme === 'dark-mode' ? 'none' : 'block';
            colorblindModeToggle.style.display = theme === 'colorblind-mode' ? 'none' : 'block';
            lightModeToggle.style.display = theme === 'light' ? 'none' : 'block';
        }
    }

    function updateCartCount() {
        if(!cartCount) return;
        const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    function addToCart(productData) {
        if (!currentUser) {
            alert('Você precisa estar logado para adicionar produtos ao carrinho.');
            openModal(loginRegisterModal);
            return;
        }
        const productId = productData.id.toString();
        if (cart[productId]) {
            cart[productId].quantity++;
        } else {
            cart[productId] = { ...productData, quantity: 1 };
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`"${productData.name}" adicionado ao carrinho!`);
    }

    function renderCartItems() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (Object.keys(cart).length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center;">Seu carrinho está vazio.</p>';
            cartTotalSpan.textContent = '0.00';
            checkoutButton.disabled = true;
            return;
        }

        checkoutButton.disabled = false;
        for (const productId in cart) {
            const item = cart[productId];
            const itemTotal = item.value * item.quantity;
            total += itemTotal;
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-quantity">Qtd: ${item.quantity}</span>
                <span class="cart-item-price">R$ ${itemTotal.toFixed(2)}</span>
                <button class="cart-item-remove" data-id="${item.id}">Remover</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        }
        cartTotalSpan.textContent = total.toFixed(2);

        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                delete cart[productId];
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCartItems();
                updateCartCount();
            });
        });
    }
    
    // [NOVA FUNÇÃO] para ativar os botões de delete
    function setupDeleteButtons() {
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation(); // Impede que outros cliques no card aconteçam
                
                const productId = e.target.dataset.id;
                const card = e.target.closest('.product-card');
                const productName = card.dataset.name;

                if (confirm(`Tem certeza que deseja remover o produto "${productName}"?`)) {
                    try {
                        const response = await fetch(`/products/${productId}`, {
                            method: 'DELETE',
                        });

                        const result = await response.json();
                        if (!response.ok) {
                            throw new Error(result.error);
                        }
                        
                        alert(result.message);
                        card.remove(); // Remove o card da tela

                    } catch (error) {
                        alert(`Falha ao remover produto: ${error.message}`);
                    }
                }
            });
        });
    }

    // =================================================
    // ================ EVENT LISTENERS ================
    // =================================================

    if (profileImageBtn) profileImageBtn.addEventListener('click', (e) => { e.stopPropagation(); profileSection.classList.toggle('open'); });

    window.addEventListener('click', (e) => {
        if (e.target.matches('.modal, .login-register-modal')) closeModal(e.target);
        if (profileSection && !profileSection.contains(e.target)) profileSection.classList.remove('open');
    });

    document.querySelectorAll('.close-button').forEach(btn => btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal, .login-register-modal'))));

    if (loginBtnHeader) loginBtnHeader.addEventListener('click', () => { openModal(loginRegisterModal); if(loginRegisterContainer) loginRegisterContainer.classList.remove('active'); });
    if (registerBtnHeader) registerBtnHeader.addEventListener('click', () => { openModal(loginRegisterModal); if(loginRegisterContainer) loginRegisterContainer.classList.add('active'); });
    if (addProductBtn) addProductBtn.addEventListener('click', () => openModal(addProductModal));
    if (createStoreBtn) createStoreBtn.addEventListener('click', () => openModal(createStoreModal));
    if (cartIcon) cartIcon.addEventListener('click', () => { renderCartItems(); openModal(cartModal); });

    // Listeners para a animação de deslize do login
    if (toggleToLogin) toggleToLogin.addEventListener('click', () => loginRegisterContainer.classList.remove('active'));
    if (toggleToRegister) toggleToRegister.addEventListener('click', () => loginRegisterContainer.classList.add('active'));

    // --- Listeners de Formulários (Comunicação com o Back-end) ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = registerForm.querySelector('[name="username"]').value;
            const email = registerForm.querySelector('[name="email"]').value;
            const password = registerForm.querySelector('[name="password"]').value;
            try {
                const response = await fetch('/register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                alert(result.message);
                loginRegisterContainer.classList.remove('active'); 
            } catch (error) { alert(`Falha no cadastro: ${error.message}`); }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const identifier = loginForm.querySelector('[name="identifier"]').value;
            const password = loginForm.querySelector('[name="password"]').value;
            try {
                const response = await fetch('/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier, password })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                
                currentUser = result.user;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                alert(result.message);
                closeModal(loginRegisterModal);
                updateProfileOptionsVisibility();
            } catch (error) { alert(`Falha no login: ${error.message}`); }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            sessionStorage.removeItem('currentUser');
            alert('Você foi desconectado.');
            updateProfileOptionsVisibility();
            // Desativa o modo de remoção ao fazer logout
            if (isRemoveModeActive) {
                productList.classList.remove('remove-mode');
                removeProductBtn.classList.remove('active');
                isRemoveModeActive = false;
            }
        });
    }
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(addProductForm);
            const productData = Object.fromEntries(formData.entries());
            productData.value = parseFloat(productData.value);
            productData.stock = parseInt(productData.stock);

            try {
                const response = await fetch('/products', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (!response.ok) throw new Error((await response.json()).error);
                alert('Produto adicionado com sucesso!');
                window.location.reload();
            } catch (error) { alert(`Erro ao adicionar produto: ${error.message}`); }
        });
    }

    if (createStoreForm) {
        createStoreForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!currentUser) { return alert("Você precisa estar logado para criar uma loja."); }

            const formData = new FormData(createStoreForm);
            const storeData = Object.fromEntries(formData.entries());
            storeData.userId = currentUser.id;

            try {
                const response = await fetch('/stores', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(storeData)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                
                alert(result.message);

                currentUser.storeId = result.storeId;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                closeModal(createStoreModal);
                updateProfileOptionsVisibility();
            } catch (error) { alert(`Falha ao criar a loja: ${error.message}`); }
        });
    }
    
    // [NOVO] Listener para o botão de ativar/desativar modo de remoção
    if (removeProductBtn) {
        removeProductBtn.addEventListener('click', () => {
            isRemoveModeActive = !isRemoveModeActive;
            productList.classList.toggle('remove-mode', isRemoveModeActive);
            removeProductBtn.classList.toggle('active', isRemoveModeActive);
            if (isRemoveModeActive) {
                alert("Modo de remoção ativado. Clique no 'x' dos produtos para removê-los.");
            } else {
                alert("Modo de remoção desativado.");
            }
        });
    }

    // --- Outros Listeners ---
    document.querySelectorAll('.password-toggle').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const input = e.target.closest('.input-box').querySelector('input');
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
                e.target.classList.toggle('bxs-show');
                e.target.classList.toggle('bxs-hide');
            }
        });
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const productData = {
                id: card.dataset.id,
                name: card.dataset.name,
                value: parseFloat(card.dataset.value),
                image: card.dataset.image
            };
            addToCart(productData);
        });
    });
    
    // Tema
    if (darkModeToggle) darkModeToggle.addEventListener('click', () => setTheme('dark-mode'));
    if (colorblindModeToggle) colorblindModeToggle.addEventListener('click', () => setTheme('colorblind-mode'));
    if (lightModeToggle) lightModeToggle.addEventListener('click', () => setTheme('light'));

    // =================================================
    // ============== INICIALIZAÇÃO DA PÁGINA ==========
    // =================================================
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    updateProfileOptionsVisibility();
    updateCartCount();
    setupDeleteButtons(); // [NOVO] Ativa os botões de delete ao carregar a página
});