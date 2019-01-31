# Cipressus

Sistema de cómputo de calificaciones para actividades educativas.

## Estructura básica

Las actividades del curso se organizan en una estructura jerárquica que permite calcular la calificación general un alumno o parcial de cada actividad realizada mediante recorrido de árboles, con funciones recursivas y computando la suma ponderada de los puntajes obtenidos y registrados en cada nivel de este arbol que contiene los factores de ponderación. Para cada alumno se registra su lista de notas referenciadas a las hojas del arbol de factores y por otro lado las fechas de entregas para calcular puntajes.


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
