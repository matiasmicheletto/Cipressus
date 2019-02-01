# Cipressus

CIPRESSUS es una plataforma online pensada inicialmente para implementar un sistema de cómputo de calificaciones para actividades educativas y permitir la consulta en tiempo real de resultados de evaluaciones.

### Características
  - Registro con email y contraseña
	- Usuarios con rol de alumnos y rol de docentes
	- Perfiles personalizables
	- Listado de comunicados y novedades referidos a la materia
	- Consulta de cronograma de actividades
	- Consulta de calificaicones
	- Mensajería instantánea
	- Descarga de material de estudio


## Evaluación de calificaciones
Las actividades del curso se organizan en una estructura jerárquica que permite calcular la calificación general un alumno o parcial de cada actividad realizada mediante recorrido de árboles, con funciones recursivas y computando la suma ponderada de los puntajes obtenidos y registrados en cada nivel de este arbol que contiene los factores de ponderación o puntajes absolutos. Para cada alumno se registra su lista de notas referenciadas a las actividades del arbol de puntajes y también las fechas de entregas para actividades con vencimiento.


### Contacto
LSD | Laboratorio de Sistemas Digitales
DIEC | Departamento de Ingeniería Eléctrica y Computadoras
San Andrés 800, CP8000 Bahía Blanca
Buenos Aires, Argentina
Teléfono: +54 291 4595153/4
Website: http://www.diec.uns.edu.ar/


#### Diseño e implementación
Matías J. Micheletto
Email: matias.micheletto@uns.edu.ar
Documentación: https://github.com/matiasmicheletto/cipressus


### TODO

Usuario con rol de alumno:

  - Inicio
	  - Listado de noticias con fecha y autor de publicación
  - Calificaciones
    - Listado de notas en tiempo real  (1)
    - Consulta de notas por actividad  (1)
  - Cronograma
    - Calendario con eventos de la materia
    - Detalle de eventos (fecha, hora, lugar, actividad)
  - Material
    - Lista de trabajos prácticos, laboratorios o parciales viejos para descargar
  - Perfil
    - Editar perfil 
    - Subir foto de perfil


Usuario con rol de administrador:

  - Alumnos
    - Ver lista de alumnos
    - Asignación de calificaciones
    - Envío de mensajes
  - Actividades
    - Configuración de arbol de actividades
  - Noticias
    - Gestión de noticias (eliminar o mover)
    - Editor de noticias con almacenamiento en localstorage
