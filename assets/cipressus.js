window.Cipressus = (function(){

    var core = {}; // Atributos y metodos publicos

    core.costFunction = function(score,submitMs,deadlineMs,params){ // Funcion de costo por perdida de vencimiento de una actividad
        // Entradas:
        //		- score: es la nota previo a aplicar la funcion de desgaste
        //		- submitMs: es la fecha de entrega expresada en unix time
        //		- deadlineMs: es la fecha de vencimiento (debe ser menor que submitMs)
        //		- params: contiene el o los parametros de la funcion de costo (extender a vector si hace falta)
        return score - Math.ceil((submitMs - deadlineMs)/86400000)*params; // Desgaste lineal
    };

    core.eval = function(student,node){ // Computar nota de un alumno
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
                        sum = core.costFunction(sum,student.submits[node.deadline.id],node.deadline.date,node.deadline.param); // Aplicar costo y calcular nuevo puntaje
            return sum;
        }else{ // Es hoja
            if(student.scores[node.id]) // Si ya esta evaluado este campo
                return student.scores[node.id]; // Retornar el valor de la nota
            else 
                return 0; // Si no tiene nota, devolver 0
        }
    };

    return core;
})();