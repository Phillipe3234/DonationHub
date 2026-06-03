const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Database } = require('@sqlitecloud/drivers');
const { sendOTPEmail } = require('./emailService');

const SALT_ROUNDS = 12; // Quanto maior, mais seguro (e mais lento)

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com SQLite Cloud (porta 8860 funciona via TCP no Node.js)
const connectionString = "sqlitecloud://cce14z30dz.g5.sqlite.cloud:8860/auth.sqlitecloud?apikey=W3BA2V4AoSAnQGYEDCqeT9vcgpo2hzLr7X5ybw9QTh8";
const db = new Database(connectionString);

console.log("📡 Conectando ao SQLite Cloud...");

// Inicializar tabelas caso não existam
async function initDatabase() {
    try {
        // Criar tabela de usuários se não existir
        await db.sql`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                senha TEXT NOT NULL
            );
        `;

        // Criar tabela para códigos de verificação OTP
        await db.sql`
            CREATE TABLE IF NOT EXISTS codigos_verificacao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                codigo TEXT NOT NULL,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("✅ Banco de dados inicializado e tabelas verificadas/criadas!");
    } catch (err) {
        console.error("❌ Erro ao inicializar tabelas no SQLite Cloud:", err.message);
    }
}
initDatabase();

// Função auxiliar para validar formato de e-mail usando Expressão Regular
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========== ROTAS DA API DE AUTENTICAÇÃO ==========

// 1. Rota de Cadastro (Register)
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios!' });
    }

    if (!isValidEmail(email.trim())) {
        return res.status(400).json({ error: 'Por favor, insira um e-mail com formato válido!' });
    }

    // Validação de força da senha
    if (password.length < 8) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres!' });
    }
    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ error: 'A senha deve conter pelo menos uma letra maiúscula!' });
    }
    if (!/[0-9]/.test(password)) {
        return res.status(400).json({ error: 'A senha deve conter pelo menos um número!' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return res.status(400).json({ error: 'A senha deve conter pelo menos um caractere especial (ex: !@#$%)!' });
    }

    try {
        // Verificar se o e-mail já está cadastrado
        const existing = await db.sql`
            SELECT id FROM usuarios WHERE email = ${email.trim()};
        `;

        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado!' });
        }

        // Criptografar a senha com bcrypt antes de salvar
        const senhaHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Inserir novo usuário com senha criptografada
        const resultado = await db.sql`
            INSERT INTO usuarios (nome, email, senha) 
            VALUES (${name.trim()}, ${email.trim()}, ${senhaHash});
        `;

        console.log(`👤 Novo usuário cadastrado: ${name.trim()} (${email.trim()})`);
        res.json({ success: true, id: resultado.lastID || 1 });
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ error: 'Erro interno ao realizar cadastro: ' + error.message });
    }
});

// 2. Rota de Login (Gera o código de segurança OTP)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios!' });
    }

    if (!isValidEmail(email.trim())) {
        return res.status(400).json({ error: 'Por favor, insira um e-mail com formato válido!' });
    }

    try {
        // Buscar usuário pelo e-mail (a senha será comparada via bcrypt)
        const users = await db.sql`
            SELECT * FROM usuarios WHERE email = ${email.trim()};
        `;

        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos!' });
        }

        // Comparar a senha digitada com o hash armazenado no banco
        const senhaCorreta = await bcrypt.compare(password, users[0].senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos!' });
        }

        const user = users[0];

        // Gerar um código OTP aleatório de 6 dígitos
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Salvar código no banco (apaga códigos antigos desse email primeiro)
        await db.sql`
            DELETE FROM codigos_verificacao WHERE email = ${email.trim()};
        `;
        await db.sql`
            INSERT INTO codigos_verificacao (email, codigo) 
            VALUES (${email.trim()}, ${otpCode});
        `;

        // Enviar o código OTP real por email para o usuário (com fallback para o terminal)
        await sendOTPEmail(email.trim(), otpCode);

        res.json({
            requireOtp: true,
            message: `Código de verificação enviado para ${email.trim()}! Verifique seu e-mail (ou o terminal do backend).`
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no login: ' + error.message });
    }
});

// 3. Rota de Verificação de Código OTP
app.post('/api/auth/verify', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'E-mail e código de verificação são obrigatórios!' });
    }

    try {
        // Buscar se o código confere
        const results = await db.sql`
            SELECT * FROM codigos_verificacao WHERE email = ${email.trim()} AND codigo = ${code.trim()};
        `;

        if (!results || results.length === 0) {
            return res.status(401).json({ error: 'Código de verificação incorreto ou expirado!' });
        }

        // Apagar o código após validação bem-sucedida
        await db.sql`
            DELETE FROM codigos_verificacao WHERE email = ${email.trim()};
        `;

        // Obter os dados públicos do usuário logado
        const users = await db.sql`
            SELECT id, nome, email FROM usuarios WHERE email = ${email.trim()};
        `;

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        const user = users[0];

        console.log(`🔓 Usuário autenticado com sucesso: ${user.nome} (${user.email})`);

        res.json({
            success: true,
            token: 'mock-jwt-token-donationhub-session',
            user: {
                id: user.id,
                nome: user.nome,
                name: user.nome, // Para compatibilidade com o front-end web antigo
                email: user.email
            }
        });

    } catch (error) {
        console.error('Erro na verificação do código:', error);
        res.status(500).json({ error: 'Erro interno na verificação: ' + error.message });
    }
});

// Porta padrão 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR BACKEND DO DONATIONHUB ATIVO!`);
    console.log(`👉 Web Local: http://localhost:${PORT}`);
    console.log(`👉 Celular: http://SEU_IP_LOCAL:${PORT}\n`);
});