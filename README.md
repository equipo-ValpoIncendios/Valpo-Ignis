# Valpo Ignis

# Problemática:
Es de conocer general que la problematica número 1 durante incendios es la falta de información tanto para los servicios publicos que asisten durante uno y las victimas que, dependiendo del caso, se ven atrapadas que desconocen la "big picture" de la situación. Creemos que la alerta enviada por el Sistema de Alertas de Emergencia (SAE) no es suficiente para los ciudadanos de Valparaíso.

# Nuestra Solución:
Para esto decidimos crear una aplicación GPS enfocada en feedback de los usuarios para crear alertas en un areá radial que indique donde ocurre un incendio, la cuál con el input de usuario calcula (dependiendo de multiples factores como fuerza del viento, y la ubicación misma de la alerta) una zona segura y __posibles__ rutas de evacuación.

# Características de Enfoque/Funcionales:
* __Alertas en tiempo real__: Sistema de alertas de incendios activos, sus intensidades y zonas seguras.
* __Rutas de evacuación__: Sistema que calcula rutas de evacuación según el terreno, la zona de incendio y la(s) zona segura(s).
* __Localizador de Rescate__: Modo de alerta activa para facilitar el rescate en caso de no tener una ruta asegurada.
* __Guía Logistica__: Sistema logístico que facilita la coordinación entre servicios públicos y el control del incendio.
 
# Mockup: 
https://www.figma.com/make/L7kJczFfb03QMJUuH8S2vK/Fire-Alert-App?p=f&t=Gcc1H9smyc8RL5ly-0&fullscreen=1

# Decisión Arquitectonica: 
Elegimos la arquitectura Event-Driven porque es el estilo de diseño que más se acerca a nuesra visión del proyecto, este nos ayuda a separar la aplicación en 2 segmentos de uso general y de servicio público, donde se consideran:

* __Productores de Eventos__: Donde se tienen en cuenta dos Modúlos principales de app victimas y app servicio público las cuales van publicando eventos según se vaya desenvolviendo el incendio.
* __Bus de Eventos (Broker)__: El puente entre estos, la aplicación se ecnarga de agregar cada cambio que se pública entre las dos versiones para controlar la pesadilla logistica que es un incendio activo, con la cadena de eventos "Publica incendio, se alerta a los usuarios, se controla el incendio y se elimina la alerta".
* __Consumidores de Eventos__: Proceso encargado de resolver todas las públicaciones hechas por las dos partes de la aplicación como los modúlos de alerta que muestran la zona de incendio y la escala de este, localizador que muestra la ubicación de posibles victimas sin escape y produce un sonido o vibración de busqueda.

Nuestra arquitectura se basa en 3 componentes principales:
* React Native (Front-End): Nos permite usar JavaScript, del cuál uno de nuestros devs tiene experienca con este ultimo. 
* API MDN (Back-End): API de geolocalización muy importante para el proyecto y es compatible con JavaScript.
* SQLite (Base de Datos): Como el proyecto solo es parte de Valparaíso elegimos esta app de BD para registrar los datos pertinentes de la aplicación.

## Responsabilidades del equipo 
|------------|-----|----------------------------| 

|   [Nicolas Lazcano]   |  [Scrum Master] |        [Creación del repositorio, creación de los Mockups]       | 

| [Angelo De La Rivera] | [Product Owner] |       [Creación de las US, escritos del archivo README.md]       | 

|   [Sebastian Rojas]   |   [Developer]   | [creacioón de los Mockups, escritos del archivo Arquitectura.md] | 

|   [Rodrigo Sances]    |   [Developer]   |         [escritos del archibo ReqExtrafuncionales.md]            | 

