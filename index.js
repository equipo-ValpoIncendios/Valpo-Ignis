const express      = require('express');
const db           = require('./db');
const swaggerUi    = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Incendios', version: '1.0.0',
            description: 'API para gestionar informes de incendios activos' }
  },
  apis: ['./index.js']
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /incendios:
 *   get:
 *     summary: Lista todos los incendios
 *     responses:
 *       200:
 *         description: Array de incendios
 */
app.get('/incendios', (req, res) => {
  res.json(db.prepare('SELECT * FROM incendios').all());
});

/**
 * @swagger
 * /incendios:
 *   post:
 *     summary: Crea un nuevo incendio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaHora:      { type: string, format: date-time }
 *               estado:         { type: string }
 *               nivelGravedad:  { type: string }
 *               ubicacion:      { type: string }
 *     responses:
 *       201:
 *         description: Incendio creado
 */
app.post('/incendios', (req, res) => {
  const { fechaHora, estado, nivelGravedad, ubicacion } = req.body;
  const r = db.prepare(
    'INSERT INTO incendios (fechaHora, estado, nivelGravedad, ubicacion) VALUES (?, ?, ?, ?)'
  ).run(fechaHora, estado, nivelGravedad, ubicacion);
  res.status(201).json({ id: r.lastInsertRowid, fechaHora, estado, nivelGravedad, ubicacion });
});

/**
 * @swagger
 * /incendios/{id}:
 *   put:
 *     summary: Modifica un incendio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaHora:      { type: string, format: date-time }
 *               estado:         { type: string }
 *               nivelGravedad:  { type: string }
 *               ubicacion:      { type: string }
 *     responses:
 *       200:
 *         description: Incendio actualizado
 *       404:
 *         description: No encontrado
 */
app.put('/incendios/:id', (req, res) => {
  const { fechaHora, estado, nivelGravedad, ubicacion } = req.body;
  const i = db.prepare(
    'UPDATE incendios SET fechaHora=?, estado=?, nivelGravedad=?, ubicacion=? WHERE id=?'
  ).run(fechaHora, estado, nivelGravedad, ubicacion, req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Incendio no encontrado' });
  res.json({ mensaje: 'Incendio actualizado' });
});

/**
 * @swagger
 * /incendios/{id}:
 *   delete:
 *     summary: Elimina un incendio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Incendio eliminado
 *       404:
 *         description: No encontrado
 */
app.delete('/incendios/:id', (req, res) => {
  const i = db.prepare('DELETE FROM incendios WHERE id=?').run(req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Incendio no encontrado' });
  res.json({ mensaje: 'Incendio eliminado' });
});

app.listen(3000, () => console.log('API en http://localhost:3000/incendios'));