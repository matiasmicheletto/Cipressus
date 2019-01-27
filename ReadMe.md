# Cupressus

Sistema de cómputo de calificaciones para actividades educativas

## Estructura básica

Las actividades del curso se organizan en una estructura jerárquica que permite calcular la calificación general un alumno o parcial de cada actividad realizada recorriendo un arbol y computando la suma ponderada de los puntajes obtenidos y registrados en cada nivel del arbol.
Existe un arbol que contiene los factores de ponderación y luego cada alumno tiene su lista de notas referenciadas y fechas de entregas.

Ejemplo de jerarquía de actividades:

```json
{
  "actividades": {
	  "nombre": "Nota final",
	  "factor": 1,
	  "children": [{
		  "nombre": "Asistencia a clase",
		  "factor": 0.15,
		  "id":"asistencia"
		},
		{
		  "nombre": "Parciales",
		  "factor": 0.5,
		  "children": [{
			"nombre": "Primer parcial",
			"factor": 0.5,
			"children": [{
			  "nombre": "Ej 1 - Primer parcial",
			  "factor": 0.25,
			  "id":"p1_ej1"       
			}, {
			  "nombre": "Ej 2 - Primer parcial",
			  "factor": 0.25,
			  "id":"p1_ej2"
			}, {
			  "nombre": "Ej 3 - Primer parcial",
			  "factor": 0.25,
			  "id":"p1_ej3"
			}, {
			  "nombre": "Ej 4 - Primer parcial",
			  "factor": 0.25,
			  "id":"p1_ej4"
			}]
		  }]
		},
		{
		  "nombre": "Laboratorios",
		  "factor": 0.35,
		  "children": [{
			  "nombre": "Probador",
			  "factor": 0.2,
			  "vencimiento": {
				"fecha":2000,        
				"desgaste": 1,           
				"id": "lab0"
			  },
			  "children": [{
				  "nombre": "Estética probador",
				  "factor": 0.5,
				  "id":"l0_estetica"
				},
				{
				  "nombre": "Funcionamiento probador",
				  "factor": 0.5,
				  "id":"l0_funcionamiento"
				}
			  ]
			},
			{
			  "nombre": "Laboratorio 1",
			  "factor": 0.16,
			  "vencimiento": {
				"fecha":2000,        
				"desgaste": 10,           
				"id": "lab1"
			  },
			  "children": [{
				  "nombre": "Implementación laboratorio 1",
				  "factor": 0.4,
				  "children": [{
					  "nombre": "Presentación prototipo laboratorio 1",
					  "factor": 0.5,
					  "id":"l1_impl_presentacion"
					},
					{
					  "nombre": "Funcionamiento prototipo laboratorio 1",
					  "factor": 0.5,
					  "id":"l1_impl_funcionamiento"
					}
				  ]
				},
				{
				  "nombre": "Informe laboratorio 1",
				  "factor": 0.6,
				  "children": [{
					"nombre": "Presentación informe laboratorio 1",
					"factor": 0.5,
					"id":"l1_informe_presentacion"
				  }, {
					"nombre": "Contenido informe laboratorio 1",
					"factor": 0.5,
					"id":"l1_informe_contenido"
				  }]
				}
			  ]
			}
	]
		},
		{
		  "nombre": "Examen suplementario",
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
	  "datos": {
		"nombre": "Matías",
		"apellido": "Micheletto",
		"carrera": "101",
		"email": "matiasmicheletto@xxxxxx.com"
	  },
	  "ultimoLogin": 12314234,
	  "calificaciones": {
      "p1_ej1":90,
      "p1_ej2":100,
      "p1_ej3":100,
      "asistencia":50,
      "p2_ej1":90,
      "p2_ej2":100,
      "p2_ej3":100,
      "l5_impl_presentacion":80,
      "l5_impl_funcionamiento":80,
      "l5_informe_presentacion":60,
      "l5_informe_contenido":80
	  },
	  "entregas":{
		  "lab5":1557111600000
	  }
	}]
}
```