var database = {
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
		  }, {
			"nombre": "Segundo parcial",
			"factor": 0.5,
			"children": [{
			  "nombre": "Ej 1 - Segundo parcial",
			  "factor": 0.25,
			  "id":"p2_ej1"
			}, {
			  "nombre": "Ej 2 - Segundo parcial",
			  "factor": 0.25,
			  "id":"p2_ej2"
			}, {
			  "nombre": "Ej 3 - Segundo parcial",
			  "factor": 0.25,
			  "id":"p2_ej3"
			}, {
			  "nombre": "Ej 4 - Segundo parcial",
			  "factor": 0.25,
			  "id":"p2_ej4"
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
				"fecha":1556593200000,        
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
			},
			{
			  "nombre": "Laboratorio 2",
			  "factor": 0.16,
			  "vencimiento": {
				"fecha":2000,        
				"desgaste": 10,           
				"id": "lab2"
			  },
			  "children": [{
				  "nombre": "Implementación laboratorio 2",
				  "factor": 0.4,
				  "children": [{
					  "nombre": "Presentación prototipo laboratorio 2",
					  "factor": 0.5,
					  "id":"l2_impl_presentacion"
					},
					{
					  "nombre": "Funcionamiento prototipo laboratorio 2",
					  "factor": 0.5,
					  "id":"l2_impl_funcionamiento"
					}
				  ]
				},
				{
				  "nombre": "Informe laboratorio 2",
				  "factor": 0.6,
				  "children": [{
					"nombre": "Presentación informe laboratorio 2",
					"factor": 0.5,
					"id":"l2_informe_presentacion"
				  }, {
					"nombre": "Contenido informe laboratorio 2",
					"factor": 0.5,
					"id":"l2_informe_contenido"
				  }]
				}
			  ]
			},
			{
			  "nombre": "Laboratorio 3",
			  "factor": 0.16,
			  "vencimiento": {
				"fecha":2000,        
				"desgaste": 10,           
				"id": "lab3"
			  },
			  "children": [{
				"nombre": "Implementación laboratorio 3",
				"factor": 0.4,
				"children": [{
					"nombre": "Presentación prototipo laboratorio 3",
					"factor": 0.5,
					"id":"l3_impl_presentacion"
				  },
				  {
					"nombre": "Funcionamiento prototipo laboratorio 3",
					"factor": 0.5,
					"id":"l3_impl_funcionamiento"
				  }
				]
			  },
			  {
				"nombre": "Informe laboratorio 3",
				"factor": 0.6,
				"children": [{
				  "nombre": "Presentación informe laboratorio 3",
				  "factor": 0.5,
				  "id":"l3_informe_presentacion"
				}, {
				  "nombre": "Contenido informe laboratorio 3",
				  "factor": 0.5,
				  "id":"l3_informe_contenido"
				}]
				}
			  ]
			},
			{
			  "nombre": "Laboratorio 4",
			  "factor": 0.16,
			  "vencimiento": {
				"fecha":2000,        
				"desgaste": 10,           
				"id": "lab4"
			  },
			  "children": [{
				"nombre": "Implementación laboratorio 4",
				"factor": 0.4,
				"children": [{
					"nombre": "Presentación prototipo laboratorio 4",
					"factor": 0.5,
					"id":"l4_impl_presentacion"
				  },
				  {
					"nombre": "Funcionamiento prototipo laboratorio 4",
					"factor": 0.5,
					"id":"l4_impl_funcionamiento"
				  }
				]
			  },
			  {
				"nombre": "Informe laboratorio 4",
				"factor": 0.6,
				"children": [{
				  "nombre": "Presentación informe laboratorio 4",
				  "factor": 0.5,
				  "id":"l4_informe_presentacion"
				}, {
				  "nombre": "Contenido informe laboratorio 4",
				  "factor": 0.5,
				  "id":"l4_informe_contenido"
				}]
				}
			  ]
			},
			{
			  "nombre": "Laboratorio 5",
			  "factor": 0.16,
			  "vencimiento": {
				"fecha":0,        
				"desgaste": 10,           
				"id": "lab5"
			  },
			  "children": [{
				"nombre": "Implementación laboratorio 5",
				"factor": 0.4,
				"children": [{
					"nombre": "Presentación prototipo laboratorio 5",
					"factor": 0.5,
					"id":"l5_impl_presentacion"
				  },
				  {
					"nombre": "Funcionamiento prototipo laboratorio 5",
					"factor": 0.5,
					"id":"l5_impl_funcionamiento"
				  }
				]
			  },
			  {
				"nombre": "Informe laboratorio 5",
				"factor": 0.6,
				"children": [{
				  "nombre": "Presentación informe laboratorio 5",
				  "factor": 0.5,
				  "id":"l5_informe_presentacion"
				}, {
				  "nombre": "Contenido informe laboratorio 5",
				  "factor": 0.5,
				  "id":"l5_informe_contenido"
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
	},
	"alumnos": [{
	  "datos": {
		"nombre": "Matías",
		"apellido": "Micheletto",
		"carrera": "101",
		"email": "matiasmicheletto@gmail.com"
	  },
	  "ultimoLogin": 12314234,
	  "calificaciones": {
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
	  "entregas":{
		"lab1":1557111600000
	  }
	}]
  }

var evalTree = function(alumno,nodo){ // Computar nota de un alumno
	// Calificacion es un arreglo que contiene las notas obtenidas de cada actividad
	// Factor es el arbol que contiene los factores de ponderacion de las notas
	if(nodo.children){ // Seguir iterando recursivamente por los nodos hijos
		var sum = 0;
		for(var k in nodo.children) // Para cada hijo
			sum += evalTree(alumno,nodo.children[k])*nodo.children[k].factor; // Sumar nota ponderada de los hijos
		if(nodo.vencimiento) // Si la actividad tenia fecha de vencimiento
			if(alumno.entregas[nodo.vencimiento.id]) // Si esta actividad fue entregada
				if(alumno.entregas[nodo.vencimiento.id] > nodo.vencimiento.fecha) // Hay que descontar puntos
					sum -= Math.ceil((alumno.entregas[nodo.vencimiento.id] - nodo.vencimiento.fecha)/86400000)*nodo.vencimiento.desgaste; // Descontar puntos por dia
		return sum;
	}else{ // Es hoja
		if(alumno.calificaciones[nodo.id]) // Si esta evaluado este campo
			return alumno.calificaciones[nodo.id]; // Retornar el valor de la nota
		else 
			return 0; // Si no tiene nota, devolver 0
	}
}


// Ejemplo de evaluacion de la nota final de un alumno
var alumno = database.alumnos[0];
var nodo = database.actividades;
console.log(nodo.nombre)
console.log(evalTree(alumno,nodo));

// Evaluacion de los laboratorios
nodo = database.actividades.children[2];
console.log(nodo.nombre)
console.log(evalTree(alumno,nodo));

// Evaluacion de un laboratorio particular
nodo = database.actividades.children[2].children[1];
console.log(nodo.nombre)
console.log(evalTree(alumno,nodo));

// Evaluacion de primer parcial
nodo = database.actividades.children[1].children[0];
console.log(nodo.nombre)
console.log(evalTree(alumno,nodo));