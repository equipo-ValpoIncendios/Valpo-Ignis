# Arquitectura — Valpo Ignis

---

## Estilo Adoptado: Event-Driven (Orientado a Eventos)

### Justificación basada en REF priorizados:

| REF ID | Prioridad | Descripción | Cómo aborda el estilo |
| --- | --- | --- | --- |
| REF-01 | Alta | El sistema debe generar y propagar una alerta de incendio a los usuarios del área afectada en menos de 3 segundos desde su publicación. | La arquitectura Event-Driven permite que los eventos se publiquen y distribuyan de forma asíncrona a todos los consumidores suscritos de manera simultánea, sin depender de llamadas síncronas que introduzcan latencia. |
| REF-02 | Alta | El módulo de Localizador de Rescate debe permanecer operativo en todo momento, incluso si otros módulos de la app fallan. | El desacoplamiento entre productores y consumidores de eventos garantiza que el Localizador de Rescate opere de forma independiente: si otro módulo falla, este consumidor sigue procesando sus eventos sin verse interrumpido. |
| REF-04 | Alta | Las señales de rescate emitidas sin conexión deben encolarse y enviarse automáticamente al recuperar la conectividad. | El Bus de Eventos (Broker) actúa como cola persistente: los eventos generados offline se almacenan localmente y se propagan al Broker central en cuanto se restablece la conexión, sin pérdida de datos críticos. |

---

### Explicación textual:

Se eligió arquitectura **Event-Driven** porque la naturaleza del sistema es reactiva por definición: un incendio activo genera una cadena de eventos (publicación → alerta → respuesta → cierre) que deben propagarse de forma asíncrona y simultánea a múltiples actores —ciudadanos, bomberos, SENAPRED— sin que ninguno bloquee a los demás.

El sistema se estructura en torno a tres roles: **Productores** (App Víctimas y App Servicio Público publican eventos según evoluciona el incendio), un **Bus de Eventos** (que agrega y enruta cada cambio entre las dos versiones de la aplicación) y **Consumidores** (los módulos de alerta, rutas de evacuación y localizador de rescate que reaccionan a los eventos).

Al elegir Event-Driven se asume mayor complejidad en la gestión de la cola de eventos y en el manejo de estados inconsistentes si el broker falla. Este costo se acepta porque la propagación en tiempo real de alertas críticas (REF-01) y la operabilidad del Localizador de Rescate incluso en modo offline (REF-03, REF-04) son más importantes que la simplicidad operacional, la cual se mitiga con SQLite como almacenamiento local para encolar eventos sin conectividad.

**Conexiones:** React Native (Front-End) → Bus de Eventos (Broker) → Módulos Consumidores → API MDN Geolocalización / API Meteorológica externa → SQLite (Base de Datos local)

---

## Descomposición Modular

**Fundamentación:** Descomposición por dominio funcional, agrupando responsabilidades según los dos perfiles de usuario principales (víctimas y servicios públicos) y las funciones críticas del sistema identificadas en el análisis de requerimientos.

| Módulo 1 | Alertas y Mapa de Incendio |
| --- | --- |
| **Responsabilidad** | Recibir reportes de incendio de los usuarios, calcular la zona afectada en forma radial y propagar la alerta en tiempo real a todos los usuarios del área. |
| **Datos que maneja** | Ubicación GPS del reporte, intensidad del incendio, datos de viento (API meteorológica), zona radial afectada y timestamp del evento. |
| **Ofrece a otros módulos** | Zona de incendio activa y su intensidad como evento para el cálculo de rutas y para el Localizador de Rescate. |
| **Depende de** | Módulo de Geolocalización (para obtener coordenadas del reporte), Módulo de Notificaciones (para difundir la alerta a los usuarios del área). |

| Módulo 2 | Rutas de Evacuación |
| --- | --- |
| **Responsabilidad** | Calcular rutas de evacuación seguras considerando el terreno, la posición del incendio, la dirección del viento y las zonas seguras disponibles. |
| **Datos que maneja** | Mapa de terreno, zona de incendio activa, datos meteorológicos (viento), ubicación del usuario y zonas seguras predefinidas. |
| **Ofrece a otros módulos** | Ruta de evacuación recomendada visualizable en el mapa del usuario. |
| **Depende de** | Módulo de Alertas y Mapa de Incendio (para recibir la zona activa), Módulo de Geolocalización (para la posición actual del usuario), API meteorológica externa (para datos de viento en tiempo real). |

| Módulo 3 | Localizador de Rescate |
| --- | --- |
| **Responsabilidad** | Activar un modo de alerta para usuarios sin ruta de escape disponible, emitir señal de ubicación continua para facilitar su rescate por parte de los servicios públicos. |
| **Datos que maneja** | Ubicación GPS en tiempo real del usuario en peligro, estado de conectividad y cola de señales offline pendientes. |
| **Ofrece a otros módulos** | Posición de víctimas activas al Módulo de Guía Logística para que los servicios de rescate las visualicen. |
| **Depende de** | Módulo de Geolocalización (ubicación en tiempo real), Bus de Eventos (para encolar señales offline según REF-04). Este módulo debe operar de forma autónoma incluso si otros módulos fallan (REF-02). |

| Módulo 4 | Guía Logística (Servicios Públicos) |
| --- | --- |
| **Responsabilidad** | Proveer a bomberos, rescatistas y SENAPRED una vista consolidada del incendio activo: ubicación de víctimas, reportes de desaparecidos, gestión de falsos reportes, aviso de cortes de energía e informes de evacuados/fallecidos. |
| **Datos que maneja** | Ubicaciones de víctimas activas (Localizador de Rescate), reportes de ciudadanos, lista de desaparecidos y evacuados, estado de cortes de energía y datos para búsqueda de perpetradores. |
| **Ofrece a otros módulos** | Validación de reportes (filtro de falsos positivos) al módulo de Alertas y retroalimentación de estado del incendio al Bus de Eventos. |
| **Depende de** | Módulo de Alertas y Mapa de Incendio (estado del incendio), Módulo de Localizador de Rescate (posición de víctimas), Módulo de Notificaciones (avisos a ciudadanos sobre cortes de energía). |

| Módulo 5 | Geolocalización |
| --- | --- |
| **Responsabilidad** | Obtener y gestionar la ubicación GPS en tiempo real de todos los usuarios de la aplicación, con consentimiento explícito conforme a la Ley 19.628. |
| **Datos que maneja** | Coordenadas GPS del dispositivo, estado del permiso de localización y frecuencia de actualización de posición. |
| **Ofrece a otros módulos** | Posición en tiempo real a todos los módulos que la requieran (Alertas, Rutas, Localizador). |
| **Depende de** | API MDN de Geolocalización del dispositivo (REF-05). Compatible con Android 10+ e iOS 14+ (REF-06). |

| Módulo 6 | Notificaciones |
| --- | --- |
| **Responsabilidad** | Difundir alertas críticas a los usuarios del área afectada en menos de 3 segundos desde la publicación del evento (REF-01). |
| **Datos que maneja** | Tokens de dispositivo, área geográfica objetivo, cola de mensajes push y notificaciones locales para modo offline. |
| **Ofrece a otros módulos** | Servicio de mensajería inmediata para alertas de incendio, rutas actualizadas y avisos logísticos. |
| **Depende de** | Bus de Eventos (recibe los eventos a notificar), Módulo de Alertas (disparador principal de notificaciones masivas). |

---

### Conexiones Principales entre Módulos:

- **Módulo de Alertas → Bus de Eventos → Módulo de Notificaciones:** Cuando se publica un incendio, el evento se propaga al broker y este dispara las notificaciones push masivas al área afectada en tiempo real.
- **Módulo de Alertas → Módulo de Rutas de Evacuación:** La zona de incendio activa y datos de viento son consumidos por el módulo de rutas para calcular el camino seguro.
- **Módulo de Geolocalización → Módulo de Localizador de Rescate:** La posición GPS continua del usuario en peligro alimenta la señal de rescate que consumen los servicios públicos.
- **Módulo de Localizador de Rescate → Módulo de Guía Logística:** Las posiciones de víctimas activas se publican como eventos para que bomberos y rescatistas las visualicen en tiempo real.
- **Módulo de Guía Logística → Bus de Eventos:** Los servicios públicos publican actualizaciones del estado del incendio (control, cierre) que desencadenan el fin de alertas para los ciudadanos.
- **Módulo de Notificaciones → Módulo de Guía Logística:** Envía avisos de cortes de energía y actualizaciones logísticas relevantes para los servicios públicos.

---
## Modelo de Dominio

El siguiente diagrama de clases UML describe el modelo de dominio del sistema, mostrando las entidades principales, sus atributos, relaciones y paquetes funcionales.
![Modelo de Dominio UML - Valpo Ignis](assets/modelo_de_dominio1.png)
![Modelo de Dominio UML - Valpo Ignis](assets/modelo_de_dominio2.png)
## Decisiones de Diseño

### Decisión 1: Estilo Arquitectónico Event-Driven

- **Decisión:** Adoptar arquitectura orientada a eventos como estilo principal del sistema.
- **Motivación:** La naturaleza reactiva del dominio (un incendio activo genera cadenas de eventos que deben propagarse simultáneamente a múltiples actores) hace que Event-Driven sea el estilo más natural. Permite cumplir REF-01 (propagación de alerta en < 3 segundos) y REF-02 (Localizador de Rescate operativo aunque otros módulos fallen) gracias al desacoplamiento entre productores y consumidores.
- **Alternativas consideradas:** Cliente-Servidor (menor complejidad, pero las llamadas síncronas introducen latencia inaceptable para alertas de emergencia); Microservicios (mayor escalabilidad, pero complejidad operacional excesiva para el equipo actual y el alcance del proyecto).
- **Impacto:** Todos los módulos se comunican a través del Bus de Eventos; ningún módulo llama directamente a otro, lo que garantiza resiliencia y operación parcial ante fallos individuales.

### Decisión 2: Trade-off — Operación Offline vs. Consistencia en Tiempo Real

- **Decisión:** Soportar modo degradado offline (mapa cacheado + Localizador de Rescate activo con cola de eventos) cubriendo las funciones más críticas para la supervivencia, aceptando que otras funciones como el cálculo completo de rutas requieran conectividad.
- **Motivación:** REF-03 y REF-04 exigen que el sistema sea útil incluso sin internet, ya que durante incendios la infraestructura de red puede verse afectada. La vida de los usuarios depende de que el localizador emita señales aunque no haya conexión.
- **Alternativas consideradas:** Operación completamente online (más simple, pero inaceptable para un sistema de emergencias); sincronización completa offline (mayor complejidad de resolución de conflictos para todos los datos del mapa).
- **Impacto:** Se usa SQLite como almacenamiento local para cachear el mapa y encolar señales de rescate offline. Mejora la resiliencia en emergencias reales a costa de mayor complejidad en la lógica de sincronización.

### Decisión 3: Stack Tecnológico

- **Decisión:** React Native como frontend, API MDN de Geolocalización como fuente de ubicación, API meteorológica externa para datos de viento, y SQLite como base de datos local.
- **Motivación:** React Native cumple con REF-06 (compatibilidad Android 10+ e iOS 14+) y permite usar JavaScript, tecnología conocida por el equipo. La API MDN de Geolocalización es nativa al ecosistema web/móvil y compatible con JavaScript (REF-05). SQLite es adecuado para el alcance local del proyecto (Valparaíso) y permite operación offline (REF-03). La API meteorológica externa es necesaria para datos de viento requeridos en el cálculo de zonas seguras (REF-07).
- **Alternativas consideradas:** Flutter (multiplataforma pero curva de aprendizaje mayor para el equipo); Firebase Realtime Database (facilita el broker de eventos pero introduce dependencia de un servicio de pago externo).
- **Impacto:** El equipo puede desarrollar con una sola base de código para iOS y Android; la integración con APIs externas introduce dependencia de terceros para funciones críticas de cálculo de zonas seguras.

### Decisión 4: Requisitos Arquitectónicamente Significativos (ASR)

- **ASR 1 (REF-01):** El sistema debe generar y propagar una alerta de incendio a los usuarios del área afectada en menos de 3 segundos desde su publicación.
  Abordado mediante el Bus de Eventos que distribuye la alerta de forma asíncrona a todos los consumidores suscritos sin cuellos de botella síncronos.

- **ASR 2 (REF-02):** El Localizador de Rescate debe permanecer operativo incluso si otros módulos de la app fallan.
  Abordado mediante el desacoplamiento total entre módulos en la arquitectura Event-Driven: el Localizador de Rescate es un consumidor independiente que no depende de la disponibilidad de otros módulos.

- **ASR 3 (REF-03 + REF-04):** El sistema debe funcionar en modo degradado sin conexión a internet, y las señales de rescate emitidas offline deben encolarse y enviarse al recuperar conectividad.
  Abordado mediante SQLite como almacenamiento local para cachear datos críticos y encolar eventos offline, con sincronización automática al recuperar conexión.

- **ASR 4 (REF-10):** La recolección de datos de geolocalización debe contar con consentimiento explícito del usuario, conforme a la Ley 19.628 de Protección de la Vida Privada (Chile).
  Abordado mediante flujo obligatorio de solicitud de permisos en el Módulo de Geolocalización antes de activar cualquier función que use coordenadas GPS.
