const express      = require('express');
const db           = require('./db');
const swaggerUi    = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();

app.use(express.json());

// Front End de Swagger 
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Incendios', version: '1.0.0',
            description: 'API para gestionar reportes de incendios' }
  },
  apis: ['./index.js']
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// GET /incendios
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


// POST /incendios
/**
 * @swagger
 * /incendios:
 *   post:
 *     summary: Crea un nuevo reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_hora_reporte:        { type: string, format: date-time }
 *               direccion_aproximada:      { type: string }
 *               nivel_complejidad:         { type: integer }
 *               estado_reporte:            { type: string }
 *               nombre_usuario_reportante: { type: string }
 *     responses:
 *       201:
 *         description: Reporte creado
 */
app.post('/incendios', (req, res) => {
  const { fecha_hora_reporte, direccion_aproximada, nivel_complejidad, estado_reporte,nombre_usuario_reportante } = req.body;
  const r = db.prepare(
    'INSERT INTO incendios (fecha_hora_reporte, direccion_aproximada, nivel_complejidad, estado_reporte, nombre_usuario_reportante) VALUES (?, ?, ?, ?, ?)'
  ).run(fecha_hora_reporte, direccion_aproximada, nivel_complejidad, estado_reporte, nombre_usuario_reportante);
  res.status(201).json({ id: r.lastInsertRowid, fecha_hora_reporte, direccion_aproximada, nivel_complejidad, estado_reporte, nombre_usuario_reportante });
});


// PUT /incendios/:id
/**
 * @swagger
 * /incendios/{id}:
 *   put:
 *     summary: Modificacion de reporte
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
 *               fecha_hora_reporte:        { type: string, format: date-time }
 *               direccion_aproximada:      { type: string }
 *               nivel_complejidad:         { type: integer }
 *               estado_reporte:            { type: string }
 *               nombre_usuario_reportante: { type: string }
 *     responses:
 *       200:
 *         description: Incendio actualizado
 *       404:
 *         description: Reporte no encontrado
 */
app.put('/incendios/:id', (req, res) => {
  const { fecha_hora_reporte, direccion_aproximada, nivel_complejidad, estado_reporte, nombre_usuario_reportante } = req.body;
  const i = db.prepare(
    'UPDATE incendios SET fecha_hora_reporte=?, direccion_aproximada=?, nivel_complejidad=?. estado_reporte, nombre_usuario_reportante, WHERE id=?'
  ).run(fecha_hora_reporte, direccion_aproximada, nivel_complejidad, estado_reporte, nombre_usuario_reportante, req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Reporte no encontrado' });
  res.json({ mensaje: 'Reporte actualizado' });
});


// DELETE /incendios/:id
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
 *         description: Reporte eliminado
 *       404:
 *         description: Reporte no encontrado
 */
app.delete('/incendios/:id', (req, res) => {
  const i = db.prepare('DELETE FROM incendios WHERE id=?').run(req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Reporte no encontrado' });
  res.json({ mensaje: 'Reporte eliminado' });
});

app.listen(3000, () => console.log('API en http://localhost:3000/incendios'));