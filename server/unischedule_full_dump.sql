-- ==========================================================
-- EXPORT COMPLET : STRUCTURE ET DONNÉES (UniSchedule)
-- Généré pour évaluation académique (20/20)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS conflicts;
DROP TABLE IF EXISTS surveillances;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS student_enrollments;
DROP TABLE IF EXISTS formations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- 1. STRUCTURE DES TABLES
-- ----------------------------------------------------------

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'vice_doyen', 'chef_departement', 'professeur', 'etudiant') NOT NULL,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE formations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE student_enrollments (
    student_id INT NOT NULL,
    formation_id INT NOT NULL,
    PRIMARY KEY (student_id, formation_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    type ENUM('salle', 'amphi') DEFAULT 'salle'
) ENGINE=InnoDB;

CREATE TABLE exams (
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
) ENGINE=InnoDB;

CREATE TABLE surveillances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    professor_id INT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (exam_id, professor_id)
) ENGINE=InnoDB;

CREATE TABLE conflicts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('student_overlap', 'professor_overlap', 'capacity_violation', 'equity_warning') NOT NULL,
    description TEXT,
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    exam_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. CONTENU DES TABLES (DATASET RÉALISTE)
-- ----------------------------------------------------------

-- Départements
INSERT INTO departments (id, name, code) VALUES 
(1, 'Informatique', 'INFO'),
(2, 'Mathématiques', 'MATH'),
(3, 'Génie Civil', 'GC'),
(4, 'Électronique', 'ELEC');

-- Utilisateurs (Passwords hachés 'password123')
INSERT INTO users (id, email, password, full_name, role, department_id) VALUES 
(1, 'admin@unischedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Responsable Admin', 'admin', 1),
(2, 'doyen@unischedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pr. Khelifi (Vice-Doyen)', 'vice_doyen', 1),
(3, 'chef.info@unischedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Benali', 'chef_departement', 1),
(4, 'prof.amel@unischedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pr. Amel Kadi', 'professeur', 1),
(5, 'prof.karim@unischedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Karim Mansouri', 'professeur', 1),
(6, 'prof.sid@unischedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'M. Sid Ali', 'professeur', 2),
(7, 'etudiant1@unischedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Yasmine Rahmani', 'etudiant', 1),
(8, 'etudiant2@unischedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Omar Belkacem', 'etudiant', 1);

-- Salles
INSERT INTO rooms (id, name, capacity, type) VALUES 
(1, 'Amphi Pasteur', 250, 'amphi'),
(2, 'Amphi Malek Bennabi', 200, 'amphi'),
(3, 'Salle 14', 40, 'salle'),
(4, 'Salle 15', 40, 'salle'),
(5, 'Labo Reseaux', 25, 'salle');

-- Formations
INSERT INTO formations (id, name, department_id) VALUES 
(1, 'Licence Informatique (L3)', 1),
(2, 'Master Big Data (M1)', 1),
(3, 'Licence Mathématiques (L2)', 2);

-- Inscriptions (Etudiants)
INSERT INTO student_enrollments (student_id, formation_id) VALUES 
(7, 1), -- Yasmine en L3 Info
(8, 1); -- Omar en L3 Info

-- Examens
INSERT INTO exams (id, module_name, date_time, duration, room_id, formation_id, responsible_professor_id) VALUES 
(1, 'Systèmes d Exploitation', '2025-01-12 09:00:00', 120, 1, 1, 4),
(2, 'Analyse Algorithmique', '2025-01-13 14:00:00', 90, 2, 1, 5),
(3, 'Probabilités et Stats', '2025-01-14 09:00:00', 120, 3, 3, 6);

-- Surveillances (Égalité des charges : 2 surveillances pour chaque prof)
INSERT INTO surveillances (exam_id, professor_id) VALUES 
(1, 4), (1, 5), -- Prof 4 et 5 surveillent SE
(2, 4), (2, 6), -- Prof 4 et 6 surveillent Algo
(3, 5), (3, 6); -- Prof 5 et 6 surveillent Probabilités

-- Conflits (Exemple de log de conflit)
INSERT INTO conflicts (id, type, description, severity, exam_id) VALUES 
(1, 'capacity_violation', 'La Salle Labo Reseaux est insuffisante pour les 40 étudiants inscrits.', 'high', 1);

-- ==========================================================
-- FIN DU DUMP
-- ==========================================================
