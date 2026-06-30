const Database = require('better-sqlite3');
const db = new Database('datos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS incendios (
    id                        INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_hora_reporte        TIMESTAMP NOT NULL,
    direccion_aproximada      TEXT NOT NULL, 
    nivel_complejidad         INTEGER NOT NULL,
    estado_reporte            TEXT NOT NULL,
    nombre_usuario_reportante TEXT NOT NULL
  )
`);

module.exports = db;

//SQLite guarda toda la base de datos en un solo archivo (datos.db). 
// No necesitan instalar ningun servidor de base de datos separado.
