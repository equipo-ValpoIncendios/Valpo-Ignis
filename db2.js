const Database = require('better-sqlite3');
const db = new Database('datos.db');
 
db.exec(`
  CREATE TABLE IF NOT EXISTS personas_desaparecidas (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    fechaDesaparicion   TEXT NOT NULL,
    nombreCompleto      TEXT NOT NULL,
    edad                INTEGER,
    genero              TEXT,
    descripcionFisica   TEXT,
    ultimaUbicacion     TEXT NOT NULL,
    estado              TEXT NOT NULL DEFAULT 'desaparecido',
    nivelAlerta         TEXT NOT NULL DEFAULT 'normal',
    contactoReportante  TEXT,
    observaciones       TEXT,
    fechaRegistro       TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
 
module.exports = db;

//SQLite guarda toda la base de datos en un solo archivo (datos.db). 
// No necesitan instalar ningun servidor de base de datos separado.