# Valpo Ignis

## Problemática:
Es de conocer general que la problematica número 1 durante incendios es la falta de información tanto para los servicios publicos que asisten durante uno y las victimas que, dependiendo del caso, se ven atrapadas que desconocen la "big picture" de la situación. Creemos que la alerta enviada por el Sistema de Alertas de Emergencia (SAE) no es suficiente para los ciudadanos de Valparaíso.

## Nuestra Solución:
Para esto decidimos crear una aplicación GPS enfocada en feedback de los usuarios para crear alertas en un areá radial que indique donde ocurre un incendio, la cuál con el input de usuario calcula (dependiendo de multiples factores como fuerza del viento, y la ubicación misma de la alerta) una zona segura y __posibles__ rutas de evacuación.

## Características de Enfoque/Funcionales:
* __Alertas en tiempo real__: Sistema de alertas de incendios activos, sus intensidades y zonas seguras.
* __Rutas de evacuación__: Sistema que calcula rutas de evacuación según el terreno, la zona de incendio y la(s) zona segura(s).
* __Localizador de Rescate__: Modo de alerta activa para facilitar el rescate en caso de no tener una ruta asegurada.
* __Guía Logistica__: Sistema logístico que facilita la coordinación entre servicios públicos y el control del incendio.

## Historias de Usuario:
Todas las historias están registradas como Issues y registradas en el proyecto, aquí el listado de estas:
| ID    | Epica | Nombre                                   | Issue               |
|-------|-------|------------------------------------------|---------------------|
| US-01 | Victimas | Interfaz usuario general              | [#19](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/19) |
| US-02 | Victimas | Rutas de escape                       | [#15](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/15) |
| US-03 | Victimas | Localizador de Rescate                | [#16](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/16) |
| US-04 | Victimas | Foro Desaparecidos                    | [#24](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/24) |
| US-05 |Serv. Púb.| Interfaz Bombero/Rescatista           | [#18](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/18) |
| US-06 |Serv. Púb.| Localizador de victimas               | [#17](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/17) |
| US-07 |Serv. Púb.| Reportes falsos                       | [#21](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/21) |
| US-08 |Serv. Púb.| Búsqueda perpretador                  | [#20](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/20) |
| US-09 |Serv. Púb.| Identificación de fallecidos          | [#22](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/22) |
| US-10 |Serv. Púb.| Aviso cortes de energía               | [#23](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/23) |
| US-11 | SENAPRED | Informe de desaparecidos              | [#13](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/13) |
| US-12 | SENAPRED | Informe de evacuados                  | [#14](https://github.com/equipo-ValpoIncendios/Valpo-Ignis/issues/14) |
 
## Mockup: 
https://www.figma.com/make/L7kJczFfb03QMJUuH8S2vK/Fire-Alert-App?p=f&t=Gcc1H9smyc8RL5ly-0&fullscreen=1

## Responsabilidades del equipo 

| Nombre               | Rol           | Actividad |
|----------------------|---------------|-----------|
| Nicolás Lazcano     | Scrum Master | Creación del repositorio, creación de los mockups, escritos del archivo Arquitectura.md |
| Angelo De La Rivera | Product Owner | Creación de las US, escritos del archivo README.md |
| Sebastián Rojas     | Developer     | Creación de los mockups, Modelo de Dominio |
| Rodrigo Sances      | Developer     | Escritos del archivo ReqExtrafuncionales.md |
