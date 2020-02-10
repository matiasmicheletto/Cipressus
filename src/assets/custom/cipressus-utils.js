(function (core) { //// UTILIDADES ////

    var actionStack = [];

    core.utils.searchNode = function (node, id) { // Obtener el objeto de un nodo a partir del id
        // Entradas:
        //		- node: es el nodo del arbol a partir del cual se inicia la busqueda
        //      - id: es el identificador de la actividad que se desea buscar    
        var result = null;
        if (node.id == id) // Coincidencia
            return node;
        else
        if (node.children) // Si el nodo tiene hijos, recorrer buscando
            for (var k in node.children) { // Para cada hijo del nodo
                result = core.utils.searchNode(node.children[k], id); // Buscar
                if (result)
                    return result;
            }
        return result;
    };

    core.utils.defaultCostFunction = function (submitMs, deadlineMs, param) { // Funcion de costo por perdida de vencimiento de una actividad
        // Entradas:
        //		- submitMs: es la fecha de entrega expresada en unix time
        //		- deadlineMs: es la fecha de vencimiento (debe ser menor que submitMs)
        //		- param: contiene el o los parametros de la funcion de costo (extender a vector si hace falta)
        return Math.ceil((submitMs - deadlineMs) / 86400000) * param; // Desgaste lineal por dia
    };

    core.utils.eval = function (student, node) { // Computar nota de un alumno en puntaje absoluto
        // Entradas:
        //		- student: contiene la informacion de entregas y notas asignadas por los profesores
        //		- node: es el nodo del arbol de actividades al que se le quiere calcular el puntaje total 

        if (node.children) { // Si el nodo tiene hijos, calcular suma ponderada de los hijos
            var sum = 0; // Contador de puntajes
            for (var k in node.children) // Para cada hijo del nodo
                sum += core.utils.eval(student, node.children[k]); // Sumar nota obtenida de los hijos
            if (node.deadline) // Si la actividad tiene fecha de vencimiento
                if (student.submits) // Si el alumno tiene alguna entrega
                    if (student.submits[node.id]) // Y si esta actividad ya fue entregada por el alumno y recibida por el profesor
                        if (student.submits[node.id].submitted > node.deadline.date) { // Si se paso el vencimiento, hay que descontar puntos segun funcion de desgaste
                            var cost = core.utils.defaultCostFunction(student.submits[node.id].submitted, node.deadline.date, node.deadline.param);
                            if (cost > node.score) cost = node.score; // Habria que considerar la nota puesta
                            sum -= cost; // Restar costo
                            if (sum < 0) sum = 0; // La nota no puede ser negativa
                        }
            return sum;
        } else { // Es hoja
            if(student.scores){ // Puede que no tenga ninguna calificacion aun
                if (student.scores[node.id]) // Si ya esta evaluado este campo
                    return student.scores[node.id].score * node.score / 100; // Retornar el valor de la nota multiplicado por el puntaje de la actividad
                else
                    return 0; // Si no tiene nota, devolver 0
            }else{
                return 0;
            }
        }
    };

    core.utils.getArray = function (root) { // Convertir el arbol en arreglo referenciado
        // Sirve para exportar a formato de highcharts y para listar actividades en vista de alumnos

        var getArrRec = function (node, arr, parent) { // Recorrido recursivo
            if (node.children) {
                for (var k in node.children) // Para cada hijo del nodo
                    getArrRec(node.children[k], arr, node.id); // Obtener arreglo de los hijos
                
                arr.push({ // Agregar el nodo actual 
                    id: node.id,
                    parent: parent, // Referencias hacia atras
                    name: node.name,
                    score: node.score, // Higcharts calcula este valor y por eso se llama value en las hojas
                    dl: node.deadline // Vencimiento va si existe
                });
            } else { // Es hoja, agregar hoja y retornar
                arr.push({
                    id: node.id,
                    parent: parent,
                    name: node.name,
                    value: node.score // Este dato lo usa highcarts (se calcula para los nodos padres)
                });
            }
        }

        var arr = [];

        getArrRec(root, arr, ''); // Iniciar
        
        return arr;
    };

    core.utils.getTree = function(root){ // Obtener arbol como nodos y lazos
        
        var treeRec = function(tree, nodes, edges, color){ // Funcion recursiva para recorrer el arbol
            
            nodes.push({
                id: tree.id,
                label: tree.name+"\nPuntaje: "+tree.score,
                shape: "box",
                color: color ? color : "#555555",                
                font: { 
                    size: 12, 
                    color: "white", 
                    face: "arial", 
                    strokeWidth: 3, 
                    strokeColor: "#000000" 
                }
            });

            if(tree.children){ 
                var color = '#'+Math.floor(Math.random()*16777215).toString(16);
                for(var k in tree.children){
                    treeRec(tree.children[k], nodes, edges, color);
                    edges.push({
                        from: tree.id,
                        to: tree.children[k].id
                    });
                }
            }else{                
                return;
            }
        };

        // Hay que crear un nodo root con un solo children para que funcione con la libreria vis.js
        var nodes = [
            {
                id: "main", 
                label: root.course.name.replace(/\s/g,"\n"),
                shape: "box",
                font: { 
                    size: 12, 
                    color: "white", 
                    face: "arial", 
                    strokeWidth: 3, 
                    strokeColor: "#000000" 
                }
            }
        ]; 

        var edges = [{from: "main", to: root.id}];

        treeRec(root, nodes, edges); // Iniciar

        return {
            nodes: nodes,
            edges: edges
        };
    };

    core.utils.sendEmail = function (data) { // Enviar email (requiere script php en hosting)
        return new Promise(function (fulfill, reject) {
            /*
            var uriData = 'nombre=' + data.name + '&email=' + data.email + '&cc=' + data.cc.join() + '&asunto=' + data.subject + '&mensaje=' + data.message;
            var ajax_url = 'https://cipressus.uns.edu.ar/mail.php';
            var ajax_request = new XMLHttpRequest();
            ajax_request.onreadystatechange = function () {
                if (ajax_request.readyState === 4)
                    return fulfill({
                        response: ajax_request.responseText,
                        type: "success",
                        status: ajax_request.status
                    });
            };
            try {
                ajax_request.open("POST", ajax_url, false);
                ajax_request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                ajax_request.send(encodeURI(uriData));
            } catch (err) {
                return reject(err);
            }
            */
            return reject("Email no implementado");
        });
    };

    core.utils.sendNotification = function (data) { // Enviar notificaciones por FCM
        var xhr = new XMLHttpRequest();
        var url = "https://fcm.googleapis.com/fcm/send";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "key=AAAA1_ib0QI:APA91bHVFpFU4-CAibNhNmCriYbWcqbmhQuuCZa1sITD4BgF2wBBYZ8-WPc30NI0n_HfPFHEIzG1THqKgtWS8gd1bUROftZpW_o2OqBP64IgciaQMNnp4_nKU5vysZmAACjToKWFsPGe");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                console.log(json);
            }
        };

        /*var data = {
            "notification": {
                "title": "Cipressus",
                "body": "Hola mundo",
                "icon": "images/mainlogo.png"
            },
            "to": "eY9vq-H4hws:APA91bHwMxWW5K6jEySnJGpkOEHc9RiY6aCjEUl1yK0xqf4LHeOmgGMUYlYlBYDiN7inFJjz1vMHeb3GGAg-yQPYJphveS_Q7q_i2JY1VKgSv7HqGMY3mUW4uKqph7NQt48b4KXyh5B-" // Token que devuelve
        };*/

        var msg = JSON.stringify(data);
        xhr.send(msg);
    };

    core.utils.generateFileName = function (len) { // Nombres aleatorios para archivos
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < len; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };

    core.utils.quillToHTML = function (str) { // Hacer la adaptacion del formato quill al formato html de home
        return str.replace(/ql-align-center/g, "center-align"); // Por ahora solo este, buscar otros
    };

    core.utils.activityCntr = function (userUid, item) { // Incrementador de contadores para monitoreo de actividad de usuarios
        return new Promise(function (fulfill, reject) {
            core.db.get("users_public/" + userUid + "/activity/items/" + item)
                .then(function (activity_data) {
                    var data = {};
                    if (activity_data) // Tiene valores en este item de actividad
                        data[item] = activity_data + 1;
                    else // Aun no registra actividad en este item
                        data[item] = 1;
                    core.db.update(data, "users_public/" + userUid + "/activity/items")
                        .then(function (res) {
                            return fulfill(res);
                        })
                        .catch(function (err) {
                            return reject(err);
                        });
                })
                .catch(function (err) {
                    return reject(err);
                });
        });
    };

    core.utils.logAction = function(actionMsg){ // Registra acciones del usuario localmente. Si ocurre error se guarda el registro en la db
        actionStack.push({
            msg: actionMsg,
            timestamp: Date.now()
        });
    };

    core.utils.logError = function(error){ // Registra error en db para llevar estadistica de funcionamiento
        /* Formato:
        error = {
            source: [string], // Nombre del controller o libreria donde ocurre el error
            line: [number], // Numero de linea del codigo donde se dispara el error
            code: [string], // Si hay codigo de error disponible o mensaje (generado por librerias, dependencias, etc)
            msg: [string], // Mensaje de error (redactado por programador)
            uid: [string], // Usuario que genero ese error
        }

        Ejemplo (sin codigo de error):

        var error = {
            source: "main.js", 
            line: 54,  // TODO: generar automaticamente
            msg: "Error actualizando dato", // Mensaje de error (redactado por programador)
            uid: "erfd6f7a8dfadyfgad" // Usuario que genero ese error
        }
        Cipressus.utils.logError(error);
        */

        // Agregar un par de atributos automaticos
        error.timestamp = Date.now(); // Hora local (usar de firebase?)

        if(actionStack.length > 0) // Registro de acciones
            error.stack = actionStack;

        // Logear en firestore
        core.fs.add(error, "errorLog")
        .then(function(){
            actionStack = []; // Se reinicia la pila de acciones
            console.log("Error reportado");
        })
        .catch(function(err){
            console.log(err);
        });
    };

    core.utils.getPrimeImplicants = function (data) { // Obtener implicantes primos a partir de los miniterminos
        // Autor del metodo: Janus Troelsen (https://gist.github.com/ysangkok/5707171)
        /*
        var minterms = ['1101', '1100', '1110', '1111', '1010', '0011', '0111', '0110'];
        var minterms2 = ['0000', '0100', '1000', '0101', '1100', '0111', '1011', '1111'];
        var minterms3 = ['0001', '0011', '0100', '0110', '1011', '0000', '1000', '1010', '1100', '1101'];
        console.log( 'PI(s):', JSON.stringify(Cipressus.utils.getPrimeImplicants(minterms)));
        console.log( 'PI2(s):', JSON.stringify(Cipressus.utils.getPrimeImplicants(minterms2)));
        console.log( 'PI3(s):', JSON.stringify(Cipressus.utils.getPrimeImplicants(minterms3)));
        */

        var combine = function (m, n) {
            var a = m.length,
                c = '',
                count = 0,
                i;
            for (i = 0; i < a; i++) {
                if (m[i] === n[i]) {
                    c += m[i];
                } else if (m[i] !== n[i]) {
                    c += '-';
                    count += 1;
                }
            }
            if (count > 1)
                return "";
            return c;
        };

        var repeatelem = function (elem, count) {
            var accu = [],
                addOneAndRecurse = function (remaining) {
                    accu.push(elem);
                    if (remaining > 1) {
                        addOneAndRecurse(remaining - 1);
                    }
                };
            addOneAndRecurse(count);
            return accu;
        };

        var newList = [].concat(data),
            size = newList.length,
            IM = [],
            im = [],
            im2 = [],
            mark = repeatelem(0, size),
            mark2, m = 0,
            i, j, c, p, n, r, q;
        for (i = 0; i < size; i++) {
            for (j = i + 1; j < size; j++) {
                c = combine(newList[i], newList[j]);
                if (c !== "") {
                    im.push(c);
                    mark[i] = 1;
                    mark[j] = 1;
                }
            }
        }

        mark2 = repeatelem(0, im.length);
        for (p = 0; p < im.length; p++) {
            for (n = p + 1; n < im.length; n++) {
                if (p !== n && mark2[n] === 0 && im[p] === im[n]) {
                    mark2[n] = 1;
                }
            }
        }

        for (r = 0; r < im.length; r++) {
            if (mark2[r] === 0) {
                im2.push(im[r]);
            }
        }

        for (q = 0; q < size; q++) {
            if (mark[q] === 0) {
                IM.push(newList[q]);
                m = m + 1;
            }
        }

        if (m !== size && size !== 1)
            IM = IM.concat(Cipressus.utils.getPrimeImplicants(im2));

        IM.sort();
        return IM;
    };
})(Cipressus);