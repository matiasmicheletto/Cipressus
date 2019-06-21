# Cipressus

CIPRESSUS es un sistema de gestión de contenidos para el aprendizaje (LCMS). 

Permite registrarse con correo electrónico, configurar el perfil del usuario, consultar el cronograma de actividades de la materia, enviar y recibir mensajes, descargar material de estudio y realizar entrega de informes. Los usuarios con rol de docentes pueden crear y editar publicaciones, configurar la lista de actividades, agregar o quitar eventos como clases, consultas o exámenes, gestionar la lista de usuarios y alumnos, descargar y calificar archivos enviados por alumnos.

Incluye una GUI para controlar un tester de circuitos digitales basado en Arduino y un simulador gráfico de circuitos lógicos. Por medio del tester se puede acceder a una interface tipo analizador lógico y crear simulaciones que son controladas mediante circuitos digitales.


### Características
  - Registro con email y contraseña.
  - Usuarios con roles de alumnos o docentes.
  - Perfil de usuario personalizable.
  - Publicación de comunicados y novedades.
  - Consulta de cronograma de actividades.
  - Calificaciones actualizadas en tiempo real.
  - Tablero de calificaciones animado con información de progreso de la materia, actividades entregadas, calificaciones generales del curso y lista de eventos próximos.
  - Entrega online de informes o archivos para evaluación.
  - Interfaz gráfica para conectar el probador digital de circuitos lógicos y realizar verificación de funcionamiento o simulación de situaciones.
  - Simulador de circuitos lógicos embebido en la misma app.
  - Evaluación del Test de Felder & Silverman o instrumento ILS para usuarios alumnos. 
  - Estadística y analíticos de usuarios alumnos sobre uso de la app, origen y frecuencia de acceso, progreso de notas.
  - Evaluación de asistencia ágil con cómputo automático.
  - Notificaciones y mensajería instantánea [Próximamente].
  - Descarga de material de estudio, prácticos, libros, apuntes, programas, etc.


### Contacto
LSD | Laboratorio de Sistemas Digitales  
DIEC | Departamento de Ingeniería Eléctrica y Computadoras  
UNS | Universidad Nacional del Sur  
San Andrés 800, CP8000 Bahía Blanca  
Buenos Aires, Argentina  
Teléfono: +54 291 4595153/4  
Website: http://www.diec.uns.edu.ar/rts  


#### Diseño e implementación
Ing. Matías J. Micheletto  
Email: matias.micheletto@uns.edu.ar  
Documentación: https://github.com/matiasmicheletto/cipressus  



## Librerías importadas
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
#### SimCirJS
https://kazuhikoarase.github.io/simcirjs/  
Simulador de circuitos lógicos digitales
#### Quill
https://quilljs.com/  
https://github.com/kensnyder/quill-image-resize-module  
Editor de texto enriquecido para crear publicaciones con comunicados y noticias.
#### Moment
http://momentjs.com  
Operaciones de fecha y hora
#### Is
https://is.js.org/  
Identificación de Sist. Operativo, navegador, dispositivo, etc.


## Evaluación de calificaciones
Las actividades del curso se organizan en una estructura jerárquica que permite calcular la calificación general un alumno o parcial de cada actividad realizada mediante algoritmos de recorrido de árboles, con funciones recursivas y computando la suma ponderada de los puntajes obtenidos y registrados en cada nivel de este árbol, que contiene los factores de ponderación o puntajes absolutos de dichas actividades. Para cada alumno se registra una lista de notas referenciadas a las actividades del árbol de puntajes. Para actividades con vencimiento se pueden definir funciones de costo que aplican sobre las calificaciones en función del tiempo transcurrido desde el vencimiento de la actividad hasta el cumplimiento de la misma.


## Estructura de la DB
```
-activities             // Contiene la estructura de actividades, puntajes, vencimientos, etc
 |
 + ... (arbol)
-events                 // Lista de eventos de calendario
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
-news                   // Lista de comunicados a mostrar en home
 |
 +-(child_key)          // ID firebase de la noticia
  |
  +-author              // ID del autor
  +-content             // Contenido del post formato html
  +-order               // Numero para ordenar el listado
  +-timestamp           // Fecha de publicacion/edicion
  +-title               // Titulo del post
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
-submissions            // Lista de entregas realizadas por alumnos
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
 +-updates              // Estampas de tiempo de última actualizacion de los datos de cada vista
  |
  +-news
  +-events
  +-sources
  +-submissions
```

## Setup

  - Crear proyecto Firebase con una cuenta de Google.
  - Copiar el código de configuración Firebase en objeto ```core.db.config```, en cipressus.js. 
  - Registrar manualmente, desde la consola firebase, un usuario admin y cargar el arbol de actividades de la asignatura. 
  - Definir las reglas de escritura y lectura de información de la db (ejemplo para un admin con uid = FlX1c7HXkzUrrKBmuaqK9mLp1EI2):
```json
{
  "rules": {
    "activities":{
    	".read": "auth != null",
      ".write": false
    },
    "news":{
      ".read":"auth != null",
      ".write":"auth.uid == 'FlX1c7HXkzUrrKBmuaqK9mLp1EI2'"
    },
    "events":{
      ".read":"auth != null",
      ".write":"auth.uid == 'FlX1c7HXkzUrrKBmuaqK9mLp1EI2'"
    },
    "sources":{
      ".read" : "auth != null",
      ".write" : "auth.uid == 'FlX1c7HXkzUrrKBmuaqK9mLp1EI2'"  
    },
    "submissions":{
      ".read":"auth != null",
      ".write":"auth != null"
    },
    "users_private":{
      ".read":"auth != null",
      ".write":"auth.uid == 'FlX1c7HXkzUrrKBmuaqK9mLp1EI2'"
    },
    "users_public":{ 
      ".read":"auth != null",
      ".write":"auth != null"
    },
    "metadata":{
      ".read":"auth != null",
      ".write":"auth.uid == 'FlX1c7HXkzUrrKBmuaqK9mLp1EI2'"
    }
  }
}
```
  - Configurar CORS para la descarga de archivos (ver documentacion firebase).
  - Hostear en servidor con certificado SSL para que funcionen los service workers.


### Backlog
[Impr] Optimizar o mejorar  
[Bug] Error para corregir  
[Feature] Agregar característica  

  - [Feature] Admitir calificaciones por encima del 100% (chequear si el modelo lo soporta).
  - [Impr] Calcular asistencia de todo el curso al momento de evaluar asistencia y guardar junto con notas para evitar calcular cada vez (hay que modificar varios controllers).
  - [Bug] Actualizacion de noticias: Al actualizar publicación se duplica la entrada y se agrega un "undefined" en db.
  - [Feature] Separar los grupos de usuarios en cursos.
  - [Feature] Probador de circuitos: implementar verificacion de tabla de verdad.
  - [Feature] Dialogo inicial de guia para el usuario (agregar foto de perfil, indicar compañeros de comision, etc)
  - [Feature] Detallar clases asistidas. En progreso, mostrar cantidad de actividades calificadas y por completar.
  - [Impr] Mejorar sistema de entrega de trabajos. No permitir dos entregas de lo mismo (salvo que este rebotado para reenviar)
  - [Feature] Notificaciones de segundo plano (cuando la app esta instalada y el usuario logeado).
  - [Feature] Configuración de árbol de actividades. 
  - [Feature] Modelo de múltiples materias (con el mismo esquema).
