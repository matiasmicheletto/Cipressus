var evalTree = function(nodoNotas, nodoFactores){ // Evaluar arbol de calificaciones de un alumno (nodoNotas y nodoFactores deben tener el mismo nivel)
	if(nodoNotas.children.length == undefined) // Es hoja y contiene solo valor de la nota
		return nodoNotas.children; // Retornar solo el valor de la nota
	else{
		var sum = 0;
		for(var k in nodoNotas.children) // Para cada hijo
			sum += evalTree(nodoNotas.children[k],nodoFactores.children[k])*nodoFactores.children[k].factor;
		if(nodoFactores.vencimiento) // Si la actividad tenia fecha de vencimiento
			if(nodoNotas.entrega > nodoFactores.vencimiento) // Hay que descontar puntos
				sum -= Math.ceil((nodoNotas.entrega-nodoFactores.vencimiento)/86400000)*nodoFactores.desgaste; // Descontar puntos por dia
		return sum;
	}
}