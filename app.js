const express = require('express');
const path = require('path');
const hbs = require('hbs');
const db = require('./database.js'); // Importa a conexão MySQL
const bcrypt = require('bcrypt');   // Importa a biblioteca de criptografia

const app = express();
const port = 3000;
const saltRounds = 10; // Fator de custo para o hash do bcrypt

// CONFIGURAÇÃO DO SERVIDOR
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ROTAS (ENDPOINTS) DA APLICAÇÃO

// Rota principal: Carrega a página inicial com os produtos do banco
app.get('/', (req, res) => {
    const sql = "SELECT * FROM products ORDER BY name";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar produtos:", err);
            return res.status(500).send("Erro no servidor ao buscar produtos.");
        }
        res.render('index', {
            titulo: "Loja Acessível",
            products: results
        });
    });
});

// Rota para cadastrar um novo usuário (COM SENHA CRIPTOGRAFADA)
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).json({ "error": "Erro ao criptografar a senha." });
        }

        const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.query(sql, [username, email, hash], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ "error": "Usuário ou email já cadastrado." });
                }
                return res.status(500).json({ "error": err.message });
            }
            res.status(201).json({ "message": "Usuário registrado com sucesso!", "id": result.insertId });
        });
    });
});

// Rota de Login (COM COMPARAÇÃO DE SENHA CRIPTOGRAFADA)
app.post('/login', (req, res) => {
    const { identifier, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ? OR email = ?`;

    db.query(sql, [identifier, identifier], (err, results) => {
        if (err) return res.status(500).json({ "error": "Erro no servidor." });
        if (results.length === 0) {
            return res.status(401).json({ "error": "Credenciais inválidas." });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ "error": "Erro no servidor ao verificar senha." });
            if (!isMatch) {
                return res.status(401).json({ "error": "Credenciais inválidas." });
            }

            const userSessionData = {
                id: user.id,
                username: user.username,
                email: user.email,
                storeId: user.storeId
            };
            res.status(200).json({ message: "Login bem-sucedido!", user: userSessionData });
        });
    });
});

// Rota para adicionar produtos
app.post('/products', (req, res) => {
    const { name, description, image, value, category, stock } = req.body;
    const sql = `INSERT INTO products (name, description, image, value, category, stock) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, description, image, value, category, stock], (err, result) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(201).json({ "message": "Produto adicionado com sucesso!", "id": result.insertId });
    });
});

// Rota para remover um produto
app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error("Erro ao deletar produto:", err.message);
            return res.status(500).json({ error: "Erro no servidor ao deletar produto." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }
        res.status(200).json({ message: "Produto removido com sucesso!" });
    });
});


// Rota para criar uma loja
app.post('/stores', (req, res) => {
    const { userId, cnpj, socialReason, fantasyName, ceo, address, email, phone, ownerCpf } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "O ID do usuário é obrigatório." });
    }

    // ALTERADO AQUI: A lista de colunas na query agora corresponde exatamente à do banco de dados (com underlines).
    const insertStoreSql = `INSERT INTO stores (user_id, cnpj, social_reason, fantasy_name, ceo, address, email, phone, owner_cpf) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [userId, cnpj, socialReason, fantasyName, ceo, address, email, phone, ownerCpf];

    db.query(insertStoreSql, values, (err, result) => {
        if (err) {
            console.error("Erro ao inserir loja:", err.message);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "Falha ao criar a loja: CNPJ ou email já cadastrado." });
            }
            return res.status(500).json({ error: "Ocorreu um erro interno no servidor ao tentar criar a loja." });
        }

        const newStoreId = result.insertId;

        const updateUserSql = `UPDATE users SET storeId = ? WHERE id = ?`;
        db.query(updateUserSql, [newStoreId, userId], (err, updateResult) => {
            if (err) {
                console.error("Erro ao vincular loja ao usuário:", err.message);
                return res.status(500).json({ error: "Loja criada, mas falha ao vincular ao usuário." });
            }
            res.status(201).json({
                message: "Loja criada e vinculada com sucesso!",
                storeId: newStoreId
            });
        });
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando! Acesse http://localhost:${port}`);
});

