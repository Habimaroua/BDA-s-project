const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration
const START_DATE = new Date('2025-06-01T08:00:00'); // Début des examens (Juin 2025)
const END_DATE = new Date('2025-06-20T18:00:00');   // Fin des examens
const DAILY_START_HOUR = 8;
const DAILY_END_HOUR = 17;

async function generateTimetable(filters = {}) {
    const { deptId, formationId, startDate, endDate } = filters;

    const PERIOD_START = startDate ? new Date(startDate + 'T08:00:00') : new Date('2025-06-01T08:00:00');
    const PERIOD_END = endDate ? new Date(endDate + 'T18:00:00') : new Date('2025-06-20T18:00:00');

    console.log(`🔄 Lancement de l'algorithme de génération (Dept: ${deptId || 'Tous'}, Periode: ${PERIOD_START.toLocaleString()} -> ${PERIOD_END.toLocaleString()})...`);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'mysql-20957e76-habimaroua-a255.e.aivencloud.com',
        port: process.env.DB_PORT || 26878,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 0. Auto-création des examens pour les modules qui n'en ont pas
        let missingExamsQuery = `
            SELECT m.id, m.formation_id, f.dept_id
            FROM modules m
            JOIN formations f ON m.formation_id = f.id
            LEFT JOIN examens e ON e.module_id = m.id
            WHERE e.id IS NULL
        `;
        let missingParams = [];
        if (formationId) {
            missingExamsQuery += " AND m.formation_id = ?";
            missingParams.push(formationId);
        } else if (deptId) {
            missingExamsQuery += " AND f.dept_id = ?";
            missingParams.push(deptId);
        }

        const [missing] = await connection.execute(missingExamsQuery, missingParams);
        if (missing.length > 0) {
            console.log(`🆕 Création de ${missing.length} entrées d'examens manquantes...`);
            for (const m of missing) {
                // On cherche le premier prof du département pour l'assigner
                const [profs] = await connection.execute('SELECT id FROM professeurs WHERE dept_id = ? LIMIT 1', [m.dept_id]);
                const profId = profs.length > 0 ? profs[0].id : null;

                if (profId) {
                    await connection.execute(
                        'INSERT INTO examens (module_id, prof_id, duree_minutes, is_validated) VALUES (?, ?, ?, FALSE)',
                        [m.id, profId, 120] // 2h par défaut
                    );
                }
            }
        }

        // 1. Récupérer les examens à planifier
        // On ne planifie que ce qui n'est pas déjà validé
        let query = `
            SELECT e.*, m.nom as module_name, m.formation_id, f.dept_id, f.nom as formation_name
            FROM examens e
            JOIN modules m ON e.module_id = m.id
            JOIN formations f ON m.formation_id = f.id
            WHERE e.is_validated = FALSE
        `;
        const params = [];

        if (formationId) {
            query += " AND m.formation_id = ?";
            params.push(formationId);
        } else if (deptId) {
            query += " AND f.dept_id = ?";
            params.push(deptId);
        }

        // On relance la requête pour inclure ceux qu'on vient de créer
        const [examsToPlan] = await connection.execute(query, params);

        if (examsToPlan.length === 0) {
            console.log("⚠️ Aucun examen non-validé à planifier dans ce périmètre.");
            return { success: true, scheduled: 0, message: "Rien à planifier." };
        }

        console.log(`🔥 Resetting ${examsToPlan.length} non-validated exams before re-planning...`);
        const examIds = examsToPlan.map(e => e.id);
        await connection.query('UPDATE examens SET date_heure = NULL, salle_id = NULL WHERE id IN (?)', [examIds]);

        // 2. Récupérer les ressources (salles)
        const [rooms] = await connection.execute('SELECT * FROM lieu_examen ORDER BY capacite DESC');

        // 3. Récupérer les examens DÉJÀ planifiés et validés (pour éviter les conflits)
        const [existingExams] = await connection.execute('SELECT * FROM examens WHERE is_validated = TRUE AND date_heure IS NOT NULL');

        console.log(`📊 Période: ${PERIOD_START.toLocaleString()}`);
        console.log(`📊 ${examsToPlan.length} examens à planifier.`);
        console.log(`🏠 ${rooms.length} salles disponibles.`);

        // Trackers d'occupation
        const roomOccupancy = {}; // salle_id -> [ {start, end} ]
        const formationOccupancy = {}; // formation_id -> [ {start, end} ]
        const profOccupancy = {}; // prof_id -> [ {start, end} ]

        rooms.forEach(r => roomOccupancy[r.id] = []);

        // Charger l'occupation existante (validée)
        existingExams.forEach(e => {
            const start = new Date(e.date_heure);
            const end = new Date(start.getTime() + (e.duree_minutes || 90) * 60 * 1000);

            if (e.salle_id) {
                if (!roomOccupancy[e.salle_id]) roomOccupancy[e.salle_id] = [];
                roomOccupancy[e.salle_id].push({ start, end });
            }

            // On devrait aussi charger l'occupation formation/prof des examens validés
            // Mais pour simplifier ici, on se concentre sur les nouveaux.
        });

        const isTimeSlotFree = (occupancyList, start, end) => {
            if (!occupancyList) return true;
            for (let slot of occupancyList) {
                if ((start < slot.end) && (end > slot.start)) {
                    return false;
                }
            }
            return true;
        };

        const isTooCloseToOtherExam = (occupancyList, date, minGapDays = 1) => {
            if (!occupancyList || occupancyList.length === 0) return false;
            const current = new Date(date);
            current.setHours(0, 0, 0, 0);

            return occupancyList.some(slot => {
                const other = new Date(slot.start);
                other.setHours(0, 0, 0, 0);
                const diff = Math.abs(current.getTime() - other.getTime()) / (1000 * 3600 * 24);
                return diff <= minGapDays; // Si diff est 0 (même jour) ou 1 (jour suivant), c'est trop proche
            });
        };

        let scheduledCount = 0;
        let conflicts = [];

        for (let exam of examsToPlan) {
            let placed = false;
            let attemptDate = new Date(PERIOD_START);

            while (!placed && attemptDate < PERIOD_END) {
                // Heures ouvrables
                if (attemptDate.getHours() < DAILY_START_HOUR) {
                    attemptDate.setHours(DAILY_START_HOUR, 0, 0, 0);
                }
                if (attemptDate.getHours() >= DAILY_END_HOUR) {
                    attemptDate.setDate(attemptDate.getDate() + 1);
                    attemptDate.setHours(DAILY_START_HOUR, 0, 0, 0);
                    continue;
                }

                const duration = exam.duree_minutes || 90;
                const slotEnd = new Date(attemptDate.getTime() + duration * 60 * 1000);

                if (slotEnd.getHours() > DAILY_END_HOUR) {
                    attemptDate.setDate(attemptDate.getDate() + 1);
                    attemptDate.setHours(DAILY_START_HOUR, 0, 0, 0);
                    continue;
                }

                // CONTRAINTE : Pas d'examen le Vendredi (journée libre)
                if (attemptDate.getDay() === 5) {
                    attemptDate.setDate(attemptDate.getDate() + 1);
                    attemptDate.setHours(DAILY_START_HOUR, 0, 0, 0);
                    continue;
                }

                // CONTRAINTE : Au moins 1 jour de repos entre les examens d'une même formation
                if (isTooCloseToOtherExam(formationOccupancy[exam.formation_id], attemptDate, 1)) {
                    // Sauter à demain 8h pour retenter
                    attemptDate.setDate(attemptDate.getDate() + 1);
                    attemptDate.setHours(DAILY_START_HOUR, 0, 0, 0);
                    continue;
                }

                // Vérifier collision formation
                if (isTimeSlotFree(formationOccupancy[exam.formation_id], attemptDate, slotEnd)) {
                    // Vérifier collision prof
                    if (isTimeSlotFree(profOccupancy[exam.prof_id], attemptDate, slotEnd)) {

                        // Chercher une salle
                        for (let room of rooms) {
                            if (isTimeSlotFree(roomOccupancy[room.id], attemptDate, slotEnd)) {
                                // TROUVÉ !
                                await connection.execute(
                                    'UPDATE examens SET salle_id = ?, date_heure = ? WHERE id = ?',
                                    [room.id, attemptDate, exam.id]
                                );

                                // Update Trackers
                                if (!roomOccupancy[room.id]) roomOccupancy[room.id] = [];
                                roomOccupancy[room.id].push({ start: new Date(attemptDate), end: new Date(slotEnd) });

                                if (!formationOccupancy[exam.formation_id]) formationOccupancy[exam.formation_id] = [];
                                formationOccupancy[exam.formation_id].push({ start: new Date(attemptDate), end: new Date(slotEnd) });

                                if (!profOccupancy[exam.prof_id]) profOccupancy[exam.prof_id] = [];
                                profOccupancy[exam.prof_id].push({ start: new Date(attemptDate), end: new Date(slotEnd) });

                                placed = true;
                                scheduledCount++;
                                break;
                            }
                        }
                    }
                }

                if (!placed) {
                    attemptDate.setMinutes(attemptDate.getMinutes() + 30);
                }
            }

            if (!placed) {
                conflicts.push({
                    module_name: exam.module_name,
                    description: `Impossible de placer l'examen de ${exam.module_name} (Formation: ${exam.formation_name})`
                });
            }
        }

        // Sauvegarder les conflits
        for (let c of conflicts) {
            await connection.execute(
                'INSERT INTO conflicts (type, description, severity, module_name) VALUES (?, ?, ?, ?)',
                ['planning_fail', c.description, 'high', c.module_name]
            );
        }

        return { success: true, scheduled: scheduledCount, conflicts: conflicts.length };

    } catch (error) {
        console.error("❌ Erreur scheduler:", error);
        return { success: false, error: error.message };
    } finally {
        await connection.end();
    }
}

module.exports = { generateTimetable };

