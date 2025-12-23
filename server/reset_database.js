const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');

async function resetAndSeed() {
    console.log("💣 STARTING BDA DATABASE RESET...");
    const connection = await mysql.createConnection({
        host: 'mysql-20957e76-habimaroua-a255.e.aivencloud.com',
        port: 26878,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        multipleStatements: true
    });

    try {
        console.log("🔥 Dropping tables...");
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        const tables = [
            'inscriptions', 'surveillances', 'examens', 'modules',
            'etudiants', 'professeurs', 'formations', 'departements', 'lieu_examen',
            'users', 'admins', 'rooms', 'exams', 'student_enrollments', 'conflicts', 'notifications'
        ];
        for (const t of tables) await connection.query(`DROP TABLE IF EXISTS ${t}`);
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log("🏗️ Creating BDA Schema...");

        // 1. Departements
        await connection.query(`
            CREATE TABLE departements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL
            )
        `);

        // 2. Formations
        await connection.query(`
            CREATE TABLE formations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                dept_id INT NOT NULL,
                nb_modules INT DEFAULT 0,
                FOREIGN KEY (dept_id) REFERENCES departements(id) ON DELETE CASCADE
            )
        `);

        // 3. Etudiants
        await connection.query(`
            CREATE TABLE etudiants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                formation_id INT,
                promo VARCHAR(20),
                niveau VARCHAR(10),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE SET NULL
            )
        `);

        // 4. Professeurs
        await connection.query(`
            CREATE TABLE professeurs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                dept_id INT,
                specialite VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_chef BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (dept_id) REFERENCES departements(id) ON DELETE SET NULL
            )
        `);

        // 5. Admins
        await connection.query(`
            CREATE TABLE admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'vice_doyen') DEFAULT 'admin'
            )
        `);

        // 6. Modules
        await connection.query(`
            CREATE TABLE modules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                credits INT NOT NULL,
                formation_id INT NOT NULL,
                pre_req_id INT,
                FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
            )
        `);

        // 7. Lieu Examen
        await connection.query(`
            CREATE TABLE lieu_examen (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                capacite INT NOT NULL,
                type VARCHAR(50),
                batiment VARCHAR(50)
            )
        `);

        // 8. Examens
        await connection.query(`
            CREATE TABLE examens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                module_id INT NOT NULL,
                prof_id INT NOT NULL,
                salle_id INT,
                date_heure DATETIME,
                duree_minutes INT,
                is_validated BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
                FOREIGN KEY (prof_id) REFERENCES professeurs(id) ON DELETE CASCADE,
                FOREIGN KEY (salle_id) REFERENCES lieu_examen(id) ON DELETE SET NULL
            )
        `);

        // 9. Inscriptions
        await connection.query(`
            CREATE TABLE inscriptions (
                etudiant_id INT NOT NULL,
                module_id INT NOT NULL,
                note DECIMAL(5,2),
                PRIMARY KEY (etudiant_id, module_id),
                FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE,
                FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
            )
        `);

        // 10. Surveillances
        await connection.query(`
            CREATE TABLE surveillances (
                id INT AUTO_INCREMENT PRIMARY KEY,
                exam_id INT NOT NULL,
                prof_id INT NOT NULL,
                FOREIGN KEY (exam_id) REFERENCES examens(id) ON DELETE CASCADE,
                FOREIGN KEY (prof_id) REFERENCES professeurs(id) ON DELETE CASCADE
            )
        `);

        // 11. Conflicts
        await connection.query(`
            CREATE TABLE conflicts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                description TEXT,
                severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
                module_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 12. Notifications
        await connection.query(`
            CREATE TABLE notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_email VARCHAR(255),
                title VARCHAR(255),
                message TEXT,
                type VARCHAR(50),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("🌱 SEEDING DATA...");

        const passwordHash = await bcrypt.hash('password123', 10);

        // Departments
        const deptsData = ['Informatique', 'Mathématiques', 'Génie Civil', 'Économie'];
        for (const d of deptsData) {
            await connection.query('INSERT INTO departements (nom) VALUES (?)', [d]);
        }
        const [depts] = await connection.query('SELECT * FROM departements');

        // Formations
        for (const d of depts) {
            const levels = ['L1', 'L2', 'L3', 'M1', 'M2'];
            for (const lvl of levels) {
                await connection.query('INSERT INTO formations (nom, dept_id, nb_modules) VALUES (?, ?, 0)', [`${lvl} ${d.nom}`, d.id]);
            }
        }
        const [formations] = await connection.query('SELECT * FROM formations');

        // Modules
        for (const f of formations) {
            for (let i = 1; i <= 5; i++) {
                const sub = f.nom.includes('Informatique') ? 'Info' : 'Général';
                await connection.query('INSERT INTO modules (nom, credits, formation_id) VALUES (?, ?, ?)', [`${sub} Mod ${i} (${f.nom})`, 3, f.id]);
            }
        }
        const [modules] = await connection.query('SELECT * FROM modules');

        // Professors
        for (const d of depts) {
            for (let i = 1; i <= 5; i++) {
                const email = `prof${d.id}_${i}@univ.dz`;
                const isChef = (i === 1);
                const roleName = isChef ? "Chef" : "Prof";
                await connection.query(
                    'INSERT INTO professeurs (nom, dept_id, specialite, email, password, is_chef) VALUES (?, ?, ?, ?, ?, ?)',
                    [`${roleName} ${d.nom} ${i}`, d.id, d.nom, email, passwordHash, isChef]
                );
            }
        }
        const [profs] = await connection.query('SELECT * FROM professeurs');

        // Students
        for (const f of formations) {
            for (let i = 1; i <= 3; i++) {
                const email = `etudiant_${f.id}_${i}@univ.dz`;
                // Add explicit logic for L3 SI later if needed, now generic
                await connection.query(
                    'INSERT INTO etudiants (nom, prenom, formation_id, promo, email, password) VALUES (?, ?, ?, ?, ?, ?)',
                    [`Etu${i}`, `Promo${f.nom}`, f.id, '2025', email, passwordHash]
                );
            }
        }
        const [students] = await connection.query('SELECT * FROM etudiants');

        // Inscriptions
        for (const s of students) {
            const formationModules = modules.filter(m => m.formation_id === s.formation_id);
            for (const m of formationModules) {
                await connection.query('INSERT INTO inscriptions (etudiant_id, module_id) VALUES (?, ?)', [s.id, m.id]);
            }
        }

        // Lieu Examen
        await connection.query("INSERT INTO lieu_examen (nom, capacite, type) VALUES ('Amphi A', 100, 'amphi'), ('Amphi B', 100, 'amphi'), ('Salle 1', 30, 'salle'), ('Salle 2', 30, 'salle')");
        const [salles] = await connection.query('SELECT * FROM lieu_examen');

        // Exams & Surveillances
        let date = new Date('2025-06-01T08:00:00');
        for (const m of modules) {
            if (Math.random() > 0.6) continue; // Seed 40% of modules with exams

            const formation = formations.find(f => f.id === m.formation_id);
            const deptProfs = profs.filter(p => p.dept_id === formation.dept_id);
            const responsible = deptProfs[Math.floor(Math.random() * deptProfs.length)] || profs[0];
            const salle = salles[Math.floor(Math.random() * salles.length)];

            date.setHours(date.getHours() + 4);
            if (date.getHours() > 17) {
                date.setHours(8);
                date.setDate(date.getDate() + 1);
            }

            const [res] = await connection.query(
                'INSERT INTO examens (module_id, prof_id, salle_id, date_heure, duree_minutes, is_validated) VALUES (?, ?, ?, ?, ?, TRUE)',
                [m.id, responsible.id, salle.id, date, 120]
            );
            const examId = res.insertId;

            // Surveillance
            await connection.query('INSERT INTO surveillances (exam_id, prof_id) VALUES (?, ?)', [examId, responsible.id]);
        }

        // Admins
        await connection.query("INSERT INTO admins (nom, email, password, role) VALUES ('Admin', 'admin@univ.dz', ?, 'admin')", [passwordHash]);

        console.log("✅ BDA RESET COMPLETE.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

resetAndSeed();
