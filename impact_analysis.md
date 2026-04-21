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

## 4. Impacto en entidades del dominio 

### Entidades afectadas por US-13 y los nuevos REFs

---

### 🔥 Alerta de Incendio

**Cambio:** Pasa de ser un evento efímero del bus a convertirse en una entidad persistente con trazabilidad judicial.

| Atributo nuevo / modificado | Descripción |
|-----------------------------|-------------|
| `timestamp_emision` | Hora exacta (HH:MM:SS) en que se emitió la alerta. Requerido por CA1. |
| `coordenadas` / `direccion` | Ya existía, pero ahora es parte del registro inmutable. |
| `snapshot_servicios` | Nuevo atributo: estado de todos los servicios públicos activos al momento de la alerta. |
| `firma_digital` | Nuevo atributo: firma criptográfica del registro para garantizar no-repudio (REF-07). |
| `estado_log` | Indica si el registro fue correctamente almacenado en el almacén append-only. |

**Impacto arquitectónico:** La entidad ahora debe persistirse de forma síncrona y replicada antes de propagarse al bus de eventos, para garantizar que el log judicial nunca se pierda (REF-03, REF-07).

---

### 🚒 Bombero / Servicio Público

**Cambio:** Adquiere un nuevo rol como **receptor auditado** de alertas, no solo como consumidor de eventos.

| Atributo nuevo / modificado | Descripción |
|-----------------------------|-------------|
| `id_bombero` | Ya existía. Ahora se usa como clave de trazabilidad en los logs de latencia (CA2). |
| `timestamp_recepcion` | Nuevo atributo: hora exacta en que el bombero recibió la notificación de alerta. |
| `latencia_ms` | Nuevo atributo: diferencia entre `timestamp_emision` y `timestamp_recepcion`, registrada por notificación. |
| `estado_notificacion` | Nuevo atributo: `OK` si llegó dentro de 500ms, `ERROR` si superó el límite (REF-08, REF-11). |

**Impacto arquitectónico:** Cada instancia de recepción de alerta por un bombero genera un sub-registro en la base de datos. Si la latencia supera 500ms, se persiste un log de error vinculado al `id_bombero` y al registro del incendio (REF-11).

---

### 📋 Registro de Incendio Activo

**Cambio:** Entidad **completamente nueva** introducida por US-13 (CA1). Materializa el log auditable como una entidad de dominio de primera clase.

| Atributo | Descripción |
|----------|-------------|
| `id_registro` | Identificador único del registro. |
| `id_alerta` | Referencia a la alerta de incendio que lo originó. |
| `timestamp_alerta` | Hora exacta de emisión (HH:MM:SS). |
| `coordenadas` / `direccion` | Ubicación del incendio al momento de la alerta. |
| `servicios_disponibles` | Snapshot de los servicios públicos activos en ese momento. |
| `visibilidad` | `público` — visible en la sección "Registros de incendio activos". |
| `inmutable` | El registro no puede ser modificado ni eliminado una vez creado (append-only, REF-07). |
| `firma_digital` | Garantiza integridad para uso judicial. |

**Relaciones:**
- Un `Registro de Incendio Activo` se genera a partir de una `Alerta de Incendio`.
- Un `Registro de Incendio Activo` está asociado a uno o más `LogNotificacionBombero`.

---

### 📡 Log de Notificación por Bombero

**Cambio:** Entidad **nueva** introducida por US-13 (CA2). Registra el comportamiento de entrega de cada notificación.

| Atributo | Descripción |
|----------|-------------|
| `id_log` | Identificador único del log. |
| `id_registro` | Referencia al `Registro de Incendio Activo` asociado. |
| `id_bombero` | Referencia al bombero que debía recibir la notificación. |
| `timestamp_emision` | Hora de envío de la notificación. |
| `timestamp_recepcion` | Hora en que el bombero recibió la notificación. |
| `latencia_ms` | Latencia calculada en milisegundos. |
| `tipo` | `OK` si latencia ≤ 500ms / `ERROR` si latencia > 500ms (REF-08, REF-11). |

**Relaciones:**
- Un `Registro de Incendio Activo` genera N `LogNotificacionBombero`, uno por cada bombero activo al momento de la alerta.
- Los registros de tipo `ERROR` son accesibles para auditoría operacional (REF-05).

---

### 🧑 Usuario / Víctima

**Cambio:** No se agregan atributos nuevos, pero la entidad se ve **indirectamente afectada**.

| Aspecto | Descripción |
|---------|-------------|
| Orden de recepción | Las alertas ahora llegan en orden cronológico estricto y sin duplicados (REF-09), mejorando la confiabilidad de la información que recibe. |
| Latencia garantizada | El SLA de 500ms (REF-08) beneficia también a los usuarios, aunque el foco de auditoría es el canal de bomberos. |

---

### Resumen de relaciones nuevas

```
Alerta de Incendio
    └── genera ──▶ Registro de Incendio Activo
                        └── genera (1..N) ──▶ Log de Notificación por Bombero
                                                    └── vinculado a ──▶ Bombero
```

## 5. Impacto en mockups 
### Mockups afectados:
El mockup afectado por los cambios es [este](https://www.figma.com/make/L7kJczFfb03QMJUuH8S2vK/Fire-Alert-App?p=f&t=Gcc1H9smyc8RL5ly-0&fullscreen=1) 
donde se agregan los siguientes cambios:
* Se añade una nueva sección pública "Registros de incendio activos" con una lista de tarjetas que muestran dirección, hora de alerta (HH:MM:SS) y servicios públicos disponibles.
* Se añade una pantalla de notificación push que aparece al bombero al momento de crearse un registro, mostrando el ID del incendio, la hora de recepción y un indicador de estado según si llegó dentro del límite de 500ms.


## 6. Impacto en arquitectura 
* ¿Cambia el estilo arquitectónico? Sí, se cambia de Event-Driven al modelo de **3 Capas**
* Justificación: El modelo event driven no es compatible con estos cambios, debido a que _"Event-driven distribuido no garantiza entrega ordenada ni exactly-once sin infraestructura adicional compleja. La exigencia de auditoría judicial y orden estricto con baja latencia simultáneamente es incompatible con un modelo puramente reactivo."_, por esto se hace el cambio al modelo de 3 Capas el cuál se adapta mejor al uso de Front-End <-> Back-End <-> Base de Datos. \
Así cuando se necesita crear registros de los incendios activos en tiempo real, cuando se utiliza el botón de la alerta de incendios vía el codigo de la aplicación se registra a una BD para poder almacenar los registros de los incendios por los requirimentos hecho por el cambio funcional.    

## 7. Impacto en módulos 
| Módulo                          | Tipo de impacto | Responsabilidad actualizada                                                                                                                                      | Ofrece a otros (actualizado)                                                                                  |
|---------------------------------|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| Alertas en Tiempo Real          | modificado      | Además de propagar alertas al bus de eventos, debe persistir un `Registro de Incendio Activo` de forma síncrona antes de publicar el evento, garantizando el log inmutable (REF-07). | Evento de alerta publicado al bus; referencia al `id_registro` creado, disponible para los demás módulos.     |
| Guía Logística                  | modificado      | Incorpora la sección pública "Registros de incendio activos", mostrando tarjetas con dirección, `timestamp_alerta` y snapshot de servicios disponibles (US-13 CA1). | Vista de registros históricos y activos consultable por Bomberos, SENAPRED y auditores.| | Localizador de Rescate          | sin cambio      | Mantiene su responsabilidad de emitir señales de rescate y operar en modo offline.                                                                               | Señales de rescate encoladas; estado del localizador al bus de eventos.                                       |
| Notificaciones Push             | modificado      | Debe entregar alertas a bomberos en orden cronológico estricto, sin duplicados y con latencia ≤ 500ms (REF-08, REF-09). Registra `timestamp_recepcion` por cada entrega. | Confirmación de recepción con latencia medida hacia el módulo de Auditoría de Latencia.                       |
| Auditoría de Latencia           | nuevo           | Recibe las confirmaciones de entrega del módulo de Notificaciones Push, calcula la latencia por bombero y persiste un `LogNotificacionBombero`. Si latencia > 500ms, genera un log de error (REF-11). | Logs de error y registros de latencia consultables por el módulo de Guía Logística y auditores externos.      |
| Almacén de Logs (Append-Only)   | nuevo           | Persiste de forma inmutable todos los `Registro de Incendio Activo` y `LogNotificacionBombero`. Aplica firma digital para garantizar no-repudio (REF-07). Gestiona política de retención legal. | API de solo lectura para auditores judiciales y el módulo de Guía Logística; no permite operaciones de update ni delete. |
| Rutas de Evacuación             | sin cambio      | Mantiene su responsabilidad de calcular rutas según ubicación, terreno y zona de incendio.                                                                       | Ruta calculada con zona segura hacia la interfaz de Usuario/Víctima.                                          |
| Interfaz Servicio Público       | modificado      | Agrega pantalla de notificación push que muestra al bombero el `id_registro`, `timestamp_recepcion` e indicador de estado OK/ERROR según el límite de 500ms (US-13 CA2). | Confirmación de lectura de notificación hacia el módulo de Notificaciones Push.                               |

## 8. Nuevas decisiones de diseño 
### Decisión: Adoptar una arquitectura de 3 capas (Presentación, Lógica de Negocio, Datos) como estructura base del sistema.
* Motivación: El aumento de prioridad de la mantenibilidad (REF-04 pasa a Alta) exige que los módulos de alertas, rutas de evacuación y guía logística puedan evolucionar de forma independiente. Una arquitectura sin separación clara de responsabilidades haría que cambios en, por ejemplo, el algoritmo de cálculo de rutas * impactaran directamente la interfaz o la persistencia. \
* Alternativas consideradas: Arquitectura monolítica en una sola capa (descartada por alto acoplamiento); arquitectura de microservicios (descartada por complejidad operacional excesiva para el alcance actual del proyecto). \
* Impacto: Afecta directamente los módulos de rutas de evacuación (US-02, US-13), alertas en tiempo real (US-01) y guía logística (US-11, US-12). Eleva REF-04 (mantenibilidad) a prioridad Alta y reduce REF-03 (testeabilidad) a prioridad Media al dejar de ser el atributo conductor.

## 9. Trazabilidad actualizada 
Trazabilidad — US-13: Registro en tiempo real

| Historia | REF relacionado | Módulo | Mockup |
|----------|-----------------|--------|--------|
| US-13 (CA1: Registro del incendio) | REF-01, REF-05, REF-10 | Alertas en Tiempo Real / Guía Logística | Se añade una nueva sección pública "Registros de incendio activos" con una lista de tarjetas que muestran dirección, hora de alerta (HH:MM:SS) y servicios públicos disponibles. |
| US-13 (CA2: Alertas del registro) | REF-01, REF-02, REF-04 | Alertas en Tiempo Real | Se añade una pantalla de notificación push que aparece al bombero al momento de crearse un registro, mostrando el ID del incendio, la hora de recepción y un indicador de estado según si llegó dentro del límite de 500ms. |

### Descripción de REFs relacionados

| REF | Descripción |
|-----|-------------|
| REF-01 | El sistema debe generar y propagar una alerta de incendio a los usuarios del área afectada en menos de 3 segundos desde su publicación. |
| REF-02 | El módulo de Localizador de Rescate debe permanecer operativo en todo momento, incluso si otros módulos de la app fallan. |
| REF-04 | Las señales de rescate emitidas sin conexión deben encolarse y enviarse automáticamente al recuperar la conectividad. |
| REF-05 | El sistema debe obtener, con permisos del usuario, su ubicación GPS en tiempo real mediante la API MDN de Geolocalización. |
| REF-10 | La recolección de datos de geolocalización debe contar con el consentimiento explícito del usuario, conforme a la Ley 19.628 de Protección de la Vida Privada (Chile). |
| REF-11 | El sistema debe registrar automáticamente en base de datos un log de error cuando una notificación supere los 500ms de latencia, incluyendo el ID del bombero y la latencia medida. |

## 10. Justificación global y trade-offs 
* La solución va de la mano con el proyecto inicial ya que al crear un sistema en momento real tanto para funcionarios de emergencia y usuarios da mayor flexibilidad y eficiencia al momento de actuar en una catástrofe, es mas que nada una actualización para que todo tenga respaldo y así por cualquier suceso desafortunado dentro de la emergencia se tenga registro de todo lo ocurrido.
* En parte también da un salvavidas en temas legales ya que con los registros se sabrá con claridad todo lo ocurrido y además con justificación de que fue en tiempo real y toda la información fue ejecutada al mismo tiempo y sin un mayor retraso.
* Los trade-offs son cambio de sistema a tres capas en vez de evento driven, cambio en los diseños para agregar nuevas opciones de funcionalidad, costo de producción y además de concentrar toda la lógica de cálculo de zonas seguras y rutas de evacuación exclusivamente en la capa de Lógica de Negocio, exponiéndola mediante una interfaz de servicio hacia la capa de Presentación. Los sacrificios son mínimos ya que mas haya de cambiar el sistema inicial se sigue llevando acabo el mismo propósito que es salvar de manera mas eficiente a las personas dentro de un incendio y alarmar a autoridades por el mismo.
* Los sacrificios son mínimos ya que mas haya de cambiar el sistema inicial se sigue llevando acabo el mismo propósito que es salvar de manera mas eficiente a las personas dentro de un incendio y alarmar a autoridades por el mismo.
