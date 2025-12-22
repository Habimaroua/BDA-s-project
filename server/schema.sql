-- ==========================================================
-- SCRIPT DE CRÉATION DE LA BASE DE DONNÉES UNISCHEDULE (MySQL)
-- ==========================================================

DROP DATABASE IF EXISTS unischedule;
CREATE DATABASE unischedule;
USE unischedule;

-- 1. Départements
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

-- 2. Utilisateurs (Admins, Profs, Etudiants)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'vice_doyen', 'chef_departement', 'professeur', 'etudiant') NOT NULL,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. Formations (L1, L2, Master, etc.)
CREATE TABLE formations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 4. Inscription des étudiants aux formations
CREATE TABLE student_enrollments (
    student_id INT NOT NULL,
    formation_id INT NOT NULL,
    PRIMARY KEY (student_id, formation_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
);

-- 5. Salles et Amphis
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    type ENUM('salle', 'amphi') DEFAULT 'salle'
);

-- 6. Examens
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(255) NOT NULL,
    date_time DATETIME NOT NULL,
    duration INT DEFAULT 90, -- en minutes
    room_id INT,
    formation_id INT NOT NULL,
    responsible_professor_id INT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
    FOREIGN KEY (responsible_professor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Surveillances (Table pour l'équité des surveillances)
CREATE TABLE surveillances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    professor_id INT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (exam_id, professor_id)
);

-- 8. Conflits (Logiques critiques)
CREATE TABLE conflicts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('student_overlap', 'professor_overlap', 'capacity_violation', 'equity_warning') NOT NULL,
    description TEXT,
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    exam_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- ==========================================================
-- DATASET RÉALISTE (SEED)
-- ==========================================================

-- Insertion Départements
INSERT INTO departments (name, code) VALUES 
('Informatique', 'INFO'),
('Mathématiques', 'MATH'),
('Génie Civil', 'GC');

-- Insertion Salles
INSERT INTO rooms (name, capacity, type) VALUES 
('Amphi A', 200, 'amphi'),
('Amphi B', 150, 'amphi'),
('Salle 101', 40, 'salle'),
('Salle 102', 40, 'salle'),
('Labo Info', 30, 'salle');

-- Insertion Formations
INSERT INTO formations (name, department_id) VALUES 
('L3 Informatique', 1),
('M1 Big Data', 1),
('L2 Mathématiques', 2);

-- Insertion Utilisateurs (Mots de passe 'password123' hachés en mode démo si besoin, ici on met du texte)
-- Note: Dans un vrai système, utilisez bcrypt.
INSERT INTO users (email, password, full_name, role, department_id) VALUES 
('admin@uni.dz', '$2a$10$Exv.fOZXWvF6X9p3pX9OueXG9S9S9S9S9S9S9S9S9S9S9S9S9S9S.', 'Admin Principal', 'admin', 1),
('chef.info@uni.dz', '$2a$10$Exv.fOZXWvF6X9p3pX9OueXG9S9S9S9S9S9S9S9S9S9S9S9S9S9S.', 'Dr. Benali', 'chef_departement', 1),
('chef.math@uni.dz', '$2a$10$Exv.fOZXWvF6X9p3pX9OueXG9S9S9S9S9S9S9S9S9S9S9S9S9S9S.', 'Dr. Mansouri', 'chef_departement', 2),
('prof.alim@uni.dz', '$2a$10$Exv.fOZXWvF6X9p3pX9OueXG9S9S9S9S9S9S9S9S9S9S9S9S9S9S.', 'Pr. Alim', 'professeur', 1),
('prof.kadi@uni.dz', '$2a$10$Exv.fOZXWvF6X9p3pX9OueXG9S9S9S9S9S9S9S9S9S9S9S9S9S9S.', 'Pr. Kadi', 'professeur', 1),
('etudiant1@uni.dz', '$2a$10$Exv.fOZXWvF6X9p3pX9OueXG9S9S9S9S9S9S9S9S9S9S9S9S9S9S.', 'Amine Rahmani', 'etudiant', 1);

-- Inscription étudiant
INSERT INTO student_enrollments (student_id, formation_id) VALUES (6, 1);

-- Insertion Examens
INSERT INTO exams (module_name, date_time, duration, room_id, formation_id, responsible_professor_id) VALUES 
('Base de Données', '2025-01-10 09:00:00', 120, 1, 1, 4),
('Algorithmique', '2025-01-10 14:00:00', 120, 2, 1, 5),
('Analyse Mathématique', '2025-01-11 09:00:00', 90, 3, 3, 3);

-- Insertion Surveillances (Exemple d'équilibre)
INSERT INTO surveillances (exam_id, professor_id) VALUES 
(1, 4), (1, 5),
(2, 4), (2, 5),
(3, 3);
