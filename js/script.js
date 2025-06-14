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
    const profileImageBtn = document.getElementById('profileImageBtn'); // Botão clicável da imagem de perfil
    const profileOptions = document.getElementById('profileOptions'); // Container das opções de login/cadastro
    const loginRegisterModal = document.getElementById('loginRegisterModal');
    const loginBtnHeader = document.getElementById('loginBtnHeader');
    const registerBtnHeader = document.getElementById('registerBtnHeader');
    const createStoreBtn = document.getElementById('createStoreBtn'); // New button
    const myStoreBtn = document.getElementById('myStoreBtn'); // New button
    const logoutBtn = document.getElementById('logoutBtn'); // New button

    const containerLoginRegister = document.querySelector('#loginRegisterModal .container');
    const registerBtnModal = document.querySelector('#loginRegisterModal .register-btn'); // Botão 'Cadastrar' dentro do modal de login
    const loginBtnModal = document.querySelector('#loginRegisterModal .login-btn'); // Botão 'Entrar' dentro do modal de login

    // --- Create Store Modal Elements ---
    const createStoreModal = document.getElementById('createStoreModal');
    const createStoreForm = document.getElementById('createStoreForm');
    const storeOwnerCpfInput = document.getElementById('storeOwnerCpf'); // Novo campo CPF
    const storeEmailInput = document.getElementById('storeEmail'); // Campo Email da loja

    // --- Global State Variables (simulating backend data with localStorage) ---
    let isRemovingMode = false;
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null; // Stores logged-in user
    let users = JSON.parse(localStorage.getItem('users')) || []; // Mock user data (for registration)
    let stores = JSON.parse(localStorage.getItem('stores')) || []; // Stores created shops

    // --- Initial Data Population (for demonstration) ---
    // Adiciona produtos de exemplo se o localStorage estiver vazio
    if (products.length === 0) {
        products.push({
            id: '1', name: 'Cadeira de Rodas Leve', description: 'Cadeira dobrável em alumínio, ideal para transporte e mobilidade diária. Confortável e resistente.', image: 'https://via.placeholder.com/200x200?text=Cadeira+de+Rodas', value: 1200.50, category: 'Mobilidade', stock: 10, delivery: 5, storeId: 'store1', storeName: 'Mobilidade Essencial'
        });
        products.push({
            id: '2', name: 'Muletas Ajustáveis', description: 'Par de muletas com altura ajustável, ponteiras antiderrapantes para maior segurança. Ergonômicas e leves.', image: 'https://via.placeholder.com/200x200?text=Muletas', value: 150.00, category: 'Apoio', stock: 25, delivery: 3, storeId: 'store2', storeName: 'Saúde & Conforto'
        });
        products.push({
            id: '3', name: 'Bengala Dobrável', description: 'Bengala portátil e dobrável, com luz LED e base estável. Design moderno e funcional.', image: 'https://via.placeholder.com/200x200?text=Bengala', value: 80.00, category: 'Apoio', stock: 15, delivery: 2, storeId: 'store1', storeName: 'Mobilidade Essencial'
        });
        products.push({
            id: '4', name: 'Almofada Ortopédica', description: 'Almofada ergonômica para cadeira de rodas, alivia pressão e proporciona conforto extra.', image: 'https://via.placeholder.com/200x200?text=Almofada', value: 95.00, category: 'Conforto', stock: 30, delivery: 4, storeId: 'store2', storeName: 'Saúde & Conforto'
        });
        localStorage.setItem('products', JSON.stringify(products));
    }

    // Adiciona lojas de exemplo para teste
    if (stores.length === 0) {
        stores.push({
            id: 'store1', ownerId: 'user1', cnpj: '11.111.111/0001-11', socialReason: 'Empresa A S.A.', fantasyName: 'Mobilidade Essencial', ceo: 'João Silva', address: 'Rua Alfa, 123', email: 'contato@mobilidade.com', phone: '(11) 98765-4321', ownerCpf: '111.111.111-11'
        });
        stores.push({
            id: 'store2', ownerId: 'user2', cnpj: '22.222.222/0001-22', socialReason: 'Bem Estar Ltda.', fantasyName: 'Saúde & Conforto', ceo: 'Maria Oliveira', address: 'Av. Beta, 456', email: 'atendimento@saudeconforto.com', phone: '(21) 91234-5678', ownerCpf: '222.222.222-22'
        });
        localStorage.setItem('stores', JSON.stringify(stores));
    }

    // Adiciona usuários de exemplo para teste de login
    if (users.length === 0) {
        users.push({ id: 'user1', username: 'lojaum', password: '123' }); // Mock password
        users.push({ id: 'user2', username: 'lojadois', password: '123' });
        users.push({ id: 'comprador', username: 'comprador', password: '123' });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // --- Helper Functions ---

    // Closes any active modal
    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.style.display = 'none';
        }
    }

    // --- Product Display and Management ---

    function renderProducts(filter = '') {
        productList.innerHTML = '';
        const lowerCaseFilter = filter.toLowerCase();

        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(lowerCaseFilter) ||
            product.description.toLowerCase().includes(lowerCaseFilter) ||
            product.category.toLowerCase().includes(lowerCaseFilter) ||
            (product.storeName && product.storeName.toLowerCase().includes(lowerCaseFilter)) // Verifica se storeName existe
        );

        if (filteredProducts.length === 0 && filter !== '') {
            productList.innerHTML = '<p class="info-message" style="text-align: center; width: 100%;">Nenhum produto encontrado com a busca.</p>';
            return;
        } else if (products.length === 0) {
            productList.innerHTML = '<p class="info-message" style="text-align: center; width: 100%;">Nenhum produto cadastrado ainda. Adicione um para começar!</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.id = product.id; // Store product ID

            let deleteButtonHtml = '';
            // Only show delete button if in removing mode AND it's the current user's product
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

        // Event listeners for Add to Cart
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                addToCart(productId);
            });
        });

        // Event listeners for Delete Product (X button)
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                confirmRemoveProduct(productId);
            });
        });

        // Event listeners for Product Image (to open detail modal)
        document.querySelectorAll('.product-image').forEach(img => {
            img.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                viewProductDetails(productId);
            });
        });
    }

    // --- Search Functionality ---
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        renderProducts(searchTerm);
    });

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            const searchTerm = searchInput.value;
            renderProducts(searchTerm);
        }
    });

    // --- Add Product Functionality ---
    addProductBtn.addEventListener('click', () => {
        closeModal(profileOptions); // Close profile options if open
        addProductModal.style.display = 'flex';
    });

    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Ensure a user is logged in and has a store
        if (!currentUser || !currentUser.storeId) {
            alert('Você precisa criar uma loja para adicionar produtos.');
            closeModal(addProductModal);
            return;
        }

        const productName = document.getElementById('productName').value;
        const productDescription = document.getElementById('productDescription').value;
        const productImage = document.getElementById('productImage').value;
        const productValue = parseFloat(document.getElementById('productValue').value);
        const productCategory = document.getElementById('productCategory').value;
        const productStock = parseInt(document.getElementById('productStock').value);
        const productDeliveryTime = parseInt(document.getElementById('productDeliveryTime').value);

        // Basic validation for mandatory fields (though "required" in HTML helps)
        if (!productName || !productDescription || !productImage || isNaN(productValue) || !productCategory || isNaN(productStock) || isNaN(productDeliveryTime)) {
            alert('Por favor, preencha todos os campos do produto.');
            return;
        }

        const newProduct = {
            id: Date.now().toString(),
            name: productName,
            description: productDescription,
            image: productImage,
            value: productValue,
            category: productCategory,
            stock: productStock,
            delivery: productDeliveryTime,
            storeId: currentUser.storeId, // Link product to current user's store
            storeName: stores.find(s => s.id === currentUser.storeId)?.fantasyName || 'Loja Desconhecida'
        };

        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts(searchInput.value);
        closeModal(addProductModal);
        addProductForm.reset();
    });

    // --- Remove Product Functionality ---
    removeProductBtn.addEventListener('click', () => {
        if (!currentUser || !currentUser.storeId) {
            alert('Você precisa ser o proprietário de uma loja para remover produtos.');
            return;
        }

        isRemovingMode = !isRemovingMode; // Toggle the removal mode
        removeProductBtn.textContent = isRemovingMode ? 'Finalizar Remoção' : 'Remover Anúncio';

        // Re-render products to show/hide 'X' buttons correctly based on current user's store
        renderProducts(searchInput.value);
    });

    function confirmRemoveProduct(productId) {
        // Find the product and ensure it belongs to the current user's store
        const productToRemove = products.find(p => p.id === productId);

        if (!productToRemove) {
            alert('Produto não encontrado.');
            return;
        }

        if (!currentUser || productToRemove.storeId !== currentUser.storeId) {
            alert('Você só pode remover produtos da sua própria loja.');
            return;
        }

        if (confirm(`Tem certeza que deseja remover o produto "${productToRemove.name}" da sua loja?`)) {
            products = products.filter(p => p.id !== productId);
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts(searchInput.value); // Re-render to update the list
            // If all products are removed, exit removing mode
            if (products.filter(p => p.storeId === currentUser.storeId).length === 0) {
                isRemovingMode = false;
                removeProductBtn.textContent = 'Remover Anúncio';
            }
        }
    }

    // --- Product Detail View ---
    function viewProductDetails(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
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
            productDetailModal.style.display = 'flex';

            const detailAddToCartBtn = document.querySelector('.detail-add-to-cart');
            if (detailAddToCartBtn) {
                detailAddToCartBtn.addEventListener('click', (event) => {
                    const productId = event.target.dataset.id;
                    addToCart(productId);
                    closeModal(productDetailModal); // Close detail modal after attempting to add to cart
                });
            }
        }
    }

    // --- Cart Functionality ---
    function updateCartCount() {
        const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        if (totalItems > 0) {
            cartCount.style.display = 'inline-block';
            cartIcon.style.cursor = 'pointer';
        } else {
            cartCount.style.display = 'none';
            cartIcon.style.cursor = 'default';
        }
    }

    function addToCart(productId) {
        if (!currentUser) {
            alert('Você precisa estar logado para adicionar produtos ao carrinho.');
            // Opcional: Abrir modal de login aqui
            loginRegisterModal.style.display = "flex";
            containerLoginRegister.classList.remove('active'); // Mostrar tela de login por padrão
            return;
        }

        const product = products.find(p => p.id === productId);
        if (product) {
            if (cart.hasOwnProperty(productId)) {
                cart[`${productId}`].quantity++;
            } else {
                cart[`${productId}`] = { ...product, quantity: 1 };
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
    }

    function removeFromCart(productId) {
        if (cart.hasOwnProperty(productId)) {
            if (cart[`${productId}`].quantity > 1) {
                cart[`${productId}`].quantity--;
            } else {
                delete cart[`${productId}`];
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
    }

    function renderCartItems() {
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
            if (cart.hasOwnProperty(productId)) {
                const item = cart[`${productId}`];
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
        }

        cartTotalSpan.textContent = total.toFixed(2);

        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                removeFromCart(productId);
            });
        });
    }

    cartIcon.addEventListener('click', () => {
        closeModal(profileOptions); // Close profile options if open
        renderCartItems();
        cartModal.style.display = 'flex';
    });

    checkoutButton.addEventListener('click', () => {
        if (!currentUser) {
            alert('Você precisa estar logado para finalizar a compra.');
            closeModal(cartModal);
            loginRegisterModal.style.display = "flex"; // Open login modal
            containerLoginRegister.classList.remove('active'); // Mostrar tela de login por padrão
            return;
        }
        alert('Compra finalizada! Obrigado por sua preferência.');
        cart = {};
        localStorage.removeItem('cart');
        updateCartCount();
        closeModal(cartModal);
        renderCartItems();
    });

    // --- Profile & Authentication Flow ---

    // Updates visibility of profile options and header buttons based on login status and store existence
    function updateProfileOptionsVisibility() {
        const hasStore = currentUser && stores.some(s => s.ownerId === currentUser.id);

        // Controla a visibilidade dos botões dentro do dropdown de perfil
        loginBtnHeader.style.display = !currentUser ? 'block' : 'none'; // Mostra login se não estiver logado
        registerBtnHeader.style.display = !currentUser ? 'block' : 'none'; // Mostra cadastro se não estiver logado
        createStoreBtn.style.display = (currentUser && !hasStore) ? 'block' : 'none'; // Mostra criar loja se logado e sem loja
        myStoreBtn.style.display = (currentUser && hasStore) ? 'block' : 'none'; // Mostra minha loja se logado e com loja
        logoutBtn.style.display = currentUser ? 'block' : 'none'; // Mostra sair se logado

        // Controla a visibilidade dos botões de gerenciamento de produto no cabeçalho
        addProductBtn.style.display = (currentUser && hasStore) ? 'block' : 'none';
        removeProductBtn.style.display = (currentUser && hasStore) ? 'block' : 'none';

        // Reseta o modo de remoção quando o status de login muda
        if (!currentUser) {
            isRemovingMode = false;
            removeProductBtn.textContent = 'Remover Anúncio';
        }
    }

    // Handles user login (mock authentication)
    function handleLogin(username, password) {
        const user = users.find(u => u.username === username && u.password === password); // Procura usuário e senha
        if (user) {
            currentUser = { id: user.id, username: user.username }; // Define o usuário logado
            const userStore = stores.find(s => s.ownerId === currentUser.id);
            if (userStore) {
                currentUser.storeId = userStore.id; // Linka o usuário à loja se existir
            } else {
                currentUser.storeId = null; // Sem loja ainda
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateProfileOptionsVisibility();
            closeModal(loginRegisterModal);
            alert(`Bem-vindo(a), ${username}!`);
            renderProducts(searchInput.value); // Re-renderiza para atualizar botões de remoção
        } else {
            alert('Nome de usuário ou senha incorretos.');
        }
    }

    // Handles user registration (mock)
    function handleRegister(username, email, password) {
        // Validação se o usuário já existe
        if (users.some(u => u.username === username)) {
            alert('Nome de usuário já existe.');
            return;
        }
        if (users.some(u => u.email === email)) {
            alert('Email já cadastrado.');
            return;
        }

        const newUser = {
            id: 'user' + Date.now().toString(),
            username: username,
            email: email,
            password: password // Em um sistema real, a senha seria hashada
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Automaticamente loga o novo usuário
        handleLogin(username, password);
        alert(`Conta para ${username} criada com sucesso!`);
    }

    // Handles logout
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        isRemovingMode = false; // Sai do modo de remoção ao deslogar
        removeProductBtn.textContent = 'Remover Anúncio';
        updateProfileOptionsVisibility();
        alert('Você saiu da sua conta.');
        renderProducts(searchInput.value); // Re-renderiza para remover botões de loja
    });

    // Toggle profile options visibility (the dropdown menu)
    profileImageBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        profileSection.classList.toggle('open');
    });

    // Handle clicks outside profile options to close them
    window.addEventListener('click', (event) => {
        if (!profileSection.contains(event.target) && profileSection.classList.contains('open')) {
            profileSection.classList.remove('open');
        }
    });

    // Open login/register modal from profile options
    loginBtnHeader.addEventListener('click', () => {
        loginRegisterModal.style.display = "flex";
        containerLoginRegister.classList.remove('active'); // Show login form
        profileSection.classList.remove('open'); // Close profile dropdown
    });

    registerBtnHeader.addEventListener('click', () => {
        loginRegisterModal.style.display = "flex";
        containerLoginRegister.classList.add('active'); // Show registration form
        profileSection.classList.remove('open'); // Close profile dropdown
    });

    // Handle mock login/register form submission inside the modal
    document.querySelector('.form-box.login form').addEventListener('submit', (event) => {
        event.preventDefault();
        const username = event.target.querySelector('input[type="text"]').value;
        const password = event.target.querySelector('input[type="password"]').value;
        handleLogin(username, password);
    });

    document.querySelector('.form-box.register form').addEventListener('submit', (event) => {
        event.preventDefault();
        const username = event.target.querySelector('input[type="text"]').value;
        const email = event.target.querySelector('input[type="email"]').value;
        const password = event.target.querySelector('input[type="password"]').value;
        handleRegister(username, email, password);
    });

    // Toggle between login and registration panels within the modal
    if (registerBtnModal) {
        registerBtnModal.addEventListener('click', () => {
            containerLoginRegister.classList.add('active');
        });
    }
    if (loginBtnModal) {
        loginBtnModal.addEventListener('click', () => {
            containerLoginRegister.classList.remove('active');
        });
    }

    // --- Create Store Functionality ---
    createStoreBtn.addEventListener('click', () => {
        closeModal(profileOptions); // Close profile options
        if (!currentUser) {
            alert('Você precisa estar logado para criar uma loja.');
            return;
        }
        // Check if user already owns a store
        if (stores.some(s => s.ownerId === currentUser.id)) {
            alert('Você já possui uma loja cadastrada.');
            return;
        }
        createStoreModal.style.display = 'flex';
    });

    createStoreForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!currentUser) {
            alert('Erro: Usuário não logado. Por favor, faça login ou registre-se.');
            closeModal(createStoreModal);
            return;
        }

        const storeCnpj = document.getElementById('storeCnpj').value;
        const storeSocialReason = document.getElementById('storeSocialReason').value;
        const storeFantasyName = document.getElementById('storeFantasyName').value;
        const storeCeo = document.getElementById('storeCeo').value;
        const storeAddress = document.getElementById('storeAddress').value;
        const storeEmail = document.getElementById('storeEmail').value;
        const storePhone = document.getElementById('storePhone').value;
        const storeOwnerCpf = document.getElementById('storeOwnerCpf').value; // Get CPF

        // Validation for uniqueness (CNPJ, email, owner CPF)
        if (stores.some(s => s.cnpj === storeCnpj)) {
            alert('CNPJ já cadastrado para outra loja.');
            return;
        }
        if (stores.some(s => s.email === storeEmail)) {
            alert('Email da loja já cadastrado para outra loja.');
            return;
        }
        // Ensure only one store per owner CPF
        if (stores.some(s => s.ownerCpf === storeOwnerCpf)) {
            alert('CPF do proprietário já associado a outra loja.');
            return;
        }
        // Ensure this logged-in user doesn't already own a store (double-check via ownerId)
        if (stores.some(s => s.ownerId === currentUser.id)) {
             alert('Você já possui uma loja cadastrada. Use o botão "Minha Loja" no menu do perfil.');
             closeModal(createStoreModal);
             return;
        }


        const newStore = {
            id: 'store' + Date.now().toString(), // Unique ID for the store
            ownerId: currentUser.id, // Link store to the current logged-in user
            cnpj: storeCnpj,
            socialReason: storeSocialReason,
            fantasyName: storeFantasyName,
            ceo: storeCeo,
            address: storeAddress,
            email: storeEmail,
            phone: storePhone,
            ownerCpf: storeOwnerCpf // Store CPF
        };

        stores.push(newStore);
        localStorage.setItem('stores', JSON.stringify(stores));

        // Update current user to link to their new store
        currentUser.storeId = newStore.id;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        updateProfileOptionsVisibility(); // Refresh buttons in header and profile dropdown
        closeModal(createStoreModal);
        createStoreForm.reset();
        alert(`Loja "${newStore.fantasyName}" criada com sucesso! Agora você pode adicionar produtos.`);
        renderProducts(searchInput.value); // Re-render to make sure store name shows on products
    });

    // My Store button (can open a modal or navigate to a dedicated store page)
    myStoreBtn.addEventListener('click', () => {
        closeModal(profileOptions);
        if (currentUser && currentUser.storeId) {
            const userStore = stores.find(s => s.id === currentUser.storeId);
            if (userStore) {
                alert(`Detalhes da sua loja:\n\nNome Fictício: ${userStore.fantasyName}\nCNPJ: ${userStore.cnpj}\nEndereço: ${userStore.address}\nEmail: ${userStore.email}\nTelefone: ${userStore.phone}\nCEO: ${userStore.ceo}\nCPF do Proprietário: ${userStore.ownerCpf}`);
            } else {
                 alert('Sua loja não foi encontrada. Tente recriar ou logar novamente.');
            }
        } else {
            alert('Você não possui uma loja cadastrada.');
        }
    });


    // --- Initial setup on page load ---
    updateCartCount();
    updateProfileOptionsVisibility(); // Sets initial button visibility based on login state
    renderProducts();
});