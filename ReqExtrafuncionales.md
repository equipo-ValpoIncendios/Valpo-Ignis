# Catálogo de Requisitos Extrafuncionales

Clasificación según ISO 25010 y tipo de restricción. La columna Prioridad refleja la importancia para las decisiones de arquitectura: Alta, Media o Baja.

| ID | Tipo | Prioridad | Descripción |
|----|------|:---------:|-------------|
| REF-01 | Calidad de servicio (Rendimiento) | Alta | El sistema debe generar y propagar una alerta de incendio a los usuarios del área afectada en menos de 3 segundos desde su publicación. |
| REF-02 | Calidad de servicio (Disponibilidad) | Alta | El módulo de Localizador de Rescate debe permanecer operativo en todo momento, incluso si otros módulos de la app fallan. |
| REF-03 | Calidad de servicio (Disponibilidad) | Alta | El sistema debe funcionar en modo degradado (mapa cacheado y localizador activo) cuando no haya conexión a internet. |
| REF-04 | Calidad de servicio (Confiabilidad) | Alta | Las señales de rescate emitidas sin conexión deben encolarse y enviarse automáticamente al recuperar la conectividad. |
| REF-05 | Restricción técnica | Alta | El sistema debe obtener, con permisos del usuario, su ubicación GPS en tiempo real mediante la API MDN de Geolocalización. |
| REF-06 | Restricción técnica | Alta | La aplicación debe ser compatible con Android 10 o superior e iOS 14 o superior, desarrollada en React Native. |
| REF-07 | Restricción técnica | Alta | El sistema debe integrarse con una API meteorológica externa para obtener datos de viento usados en el cálculo de zonas seguras. |
| REF-08 | Calidad de servicio (Rendimiento) | Media | El cálculo de zona segura y ruta de evacuación debe completarse en menos de 5 segundos desde que se registra una alerta. |
| REF-09 | Otros no funcionales (Usabilidad) | Media | Un ciudadano sin experiencia técnica debe poder reportar un incendio y visualizar su ruta de evacuación en menos de 3 minutos. |
| REF-10 | Otros no funcionales (Legal) | Alta | La recolección de datos de geolocalización debe contar con el consentimiento explícito del usuario, conforme a la Ley 19.628 de Protección de la Vida Privada (Chile). |
