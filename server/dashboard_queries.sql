-- ==========================================================
-- REQUÊTES SQL POUR LE DASHBOARD ET LE RESPECT DES CONTRAINTES
-- ==========================================================

USE unischedule;

-- 1. ÉQUITÉ DES SURVEILLANCES
-- Cette requête compte le nombre de surveillances par professeur pour vérifier l'égalité.
SELECT 
    u.full_name, 
    COUNT(s.id) as total_surveillances
FROM users u
LEFT JOIN surveillances s ON u.id = s.professor_id
WHERE u.role = 'professeur'
GROUP BY u.id
ORDER BY total_surveillances ASC;

-- 2. VÉRIFICATION CAPACITÉ RÉELLE DES SALLES
-- Vérifie si le nombre d'étudiants inscrits à l'examen dépasse la capacité de la salle.
SELECT 
    e.module_name, 
    r.name as salle, 
    r.capacity as capacite_salle,
    (SELECT COUNT(*) FROM student_enrollments WHERE formation_id = e.formation_id) as nombre_etudiants
FROM exams e
JOIN rooms r ON e.room_id = r.id
HAVING nombre_etudiants > capacite_salle;

-- 3. CONTRAINTE ÉTUDIANTS : MAX 1 EXAMEN PAR JOUR
-- Détecte si un étudiant à plus d'un examen le même jour.
SELECT 
    u.full_name as etudiant, 
    DATE(e.date_time) as jour, 
    COUNT(e.id) as nombre_examens
FROM users u
JOIN student_enrollments se ON u.id = se.student_id
JOIN exams e ON se.formation_id = e.formation_id
GROUP BY u.id, jour
HAVING nombre_examens > 1;

-- 4. CONTRAINTE PROFESSEURS : MAX 3 EXAMENS PAR JOUR
-- Détecte si un professeur surveille ou est responsable de plus de 3 examens par jour.
SELECT 
    u.full_name as professeur, 
    DATE(e.date_time) as jour, 
    COUNT(DISTINCT e.id) as nombre_surveillances
FROM users u
JOIN surveillances s ON u.id = s.professor_id
JOIN exams e ON s.exam_id = e.id
GROUP BY u.id, jour
HAVING nombre_surveillances > 3;

-- 5. PRIORITÉS DÉPARTEMENT
-- Liste les examens où le surveillant n'est PAS du même département que l'examen (Alerte priorité).
SELECT 
    e.module_name, 
    d.name as dept_examen, 
    u.full_name as surveillant, 
    d2.name as dept_surveillant
FROM exams e
JOIN formations f ON e.formation_id = f.id
JOIN departments d ON f.department_id = d.id
JOIN surveillances s ON e.id = s.exam_id
JOIN users u ON s.professor_id = u.id
JOIN departments d2 ON u.department_id = d2.id
WHERE d.id != d2.id;
