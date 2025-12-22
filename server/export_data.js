const fs = require('fs');
const db = require('./db');
const path = require('path');

async function exportFullDatabase() {
    try {
        console.log("Démarrage de l'exportation des données réelles depuis Aiven...");
        let sqlDump = "-- EXPORT DES DONNÉES RÉELLES UNISCHEDULE\n";
        sqlDump += "-- Généré le : " + new Date().toLocaleString() + "\n\n";
        sqlDump += "SET FOREIGN_KEY_CHECKS = 0;\n\n";

        // Tables qui existent réellement sur Aiven
        const tables = [
            'departments',
            'users',
            'formations',
            'rooms',
            'exams',
            'surveillances',
            'conflicts'
        ];

        for (const table of tables) {
            console.log(`Exportation de la table : ${table}...`);
            const [rows] = await db.execute(`SELECT * FROM ${table}`);

            if (rows.length > 0) {
                sqlDump += `-- Données pour la table ${table}\n`;

                for (const row of rows) {
                    const columns = Object.keys(row).join(', ');
                    const valuesArr = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        if (typeof val === 'boolean') return val ? 1 : 0;
                        return val;
                    });

                    sqlDump += `INSERT INTO ${table} (${columns}) VALUES (${valuesArr.join(', ')});\n`;
                }
                sqlDump += "\n";
            } else {
                sqlDump += `-- Table ${table} est vide dans la base Aiven.\n\n`;
            }
        }

        sqlDump += "SET FOREIGN_KEY_CHECKS = 1;\n";

        const outputPath = path.join(__dirname, 'live_database_dump.sql');
        fs.writeFileSync(outputPath, sqlDump);

        console.log("-----------------------------------------");
        console.log("SUCCÈS : Données exportées avec succès !");
        console.log("Fichier crée : " + outputPath);
        console.log("-----------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("Erreur lors de l'exportation :", error);
        process.exit(1);
    }
}

exportFullDatabase();
