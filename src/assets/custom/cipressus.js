window.Cipressus = (function () {
    // Libreria para el control de la base de datos, storage, metodos utiles de la app y de comunicacion con hardware

    var core = { // Instancia de la clase
        globalTarget: null, // Este atributo se usa para poder acceder a variables desde la consola
        db: {}, // Operaciones de base de datos
        storage: {}, // Almacenamiento de archivos
        users: {}, // Operaciones de autenticacion
        utils: {}, // Utilidades
        hardware: {} // Metodos de control de hardware (probador de circuitos)
    };

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

    core.db.listen = function (path, callback_success, callback_error) { // Escuchar cambios
        firebase.database().ref(path).on('value',
            function (snapshot) {
                callback_success(snapshot.val(), snapshot.key);
            },
            function (error) {
                callback_error(error);
            });
    };

    core.db.listenChild = function(path, child, value, callback_success, callback_error) { // Escucha cambios con filtro
        firebase.database().ref(path).orderByChild(child).equalTo(value).on('child_added',
            function (snapshot) {
                callback_success(snapshot.val(), snapshot.key);
            },
            function (error) {
                callback_error(error);
            });
    };

    core.db.stopListener = function(path){ // Detener escuchador
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).off()
                .then(function () {
                    return fulfill();
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
    };

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
                        avatar: "images/robohashes/robohash"+Math.floor(Math.random()*20+1)+".png" // Imagen de perfil aleatoria
                    };
                    // Inicializar contadores de navegador y so
                    users_public.activity.browser[is.firefox() ? 'Firefox' : (is.chrome() ? 'Chrome' : (is.ie() ? 'IE' : (is.opera() ? 'Opera' : (is.safari() ? 'Safari' : 'Otro'))))] = 1;
                    users_public.activity.os[is.ios() ? 'IOS' : (is.android() ? 'Android' : (is.windows() ? 'Windows' : (is.linux() ? 'Linux' : 'Otro')))] = 1;

                    core.db.set(users_public, 'users_public/' + result.user.uid)
                        .then(function (res) {
                            // #NOTIFICAR ADMINS
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


    ///// INICIALIZACION /////

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