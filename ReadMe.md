# Cipressus

![Probador](screenshots/probador2.jpg "Probador") 

| Librería | Documentación | Función |
-----------|---------------|----------|
| Angular | http://angularjs.org/ | Framework de front-end. |  
| Materialize | http://materializecss.com/ | Componentes de la GUI.  |  
| Firebase | http://firebase.google.com/ | Autenticación, base de datos, mensajería instantánea, notificaciones, almacenamiento. |  
| HighCharts | http://highcharts.com/ | Gráficos interactivos. |  
| Fullcalendar | http://fullcalendar.io/ | Calendario de eventos para el cronograma de la materia.  |  
| SimCirJS  | https://kazuhikoarase.github.io/simcirjs/ | Simulador de circuitos lógicos digitales. |  
| JQuery | http://jquery.com/ |Dependencia de FullCalendar y SimCirJS. |  
| Tone | https://tonejs.github.io/ | Generador de audio para el simulador. |    
| Quill | https://quilljs.com/, https://github.com/kensnyder/quill-image-resize-module | Editor de texto enriquecido para crear publicaciones de contenido multimedia. |    
| Moment | http://momentjs.com/ | Operaciones de fecha y hora. |  
| Is | https://is.js.org/ | Identificación de Sist. Operativo, navegador, dispositivo, etc. |  
| Vis | http://visjs.org/ | Visualización de modelos abstractos. |  


## Base de Datos de Tiempo Real

```
-activities             // Contiene la estructura de actividades, puntajes, vencimientos, etc
 |
 + ... (arbol)
-events/courseID        // Lista de eventos de calendario
 | 
 +-(child_key)          // ID firebase del evento
  |
  +-attendance          // Asistencia es obligatoria
  +-start               // Inicio ms unix
  +-end                 // Fin ms unix
  +-author              // ID del autor
  +-title               // Titulo del evento
  +-info                // Detalles del evento formato html
  +-timestamp           // Fecha de publicacion/edicion
  +-color               // Color de la etiqueta
-news/courseID          // Lista de comunicados a mostrar en home
 |
 +-(child_key)          // ID firebase de la noticia
  |
  +-author              // ID del autor
  +-content             // Contenido del post formato html
  +-order               // Numero para ordenar el listado
  +-timestamp           // Fecha de publicacion/edicion
  +-title               // Titulo del post
  +-comments            // Comentarios de esta publicación
   |
   +-(child_key)        // ID del comentario
    |
    +-uid               // ID del usuario que comenta
    +-text              // Texto el comentario
    +-timestamp         // Estampa de tiempo del comentario
-notifications          // Lista de notificaciones para todos los usuarios
 |
 +-(child_key)          // ID firebase de la notificacion
  |
  +-uid                 // ID del destinatario
  +-title               // Titulo de la notificacion
  +-text                // Texto descriptivo
  +-link                // Enlace (opcional)
  +-timestamp           // Fecha de generacion
  +-read                // Acuse de lectura
-sources                // Listas de archivos
 |
 +-(child_key)          // Subcategoria de directorio
  |
  +-name                // Nombre del subdirectorio
  +-files               // ID del archivo
   |
   +-(child_key)        // Identificador del archivo
    |
    +-link              // Enlace al storage
    +-name              // Nombre visible (editable)
    +-filename          // Nombre en storage
    +-size              // Tamanio en storage
    +-format            // Formato del archivo
    +-uploaded          // Fecha de carga
-submissions/courseID   // Lista de entregas realizadas por alumnos
 |
 +-(child_key)          // Identificador de la entrega
  |
  +-authors             // Autores de la entrega (apellido de los integrantes separado por coma)
  +-filename            // Nombre de archivo subido
  +-link                // Enlace al storage
  +-activity            // Identificador de la actividad entregada
  +-status              // Estado de la correccion
   |
   +-(child_key)        // Identificador del registro
    |
    +-timestamp         // Fecha/hora del registro
    +-action            // Acciones del registro (0:subido, 1:descargado, 2:observacion, 3:evaluado)
    +-user              // Usuario que realizo la accion
    +-display           // Mensaje a mostrar del estado de revision
    +-obs               // Observaciones
-users_private          // Informacion de usuarios alumnos
 |
 +-(child_key)          // ID firebase del usuario
  |
  +-admin               // True/false dependiendo de si es administrador
  +-enrolled            // Fecha de aprobacion como usuario alumno
  +-scores              // Arreglo de notas
   |
   +-(child_name)       // Nombre de la actividad 
    |
    +-evaluator         // ID de quien evaluo
    +-score             // Puntaje de 0 a 100
    +-timestamp         // Fecha/hora de correccion
  +-submits             // Lista de fechas de entrega de tps
   |
   +-(child_name)       // Nombre de la actividad 
    |
    +-evaluator         // ID de quien evaluo
    +-date              // Fecha de entrega de la actividad
    +-timestamp         // Fecha/hora de correccion
  +-attendance          // Para computo de asistencia a clase
   |
   +-(child_key)        // ID del evento asistido
    |
    +-evaluator         // ID de quien tomo asistencia
    +-timestamp         // Fecha/hora de evaluacion de asistencia
-users_public           // Datos de usuarios (unico campo editable por cualquier usuario)
 |
 +-(child_key)          // ID firebase
  |
  +-avatar              // Foto de perfil
  +-degree              // Carrera
  +-email               // Email
  +-lu                  // LU
  +-name                // Nombre
  +-secondName          // Apellido
  +-partners            // Compañeros de comision
   |
   +-(array_index)      // Indice de arreglo e identificador de usuario como valor
  +-activity            // Monitor de actividad
   |
   +-last_login         // Estampa de tiempo de ultimo acceso
   +-so                 // Sist. operativos utilizados
   +-browser            // Navegadores utilizados
   +-item               // Contadores de acceso a secciones de la pagina
  +-simulations            // Carpeta para guardar simulaciones de SimCirJS
   |
   +-(child_key)        // Identificador del circuito
    |
    +-name              // Nombre de archivo
    +-size              // Tamanio
    +-timestamp         // Fecha y hora de generado
    +-data              // Datos guardados de la simulacion
  +-test_fs             // Resultados del test Felder-Silverman
   |
   +-answers            // Arreglo de respuestas
   +-changes            // Arreglo de cambios en respuestas
   +-starTime           // Fecha/hora de inicio del test
   +-timeline           // Tiempos de respuesta de cada pregunta
-metadata               // Informacion adicional que emplea la app
 |
 +-courses              // Informacion de cursos creados
  |
  +-(child_key)         // ID del curso (coincide con el del arbol de actividades)
   |
   +-name               // Nombre del curso
   +-start              // Inicio (timestamp)
   +-end                // Finalizacion (timestamp)
   +-enrolled           // Cantidad de usuarios registrados
 +-updates              // Estampas de tiempo de última actualizacion de los datos de cada vista
  |
  +-news 
  +-events
  +-sources
  +-submissions
 +-notifications        // Arreglos de UIDs de usuarios subscriptos a cada tipo de evento
  |
  +-new_user            // Nuevo usuario registrado (solo lo pueden configurar usuarios admins)
  +-submission          // Nueva entrega realizada (se diferencia por curso)
```

## Setup

  - Crear proyecto Firebase.  
  - Definir las reglas de escritura y lectura de información de la db:  

```json
{
  "rules": {
    "activities":{
    	".read": "auth != null",
      ".write": "root.child('users_private/'+auth.uid+'/admin').val() === true"  
    },
    "news":{
      ".read":"auth != null",
      ".write":"auth != null"
    },
    "events":{
      ".read":"auth != null",
      ".write":"root.child('users_private/'+auth.uid+'/admin').val() === true"
    },
    "sources":{
      ".read" : "auth != null",
      ".write" : "root.child('users_private/'+auth.uid+'/admin').val() === true"  
    },
    "submissions":{
      ".read":"auth != null",
      ".write":"auth != null"
    },
    "notifications":{
      ".read":"auth != null",
      ".write":"auth != null"
    },
    "users_private":{
      ".read":"auth != null",
      ".write":"root.child('users_private/'+auth.uid+'/admin').val() === true"
    },
    "users_public":{ 
      ".read":"auth != null",
      ".write":"auth != null"
    },
    "metadata":{
      ".read":"auth != null",
      ".write":"auth != null"
    }
  }
}
```
  - Copiar el código de configuración Firebase en objeto ```core.db.config```, en cipressus.js.  
  - Registrar manualmente, desde la consola firebase, un usuario administrador.  
  - Configurar CORS para la descarga de archivos (ver documentacion Firebase).  
  - Hostear en servidor con certificado SSL para que funcionen los service workers.  

--------------------------------------------------
### Contacto

Matías J. Micheletto  

Email: matias.micheletto@uns.edu.ar  
Portafolio: https://matiasmicheletto.github.io  

--------------------------------------------------

LSD | Laboratorio de Sistemas Digitales  
DIEC | Departamento de Ingeniería Eléctrica y Computadoras  
UNS | Universidad Nacional del Sur  
San Andrés 800, CP8000 Bahía Blanca  
Buenos Aires, Argentina  
Teléfono: +54 291 4595153/4  
Sitio web: http://www.diec.uns.edu.ar/rts  
