# Decisión Arquitectonica: 
Elegimos la arquitectura Event-Driven porque es el estilo de diseño que más se acerca a nuesra visión del proyecto, este nos ayuda a separar la aplicación en 2 segmentos de uso general y de servicio público, donde se consideran:

* __Productores de Eventos__: Donde se tienen en cuenta dos Modúlos principales de app victimas y app servicio público las cuales van publicando eventos según se vaya desenvolviendo el incendio.
* __Bus de Eventos (Broker)__: El puente entre estos, la aplicación se ecnarga de agregar cada cambio que se pública entre las dos versiones para controlar la pesadilla logistica que es un incendio activo, con la cadena de eventos "Publica incendio, se alerta a los usuarios, se controla el incendio y se elimina la alerta".
* __Consumidores de Eventos__: Proceso encargado de resolver todas las públicaciones hechas por las dos partes de la aplicación como los modúlos de alerta que muestran la zona de incendio y la escala de este, localizador que muestra la ubicación de posibles victimas sin escape y produce un sonido o vibración de busqueda.

Nuestra arquitectura se basa en 3 componentes principales:
* React Native (Front-End): Nos permite usar JavaScript, del cuál uno de nuestros devs tiene experienca con este ultimo. 
* API MDN (Back-End): API de geolocalización muy importante para el proyecto y es compatible con JavaScript.
* SQLite (Base de Datos): Como el proyecto solo es parte de Valparaíso elegimos esta app de BD para registrar los datos pertinentes de la aplicación.
