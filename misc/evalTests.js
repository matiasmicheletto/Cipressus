var database = {
  "activities" : {
    "children" : [ {
      "factor" : 0.15,
      "id" : "asistencia",
      "name" : "Asistencia a clase"
    }, {
      "children" : [ {
        "children" : [ {
          "factor" : 0.25,
          "id" : "p1_ej1",
          "name" : "Ej 1 - Primer parcial"
        }, {
          "factor" : 0.25,
          "id" : "p1_ej2",
          "name" : "Ej 2 - Primer parcial"
        }, {
          "factor" : 0.25,
          "id" : "p1_ej3",
          "name" : "Ej 3 - Primer parcial"
        }, {
          "factor" : 0.25,
          "id" : "p1_ej4",
          "name" : "Ej 4 - Primer parcial"
        } ],
        "factor" : 0.5,
        "name" : "Primer parcial"
      }, {
        "children" : [ {
          "factor" : 0.25,
          "id" : "p2_ej1",
          "name" : "Ej 1 - Segundo parcial"
        }, {
          "factor" : 0.25,
          "id" : "p2_ej2",
          "name" : "Ej 2 - Segundo parcial"
        }, {
          "factor" : 0.25,
          "id" : "p2_ej3",
          "name" : "Ej 3 - Segundo parcial"
        }, {
          "factor" : 0.25,
          "id" : "p2_ej4",
          "name" : "Ej 4 - Segundo parcial"
        } ],
        "factor" : 0.5,
        "name" : "Segundo parcial"
      } ],
      "factor" : 0.5,
      "name" : "Parciales"
    }, {
      "children" : [ {
        "children" : [ {
          "factor" : 0.5,
          "id" : "l0_estetica",
          "name" : "Estética probador"
        }, {
          "factor" : 0.5,
          "id" : "l0_funcionamiento",
          "name" : "Funcionamiento probador"
        } ],
        "deadline" : {
          "date" : 2000,
          "id" : "lab0",
          "param" : 1
        },
        "factor" : 0.2,
        "name" : "Probador"
      }, {
        "children" : [ {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l1_impl_presentacion",
            "name" : "Presentación prototipo laboratorio 1"
          }, {
            "factor" : 0.5,
            "id" : "l1_impl_funcionamiento",
            "name" : "Funcionamiento prototipo laboratorio 1"
          } ],
          "factor" : 0.4,
          "name" : "Implementación laboratorio 1"
        }, {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l1_informe_presentacion",
            "name" : "Presentación informe laboratorio 1"
          }, {
            "factor" : 0.5,
            "id" : "l1_informe_contenido",
            "name" : "Contenido informe laboratorio 1"
          } ],
          "factor" : 0.6,
          "name" : "Informe laboratorio 1"
        } ],
        "deadline" : {
          "date" : 1556593200000,
          "id" : "lab1",
          "param" : 10
        },
        "factor" : 0.16,
        "name" : "Laboratorio 1"
      }, {
        "children" : [ {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l2_impl_presentacion",
            "name" : "Presentación prototipo laboratorio 2"
          }, {
            "factor" : 0.5,
            "id" : "l2_impl_funcionamiento",
            "name" : "Funcionamiento prototipo laboratorio 2"
          } ],
          "factor" : 0.4,
          "name" : "Implementación laboratorio 2"
        }, {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l2_informe_presentacion",
            "name" : "Presentación informe laboratorio 2"
          }, {
            "factor" : 0.5,
            "id" : "l2_informe_contenido",
            "name" : "Contenido informe laboratorio 2"
          } ],
          "factor" : 0.6,
          "name" : "Informe laboratorio 2"
        } ],
        "deadline" : {
          "date" : 2000,
          "id" : "lab2",
          "param" : 10
        },
        "factor" : 0.16,
        "name" : "Laboratorio 2"
      }, {
        "children" : [ {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l3_impl_presentacion",
            "name" : "Presentación prototipo laboratorio 3"
          }, {
            "factor" : 0.5,
            "id" : "l3_impl_funcionamiento",
            "name" : "Funcionamiento prototipo laboratorio 3"
          } ],
          "factor" : 0.4,
          "name" : "Implementación laboratorio 3"
        }, {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l3_informe_presentacion",
            "name" : "Presentación informe laboratorio 3"
          }, {
            "factor" : 0.5,
            "id" : "l3_informe_contenido",
            "name" : "Contenido informe laboratorio 3"
          } ],
          "factor" : 0.6,
          "name" : "Informe laboratorio 3"
        } ],
        "deadline" : {
          "date" : 2000,
          "id" : "lab3",
          "param" : 10
        },
        "factor" : 0.16,
        "name" : "Laboratorio 3"
      }, {
        "children" : [ {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l4_impl_presentacion",
            "name" : "Presentación prototipo laboratorio 4"
          }, {
            "factor" : 0.5,
            "id" : "l4_impl_funcionamiento",
            "name" : "Funcionamiento prototipo laboratorio 4"
          } ],
          "factor" : 0.4,
          "name" : "Implementación laboratorio 4"
        }, {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l4_informe_presentacion",
            "name" : "Presentación informe laboratorio 4"
          }, {
            "factor" : 0.5,
            "id" : "l4_informe_contenido",
            "name" : "Contenido informe laboratorio 4"
          } ],
          "factor" : 0.6,
          "name" : "Informe laboratorio 4"
        } ],
        "deadline" : {
          "date" : 2000,
          "id" : "lab4",
          "param" : 10
        },
        "factor" : 0.16,
        "name" : "Laboratorio 4"
      }, {
        "children" : [ {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l5_impl_presentacion",
            "name" : "Presentación prototipo laboratorio 5"
          }, {
            "factor" : 0.5,
            "id" : "l5_impl_funcionamiento",
            "name" : "Funcionamiento prototipo laboratorio 5"
          } ],
          "factor" : 0.4,
          "name" : "Implementación laboratorio 5"
        }, {
          "children" : [ {
            "factor" : 0.5,
            "id" : "l5_informe_presentacion",
            "name" : "Presentación informe laboratorio 5"
          }, {
            "factor" : 0.5,
            "id" : "l5_informe_contenido",
            "name" : "Contenido informe laboratorio 5"
          } ],
          "factor" : 0.6,
          "name" : "Informe laboratorio 5"
        } ],
        "deadline" : {
          "date" : 0,
          "id" : "lab5",
          "param" : 10
        },
        "factor" : 0.16,
        "name" : "Laboratorio 5"
      } ],
      "factor" : 0.35,
      "name" : "Laboratorios"
    }, {
      "factor" : 0.2,
      "id" : "suplementario",
      "name" : "Examen suplementario"
    } ],
    "factor" : 1,
    "name" : "Nota final"
  },
  "students" : [ {
    "data" : {
      "degree" : "101",
      "email" : "matiasmicheletto@gmail.com",
      "lu" : 86282,
      "name" : "Matías",
      "secondName" : "Micheletto"
    },
    "scores" : {
      "asistencia" : 75,
      "l1_impl_funcionamiento" : 80,
      "l1_impl_presentacion" : 80,
      "l1_informe_contenido" : 80,
      "l1_informe_presentacion" : 60,
      "p1_ej1" : 90,
      "p1_ej2" : 100,
      "p1_ej3" : 100,
      "p2_ej1" : 90,
      "p2_ej2" : 100,
      "p2_ej3" : 100
    },
    "submits" : {
      "lab1" : 1557111600000
    }
  } ],
  "users" : {
    "FlX1c7HXkzUrrKBmuaqK9mLp1EI2" : {
      "admin" : true,
      "data" : {
        "email" : "matiasmicheletto@gmail.com",
        "name" : "Matias",
        "secondName" : "Micheletto"
      },
      "lastLogin" : 1548589579109
    }
  }
};

var costFunction = function(score,submitMs,deadlineMs,params){ // Funcion de costo por perdida de vencimiento de una actividad
	// Entradas:
	//		- score: es la nota previo a aplicar la funcion de desgaste
	//		- submitMs: es la fecha de entrega expresada en unix time
	//		- deadlineMs: es la fecha de vencimiento (debe ser menor que submitMs)
	//		- params: contiene el o los parametros de la funcion de costo (extender a vector si hace falta)
	return score - Math.ceil((submitMs - deadlineMs)/86400000)*params; // Desgaste lineal
};

var evalTree = function(student,node){ // Computar nota de un alumno
	// Entradas:
	//		- student: contiene la informacion de entregas y notas asignadas por los profesores
	//		- node: es el nodo del arbol de actividades al que se le quiere calcular el puntaje total 

	if(node.children){ // Si el nodo tiene hijos, calcular suma ponderada de los hijos
		var sum = 0; // Contador de puntajes
		for(var k in node.children) // Para cada hijo del nodo
			sum += evalTree(student,node.children[k])*node.children[k].factor; // Sumar nota ponderada de los hijos
		if(node.deadline) // Si la actividad tiene fecha de vencimiento
			if(student.submits[node.deadline.id]) // Y si esta actividad ya fue entregada por el alumno y recibida por el profesor
				if(student.submits[node.deadline.id] > node.deadline.date) // Si se paso el vencimiento, hay que descontar puntos segun funcion de desgaste
					sum = costFunction(sum,student.submits[node.deadline.id],node.deadline.date,node.deadline.param); // Aplicar costo y calcular nuevo puntaje
		return sum;
	}else{ // Es hoja
		if(student.scores[node.id]) // Si ya esta evaluado este campo
			return student.scores[node.id]; // Retornar el valor de la nota
		else 
			return 0; // Si no tiene nota, devolver 0
	}
};


// Ejemplo de evaluacion de la nota final de un alumno
var student = database.students[0];
var node = database.activities;
console.log(node.name)
console.log(evalTree(student,node));

// Evaluacion de los laboratorios
node = database.activities.children[2];
console.log(node.name)
console.log(evalTree(student,node));

// Evaluacion de un laboratorio particular
node = database.activities.children[2].children[1];
console.log(node.name)
console.log(evalTree(student,node));

// Evaluacion de primer parcial
node = database.activities.children[1].children[0];
console.log(node.name)
console.log(evalTree(student,node));