window.Cipressus = (function () {
    // Libreria para el control de la base de datos y metodos propios de la app

    var core = { // Instancia de la clase
        db: {}, // Operaciones de base de datos
        storage: {}, // Almacenamiento de archivos
        users: {}, // Operaciones de autenticacion
        utils: {} // Utilidades
    };

    //// BASE DE DATOS /////

    core.db.config = { // Configuracion de la base de datos
        apiKey: "AIzaSyAHpgtsZeQbcoCbKNE1dNjd7gUbSIFWz6M",
        authDomain: "cipressus-0000.firebaseapp.com",
        databaseURL: "https://cipressus-0000.firebaseio.com",
        projectId: "cipressus-0000",
        storageBucket: "cipressus-0000.appspot.com",
        messagingSenderId: "927588929794"
    };

    core.db.listen = function(path){ // Escuchar cambios
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).on('value')
                .then(function (snapshot) {
                    return fulfill(snapshot.val());
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    core.db.get = function (path) { // Descargar informacion de la db
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).once('value')
                .then(function (snapshot) {
                    return fulfill(snapshot.val());
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    core.db.getSorted = function(path,key){ // Obtener lista ordenada por key
        return new Promise(function(fulfill,reject){
            firebase.database().ref(path).orderByChild(key).once('value')
            .then(function (snapshot) {
                return fulfill(snapshot);
            })
            .catch(function (error) {
                return reject(error);
            });
        })
    };

    core.db.set = function (data, path) { // Actualizar entrada de la db
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).set(data)
            .then(function (snapshot) {
                return fulfill(snapshot);
            })
            .catch(function (error) {
                return reject(error);
            });
        });
    };

    core.db.update = function (data, path) { // Actualizar entrada de la db
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).update(data)
            .then(function (snapshot) {
                return fulfill(snapshot);
            })
            .catch(function (error) {
                return reject(error);
            });
        });
    };

    core.db.push = function (data, path) { // Nueva entrada (retorna id)
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).push(data)
            .then(function (snapshot) {
                return fulfill(snapshot);
            })
            .catch(function (error) {
                return reject(error);
            });
        });
    };

    core.db.pushMultiple = function(dataArray, path){ // Subir multiples entradas a un mismo directorio
        return new Promise(function(fulfill, reject){
            var job = [];
            for(var k in dataArray) // Para cada objeto 
                job.push(firebase.database().ref(path).push(dataArray[k])); // TODO: usar multiples paths 
            Promise.all(job) // Ejecutar promise
            .then(function(snapshot){ // Snapshot es un array que contiene los keys
                return fulfill(snapshot); // Del otro lado se puede hacer un for para retornar
            })
            .catch(function(error){ // Ver si retorna un solo error o varios
                return reject(error);
            });
        });
    };

    


    //// ALMACENAMIENTO ////

    core.storage.randomFileName = function(len) { // Nombres aleatorios para archivos
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < len; i++)
          text += possible.charAt(Math.floor(Math.random()*possible.length));
        return text;
    };

    core.storage.put = function(file, path, filename){ // Subir archivo
        return new Promise(function (fulfill, reject) {
            firebase.storage().ref().child(path+"/"+filename).put(file)
            .then(function (snapshot) {
                var size = snapshot.totalBytes; // Tamanio de archivo
                snapshot.ref.getDownloadURL().then(function(url){
                    return fulfill({size:size,url:url}); // Devolver tamanio y url del archivo
                });
            })
            .catch(function (error) { // Ver si retorna un solo error o varios
                return reject(error);
            });
        });
    };

    core.storage.putMultiple = function(files, path, filenames){ // Subir muchos archivos
        return new Promise(function(fulfill, reject){
            var job = [];
            for(var k in files) // Para cada archivo                
                job.push(firebase.storage().ref().child(path+"/"+filenames[k]).put(files[k]));
            Promise.all(job) // Ejecutar promise
            .then(function(snapshot){ // Snapshot devuelve las url de manera asincrona pero en este caso es un array
                var res = []; // Nuevamente generar promesas
                var sizes = []; // Lista de tamanios de archivos
                for(var k in snapshot){
                    sizes.push(snapshot[k].totalBytes);
                    res.push(snapshot[k].ref.getDownloadURL());
                }
                Promise.all(res) // Ejecutar promise para obtener urls
                .then(function(results){ // Results es un array con los urls                    
                    return fulfill({sizes:sizes,urls:results}); // Mandar tamanio y urls
                });
            })
            .catch(function(error){
                return reject(error);
            });
        });
    };

    core.storage.putString = function(str,path,filename){ // Guardar string
        return new Promise(function(fulfill, reject){
            firebase.storage().ref().child(path+"/"+filename).putString(str)
            .then(function (snapshot) {
                snapshot.ref.getDownloadURL().then(function(url){
                    return fulfill(url); // Devolver url de descarga
                });
            })
            .catch(function (error) { // Ver si retorna un solo error o varios
                return reject(error);
            });
        });
    };

    core.storage.delete = function(filename, path){ // Borrar un archivo de storage
        return new Promise(function(fulfill, reject){
            firebase.storage().ref().child(path+"/"+filename).delete()
            .then(function(){
                return fulfill("Borrado: "+path+"/"+filename);
            })
            .catch(function(error){
                return reject(error);
            });
        });
    };



    //// USUARIOS /////

    core.users.onUserSignedIn = function (uid) { // Overridable - inicio de sesion
        console.log("default -- logged in " + uid);
    };

    core.users.onUserSignedOut = function () { // Overridable - cierre de sesion
        console.log("default -- logged out");
    };

    core.users.signIn = function (form) { // Iniciar sesión
        return new Promise(function (fulfill, reject) {
            firebase.auth().signInWithEmailAndPassword(form.email, form.password)
            .catch(function (error) {
                var errorCode = error.code,
                    errorMessage;
                switch (errorCode) {
                    case 'auth/wrong-password':
                        errorMessage = "La contraseña es incorrecta.";
                        break;
                    case 'auth/user-disabled':
                        errorMessage = "El usuario se haya inhabilitado momentáneamente.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = "El email no es válido. Quizá esté mal escrito o no exista.";
                        break;
                    case 'auth/user-not-found':
                        errorMessage = "El usuario no existe.";
                        break;
                    default:
                        errorMessage = "Algo pasó.. revisa tu conexión a internet e intentálo nuevamente.";
                        break;
                }
                return reject([errorCode, errorMessage]);
            })
            .then(function (result) {
                return fulfill("Logeado correctamente.");
            });
        });
    };

    core.users.signOut = function () {
        return new Promise(function (fulfill, reject) {
            firebase.auth().signOut()
            .then(function () {
                return fulfill("Ha salido de Cipressus.");
            })
            .catch(function (error) {
                return reject([error, "Algo pasó.. intentálo nuevamente."]);
            });
        });
    }

    core.users.signUp = function (form) { // Registrarse como nuevo usuario
        return new Promise(function (fulfill, reject) {
            firebase.auth().createUserWithEmailAndPassword(form.email, form.password)
            .catch(function (error) {
                var errorCode = error.code,
                    errorMessage;
                switch (errorCode) {
                    case 'auth/weak-password':
                        errorMessage = "La contraseña es demasiado débil. Intenta con una más segura.";
                        break;
                    case 'auth/email-already-in-use':
                        errorMessage = "Éste email ya existe en nuestra base de datos.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = "El email no es válido. Revisa lo ingresado.";
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = "No se puede crear la cuenta para ese usuario. Ponete en contacto con los administradores.";
                        break;
                    default:
                        errorMessage = "Algo pasó... revisa tu conexión a internet e intentálo nuevamente.";
                        break;
                }
                return reject([errorCode, errorMessage]);
            })
            .then(function (result) {
                // Guardar informacion del usuario en la db
                var users_public = { // Informacion editable por usuarios
                    activity: {
                        last_login: Date.now(),
                        browser: {}, // Contador de navegadores
                        os: {} // Contador de sistemas operativos
                    },
                    name: form.name,
                    secondName: form.secondName,
                    email: form.email,
                    degree: form.degree,
                    lu: form.lu,
                    avatar: "images/avatar_0.png" // Imagen por defecto (luego se carga una base64)
                };
                // Inicializar contadores de navegador y so
                users_public.activity.browser[is.firefox() ? 'Firefox' : (is.chrome() ? 'Chrome' : (is.ie() ? 'IE' : (is.opera() ? 'Opera' : (is.safari() ? 'Safari' : 'Otro'))))] = 1;
                users_public.activity.os[is.ios() ? 'IOS' : (is.android() ? 'Android' : (is.windows() ? 'Windows' : (is.linux() ? 'Linux' : 'Otro')))] = 1;

                core.db.set(users_public,'users_public/'+result.user.uid)
                    .then(function (res) {
                        return fulfill("Datos de nuevo usuario registrados.");
                    })
                    .catch(function (err) {
                        return reject([err, "Ocurrió un problema al guardar los datos."]);
                    });
            });
        });
    };

    core.users.resetPwd = function (email) { // Restablecer contrasenia
        return new Promise(function (fulfill, reject) {
            firebase.auth().sendPasswordResetEmail(email)
            .then(function () {
                return fulfill("Listo. Revisa tu correo electrónico.");
            })
            .catch(function (error) {
                return reject([error, "Algo pasó.. intentálo nuevamente."]);
            });
        });
    };


    //// UTILIDADES ////
    core.utils.searchNode = function(node, id){ // Obtener el objeto de un nodo
        // Entradas:
        //		- node: es el nodo del arbol a partir del cual se inicia la busqueda
        //      - id: es el identificador de la actividad que se desea buscar    
        var result = null;
        if(node.id == id) // Coincidencia
            return node;
        else
            if(node.children) // Si el nodo tiene hijos, recorrer buscando
                for (var k in node.children){ // Para cada hijo del nodo
                    result = core.utils.searchNode(node.children[k],id); // Buscar
                    if(result)
                        return result;
                } 
        return result;
    };

    core.utils.defaultCostFunction = function (submitMs, deadlineMs, param) { // Funcion de costo por perdida de vencimiento de una actividad
        // Entradas:
        //		- submitMs: es la fecha de entrega expresada en unix time
        //		- deadlineMs: es la fecha de vencimiento (debe ser menor que submitMs)
        //		- param: contiene el o los parametros de la funcion de costo (extender a vector si hace falta)
        return Math.ceil((submitMs - deadlineMs) / 86400000) * param; // Desgaste lineal
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
                if (student.submits[node.id]) // Y si esta actividad ya fue entregada por el alumno y recibida por el profesor
                    if (student.submits[node.id].submitted > node.deadline.date){ // Si se paso el vencimiento, hay que descontar puntos segun funcion de desgaste
                        var cost = core.utils.defaultCostFunction(student.submits[node.id].submitted, node.deadline.date, node.deadline.param);
                        if(cost > node.score) cost = node.score; // Habria que considerar la nota puesta
                        sum -= cost; // Restar costo
                    }
            return sum;
        } else { // Es hoja
            if (student.scores[node.id]) // Si ya esta evaluado este campo
                return student.scores[node.id].score*node.score/100; // Retornar el valor de la nota multiplicado por el puntaje de la actividad
            else
                return 0; // Si no tiene nota, devolver 0
        }
    };

    core.utils.getArray = function(node,arr,parent){ // Convertir el arbol en arreglo referenciado
        // Sirve para exportar a formato de highcharts y para listar actividades en vista de alumnos
        // Entradas:
        //		- node: contiene el arbol de notas
        //		- arr: se pasa recursivamente para ir completando con informacion de los nodos y hojas
        //      - parent: es el identificador del padre para ir pasando las referencias
        if (node.children) { 
            for (var k in node.children) // Para cada hijo del nodo
                arr.concat(core.utils.getArray(node.children[k],arr,node.id)); // Obtener arreglo de los hijos
            arr.push({ // Agregar el nodo actual 
                id: node.id,
                parent: parent, // Referencias hacia atras
                name: node.name,
                score: node.score, // Higcharts calcula este valor y por eso se llama value en las hojas
                dl: node.deadline // Vencimiento va si existe
            });
            return arr;
        } else { // Es hoja, agregar hoja y retornar
            arr.push({
                id: node.id,
                parent: parent,
                name: node.name,
                value: node.score // Este dato lo usa highcarts (se calcula para los nodos padres)
            });
            return arr;
        }
    };

    core.utils.sendEmail = function (data) { // Enviar email (requiere script php en hosting)
        return new Promise(function (fulfill, reject) {
            var uriData = 'nombre=' + data.name + '&email=' + data.email + '&cc=' + data.cc.join() + '&asunto=' + data.subject + '&mensaje=' + data.message;
            //var ajax_url = 'https://cipressus.uns.edu.ar/mail.php';
            var ajax_url = '';
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
            } 
            catch (err) {
                return reject(err);
            }
        });
    };

    core.utils.generateFileName = function (len) { // Nombres aleatorios para archivos
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < len; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };

    core.utils.quillToHTML = function(str){ // Hacer la adaptacion del formato quill al formato html de home
        return str.replace(/ql-align-center/g,"center-align"); // Por ahora solo este, buscar otros
    };

    core.utils.activityCntr = function(userUid,item){ // Incrementador de contadores para monitoreo de actividad de usuarios
        return new Promise(function (fulfill, reject) {
            core.db.get("users_public/"+userUid+"/activity/items/"+item)
            .then(function(activity_data){
                var data = {};                
                if(activity_data) // Tiene valores en este item de actividad
                    data[item] = activity_data+1;
                else // Aun no registra actividad en este item
                    data[item] = 1;
                core.db.update(data,"users_public/"+userUid+"/activity/items")
                .then(function(res){
                    return fulfill(res);
                })
                .catch(function(err){
                    return reject(err);
                });
            })
            .catch(function(err){
                return reject(err);
            });
        });
    };


    ///// PRINCIPAL /////

    core.initialize = function () { // Instrucciones de inicializacion de las utilidades        
        return new Promise(function (fulfill, reject) {
            firebase.initializeApp(core.db.config); // Inicializar base de datos

            firebase.auth().onAuthStateChanged(function (user) { // Escuchar cambios de logeo de usuario
                if (user) // El usuario esta logeado
                    core.users.onUserSignedIn(user.uid); // Pasar uid a los callbacks
                else // Si cerro sesión, se llama al callback
                    core.users.onUserSignedOut();
            });

            return fulfill();
        });
    };

    return core;
})();