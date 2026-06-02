<img width="869" height="753" alt="MODELODOMINIO drawio" src="https://github.com/user-attachments/assets/6d51f6af-d1a3-42e2-b02c-ece5cd1c4271" />

## Entidades y sus atributos

| Entidad | Atributos |
|---|---|
| ReporteDeIncendio | id, fechaHora, descripcion, coordenadas, esFalso |
| Incendio | id, fechaInicio, estado, nivelAlerta, hectareasAfect |
| AreaGeografica | id, nombre, tipo, coordenadas |
| SolicitudDeEmergencia | id, ubicacion, fechaHora, estado, descripcion |
| Victima | id, nombre, estado, ubicacion, contacto |
| ServicioPublico | id, nombre, tipo (Bombero / Rescatista / SENAPRED), contacto |
| Perpetrador | id, nombre, descripcion, estado |
| RutaDeEvacuacion | id, trazado, estado, modo |
| ZonaSegura | id, nombre, coordenadas, capacidad |
| Fallecido | id, nombre, ubicacion, fechaHallazgo |
| CorteDEnergia | id, fechaInicio, fechaFin, zona, tipo |

## Relaciones

| Relaciones |
|---|
| ReporteDeIncendio 1 ——< N Incendio |
| Incendio 1 ——< N SolicitudDeEmergencia |
| Incendio 1 ——< N Victima |
| Incendio N >—— 1 AreaGeografica |
| AreaGeografica 1 ——< N ServicioPublico |
| SolicitudDeEmergencia 1 >—— N Perpetrador |
| Victima 1 ——< N RutaDeEvacuacion |
| RutaDeEvacuacion N >—— 1 ZonaSegura |
| Perpetrador 1 ——< N Fallecido |
| RutaDeEvacuacion 1 ——< N CorteDEnergia |
