document.addEventListener('DOMContentLoaded', () => {
    // --- General DOM Elements ---
    const productList = document.getElementById('product-list');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const addProductBtn = document.getElementById('addProductBtn');
    const removeProductBtn = document.getElementById('removeProductBtn');

    // --- Product Modals ---
    const addProductModal = document.getElementById('addProductModal');
    const addProductForm = document.getElementById('addProductForm');
    const productDetailModal = document.getElementById('productDetailModal');
    const productDetailContent = document.getElementById('productDetailContent');

    // --- Cart Elements ---
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const cartModal = document.getElementById('cartModal');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');

    // --- Profile & Login/Registration Elements ---
    const profileSection = document.querySelector('.profile-section');
    const profileImageBtn = document.getElementById('profileImageBtn');
    const profileOptions = document.getElementById('profileOptions');
    const loginRegisterModal = document.getElementById('loginRegisterModal');
    const loginBtnHeader = document.getElementById('loginBtnHeader');
    const registerBtnHeader = document.getElementById('registerBtnHeader');
    const createStoreBtn = document.getElementById('createStoreBtn');
    const myStoreBtn = document.getElementById('myStoreBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginRegisterContainer = document.getElementById('loginRegisterContainer');
    const toggleToRegisterBtn = document.getElementById('toggleToRegister');
    const toggleToLoginBtn = document.getElementById('toggleToLogin');

    // --- Create Store Modal Elements ---
    const createStoreModal = document.getElementById('createStoreModal');
    const createStoreForm = document.getElementById('createStoreForm');
    
    // --- Theme Toggles ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    const colorblindModeToggle = document.getElementById('colorblindModeToggle');
    const lightModeToggle = document.getElementById('lightModeToggle');

    // --- Global State Variables ---
    let isRemovingMode = false;
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let stores = JSON.parse(localStorage.getItem('stores')) || [];

    // --- Initial Data Population ---
    if (products.length === 0) {
        products.push({ id: '1', name: 'Cadeira de Rodas Leve', description: 'Cadeira dobrável em alumínio, ideal para transporte e mobilidade diária. Confortável e resistente.', image: 'https://via.placeholder.com/200x200?text=Cadeira+de+Rodas', value: 1200.50, category: 'Mobilidade', stock: 10, delivery: 5, storeId: 'store1', storeName: 'Mobilidade Essencial' });
        products.push({ id: '2', name: 'Muletas Ajustáveis', description: 'Par de muletas com altura ajustável, ponteiras antiderrapantes para maior segurança. Ergonômicas e leves.', image: 'https://via.placeholder.com/200x200?text=Muletas', value: 150.00, category: 'Apoio', stock: 25, delivery: 3, storeId: 'store2', storeName: 'Saúde & Conforto' });
        products.push({ id: '3', name: 'Bengala Dobrável', description: 'Bengala portátil e dobrável, com luz LED e base estável. Design moderno e funcional.', image: 'https://via.placeholder.com/200x200?text=Bengala', value: 80.00, category: 'Apoio', stock: 15, delivery: 2, storeId: 'store1', storeName: 'Mobilidade Essencial' });
        products.push({ id: '4', name: 'Almofada Ortopédica', description: 'Almofada ergonômica para cadeira de rodas, alivia pressão e proporciona conforto extra.', image: 'https://via.placeholder.com/200x200?text=Almofada', value: 95.00, category: 'Conforto', stock: 30, delivery: 4, storeId: 'store2', storeName: 'Saúde & Conforto' });
        localStorage.setItem('products', JSON.stringify(products));
    }
    if (stores.length === 0) {
        stores.push({ id: 'store1', ownerId: 'user1', cnpj: '11.111.111/0001-11', socialReason: 'Empresa A S.A.', fantasyName: 'Mobilidade Essencial', ceo: 'João Silva', address: 'Rua Alfa, 123', email: 'contato@mobilidade.com', phone: '(11) 98765-4321', ownerCpf: '111.111.111-11' });
        stores.push({ id: 'store2', ownerId: 'user2', cnpj: '22.222.222/0001-22', socialReason: 'Bem Estar Ltda.', fantasyName: 'Saúde & Conforto', ceo: 'Maria Oliveira', address: 'Av. Beta, 456', email: 'atendimento@saudeconforto.com', phone: '(21) 91234-5678', ownerCpf: '222.222.222-22' });
        localStorage.setItem('stores', JSON.stringify(stores));
    }
    if (users.length === 0) {
        users.push({ id: 'user1', username: 'lojaum', password: '123' });
        users.push({ id: 'user2', username: 'lojadois', password: '123' });
        users.push({ id: 'comprador', username: 'comprador', password: '123' });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // --- Helper Functions ---
    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.style.display = 'none';
        }
    }

    // --- Product Display and Management ---
    function renderProducts(filter = '') {
        if (!productList) return;
        productList.innerHTML = '';
        const lowerCaseFilter = filter.toLowerCase();

        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(lowerCaseFilter) ||
            product.description.toLowerCase().includes(lowerCaseFilter) ||
            product.category.toLowerCase().includes(lowerCaseFilter) ||
            (product.storeName && product.storeName.toLowerCase().includes(lowerCaseFilter))
        );

        if (filteredProducts.length === 0 && filter !== '') {
            productList.innerHTML = '<p class="info-message" style="text-align: center; width: 100%;">Nenhum produto encontrado com a busca.</p>';
            return;
        } else if (products.length === 0) {
            productList.innerHTML = '<p class="info-message" style="text-align: center; width: 100%;">Nenhum produto cadastrado ainda.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.id = product.id;

            let deleteButtonHtml = '';
            if (isRemovingMode && currentUser && product.storeId === currentUser.storeId) {
                deleteButtonHtml = `<button class="delete-product-btn active" data-id="${product.id}">X</button>`;
            }

            productCard.innerHTML = `
                ${deleteButtonHtml}
                <img src="${product.image || 'https://via.placeholder.com/150x150?text=Produto'}" alt="${product.name}" class="product-image" data-id="${product.id}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-details">
                    <p><strong class="detail-label">Categoria:</strong> ${product.category}</p>
                    <p><strong class="detail-label">Estoque:</strong> ${product.stock}</p>
                    <p><strong class="detail-label">Entrega:</strong> ${product.delivery} dias</p>
                </div>
                <div class="price">R$ ${product.value.toFixed(2)}</div>
                <div class="store-name">Loja: ${product.storeName || 'Loja Genérica'}</div>
                <button class="add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
            `;
            productList.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                addToCart(productId);
            });
        });

        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                confirmRemoveProduct(productId);
            });
        });

        document.querySelectorAll('.product-image').forEach(img => {
            img.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                viewProductDetails(productId);
            });
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value;
            renderProducts(searchTerm);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                const searchTerm = searchInput.value;
                renderProducts(searchTerm);
            }
        });
    }

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            if (profileOptions) profileOptions.classList.remove('open');
            if (addProductModal) addProductModal.style.display = 'flex';
        });
    }

    if (addProductForm) {
        addProductForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!currentUser || !currentUser.storeId) {
                alert('Você precisa criar uma loja para adicionar produtos.');
                closeModal(addProductModal);
                return;
            }

            const newProduct = {
                id: Date.now().toString(),
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                image: document.getElementById('productImage').value,
                value: parseFloat(document.getElementById('productValue').value),
                category: document.getElementById('productCategory').value,
                stock: parseInt(document.getElementById('productStock').value),
                delivery: parseInt(document.getElementById('productDeliveryTime').value),
                storeId: currentUser.storeId,
                storeName: stores.find(s => s.id === currentUser.storeId)?.fantasyName || 'Loja Desconhecida'
            };

            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts(searchInput.value);
            closeModal(addProductModal);
            addProductForm.reset();
        });
    }

    if (removeProductBtn) {
        removeProductBtn.addEventListener('click', () => {
            if (!currentUser || !currentUser.storeId) {
                alert('Você precisa ser o proprietário de uma loja para remover produtos.');
                return;
            }

            isRemovingMode = !isRemovingMode;
            removeProductBtn.textContent = isRemovingMode ? 'Finalizar Remoção' : 'Remover Anúncio';
            renderProducts(searchInput.value);
        });
    }

    function confirmRemoveProduct(productId) {
        const productToRemove = products.find(p => p.id === productId);
        if (!productToRemove || productToRemove.storeId !== currentUser.storeId) {
            alert('Você só pode remover produtos da sua própria loja.');
            return;
        }
        if (confirm(`Tem certeza que deseja remover o produto "${productToRemove.name}"?`)) {
            products = products.filter(p => p.id !== productId);
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts(searchInput.value);
        }
    }

    function viewProductDetails(productId) {
        const product = products.find(p => p.id === productId);
        if (product && productDetailContent) {
            productDetailContent.innerHTML = `
                <img src="${product.image || 'https://via.placeholder.com/400x400?text=Produto'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p><strong class="detail-label">Descrição:</strong> ${product.description}</p>
                <p><strong class="detail-label">Categoria:</strong> ${product.category}</p>
                <p><strong class="detail-label">Estoque:</strong> ${product.stock}</p>
                <p><strong class="detail-label">Tempo de Entrega:</strong> ${product.delivery} dias</p>
                <p class="detail-price">R$ ${product.value.toFixed(2)}</p>
                <p><strong class="detail-label">Loja:</strong> ${product.storeName || 'Loja Genérica'}</p>
                <button class="add-to-cart detail-add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
            `;
            if (productDetailModal) productDetailModal.style.display = 'flex';

            document.querySelector('.detail-add-to-cart').addEventListener('click', (event) => {
                addToCart(event.target.dataset.id);
                closeModal(productDetailModal);
            });
        }
    }

    // --- Cart Functionality ---
    function updateCartCount() {
        if (!cartCount) return;
        const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    function addToCart(productId) {
        if (!currentUser) {
            alert('Você precisa estar logado para adicionar produtos ao carrinho.');
            if (loginRegisterModal) loginRegisterModal.style.display = "flex";
            if (loginRegisterContainer) loginRegisterContainer.classList.remove('active');
            return;
        }
        const product = products.find(p => p.id === productId);
        if (product) {
            cart[productId] = cart[productId] ? { ...cart[productId], quantity: cart[productId].quantity + 1 } : { ...product, quantity: 1 };
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
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
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-quantity">Qtd: ${item.quantity}</span>
                <span class="cart-item-price">R$ ${(item.value * item.quantity).toFixed(2)}</span>
                <button class="cart-item-remove" data-id="${item.id}">Remover</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
            total += item.value * item.quantity;
        }
        cartTotalSpan.textContent = total.toFixed(2);
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                if (cart[productId]) {
                    if (cart[productId].quantity > 1) {
                        cart[productId].quantity--;
                    } else {
                        delete cart[productId];
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    renderCartItems();
                }
            });
        });
    }

    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            if(profileSection) profileSection.classList.remove('open');
            renderCartItems();
            if (cartModal) cartModal.style.display = 'flex';
        });
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (!currentUser) {
                alert('Você precisa estar logado para finalizar a compra.');
                closeModal(cartModal);
                if (loginRegisterModal) loginRegisterModal.style.display = "flex";
                if (loginRegisterContainer) loginRegisterContainer.classList.remove('active');
                return;
            }
            alert('Compra finalizada! Obrigado por sua preferência.');
            cart = {};
            localStorage.removeItem('cart');
            updateCartCount();
            closeModal(cartModal);
        });
    }

    // --- Profile & Authentication Flow ---
    function updateProfileOptionsVisibility() {
        if (!loginBtnHeader) return;
        const hasStore = currentUser && stores.some(s => s.ownerId === currentUser.id);
        loginBtnHeader.style.display = !currentUser ? 'block' : 'none';
        registerBtnHeader.style.display = !currentUser ? 'block' : 'none';
        createStoreBtn.style.display = (currentUser && !hasStore) ? 'block' : 'none';
        myStoreBtn.style.display = (currentUser && hasStore) ? 'block' : 'none';
        logoutBtn.style.display = currentUser ? 'block' : 'none';
        if (addProductBtn) addProductBtn.style.display = (currentUser && hasStore) ? 'block' : 'none';
        if (removeProductBtn) removeProductBtn.style.display = (currentUser && hasStore) ? 'block' : 'none';
        if (!currentUser) isRemovingMode = false;
    }

    function handleLogin(username, password) {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = { id: user.id, username: user.username, storeId: (stores.find(s => s.ownerId === user.id) || {}).id || null };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateProfileOptionsVisibility();
            closeModal(loginRegisterModal);
            alert(`Bem-vindo(a), ${username}!`);
        } else {
            alert('Nome de usuário ou senha incorretos.');
        }
    }

    function handleRegister(username, email, password) {
        if (users.some(u => u.username === username)) { alert('Nome de usuário já existe.'); return; }
        if (users.some(u => u.email === email)) { alert('Email já cadastrado.'); return; }
        const newUser = { id: 'user' + Date.now(), username, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert(`Conta para ${username} criada com sucesso!`);
        handleLogin(username, password);
    }
    
    // --- Listeners ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateProfileOptionsVisibility();
            alert('Você saiu da sua conta.');
            renderProducts();
        });
    }
    if (profileImageBtn) {
        profileImageBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            profileSection.classList.toggle('open');
        });
    }
    if (loginBtnHeader) {
        loginBtnHeader.addEventListener('click', () => {
            if (loginRegisterModal) loginRegisterModal.style.display = "flex";
            if (loginRegisterContainer) loginRegisterContainer.classList.remove('active');
            if (profileSection) profileSection.classList.remove('open');
        });
    }
    if (registerBtnHeader) {
        registerBtnHeader.addEventListener('click', () => {
            if (loginRegisterModal) loginRegisterModal.style.display = "flex";
            if (loginRegisterContainer) loginRegisterContainer.classList.add('active');
            if (profileSection) profileSection.classList.remove('open');
        });
    }
    if (toggleToRegisterBtn) {
        toggleToRegisterBtn.addEventListener('click', () => loginRegisterContainer.classList.add('active'));
    }
    if (toggleToLoginBtn) {
        toggleToLoginBtn.addEventListener('click', () => loginRegisterContainer.classList.remove('active'));
    }
    
    const loginForm = document.querySelector('.form-box.login form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            handleLogin(event.target.querySelector('input[type="text"]').value, event.target.querySelector('input[type="password"]').value);
        });
    }
    
    const registerForm = document.querySelector('.form-box.register form');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            handleRegister(event.target.querySelector('input[type="text"]').value, event.target.querySelector('input[type="email"]').value, event.target.querySelector('input[type="password"]').value);
        });
    }

    document.querySelectorAll('.password-toggle').forEach(icon => {
        icon.addEventListener('click', () => {
            const passwordInput = icon.closest('.input-box').querySelector('input[type="password"], input[type="text"]');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.replace('bxs-show', 'bxs-hide');
            } else {
                passwordInput.type = 'password';
                icon.classList.replace('bxs-hide', 'bxs-show');
            }
        });
    });

    if (createStoreBtn) {
        createStoreBtn.addEventListener('click', () => {
            if(profileOptions) profileOptions.classList.remove('open');
            if(createStoreModal) createStoreModal.style.display = 'flex';
        });
    }

    if (createStoreForm) {
        createStoreForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!currentUser) return;
            const storeData = {
                id: 'store' + Date.now(),
                ownerId: currentUser.id,
                cnpj: document.getElementById('storeCnpj').value,
                socialReason: document.getElementById('storeSocialReason').value,
                fantasyName: document.getElementById('storeFantasyName').value,
                ceo: document.getElementById('storeCeo').value,
                address: document.getElementById('storeAddress').value,
                email: document.getElementById('storeEmail').value,
                phone: document.getElementById('storePhone').value,
                ownerCpf: document.getElementById('storeOwnerCpf').value
            };
            stores.push(storeData);
            localStorage.setItem('stores', JSON.stringify(stores));
            currentUser.storeId = storeData.id;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateProfileOptionsVisibility();
            closeModal(createStoreModal);
            createStoreForm.reset();
            alert(`Loja "${storeData.fantasyName}" criada com sucesso!`);
        });
    }

    if (myStoreBtn) {
        myStoreBtn.addEventListener('click', () => {
            if(profileOptions) profileOptions.classList.remove('open');
            if (currentUser && currentUser.storeId) {
                const userStore = stores.find(s => s.id === currentUser.storeId);
                if (userStore) {
                    alert(`Detalhes da sua loja:\n\nNome: ${userStore.fantasyName}\nCNPJ: ${userStore.cnpj}\nEmail: ${userStore.email}`);
                }
            }
        });
    }

    // --- Theme Management ---
    function setTheme(theme) {
        document.body.classList.remove('dark-mode', 'colorblind-mode');
        if (theme === 'dark') document.body.classList.add('dark-mode');
        else if (theme === 'colorblind') document.body.classList.add('colorblind-mode');
        localStorage.setItem('theme', theme);
        if (darkModeToggle) updateThemeButtons(theme);
    }
    
    function updateThemeButtons(activeTheme) {
        darkModeToggle.style.display = activeTheme === 'dark' ? 'none' : 'block';
        colorblindModeToggle.style.display = activeTheme === 'colorblind' ? 'none' : 'block';
        lightModeToggle.style.display = (activeTheme !== 'light' && activeTheme) ? 'block' : 'none';
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => setTheme('dark'));
        colorblindModeToggle.addEventListener('click', () => setTheme('colorblind'));
        lightModeToggle.addEventListener('click', () => setTheme('light'));
    }

    // --- General Event Listeners ---
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', (event) => {
            closeModal(button.closest('.modal, .login-register-modal'));
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal') || event.target.classList.contains('login-register-modal')) {
            closeModal(event.target);
        }
        if (profileSection && !profileSection.contains(event.target) && profileSection.classList.contains('open')) {
            profileSection.classList.remove('open');
        }
    });

    // --- Initial setup on page load ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof updateProfileOptionsVisibility === 'function') updateProfileOptionsVisibility();
    if (typeof renderProducts === 'function') renderProducts();
});