const express = require('express');
const db      = require('./db');
const app     = express();

app.use(express.json());

// GET /cursos
app.get('/incendios', (req, res) => {
  const incendios = db.prepare('SELECT * FROM incendios').all();
  res.json(incendios);
});

// POST /incendios
app.post('/incendios', (req, res) => {
  const { fechaHora, estado, nivelGravedad, ubicacion } = req.body;
  const result = db.prepare(
    'INSERT INTO incendios (fechaHora, estado, nivelGravedad, ubicacion) VALUES (?, ?, ?, ?)'
  ).run(fechaHora, estado, nivelGravedad, ubicacion);
  res.status(201).json({ id: result.lastInsertRowid, fechaHora, estado, nivelGravedad, ubicacion });
});

// PUT /incendios/:id
app.put('/incendios/:id', (req, res) => {
  const { fechaHora, estado, nivelGravedad, ubicacion } = req.body;
  const info = db.prepare(
    'UPDATE incendios SET fechaHora=?, estado=?, nivelGravedad=?, ubicacion=? WHERE id=?'
  ).run(fechaHora, estado, nivelGravedad, ubicacion, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Incendio no encontrado' });
  res.json({ mensaje: 'Incendio actualizado' });
});

// DELETE /incendios/:id
app.delete('/incendios/:id', (req, res) => {
  const info = db.prepare('DELETE FROM incendios WHERE id=?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Incendio no encontrado' });
  res.json({ mensaje: 'Incendio eliminado' });
});

app.listen(3000, () => { // Se coloca el nombre de la ruta en el mensaje para que sea más claro al iniciar el servidor
  console.log('API corriendo en http://localhost:3000/incendios');
});
