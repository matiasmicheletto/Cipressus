# Cipressus

CIPRESSUS es una plataforma online pensada inicialmente para implementar un sistema de cómputo automático de calificaciones para actividades educativas y permitir la consulta en tiempo real de resultados de evaluaciones. 

Actualmente permite registrarse con correo electrónico, configurar el perfil del usuario, consultar el cronograma de actividades de la materia, enviar y recibir mensajes, descargar material de estudio. Los usuarios con rol de administrador pueden configurar la lista de actividades, agregar o quitar eventos como clases, consultas o exámenes, gestionar la lista de usuarios y alumnos, entre muchas otras utilidades.


### Características
  - Registro con email y contraseña.
  - Usuarios con distintos roles y permisos.
  - Perfiles personalizables.
  - Listado de comunicados y novedades.
  - Consulta de cronograma de actividades.
  - Calificaciones actualizadas en tiempo real.
  - Tablero de calificaciones animado.
  - Evaluación de asistencia con cómputo automático.
  - Mensajería instantánea.
  - Descarga de material de estudio.


### Contacto
LSD | Laboratorio de Sistemas Digitales  
DIEC | Departamento de Ingeniería Eléctrica y Computadoras  
UNS | Universidad Nacional del Sur  
San Andrés 800, CP8000 Bahía Blanca  
Buenos Aires, Argentina  
Teléfono: +54 291 4595153/4  
Website: http://www.diec.uns.edu.ar/  


#### Diseño e implementación
Ing. Matías J. Micheletto  
Email: matias.micheletto@uns.edu.ar  
Documentación: https://github.com/matiasmicheletto/cipressus  



## Librerías utilizadas
#### Angular
http://angularjs.org
Framework para el control de la app.
#### Materialize
http://materializecss.com
Estilo de la GUI.
#### Firebase
http://firebase.google.com
Para el control de autenticación de usuarios y almacenamiento de información en la nube.
#### HighCharts
http://highcharts.com
Graficos del dashboard
#### JQuery
http://jquery.com
Sólo como dependencia requerida para FullCalendar
#### Fullcalendar
http://fullcalendar.io
Calendario de eventos para el cronograma de la materia. 
#### Moment
http://momentjs.com
Operaciones de fecha y hora



## Evaluación de calificaciones
Las actividades del curso se organizan en una estructura jerárquica que permite calcular la calificación general un alumno o parcial de cada actividad realizada mediante algoritmos de recorrido de árboles, con funciones recursivas y computando la suma ponderada de los puntajes obtenidos y registrados en cada nivel de este árbol, que contiene los factores de ponderación o puntajes absolutos de dichas actividades. Para cada alumno se registra una lista de notas referenciadas a las actividades del árbol de puntajes. Para actividades con vencimiento se pueden definir funciones de costo que aplican sobre las calificaciones en función del tiempo transcurrido desde el vencimiento de la actividad hasta el cumplimiento de la misma.


## Estructura de la DB
```
-activities // Contiene la estructura de actividades, puntajes, vencimientos, etc
 |
 + ... (arbol)
-events // Lista de eventos de calendario
 | 
 +-(child_key) // ID firebase del evento
  |
  +-start     // Inicio ms unix
  +-end       // Fin ms unix
  +-author    // ID del autor
  +-title     // Titulo del evento
  +-info      // Detalles del evento formato html
  +-timestamp // Fecha de publicacion/edicion
  +-color     // Color de la etiqueta
-news // Lista de comunicados a mostrar en home
 |
 +-(child_key)  // ID firebase de la noticia
  |
  +-author    // ID del autor
  +-content   // Contenido del post formato html
  +-order     // Numero para ordenar el listado
  +-timestamp // Fecha de publicacion/edicion
  +-title     // Titulo del post
-users_private // Informacion de usuarios alumnos
 |
 +-(child_key) // ID firebase del usuario
  |
  +-admin     // True/false dependiendo de si es administrador
  +-enrolled  // Fecha de aprobacion como usuario alumno
  +-scores    // Arreglo de notas
   |
   +-(child_name) // Nombre de la actividad 
    |
    +-evaluator // ID de quien evaluo
    +-score     // Puntaje de 0 a 100
    +-timestamp // Fecha/hora de correccion
  +-submits // Lista de fechas de entrega de tps
   |
   +-(child_name) // Nombre de la actividad 
    |
    +-evaluator // ID de quien evaluo
    +-date      // Fecha de entrega de la actividad
    +-timestamp // Fecha/hora de correccion
  +-attendance // Para computo de asistencia a clase
   |
   +-(child_key) // ID del evento asistido
    |
    +-evaluator // ID de quien tomo asistencia
    +-timestamp // Fecha/hora de evaluacion de asistencia
-users_public // Datos de usuarios
 |
 +-(child_key)  // ID firebase
  |
  +-avatar      // Foto de perfil
  +-degree      // Carrera
  +-email       // Email
  +-last_login  // Fecha de ultimo inicio de sesion
  +-lu          // LU
  +-name        // Nombre
  +-secondName  // Apellido
```



### TODO

Usuario con rol de alumno:

  - Dashboard
    - Asistencia
    - Progreso de la materia.
    - Próximos eventos.
    - Descripción textual para graficos.
  - Material
    - Lista de trabajos prácticos, laboratorios o parciales viejos para descargar.


Usuario con rol de administrador:

  - Actividades
    - Configuración de árbol de actividades