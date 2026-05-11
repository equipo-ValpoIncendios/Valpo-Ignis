const express = require('express');
const db      = require('./storage/db'); //tiene que tener el nombre ./nombre_db sino no la encuentra
const app     = express();

app.use(express.json());

// GET /incendios
app.get('/incendios', (req, res) => { // aqui falta el nombre de la ruta
  const incendios = db.prepare('SELECT * FROM incendios').all();
  res.json(incendios);
});

// POST /incendios
app.post('/incendios', (req, res) => {
  const { fechaHoraDia, estado, nivelGravedad, ubicacion } = req.body;
  const result = db.prepare(
    'INSERT INTO incendios (fechaHoraDia, estado, nivelGravedad, ubicacion) VALUES (?, ?, ?, ?)'
  ).run(fechaHoraDia, estado, nivelGravedad, ubicacion);
  res.status(201).json({ id: result.lastInsertRowid, fechaHoraDia, estado, nivelGravedad, ubicacion });
});

// PUT /incendios/:id
app.put('/incendios/:id', (req, res) => {
  const { fechaHoraDia, estado, nivelGravedad, ubicacion } = req.body;
  const info = db.prepare(
    'UPDATE incendios SET fechaHoraDia=?, estado=?, nivelGravedad=?, ubicacion=? WHERE id=?'
  ).run(fechaHoraDia, estado, nivelGravedad, ubicacion, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Incendio no encontrado' });
  res.json({ mensaje: 'Incendio actualizado' });
});

// DELETE /incendios/:id
app.delete('/incendios/:id', (req, res) => {
  const info = db.prepare('DELETE FROM incendios WHERE id=?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Incendio no encontrado' });
  res.json({ mensaje: 'Incendio eliminado' });
});

app.listen(3000, () => {
  console.log('API corriendo en http://localhost:3000/incendios');
});