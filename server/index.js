const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_super_secure';

// --- INITIALISATION DE LA BASE DE DONNÉES ---
const initDB = async () => {
    try {
        console.log("Vérification des tables sur la base de données distante...");

        await db.execute(`
            CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(10) UNIQUE NOT NULL
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'vice_doyen', 'chef_departement', 'professeur', 'etudiant') NOT NULL,
                department_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS formations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                department_id INT NOT NULL,
                FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                capacity INT NOT NULL,
                type ENUM('salle', 'amphi') DEFAULT 'salle'
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS exams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                module_name VARCHAR(255) NOT NULL,
                date_time DATETIME NOT NULL,
                duration INT DEFAULT 90,
                room_id INT,
                formation_id INT NOT NULL,
                responsible_professor_id INT,
                FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
                FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
                FOREIGN KEY (responsible_professor_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Ajout des tables pour les contraintes critiques
        await db.execute(`
            CREATE TABLE IF NOT EXISTS surveillances (
                id INT AUTO_INCREMENT PRIMARY KEY,
                exam_id INT NOT NULL,
                professor_id INT NOT NULL,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
                FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY (exam_id, professor_id)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS conflicts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('student_overlap', 'professor_overlap', 'capacity_violation', 'equity_warning') NOT NULL,
                description TEXT,
                severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
                exam_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
            )
        `);

        console.log("Base de données opérationnelle.");
    } catch (error) {
        console.error("Erreur lors de l'initialisation de la BDD:", error);
    }
};

initDB();

// --- AUTHENTIFICATION ---

// Inscription
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, full_name, role]
        );

        res.status(201).json({ message: "Utilisateur créé !", userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Email déjà utilisé ou erreur serveur." });
    }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) return res.status(401).json({ error: "Utilisateur non trouvé." });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect." });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
});

app.get('/api/exams', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM exams ORDER BY date_time ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les examens." });
    }
});

// --- DEBUG : VOIR LES TABLES SUR AIVEN ---
app.get('/api/debug/status', async (req, res) => {
    try {
        const [tables] = await db.execute('SHOW TABLES');
        const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
        res.json({
            status: "Connecté à Aiven MySQL",
            database: process.env.DB_NAME,
            tables: tables.map(t => Object.values(t)[0]),
            total_users: users[0].count,
            message: "Si vous voyez 'users' dans la liste, vos tables sont bien créées !"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur UniSchedule lancé sur le port ${PORT}`);
});
