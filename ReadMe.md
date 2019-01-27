# Cipressus

Sistema de cómputo de calificaciones para actividades educativas.

## Estructura básica

Las actividades del curso se organizan en una estructura jerárquica que permite calcular la calificación general un alumno o parcial de cada actividad realizada mediante recorrido de árboles, con funciones recursivas y computando la suma ponderada de los puntajes obtenidos y registrados en cada nivel de este arbol que contiene los factores de ponderación. Para cada alumno se registra su lista de notas referenciadas a las hojas del arbol de factores y por otro lado las fechas de entregas para calcular puntajes.

Ejemplo de jerarquía de actividades:

```json
{
	"activities":{
	  "name": "Nota final",  // Nombre legible del nodo
	  "factor": 1,
	  "children": [{			// Cada nodo tiene una lista de hijos
		  "name": "Asistencia a clase",
		  "factor": 0.15,   // El factor es el parametro que multiplica a la nota de este nodo para calcular la suma ponderada
		  "id":"asistencia" // Los nodos que son hojas tienen un identificador porque son los que deben calificarse
		},
		{
		  "name": "Parciales",
		  "factor": 0.5,
		  "children": [{
			"name": "Primer parcial",
			"factor": 0.5,
			"children": [{
			  "name": "Ej 1 - Primer parcial",
			  "factor": 0.25,
			  "id":"p1_ej1"       
			}, {
			  "name": "Ej 2 - Primer parcial",
			  "factor": 0.25,
			  "id":"p1_ej2"
			}, {
			  "name": "Ej 3 - Primer parcial",
			  "factor": 0.25,
			  "id":"p1_ej3"
			}, {
			  "name": "Ej 4 - Primer parcial",
			  "factor": 0.25,
			  "id":"p1_ej4"
			}]
		  }]
		},
		{
		  "name": "Laboratorios",
		  "factor": 0.35,
		  "children": [{
			  "name": "Probador",
			  "factor": 0.2,
			  "deadline": { // Algunas actividades pueden tener vencimiento
				"date":2000,  // Se indica la fecha de vencimiento en unix time
				"param": 1,   // Un parametro que se usa en la funcion de costo
				"id": "lab0"  // Y un identificador para obtener la fecha de entrega de esta actividad
			  },
			  "children": [{
				  "name": "Estética probador",
				  "factor": 0.5,
				  "id":"l0_estetica"
				},
				{
				  "name": "Funcionamiento probador",
				  "factor": 0.5,
				  "id":"l0_funcionamiento"
				}
			  ]
			},
			{
			  "name": "Laboratorio 1",
			  "factor": 0.16,
			  "deadline": {
				"date":1556593200000,        
				"param": 10,           
				"id": "lab1"
			  },
			  "children": [{
				  "name": "Implementación laboratorio 1",
				  "factor": 0.4,
				  "children": [{
					  "name": "Presentación prototipo laboratorio 1",
					  "factor": 0.5,
					  "id":"l1_impl_presentacion"
					},
					{
					  "name": "Funcionamiento prototipo laboratorio 1",
					  "factor": 0.5,
					  "id":"l1_impl_funcionamiento"
					}
				  ]
				},
				{
				  "name": "Informe laboratorio 1",
				  "factor": 0.6,
				  "children": [{
					"name": "Presentación informe laboratorio 1",
					"factor": 0.5,
					"id":"l1_informe_presentacion"
				  }, {
					"name": "Contenido informe laboratorio 1",
					"factor": 0.5,
					"id":"l1_informe_contenido"
				  }]
				}
			  ]
			}]
		},
		{
		  "name": "Examen suplementario",
		  "factor": 0.2,
		  "id": "suplementario"
		}
	  ]
	}
}
```

Ejemplo de datos de alumnos:

```jsonc
{
  "alumnos": [{
	  "data": {
		"name": "Matías",
		"secondName": "Micheletto",
		"degree": "101",
		"email": "matiasmicheletto@gmail.com",
		"lu":86282
	  },
	  "scores": {
		"p1_ej1":90,
		"p1_ej2":100,
		"p1_ej3":100,
		"asistencia":75,
		"p2_ej1":90,
		"p2_ej2":100,
		"p2_ej3":100,
		"l1_impl_presentacion":80,
		"l1_impl_funcionamiento":80,
		"l1_informe_presentacion":60,
		"l1_informe_contenido":80
	  },
	  "submits":{
		"lab1":1557111600000
	  }
	}]
}
```