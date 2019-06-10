window.Cipressus = (function () {
    // Libreria para el control de la base de datos, storage, metodos utiles de la app y de comunicacion con hardware

    var core = { // Instancia de la clase
        db: {}, // Operaciones de base de datos
        storage: {}, // Almacenamiento de archivos
        users: {}, // Operaciones de autenticacion
        utils: {}, // Utilidades
        hardware: {} // Metodos de control de hardware (probador de circuitos)
    };

    var socket; // Objeto privado para comunicarse con el server
    var serialPorts = []; // Lista de puertos serie disponibles (objeto privado)

    //// BASE DE DATOS /////

    core.db.config = { // Configuracion de la base de datos
        apiKey: "AIzaSyAHpgtsZeQbcoCbKNE1dNjd7gUbSIFWz6M",
        authDomain: "cipressus-0000.firebaseapp.com",
        databaseURL: "https://cipressus-0000.firebaseio.com",
        projectId: "cipressus-0000",
        storageBucket: "cipressus-0000.appspot.com",
        messagingSenderId: "927588929794",
        publicvapidkey: "BF0sMjIt0y1H_3oyJzmkBmPkrG9UK7HL5ekgRXj50jEYc3MZSfpjCd051A0tNkNfEtLmmVlYILFvi8PQ0BDXRNM"
    };

    core.db.listen = function (path) { // Escuchar cambios
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

    core.db.getSorted = function (path, key) { // Obtener lista ordenada por key
        return new Promise(function (fulfill, reject) {
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

    core.db.pushMultiple = function (dataArray, path) { // Subir multiples entradas a un mismo directorio
        return new Promise(function (fulfill, reject) {
            var job = [];
            for (var k in dataArray) // Para cada objeto 
                job.push(firebase.database().ref(path).push(dataArray[k])); // TODO: usar multiples paths 
            Promise.all(job) // Ejecutar promise
                .then(function (snapshot) { // Snapshot es un array que contiene los keys
                    return fulfill(snapshot); // Del otro lado se puede hacer un for para retornar
                })
                .catch(function (error) { // Ver si retorna un solo error o varios
                    return reject(error);
                });
        });
    };




    //// ALMACENAMIENTO ////

    core.storage.put = function (file, path, filename) { // Subir archivo
        return new Promise(function (fulfill, reject) {
            firebase.storage().ref().child(path + "/" + filename).put(file)
                .then(function (snapshot) {
                    var size = snapshot.totalBytes; // Tamanio de archivo
                    snapshot.ref.getDownloadURL().then(function (url) {
                        return fulfill({
                            size: size,
                            url: url
                        }); // Devolver tamanio y url del archivo
                    });
                })
                .catch(function (error) { // Ver si retorna un solo error o varios
                    return reject(error);
                });
        });
    };

    core.storage.putMultiple = function (files, path, filenames) { // Subir muchos archivos
        return new Promise(function (fulfill, reject) {
            var job = [];
            for (var k in files) // Para cada archivo                
                job.push(firebase.storage().ref().child(path + "/" + filenames[k]).put(files[k]));
            Promise.all(job) // Ejecutar promise
                .then(function (snapshot) { // Snapshot devuelve las url de manera asincrona pero en este caso es un array
                    var res = []; // Nuevamente generar promesas
                    var sizes = []; // Lista de tamanios de archivos
                    for (var k in snapshot) {
                        sizes.push(snapshot[k].totalBytes);
                        res.push(snapshot[k].ref.getDownloadURL());
                    }
                    Promise.all(res) // Ejecutar promise para obtener urls
                        .then(function (results) { // Results es un array con los urls                    
                            return fulfill({
                                sizes: sizes,
                                urls: results
                            }); // Mandar tamanio y urls
                        });
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    core.storage.putString = function (str, path, filename) { // Guardar string
        return new Promise(function (fulfill, reject) {
            firebase.storage().ref().child(path + "/" + filename).putString(str)
                .then(function (snapshot) {
                    snapshot.ref.getDownloadURL().then(function (url) {
                        return fulfill(url); // Devolver url de descarga
                    });
                })
                .catch(function (error) { // Ver si retorna un solo error o varios
                    return reject(error);
                });
        });
    };

    core.storage.delete = function (filename, path) { // Borrar un archivo de storage
        return new Promise(function (fulfill, reject) {
            firebase.storage().ref().child(path + "/" + filename).delete()
                .then(function () {
                    return fulfill("Borrado: " + path + "/" + filename);
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

                    core.db.set(users_public, 'users_public/' + result.user.uid)
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
                            if(sum < 0) sum = 0; // La nota no puede ser negativa
                        }
            return sum;
        } else { // Es hoja
            if (student.scores[node.id]) // Si ya esta evaluado este campo
                return student.scores[node.id].score * node.score / 100; // Retornar el valor de la nota multiplicado por el puntaje de la actividad
            else
                return 0; // Si no tiene nota, devolver 0
        }
    };

    core.utils.getArray = function (node, arr, parent) { // Convertir el arbol en arreglo referenciado
        // Sirve para exportar a formato de highcharts y para listar actividades en vista de alumnos
        // Entradas:
        //		- node: contiene el arbol de notas
        //		- arr: se pasa recursivamente para ir completando con informacion de los nodos y hojas
        //      - parent: es el identificador del padre para ir pasando las referencias
        if (node.children) {
            for (var k in node.children) // Para cada hijo del nodo
                arr.concat(core.utils.getArray(node.children[k], arr, node.id)); // Obtener arreglo de los hijos
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

    core.utils.sendNotification = function(data){ // Enviar notificaciones por FCM
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

    ///// Test Felder-Silverman de estilos de aprendizaje
    core.test_FS = {
        questions:[
            {
                text: "Entiendo mejor algo",
                options: ["si lo practico.", "si pienso en ello."]
            },
            {
                text: "Me considero",
                options: ["realista.", "innovador."]
            },
            {
                text: "Cuando pienso acerca de lo que hice ayer, es más probable que lo haga sobre la base de",
                options: ["una imagen.","palabras."]
            },
            {
                text: "Tengo tendencia a",
                options: ["entender los detalles de un tema pero no ver claramente su estructura completa", "entender la estructura completa pero no ver claramente los detalles."]
            },
            {
                text: "Cuando estoy aprendiendo algo nuevo, me ayuda",
                options: ["hablar de ello.","pensar en ello."]
            },
            {
                text: "Si yo fuera profesor, yo preferiría dar un curso",
                options: ["que trate sobre hechos y situaciones reales de la vida.","que trate con ideas y teorías."]
            },
            {
                text: "Prefiero obtener información nueva de",
                options: ["imágenes, diagramas, gráficas o mapas."," instrucciones escritas o información verbal."]
            },
            {
                text: "Una vez que entiendo",
                options: ["todas las partes, entiendo el total.","el total de algo, entiendo como encajan sus partes."]
            },
            {
                text: "En un grupo de estudio que trabaja con un material difícil, es más probable que",
                options: ["participe y contribuya con ideas.","no participe y solo escuche."]
            },
            {
                text: "Es más fácil para mí",
                options: ["aprender hechos.","aprender conceptos."]
            },
            {
                text: "En un libro con muchas imágenes y gráficas es más probable que",
                options: ["revise cuidadosamente las imágenes y las gráficas."," me concentre en el texto escrito."]
            },
            {
                text: "Cuando resuelvo problemas de matemáticas",
                options: ["generalmente trabajo sobre las soluciones con un paso a la vez.","frecuentemente sé cuales son las soluciones, pero luego tengo dificultad para imaginarme los pasos para llegar a ellas."]
            },
            {
                text: "En las clases a las que he asistido",
                options: ["he llegado a saber como son muchos de los estudiantes.","raramente he llegado a saber como son muchos estudiantes."]
            },
            {
                text: "Cuando leo temas que no son de ficción, prefiero",
                options: ["algo que me enseñe nuevos hechos o me diga como hacer algo.","algo que me dé nuevas ideas en que pensar."]
            },
            {
                text: "Me gustan los maestros",
                options: ["que utilizan muchos esquemas en el pizarrón.","que toman mucho tiempo para explicar."]
            },
            {
                text: "Cuando estoy analizando un cuento o una novela",
                options: ["pienso en los incidentes y trato de acomodarlos para configurar los temas.","me doy cuenta de cuales son los temas cuando termino de leer y luego tengo que regresar y encontrar los incidentes que los demuestran."]
            },
            {
                text: "Cuando comienzo a resolver un problema de tarea, es más probable que",
                options: ["comience a trabajar en su solución inmediatamente.","primero trate de entender completamente el problema."]
            },
            {
                text: "Prefiero la idea de",
                options: ["certeza.","teoría."]
            },
            {
                text: "Recuerdo mejor",
                options: ["lo que veo.","lo que oigo."]
            },
            {
                text: "Es más importante para mí que un profesor",
                options: ["exponga el material en pasos secuenciales claros.","me dé un panorama general y relacione el material con otros temas."]
            },
            {
                text: "Prefiero estudiar",
                options: ["en un grupo de estudio.","solo."]
            },
            {
                text: "Me considero",
                options: ["cuidadoso en los detalles de mi trabajo.","creativo en la forma en la que hago mi trabajo."]
            },
            {
                text: "Cuando alguien me da direcciones de nuevos lugares, prefiero",
                options: ["un mapa.","instrucciones escritas."]
            },
            {
                text: "Aprendo",
                options: ["a un paso constante. Si estudio con ahínco consigo lo que deseo.","en inicios y pausas. Me llego a confundir y súbitamente lo entiendo."]
            },
            {
                text: "Prefiero primero",
                options: ["hacer algo y ver que sucede.","pensar como voy a hacer algo."]
            },
            {
                text: "Cuando leo por diversión, me gustan los escritores que",
                options: ["dicen claramente los que desean dar a entender.","dicen las cosas en forma creativa e interesante."]
            },
            {
                text: "Cuando veo un esquema o bosquejo en clase, es más probable que recuerde",
                options: ["la imagen.","lo que el profesor dijo acerca de ella."]
            },
            {
                text: "Cuando me enfrento a un cuerpo de información",
                options: ["me concentro en los detalles y pierdo de vista el total de la misma.","trato de entender el todo antes de ir a los detalles."]
            },
            {
                text: "Recuerdo más fácilmente",
                options: ["algo que he hecho.","algo en lo que he pensado mucho."]
            },
            {
                text: "Cuando tengo que hacer un trabajo, prefiero",
                options: ["dominar una forma de hacerlo.","intentar nuevas formas de hacerlo."]
            },
            {
                text: "Cuando alguien me enseña datos, prefiero",
                options: ["gráficas.","resúmenes con texto."]
            },
            {
                text: "Cuando escribo un trabajo, es más probable que",
                options: ["lo haga (piense o escriba) desde el principio y avance."," lo haga (piense o escriba) en diferentes partes y luego las ordene."]
            },
            {
                text: "Cuando tengo que trabajar en un proyecto de grupo, primero quiero",
                options: ["realizar una 'tormenta de ideas' donde cada uno contribuye con ideas.","realizar la 'tormenta de ideas' en forma personal y luego juntarme con el grupo para comparar las ideas."]
            },
            {
                text: "Considero que es mejor elogio llamar a alguien",
                options: ["sensible.","imaginativo."]
            },
            {
                text: "Cuando conozco gente en una fiesta, es más probable que recuerde",
                options: ["cómo es su apariencia.","lo que dicen de sí mismos."]
            },
            {
                text: "Cuando estoy aprendiendo un tema, prefiero",
                options: ["mantenerme concentrado en ese tema, aprendiendo lo más que pueda de él.","hacer conexiones entre ese tema y temas relacionados."]
            },
            {
                text: "Me considero",
                options: ["abierto.","reservado."]
            },
            {
                text: "Prefiero cursos que dan más importancia a",
                options: ["material concreto (hechos, datos)."," material abstracto (conceptos, teorías)."]
            },
            {
                text: "Para divertirme, prefiero",
                options: ["ver televisión.","leer un libro."]
            },
            {
                text: "Algunos profesores inician sus clases haciendo un bosquejo de lo que enseñarán. Esos bosquejos son",
                options: ["algo útiles para mí.","muy útiles para mí."]
            },
            {
                text: "La idea de hacer una tarea en grupo con una sola calificación para todos",
                options: ["me parece bien.","no me parece bien."]
            },
            {
                text: "Cuando hago grandes cálculos",
                options: ["tiendo a repetir todos mis pasos y revisar cuidadosamente mi trabajo.","me cansa hacer su revisión y tengo que esforzarme para hacerlo."]
            },
            {
                text: "Tiendo a recordar lugares en los que he estado",
                options: ["fácilmente y con bastante exactitud.","con dificultad y sin mucho detalle."]
            },
            {
                text: "Cuando resuelvo problemas en grupo, es más probable que yo",
                options: ["piense en los pasos para la solución de los problemas.","piense en las posibles consecuencias o aplicaciones de la solución en un amplio rango de campos."]
            }
        ],
        evalMatrix: [ // Puntajes: evalMatrix[escala][pregunta][opcion]
                [[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0]], // Act
                [[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0]], // Refl
                [[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0]], // Sens
                [[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0]], // Int
                [[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0]], // Vis
                [[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0]], // Ver
                [[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0],[0,0],[0,0],[0,0],[1,0]], // Sec
                [[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1],[0,0],[0,0],[0,0],[0,1]]  // Glo
        ],
        profileDesc: [
            [
                "Aprende por interacción directa con el material de estudio. Prefiere la comunicación visual.",                                         // Activo
                "Le gusta reflexionar sobre el material de estudio. Prefiere el trabajo individual y comunicación grupal mínima."                       // Reflexivo
            ],
            [
                "Detallista y práctico con preferencia por hechos concretos y aplicaciones del mundo real.",                                            // Sensitivo
                "Creativo y se siente atraído por el contenido teórico y abstracto."                                                                    // Intuitivo
            ],
            [
                "Recuerda fácilmente imágenes que se le presenta (gráficos, fotos, esquemas, etc.).",                                                   // Visual   
                "Recuerda fácilmente frases escritas o habladas."                                                                                       // Verbal
            ],
            [
                "Prefiere aprender de manera lineal, mediante secuencia de pasos lógicos.",                                                              // Secuencial
                "Prefiere que se le presente un esquema general y luego aprende y entiende las partes por separado sin seguir un orden específico."      // Global
            ],
        ],
        eval:function(answers){ // Computo de escalas (metodo general escalas PsiMESH [http://www.psimesh.com])
            var var_sum = []; // Arreglo de puntajes sumados para cada escala
            for(var vble = 0; vble < 8; vble++){
                var sum = []; // Arreglo con valores de puntajes de cada resepuesta
                for(var quest in answers) // Para cada pregunta
                    sum[quest] = this.evalMatrix[vble][quest][answers[quest]]; // Puntaje que otorga cada pregunta a la escala actual
                var_sum[vble] = sum.reduce((a, b) => a + b, 0); // Sumar arreglo de puntajes de la escala actual
            }
            var scales = [];
            for(var sc = 0; sc < 8; sc+=2)
                scales[sc/2] = var_sum[sc+1] - var_sum[sc];
            return scales;
        }
    };

    

    ////// HARDWARE /////
    core.hardware.initialize = function(params){ // Inicializar conexion con WebSocketServer
        //Cipressus.hardware.initialize(1500).then(function(list){console.log(list)}).catch(function(err){console.log(err)});
        return new Promise(function(fulfill, reject){
            // Inicializar websocket (el server debe estar iniciado)
            socket = new WebSocket("ws://localhost:8081"); // Variable global privada            
            socket.onerror = function(error){
                console.log(error);
            };
            socket.onopen = function () { // Puerto conectado
                core.hardware.onSocketOpen(); // Ejecutar el callback
            };
            socket.onclose = function() { // Puerto no disponible
                core.hardware.status = "DISCONNECTED";
                core.hardware.onSocketClose(); // Ejecutar el callback
            };
            socket.onmessage = function (message) { // Respuesta del server
                serialPorts = JSON.parse(message.data); // El primer mensaje que manda el server es la lista de puertos
                socket.onmessage = function(message){ // Redefinir la funcion a partir de aqui                                        
                    for(var k = 0; k < 8; k++) // Debe mandar siempre un string de 8 caracteres 
                        core.hardware.io[k].input = (message.data[k] == "1"); // Configurar inputs segun caracter sea 1 o 0
                    params.onUpdate();
                };  
                return fulfill(serialPorts);
            };
            core.hardware.status = "IDLE";
            core.hardware.sample_period = params.sp; // Periodo de actualizacion de salidas
            core.hardware.io = params.io; // Binding con view
            setTimeout(function(){
                if(serialPorts.length == 0){ // Todavía no se pudo conectar con websocket
                    return reject("Server no disponible");
                }
            },params.timeout);
        });
    };

    core.hardware.ioUpdate = function(){
        var outputs = "";
        for (var k in core.hardware.io) 
            outputs += core.hardware.io[k].output ? "1" : "0";            
        socket.send(outputs);
        if(core.hardware.status == "CONNECTED")
            setTimeout(core.hardware.ioUpdate, core.hardware.sample_period);
    };

    core.hardware.connectTo = function(portIndex){ // Conectarse con un puerto de la lista    
        if(serialPorts.length > 0){
            socket.send(portIndex); // Esto solo funciona mientras no se haya iniciado el streaming con el probador
            core.hardware.status = "CONNECTED";
            setTimeout(core.hardware.ioUpdate,500); // Esperar 500ms e iniciar envio de comandos
        }else
            console.log("El listado de puertos no está disponible");
    };

    core.hardware.getSerialPorts = function(){ // Se puede pedir la lista de puertos en cualquier momento
        return serialPorts; // Puede que un puerto ya no este disponible
    };

    core.hardware.onSocketOpen = function(){ // Overridable - al conectarse con server
        console.log("Socket abierto.");
    };

    core.hardware.onSocketClose = function(){ // Overridable - cuando se detiene el server
        console.log("Socket cerrado.");
    };

    


    ///// PRINCIPAL /////

    core.initialize = function () { // Instrucciones de inicializacion de las utilidades        
        return new Promise(function (fulfill, reject) {
            firebase.initializeApp(core.db.config); // Inicializar base de datos

            // Configurar mensajeria y notificaciones push
            var messaging = firebase.messaging();
            
            messaging.usePublicVapidKey(core.db.config.publicvapidkey);
            
            messaging.requestPermission()
                .then(function () {
                    console.log('Permisos de notificación otorgados.');
                })
                .catch(function (err) {
                    console.log('No es posible habilitar notificaciones.', err);
                });

            /* Importar el script de notifications
            firebase.notifications().onNotification((notification) => {
                console.log('Notificacion: ',notification);
                //firebase.notifications().displayNotification(notification);
            });
            */

            messaging.onMessage(function(payload) {
                console.log('Message received: ', payload);
                // Mostrar notificacion popup
                const opts = {
                    body: 'Se actualizó tu calificación "Informe laboratorio 1"',
                    icon: '/images/mainlogo.png',
                    sound: '/sounds/notification.mp3' // No soportado
                };
                core.registration.showNotification("Cipressus", opts);
            });

            messaging.getToken().then(function (currentToken) {
                if (currentToken) 
                    console.log("Current token", currentToken);
                else 
                    console.log('No Instance ID token available. Request permission to generate one.');
            }).catch(function (err) {
                console.log('An error occurred while retrieving token. ', err);
            });

            messaging.onTokenRefresh(function () {
                messaging.getToken().then(function (refreshedToken) {
                    console.log('Token refreshed.');
                    // Indicate that the new Instance ID token has not yet been sent to the
                    // app server.
                    //setTokenSentToServer(false);
                    // Send Instance ID token to app server.
                    //sendTokenToServer(refreshedToken);
                    // ...
                }).catch(function (err) {
                    console.log('Unable to retrieve refreshed token ', err);
                    showToken('Unable to retrieve refreshed token ', err);
                });
            });

            navigator.serviceWorker.getRegistration().then(function(reg){
                core.registration = reg; // Nuevo atributo
                // messaging.useServiceWorker(reg); //
            });

            // Autenticacion
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