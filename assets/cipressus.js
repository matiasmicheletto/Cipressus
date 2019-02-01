window.Cipressus = (function () {
    // Libreria para el control de la base de datos y metodos de evaluacion


    /*********  PRIVADO **********/

    var defaultCostFunction = function (score, submitMs, deadlineMs, param) { // Funcion de costo por perdida de vencimiento de una actividad
        // Entradas:
        //		- score: es la nota previo a aplicar la funcion de desgaste
        //		- submitMs: es la fecha de entrega expresada en unix time
        //		- deadlineMs: es la fecha de vencimiento (debe ser menor que submitMs)
        //		- param: contiene el o los parametros de la funcion de costo (extender a vector si hace falta)
        return score - Math.ceil((submitMs - deadlineMs) / 86400000) * param; // Desgaste lineal
    };


    /*********  PUBLICO **********/

    var core = { // Instancia de la clase
        db: {}, // Operaciones de base de datos
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

    core.db.set = function (data, path) { // Actualizar entrada de la db
        // Para actualizar multples, poner solo array en data
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
        // Para actualizar multples, poner solo array en data
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
                return fulfill("Logeado correctamente...");
            });
        });
    };

    core.users.signOut = function () {
        return new Promise(function (fulfill, reject) {
            firebase.auth().signOut()
            .then(function () {
                return fulfill("Hasta pronto!");
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
                    last_login: Date.now(),
                    name: form.name,
                    secondName: form.secondName,
                    email: form.email,
                    degree: form.degree,
                    lu: form.lu,
                    avatar: "images/avatar_0.png" // Imagen por defecto (luego se carga una base64)
                };
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

    core.utils.eval = function (student, node, costFunction) { // Computar nota de un alumno
        // Entradas:
        //		- student: contiene la informacion de entregas y notas asignadas por los profesores
        //		- node: es el nodo del arbol de actividades al que se le quiere calcular el puntaje total 
        //      - costFuncion: [opcional] es la funcion de costo por perdida de vencimiento

        if (node.children) { // Si el nodo tiene hijos, calcular suma ponderada de los hijos
            var sum = 0; // Contador de puntajes
            for (var k in node.children) // Para cada hijo del nodo
                sum += core.utils.eval(student, node.children[k]) * node.children[k].factor; // Sumar nota ponderada de los hijos
            if (node.deadline) // Si la actividad tiene fecha de vencimiento
                if (student.submits[node.deadline.id]) // Y si esta actividad ya fue entregada por el alumno y recibida por el profesor
                    if (student.submits[node.deadline.id] > node.deadline.date) // Si se paso el vencimiento, hay que descontar puntos segun funcion de desgaste
                        if (costFunction) // Si se indico una funcion de costo, usar esa
                            sum = costFunction(sum, student.submits[node.deadline.id], node.deadline.date, node.deadline.param); // Aplicar costo y calcular nuevo puntaje
                        else // Sino usar la funcion por defecto de la libreria
                            sum = defaultCostFunction(sum, student.submits[node.deadline.id], node.deadline.date, node.deadline.param);
            return sum;
        } else { // Es hoja
            if (student.scores[node.id]) // Si ya esta evaluado este campo
                return student.scores[node.id]; // Retornar el valor de la nota
            else
                return 0; // Si no tiene nota, devolver 0
        }
    };

    core.utils.getArray = function(node,arr,parent){ // Convertir el arbol en arreglo referenciado
        if (node.children) { 
            for (var k in node.children) // Para cada hijo del nodo
                arr.concat(core.utils.getArray(node.children[k],arr,node.id)); // Obtener arreglo de los hijos
            arr.push({ // Agregar el nodo actual 
                id: node.id,
                parent: parent, // Referencias hacia atras
                name: node.name
            });
            return arr;
        } else { // Es hoja, agregar hoja y retornar
            arr.push({
                id: node.id,
                parent: parent,
                name: node.name,
                value: node.size
            });
            return arr;
        }
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