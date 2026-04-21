# Análisis de Impacto – Cambio de Requerimientos 

## 1. Cambio solicitado 
* Cambio funcional:
El sistema debe registrar un log auditable e inmutable de cada alerta emitida, con timestamp exacto y el estado de todos los servicios al momento de la alerta, para ser presentado ante investigaciones judiciales.
* Cambio no funcional:
Los eventos de alerta deben llegar a todos los receptores en orden cronológico estricto y sin duplicados, con latencia máxima de 500ms entre emisión y recepción.
* Tensión arquitectónica: 
Event-driven distribuido no garantiza entrega ordenada ni exactly-once sin infraestructura adicional compleja. La exigencia de auditoría judicial y orden estricto con baja latencia simultáneamente es incompatible con un modelo puramente reactivo.

## 2. Nuevas historias de usuario 
### US-13: Registro en tiempo real 
Como Bombero, \
quiero guardar un registro en tiempo real sobre la alerta de incendio emergente, \
para poder defenderme en caso de ser demandado.

**Criterios de aceptación:** 

- CA1: Registro del incendio \
Dado que el usuario quiere guardar un registro preciso cuando se alerta un incendio, cuando se hace una alerta de un incendio respectivo la app crea un registro en una base de datos y una sección pública llamada "Registros de incendio activos" donde se almacena la dirección/coordenadas, el tiempo cuando se envia la alerta (HH:MM:SS) y todos los servicios públicos disponibles al ser activo, entonces en caso de hacer investigaciones judiciales     
- CA2: Alertas del registro \
Dado que se solicita cuando se envía la alerta deben llegar a todos los receptores en orden cronológico estricto y sin duplicados, con latencia máxima de 500ms entre emisión y recepción, cuando se envía la alerta de incendio esta envía una notificación de la creación del registro de incendio activo a cada bombero activo en la app, por orden de ID, en caso de recibir la notificación despúes de los 500ms se envía un log de error a la base de datos con la latencia con la cuál fue enviada la notificación y la ID del bombero, entonces en caso de que un Bombero no haya recibido la notificación a tiempo se puede analizar la latencia con la que le fue enviado el registro para evitar malentendidos.
