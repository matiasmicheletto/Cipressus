app.controller("submissions", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $scope.getUserNames = function(userUids){ // Devuelve los apellidos de los usuarios cuyos uid se pasa como arreglo
        // Esta fc se usa tambien en profile.js pero no va en rootscope porque requiere lista de users
        var names = [];
        for(var k in userUids)
            names.push($scope.users[userUids[k]].secondName);
        return names.join(", "); // Apellidos separados por coma
    };

    $scope.resetForm = function(){ // Restablecer el formulario
        $scope.selectedActivity = null;
    };

    $scope.pushFile = function () { // Agregar archivos de entrega
        
        if($scope.selectedActivity){ // Si eligio el nombre de la actividad correctamente, continuar
            var file = document.getElementById("fileInput").files[0];
            if(file){ // Si el input tiene archivos
                $rootScope.loading = true;
                var filename = Cipressus.utils.generateFileName(25) + "." + file.name.split(".")[1];
                var observs = document.getElementById("obsTextarea").value; // Observaciones
                if(!observs) observs = ""; // Evitar que la variable sea undefined o null
                Cipressus.storage.put(file,"Submissions",filename)
                .then(function (res) {
                    console.log(res);
                    var reference = {
                        name: file.name.split(".")[0], // Extraer nombre de archivo
                        activityId: $scope.selectedActivity.id,
                        activityName: $scope.selectedActivity.name,
                        size: res.size, // Tamanio de archivo
                        format: file.name.split(".")[1] ? file.name.split(".")[1] : "indef.", // Extension del archivo
                        link: res.url, // Url 
                        filename: filename, // Nombre de archivo en el storage
                        authors: [$rootScope.user.uid].concat($rootScope.user.partners ? $rootScope.user.partners:[]), // Comision
                        status: [{ // Estados de la evaluacion (se concatenan)
                            timestamp: Date.now(),
                            action: 0, // 0 -> subido, 1 -> evaluando, 2 -> revisar, 3 -> evaluado
                            display: "Archivo subido",
                            user: $rootScope.user.uid, // Usuario que realizo la ultima accion
                            obs: observs // Cada status lleva un mensaje opcional
                        }]
                    };
                    Cipressus.db.push(reference,"submissions")
                    .then(function (res2) {
                        console.log(res2);
                        $scope.submissions[res2.key] = reference;
                        $scope.submCnt++;
                        document.getElementById("fileInput").files[0] = null;
                        document.getElementById("fileInputText").value = "";
                        M.toast({
                            html: "Entrega realizada correctamente",
                            classes: 'rounded green',
                            displayLength: 1500
                        });
                        $rootScope.loading = false;
                        files_modal.close();
                        $scope.$apply();
                    })
                    .catch(function (err2) {
                        console.log(err2);
                        M.toast({
                            html: "Ocurrio un error al subir el archivo",
                            classes: 'rounded red',
                            displayLength: 1500
                        });
                        $rootScope.loading = false;
                        $scope.$apply();
                    });
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({
                        html: "Ocurrió un error al subir el archivo",
                        classes: 'rounded red',
                        displayLength: 1500
                    });
                    $rootScope.loading = false;
                    $scope.$apply();
                });
            }else{ // Si no ingreso ningun archivo
                console.log("Problema con el archivo");
                M.toast({
                    html: "Debe seleccionar un archivo!",
                    classes: 'rounded red',
                    displayLength: 1500
                });            
            }
        }else{ // Si no eligio nombre de actividad, no continuar
            console.log("Identificador de actividad desconocido");
            M.toast({
                html: "Debe seleccionar una actividad!",
                classes: 'rounded red',
                displayLength: 1500
            });            
        }
    };

    $scope.downloaded = function(key){ // Agregar registro de movimiento sobre este archivo
        if($scope.submissions[key].status[$scope.submissions[key].status.length-1].action == 0){ // Solo la primera vez
            var newStatus = { // Nuevo estado del envio a registrar
                timestamp: Date.now(),
                action: 1, // 0 -> subido, 1 -> evaluando (descargado), 2 -> revisar, 3 -> evaluado
                display: "Archivo en revisión",
                user: $rootScope.user.uid, // Usuario que realizo la ultima accion
                obs: $scope.submissions[key].status[$scope.submissions[key].status.length-1].obs // Copiar original
            };
            $scope.submissions[key].status.push(newStatus); // Agrego el estado al objeto local
            Cipressus.db.update($scope.submissions[key],"submissions/"+key) // Registrar accion
            .then(function (res) {
                M.toast({
                    html: "Movimiento registrado",
                    classes: 'rounded green',
                    displayLength: 1000
                });
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "Ocurrio un error al registrar movimiento",
                    classes: 'rounded red',
                    displayLength: 1500
                });
            });
        }else{
            console.log($scope.submissions[key].status);
            M.toast({
                html: "El archivo ya está siendo evaluado!",
                classes: 'rounded red',
                displayLength: 1500
            });
        }
    };

    $scope.viewSubm = function(key){ // Seleccionar entrega para ver detalles
        $scope.submKeyView = key;
        submission_modal.open();
    };

    $scope.evaluated = function(key){ // Seleccion de entrega para marcar como evaluada (para confirmar accion)
        $scope.evaluatingKey = key;
        confirm_evaluate_modal.open();
    };

    $scope.confirmEvaluate = function(){ // Marcar entrega como evaluada
        var action = parseInt(document.getElementById("evaluation_select").value);
        var obs = document.getElementById("obsTextarea2").value;
        if(obs == "") obs = "Sin observaciones"; // Forzar valor de resultado
        if(action){
            if($scope.submissions[$scope.evaluatingKey].status[$scope.submissions[$scope.evaluatingKey].status.length-1].action == 1){ // Solo la primera vez
                $rootScope.loading = true;
                var newStatus = { // Nuevo estado del envio a registrar
                    timestamp: Date.now(),
                    action: action, // 2 -> revisar, 3 -> aprobado
                    display: action == 2 ? "Revisar" : action == 3 ? "Aprobado" : "?",
                    user: $rootScope.user.uid, // Usuario que realizo la ultima accion
                    obs: obs // Mensaje del evaluador
                };
                $scope.submissions[$scope.evaluatingKey].status.push(newStatus); // Agrego el estado al objeto local
                Cipressus.db.update(JSON.parse(angular.toJson($scope.submissions[$scope.evaluatingKey])),"submissions/"+$scope.evaluatingKey) // Registrar accion
                .then(function (res) {
                    M.toast({
                        html: "Movimiento registrado",
                        classes: 'rounded green',
                        displayLength: 1000
                    });
                    $rootScope.loading = false;
                    confirm_evaluate_modal.close();
                    document.getElementById("evaluation_select").value = "";
                    document.getElementById("obsTextarea2").value = "";
                    $scope.$apply();
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({
                        html: "Ocurrio un error al registrar movimiento",
                        classes: 'rounded red',
                        displayLength: 1500
                    });
                });
            }else{
                console.log($scope.submissions[key].status);
                M.toast({
                    html: "El archivo ya fue evaluado!",
                    classes: 'rounded red',
                    displayLength: 1500
                });
            }
        }else{
            console.log("Input select con opcion por defecto.");
            M.toast({
                html: "Seleccione resultado de evaluación",
                classes: 'rounded red',
                displayLength: 1500
            });
        }

        
    };

    $scope.deleteFile = function(key){ // Marcar el archivo a borrar para que el usuario confirme        
        $scope.fileKeyToDelete = key;
    };

    $scope.confirmDelete = function () { // Borrar el archivo seleccionado luego de que el usuario confirme
        $rootScope.loading = true;
        Cipressus.storage.delete($scope.submissions[$scope.fileKeyToDelete].filename, "Submissions")
            .then(function (res) {
                // Ahora hay que borrar la referencia de la db
                Cipressus.db.set(null, "submissions/"+$scope.fileKeyToDelete) 
                    .then(function (res2) {
                        // Eliminar entrada de la tabla y decrementar contador de elementos
                        delete $scope.submissions[$scope.fileKeyToDelete];
                        $scope.fileKeyToDelete = "";
                        $rootScope.loading = false;
                        $scope.submCnt--;
                        confirm_delete_modal.close();
                        $scope.$apply();
                    })
                    .catch(function (err2) {
                        console.log(err2);
                        M.toast({
                            html: "Ocurrio un error al eliminar archivos",
                            classes: 'rounded red',
                            displayLength: 1500
                        });
                        $rootScope.loading = false;
                        $scope.$apply();
                    });
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "Ocurrio un error al eliminar archivos",
                    classes: 'rounded red',
                    displayLength: 1500
                });
                $rootScope.loading = false;
                $scope.$apply();
            });
    };



    ///// Inicialización controller
    var files_modal = M.Modal.init(document.getElementById("files_modal"), {preventScrolling: false}); // Dialogo para subir imagenes a la galeria    
    var confirm_delete_modal = M.Modal.init(document.getElementById("confirm_delete_modal"), {preventScrolling: false}); // Dialogo para confirmar borrado
    var confirm_evaluate_modal = M.Modal.init(document.getElementById("confirm_evaluate_modal"), {preventScrolling: false}); // Dialogo para confirmar borrado
    var submission_modal = M.Modal.init(document.getElementById("submission_modal"), {preventScrolling: false}); // Dialogo para confirmar borrado

    $scope.fileKeyToDelete = ""; // Identificador del archivo seleccionado para elliminar previo confirmacion
    $scope.selectedActivity = null; // Actividad seleccionada en el input del formulario antes de elegir archivo

    $rootScope.loading = true; // Preloader hasta que se descarguen los enlaces
    $rootScope.sidenav.close();

    Cipressus.utils.activityCntr($rootScope.user.uid,"submissions").catch(function(err){console.log(err)});

    Cipressus.db.get('submissions') // Descargar lista de archivos entregados por todos los alumnos
        .then(function (submissions_data) { // Nota: No hay filtrado de archivos descargados -> usuarios pueden leer entregas de otros alumnos
            $scope.submissions = {};
            $scope.submCnt = 0; // Contador de entregas
            if($rootScope.user.admin && submissions_data){ // Si es admin, bajar todas las entregas
                $scope.submissions = submissions_data; // Lista de entregas realizadas
                $scope.submCnt = Object.getOwnPropertyNames($scope.submissions).length
            }else // Si no es admin, descargar las realizadas por este usuario o por comision
                for(var k in submissions_data){ // Buscar entregas realizadas 
                    if(submissions_data[k].authors.indexOf($rootScope.user.uid) > -1){
                        $scope.submissions[k] = submissions_data[k]; // Agregar entrega a la lista
                        $scope.submCnt++;
                    }
                }
            Cipressus.db.get('users_public') // Descargar lista de usuarios para tener info de las comisiones
            .then(function (users_data) {
                $scope.users = users_data; // Lista de usuarios
                Cipressus.db.get('activities')
                .then(function (activities_data) {
                    $scope.activities = []; // Convertir el arbol en array (no lo uso como arbol aca)
                    $scope.activities = Cipressus.utils.getArray(activities_data, $scope.activities, '');          
                    $rootScope.loading = false;
                    $scope.$apply();
                    M.FormSelect.init(document.querySelectorAll('select'), {}); // Inicializar select
                    document.getElementById("activity_select").addEventListener("change",function(){ // Callback al elegir actividad para entregar informe
                        var sel = document.getElementById("activity_select"); // Se puede usar this?
                        var actIdx = $scope.activities.findIndex(x => x.id == sel.options[sel.selectedIndex].value); // Buscar la actividad seleccionada
                        $scope.selectedActivity = { // Objeto con info de la actividad sobre la que se entrega el trabajo
                            id: sel.options[sel.selectedIndex].value, // Identificador de la actividad
                            name: sel.options[sel.selectedIndex].text, // Nombre legible de la actividad
                            deadline: $scope.activities[actIdx].dl.date // Vencimiento
                        };
                        $scope.$apply(); // Ver si hace falta
                    });
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({
                        html: "Ocurrió un error al acceder a la base de datos",
                        classes: 'rounded red',
                        displayLength: 2000
                    });
                });
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "Ocurrió un error al acceder a la base de datos",
                    classes: 'rounded red',
                    displayLength: 2000
                });
            });
        })
        .catch(function (err) {
            console.log(err);
            M.toast({
                html: "Ocurrió un error al acceder a la base de datos",
                classes: 'rounded red',
                displayLength: 2000
            });
        });
}]);