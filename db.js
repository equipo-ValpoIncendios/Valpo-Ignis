const Database = require('better-sqlite3');
const db = new Database('datos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS incendios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    fechaHora     TEXT NOT NULL,
    estado        TEXT NOT NULL,
    nivelGravedad TEXT NOT NULL,
    ubicacion     TEXT NOT NULL
  )
`);

module.exports = db;

//SQLite guarda toda la base de datos en un solo archivo (datos.db). 
// No necesitan instalar ningun servidor de base de datos separado.
