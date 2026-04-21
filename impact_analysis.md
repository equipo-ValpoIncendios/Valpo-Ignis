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

## 3. Impacto en requisitos extrafuncionales
Indicar si el cambio altera la prioridad de algún REF o introduce nuevos.  
Trazar cambios de prioridad que motiven cambios en decisiones de arquitectura.

### Cambio funcional — Log auditable e inmutable de alertas

> El sistema debe registrar un log auditable e inmutable de cada alerta emitida, con timestamp exacto y el estado de todos los servicios al momento de la alerta, para ser presentado ante investigaciones judiciales.

| REF ID | Descripción | Prioridad anterior | Prioridad nueva | Cambio / Motivo |
|--------|-------------|--------------------|-----------------|-----------------|
| REF-01 | Disponibilidad del sistema ≥ 99.9 % | Alta | Alta | Sin cambio en nivel, pero el subsistema de almacenamiento de logs pasa a ser componente crítico. Requiere replicación síncrona del almacén de auditoría. |
| REF-02 | Seguridad e integridad de datos (cifrado en tránsito y en reposo; control de acceso por rol) | Alta | Alta | Sin cambio en nivel. Se amplía el alcance: el log judicial exige firma digital (no-repudio) y control de acceso de solo lectura para auditores. |
| REF-03 | Tolerancia a fallos y recuperación (failover automático; RPO definido) | Alta | Alta | Sin cambio en nivel. Se refuerza el RPO: el log inmutable no puede perderse ante fallo. |
| REF-07 | Trazabilidad e inmutabilidad de logs — registro append-only con timestamp exacto y snapshot del estado de servicios por alerta, apto para uso judicial | — | Crítica | Nuevo REF derivado del cambio funcional. Exige almacenamiento append-only, firma criptográfica y política de retención legal definida. |

---

### Cambio no funcional — Entrega cronológica sin duplicados ≤ 500 ms

> Los eventos de alerta deben llegar a todos los receptores en orden cronológico estricto y sin duplicados, con latencia máxima de 500 ms entre emisión y recepción.

| REF ID | Descripción | Prioridad anterior | Prioridad nueva | Cambio / Motivo |
|--------|-------------|--------------------|-----------------|-----------------|
| REF-01 | Disponibilidad del sistema ≥ 99.9 % | Alta | Alta | Sin cambio. La latencia garantizada eleva la exigencia de uptime del broker de mensajería. |
| REF-04 | Escalabilidad horizontal — soporte de incremento de receptores y volumen de alertas sin degradación | Media | Alta | El cambio lo hace crítico. Mantener orden cronológico y latencia ≤ 500 ms a escala requiere particionado cuidadoso en el broker (e.g. FIFO por zona). |
| REF-05 | Mantenibilidad y observabilidad — métricas, trazas y dashboards operacionales | Media | Media | Sin cambio en nivel. Se agrega obligatoriedad de instrumentar latencia de extremo a extremo (p99) para verificar cumplimiento del SLA. |
| REF-08 | Latencia de entrega ≤ 500 ms desde emisión hasta recepción en todos los receptores | — | Crítica | Nuevo REF derivado del cambio no funcional. Define SLA estricto. Requiere revisión de infraestructura de mensajería y monitoreo continuo. |
| REF-09 | Orden cronológico estricto y entrega sin duplicados entre emisión y recepción | — | Crítica | Nuevo REF derivado del cambio no funcional. Impacta arquitectura del broker (FIFO garantizado, deduplicación idempotente). |
