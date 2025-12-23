const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const path = require('path');
const { generateTimetable } = require('./scheduler');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Serveur UniSchedule (BDA) opérationnel ! Les APIs sont sous /api');
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// AUTH MIDDLEWARE
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Token manquant." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token invalide." });
        req.user = user;
        next();
    });
};

// DEPARTMENTS
app.get('/api/departments', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, nom as name FROM departements');
        res.json(rows.map(d => ({ ...d, code: d.name.substring(0, 3).toUpperCase() })));
    } catch (e) {
        res.json([]);
    }
});

app.get('/api/public/formations', async (req, res) => {
    try {
        const { deptId } = req.query;
        let query = 'SELECT id, nom as name FROM formations';
        const params = [];
        if (deptId) {
            query += ' WHERE dept_id = ?';
            params.push(deptId);
        }
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (e) {
        res.json([]);
    }
});

// SIGNUP
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, full_name, role, department_id, formation_id, new_department_name } = req.body;
        console.log(`[Signup] Attempt for ${email} as ${role} (Formation: ${formation_id})`);

        // Check if email exists
        const [existingAdmins] = await db.execute('SELECT id FROM admins WHERE email = ?', [email]);
        const [existingProfs] = await db.execute('SELECT id FROM professeurs WHERE email = ?', [email]);
        const [existingStudents] = await db.execute('SELECT id FROM etudiants WHERE email = ?', [email]);

        if (existingAdmins.length > 0 || existingProfs.length > 0 || existingStudents.length > 0) {
            console.log(`[Signup] Email ${email} already exists`);
            return res.status(400).json({ error: "Cet email est déjà utilisé. Essayez de vous connecter." });
        }

        let deptId = department_id;
        // Accept undefined, null, empty string or the string 'null' as "no department chosen"
        if ((!department_id || department_id === 'null' || department_id === 'other') && new_department_name) {
            console.log(`[Signup] Creating dept: ${new_department_name}`);
            const [insertRes] = await db.execute('INSERT INTO departements (nom) VALUES (?)', [new_department_name]);
            deptId = insertRes.insertId;
        } else if (department_id === 'other' && !new_department_name) {
            return res.status(400).json({ error: "Nom du département requis." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [firstName, ...lastNameParts] = full_name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        if (role === 'admin' || role === 'vice_doyen') {
            await db.execute('INSERT INTO admins (nom, email, password, role) VALUES (?, ?, ?, ?)',
                [full_name, email, hashedPassword, role]);
        }
        else if (role === 'professeur' || role === 'chef_departement') {
            await db.execute(
                'INSERT INTO professeurs (nom, dept_id, specialite, email, password, is_chef) VALUES (?, ?, ?, ?, ?, ?)',
                [full_name, deptId, 'Général', email, hashedPassword, role === 'chef_departement']
            );
        }
        else {
            await db.execute(
                'INSERT INTO etudiants (nom, prenom, email, password, promo, formation_id) VALUES (?, ?, ?, ?, ?, ?)',
                [lastName, firstName, email, hashedPassword, '2025', formation_id || null]
            );
        }

        console.log(`[Signup] Success for ${email}`);
        res.json({ message: "Compte créé" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Erreur inscription: " + error.message });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
        let user = rows[0];
        let role = user ? user.role : null;

        if (!user) {
            [rows] = await db.execute('SELECT * FROM professeurs WHERE email = ?', [email]);
            user = rows[0];
            if (user) role = user.is_chef ? 'chef_departement' : 'professeur';
        }

        if (!user) {
            [rows] = await db.execute('SELECT * FROM etudiants WHERE email = ?', [email]);
            user = rows[0];
            if (user) role = 'etudiant';
        }

        if (!user) return res.status(401).json({ error: "Utilisateur non trouvé." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect." });

        const token = jwt.sign({ id: user.id, role: role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: `${user.nom} ${user.prenom || ''}`.trim(),
                role: role,
                department_id: user.dept_id || null,
                formation_id: user.formation_id || null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

// GET EXAMS
app.get('/api/exams', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT e.id, e.date_heure as date_time, e.duree_minutes as duration,
                   m.nom as module_name,
                   l.nom as room_name,
                   f.nom as formation_name,
                   p.nom as prof_name,
                   e.is_validated,
                   d.nom as department_name,
                   f.dept_id as department_id,
                   m.formation_id
            FROM examens e
            JOIN modules m ON e.module_id = m.id
            JOIN formations f ON m.formation_id = f.id
            JOIN departements d ON f.dept_id = d.id
            LEFT JOIN lieu_examen l ON e.salle_id = l.id
            LEFT JOIN professeurs p ON e.prof_id = p.id
        `;
        let params = [];
        let whereClauses = [];

        if (req.user.role === 'chef_departement') {
            const [prof] = await db.execute('SELECT dept_id FROM professeurs WHERE id = ?', [req.user.id]);
            if (prof.length > 0) {
                whereClauses.push('f.dept_id = ?');
                params.push(prof[0].dept_id);
            }
        }
        else if (req.user.role === 'etudiant') {
            const [student] = await db.execute('SELECT formation_id FROM etudiants WHERE id = ?', [req.user.id]);
            if (student.length > 0) {
                whereClauses.push('m.formation_id = ?');
                params.push(student[0].formation_id);
            } else {
                return res.json([]);
            }
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY e.date_heure ASC';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des examens." });
    }
});

// FORMATIONS
app.get('/api/formations', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT f.id, f.nom as name, f.dept_id,
                   (SELECT COUNT(*) FROM modules m WHERE m.formation_id = f.id) as nb_modules,
                   (SELECT COUNT(*) FROM etudiants s WHERE s.formation_id = f.id) as student_count
            FROM formations f
        `;
        let params = [];

        if (req.user.role === 'chef_departement') {
            const [prof] = await db.execute('SELECT dept_id FROM professeurs WHERE id = ?', [req.user.id]);
            if (prof.length > 0) {
                query += ' WHERE f.dept_id = ?';
                params.push(prof[0].dept_id);
            }
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur formations." });
    }
});

// ADD FORMATION
app.post('/api/formations/add', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'chef_departement') return res.status(403).json({ error: "Non autorisé" });

        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Nom requis" });

        const [prof] = await db.execute('SELECT dept_id FROM professeurs WHERE id = ?', [req.user.id]);
        if (!prof.length) return res.status(400).json({ error: "Prof non trouvé" });

        await db.execute('INSERT INTO formations (nom, dept_id, nb_modules) VALUES (?, ?, 0)', [name, prof[0].dept_id]);
        res.json({ message: "Formation ajoutée" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur ajout formation" });
    }
});

// GET MODULES BY FORMATION
app.get('/api/formations/:id/modules', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT m.id, m.nom, m.credits, m.pre_req_id, p.nom as pre_req_nom 
            FROM modules m 
            LEFT JOIN modules p ON m.pre_req_id = p.id 
            WHERE m.formation_id = ?
        `, [req.params.id]);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: "Erreur modules" });
    }
});

// ADD MODULE
app.post('/api/modules/add', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'chef_departement') return res.status(403).json({ error: "Non autorisé" });

        const { nom, credits, formation_id, duration, pre_req_id } = req.body;

        // 1. Créer le module
        const [modRes] = await db.execute('INSERT INTO modules (nom, credits, formation_id, pre_req_id) VALUES (?, ?, ?, ?)',
            [nom, credits, formation_id, pre_req_id]);

        const moduleId = modRes.insertId;

        // 2. Créer l'examen associé automatiquement pour qu'il soit pioché par l'algorithme
        await db.execute('INSERT INTO examens (module_id, prof_id, duree_minutes, is_validated) VALUES (?, ?, ?, FALSE)',
            [moduleId, req.user.id, duration || 120]);

        res.json({ message: "Module et Examen créés avec succès" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur ajout module" });
    }
});

// PROF: Mes Examens
app.get('/api/my-exams', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT e.id, e.date_heure as date_time, e.duree_minutes as duration,
                   m.nom as module_name,
                   l.nom as room_name,
                   f.nom as formation_name
            FROM examens e
            JOIN modules m ON e.module_id = m.id
            JOIN formations f ON m.formation_id = f.id
            LEFT JOIN lieu_examen l ON e.salle_id = l.id
            WHERE e.prof_id = ?
            ORDER BY e.date_heure ASC
        `;
        const [rows] = await db.execute(query, [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error("My Exams Error:", error);
        res.status(500).json({ error: "Erreur mes examens." });
    }
});

// PROF: Surveillances
app.get('/api/my-supervision', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT s.id, e.date_heure as date_time, e.duree_minutes as duration,
                   m.nom as module_name,
                   l.nom as room_name
            FROM surveillances s
            JOIN examens e ON s.exam_id = e.id
            JOIN modules m ON e.module_id = m.id
            LEFT JOIN lieu_examen l ON e.salle_id = l.id
            WHERE s.prof_id = ?
            ORDER BY e.date_heure ASC
        `;
        const [rows] = await db.execute(query, [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error("Supervision Error:", error);
        res.status(500).json({ error: "Erreur surveillances." });
    }
});

// STATS GLOBAL
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        let stats = {
            totalStudents: 0,
            totalExams: 0,
            totalConflicts: 0,
            validatedExams: 0,
            roomOccupancy: 0,
            formationsCount: 0,
            nonValidatedExams: 0,
            departmentsCount: 0,
            usedRooms: 0
        };

        const [[{ c: sCount }]] = await db.execute('SELECT COUNT(*) as c FROM etudiants');
        const [[{ c: eCount }]] = await db.execute('SELECT COUNT(*) as c FROM examens');
        const [[{ c: fCount }]] = await db.execute('SELECT COUNT(*) as c FROM formations');
        const [[{ c: valCount }]] = await db.execute('SELECT COUNT(*) as c FROM examens WHERE is_validated = TRUE');
        const [[{ c: dCount }]] = await db.execute('SELECT COUNT(*) as c FROM departements');

        stats.totalStudents = sCount;
        stats.totalExams = eCount;
        stats.formationsCount = fCount;
        stats.validatedExams = valCount;
        stats.nonValidatedExams = eCount - valCount;
        stats.departmentsCount = dCount;
        stats.roomOccupancy = Math.floor(Math.random() * 30 + 50); // Mock

        if (req.user.role === 'chef_departement') {
            const [prof] = await db.execute('SELECT dept_id FROM professeurs WHERE id = ?', [req.user.id]);
            if (prof.length) {
                const [d] = await db.execute('SELECT nom FROM departements WHERE id = ?', [prof[0].dept_id]);
                if (d.length) stats.departmentName = d[0].nom;
            }
        }
        res.json(stats);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Stats error" });
    }
});

// STATS DEPARTMENTS (Missing before)
app.get('/api/stats/departments', authenticateToken, async (req, res) => {
    try {
        const [depts] = await db.execute('SELECT id, nom as name FROM departements');
        const stats = [];

        for (const d of depts) {
            // Count exams for this dept
            const [[{ count }]] = await db.execute(
                'SELECT COUNT(e.id) as count FROM examens e JOIN modules m ON e.module_id = m.id JOIN formations f ON m.formation_id = f.id WHERE f.dept_id = ?',
                [d.id]
            );

            stats.push({
                id: d.id,
                name: d.name,
                code: d.name.substring(0, 3).toUpperCase(),
                examCount: count,
                roomUsage: Math.floor(Math.random() * 60 + 20)
            });
        }
        res.json(stats);
    } catch (e) {
        console.error(e);
        res.json([]); // Fail safe for frontend
    }
});

// CONFLICTS (Missing before)
app.get('/api/conflicts', authenticateToken, async (req, res) => {
    try {
        // Mock response to prevent crash. Implement logic later if table exists.
        res.json([]);
    } catch (e) {
        res.json([]); // Fail safe
    }
});

// VALIDATE PLANNING (Missing before)
app.post('/api/department/validate', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'chef_departement') return res.status(403).json({ error: "Unauthorized" });
        const [prof] = await db.execute('SELECT dept_id FROM professeurs WHERE id = ?', [req.user.id]);
        if (!prof.length) return res.status(400).json({ error: "Prof error" });

        await db.execute(`
            UPDATE examens e
            JOIN modules m ON e.module_id = m.id
            JOIN formations f ON m.formation_id = f.id
            SET e.is_validated = TRUE
            WHERE f.dept_id = ?
        `, [prof[0].dept_id]);

        res.json({ message: "Planning validé" });
    } catch (e) {
        res.status(500).json({ error: "Validation error" });
    }
});

// GENERATE SCHEDULE
app.post('/api/schedule/generate', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'chef_departement' && req.user.role !== 'vice_doyen') {
            return res.status(403).json({ error: "Accès refusé" });
        }

        let deptId = req.body.deptId;
        let formationId = req.body.formationId;
        let startDate = req.body.startDate;
        let endDate = req.body.endDate;

        console.log(`[API /schedule/generate] Params: Dept=${deptId}, Form=${formationId}, Start=${startDate}, End=${endDate}`);

        // Si c'est un chef de département, on force son département
        if (req.user.role === 'chef_departement') {
            const [prof] = await db.execute('SELECT dept_id FROM professeurs WHERE id = ?', [req.user.id]);
            if (prof.length > 0) deptId = prof[0].dept_id;
        }

        const result = await generateTimetable({ deptId, formationId, startDate, endDate });

        if (result.success) {
            res.json({
                message: `Génération réussie : ${result.scheduled} examens planifiés.`,
                details: result
            });
        } else {
            res.status(500).json({ error: result.error || "Erreur lors de la génération" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur serveur lors de la génération" });
    }
});

// NOTIFICATIONS
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM notifications WHERE user_email = ? ORDER BY created_at DESC', [req.user.email]);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Serveur BDA lancé sur le port ${PORT}`);
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Erreur: le port ${PORT} est déjà utilisé. Tuez le processus existant ou définissez une autre valeur pour PORT.`);
        process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
});
