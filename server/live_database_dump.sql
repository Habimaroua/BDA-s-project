-- EXPORT DES DONNÉES RÉELLES UNISCHEDULE
-- Généré le : 12/22/2025, 12:03:30 PM

SET FOREIGN_KEY_CHECKS = 0;

-- Données pour la table departments
INSERT INTO departments (id, name, code) VALUES (1, 'Informatique', 'INFO');
INSERT INTO departments (id, name, code) VALUES (2, 'Mathématiques', 'MATH');
INSERT INTO departments (id, name, code) VALUES (3, 'Génie Civil', 'GC');
INSERT INTO departments (id, name, code) VALUES (4, 'Économie', 'ECO');
INSERT INTO departments (id, name, code) VALUES (5, 'medcine', 'MDC');

-- Données pour la table users
INSERT INTO users (id, email, password, full_name, role, department_id, created_at) VALUES (1, 'habiwalid209@gmail.com', '$2a$10$9Qt38zC4pr5i2BzZ9SK2nOvrerNw/WmkmKjq93OJ7LXWEVr7kQERK', 'walid habi', 'chef_departement', NULL, '2025-12-22 07:59:23');
INSERT INTO users (id, email, password, full_name, role, department_id, created_at) VALUES (2, 'ahmedhmaw@gmsil.com', '$2a$10$SNs5GR.ncSsBsuYoMR4ZB.n4ChMXUiQKn8P2v2dHBjHR7zFdeiY6.', 'ahmed hmaw', 'admin', NULL, '2025-12-22 08:12:40');
INSERT INTO users (id, email, password, full_name, role, department_id, created_at) VALUES (3, 'dj@gmail.com', '$2a$10$.xs.Wn/15aMID34lZ1YZ0.rUg4jBVReSL4ZbKCWhEkf0ZkVJPZW8m', 'dk dj', 'professeur', NULL, '2025-12-22 08:13:51');
INSERT INTO users (id, email, password, full_name, role, department_id, created_at) VALUES (4, 'abc@gmail.com', '$2a$10$7YD40.gESLO/Lom837Tm1uWvFdIczKFn6KsSPwm9qclFYvLnMUp42', 'habi maroua', 'vice_doyen', NULL, '2025-12-22 08:26:08');
INSERT INTO users (id, email, password, full_name, role, department_id, created_at) VALUES (5, 'jantekin@gmail.com', '$2a$10$wIA7UPFmK5yax3ZOSmAmfOBO8L3Ejif7y.t5dFYJ.TAuhZYhm2tYC', 'jan tekin', 'admin', NULL, '2025-12-22 09:08:45');
INSERT INTO users (id, email, password, full_name, role, department_id, created_at) VALUES (6, 'ines@gmail.com', '$2a$10$7dXjebOQbJdxAB9q3onnhOpJvjXV0DyvxsAw.JnD1U7S.hkM9GNk2', 'ines bnjt', 'chef_departement', 5, '2025-12-22 09:13:00');
INSERT INTO users (id, email, password, full_name, role, department_id, created_at) VALUES (7, 'saidhabi@gmail.com', '$2a$10$2k9nYpsETC902iR0iBI1EO9WZhZM7ImlKpQTAOqxJNB9ib/72SoF2', 'fg bfb', 'admin', NULL, '2025-12-22 09:17:49');

-- Table formations est vide dans la base Aiven.

-- Table rooms est vide dans la base Aiven.

-- Table exams est vide dans la base Aiven.

-- Table surveillances est vide dans la base Aiven.

-- Table conflicts est vide dans la base Aiven.

SET FOREIGN_KEY_CHECKS = 1;
