// database.js

const mysql = require('mysql');

// Configuração da conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost',    // O endereço do servidor MySQL
    user: 'root',         // Usuário padrão do XAMPP
    password: '',         // Senha padrão do XAMPP é vazia
    database: 'loja_acessivel' // O nome do banco de dados que criamos
});

// Estabelece a conexão
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.stack);
        return;
    }
    console.log('Conectado ao banco de dados MySQL com o ID ' + connection.threadId);
});

module.exports = connection;