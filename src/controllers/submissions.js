app.controller("submissions", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $scope.resetForm = function(){ // Restablecer el formulario
        $scope.selectedActivity = null;
    };

    $scope.pushFile = function () { // Agregar archivos de entrega
        
        if($scope.selectedActivity){ // Si eligio el nombre de la actividad correctamente, continuar
            
            var observs = document.getElementById("obsTextarea").value; // Observaciones
            if(!observs) observs = ""; // Evitar que la variable sea undefined o null

            var submission_data = { // Objeto a subir a db
                activityId: $scope.selectedActivity.id,
                activityName: $scope.selectedActivity.name,
                created: Date.now(),
                authors: [$rootScope.user.uid].concat($rootScope.user.partners ? $rootScope.user.partners:[]), // Comision
                status: [{ // Estados de la evaluacion (se concatenan)
                    timestamp: Date.now(),
                    action: 0, // 0 -> subido, 1 -> evaluando, 2 -> revisar, 3 -> evaluado
                    display: "Archivo subido",
                    user: $rootScope.user.uid, // Usuario que realizo la ultima accion
                    obs: observs // Cada status lleva un mensaje opcional
                }]
            };

            if($scope.selectedSim) // Si hay simulacion
                submission_data.simulation = angular.copy($scope.selectedSim);

            var files = document.getElementById("fileInput").files;
            if(files.length > 0){ // Si el input tiene archivos
                $rootScope.loading = true;

                var fr = new FileReader();
                var k = 0; // Indice de archivos
                var attached = [];
                
                fr.addEventListener("load", function (e) {
                    attached.push({data: e.target.result,name: files[k].name});
                    k++; // Pasar al siguiente
                    if (k == files.length) { // Fin
                        //console.log(data);
                        //console.log(attached);
                        try{ // Comprimir todo lo que subio
                            var zip = new JSZip();
                            for(var j in attached)
                                zip.file(attached[j].name, attached[j].data.split(',')[1], {base64:true});
                            zip.generateAsync({type:"blob"})
                            .then(function(content) {

                                // Completar el resto de los datos del objeto a subir a db
                                submission_data.filename = Cipressus.utils.generateFileName(25) + ".zip"; // Nombre del archivo autogenerado
                                Cipressus.storage.put(content,"Submissions", submission_data.filename)
                                    .then(function (res) {
                                        //console.log(res);
                                        // Completar el resto de los datos del objeto a subir a db
                                        submission_data.size = res.size;
                                        submission_data.link = res.url;

                                        // Subir datos de la entrega a db
                                        Cipressus.db.push(submission_data,"submissions/"+$rootScope.user.course)
                                        .then(function (res2) {
                                            //console.log(res2);
                                            $scope.submissions[res2.key] = submission_data;
                                            $scope.submCnt++;
                                            document.getElementById("fileInput").files = null;
                                            document.getElementById("fileInputText").value = "";
                                            M.toast({
                                                html: "Entrega realizada correctamente",
                                                classes: 'rounded green',
                                                displayLength: 1500
                                            });
                                            // Notificar admins sobre la nueva entrega
                                            Cipressus.db.query("users_private", "admin", true)
                                            .then(function(snapshot){
                                                var notif = { // Detalles de la notificacion
                                                    icon: "info",
                                                    link: "submissions",
                                                    title: "Nueva entrega",
                                                    text: "Nueva actividad presentada: "+submission_data.activityName
                                                };
                                                var admins = snapshot.val();
                                                for(var k in admins){
                                                    if(admins[k].course == $rootScope.user.course) // Si pertenece al mismo curso
                                                        Cipressus.utils.sendNotification(k, notif);
                                                }
                                            })
                                            .catch(function (err2) {
                                                console.log(err2);
                                            });
                                            $rootScope.loading = false;
                                            files_modal.close();
                                            $scope.$apply();
                                        })
                                        .catch(function (err2) {
                                            console.log(err2);
                                            M.toast({
                                                html: "Ocurrió un error al subir el archivo",
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


                            });
                        }catch(err){
                            console.log(err);
                            M.toast({
                                html: "Ocurrió un error al comprimir adjuntos.",
                                classes: 'rounded red',
                                displayLength: 1500
                            });
                            $rootScope.loading = false;
                            $scope.$apply();
                        }
                    }else{ // Leer siguiente
                        fr.readAsDataURL(files[k]);
                    }
                });
                fr.readAsDataURL(files[k]);
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

    $scope.downloaded = function(key, subm){ // Agregar registro de movimiento sobre este archivo
        
        var openSubmission = function(){ // Abrir adjunto o simulacion
            window.open(subm.link);    
            if(subm.simulation){
                $rootScope.openSimulation = subm.simulation.data; // Pasar modelo como string al controller del simulador
                $location.path("/simulator");
                $scope.$apply();
            }
        }
        
        if($scope.submissions[key].status[$scope.submissions[key].status.length-1].action == 0){ // Solo la primera vez
            var newStatus = { // Nuevo estado del envio a registrar
                timestamp: Date.now(),
                action: 1, // 0 -> subido, 1 -> evaluando (descargado), 2 -> revisar, 3 -> evaluado
                display: "Archivo en revisión",
                user: $rootScope.user.uid, // Usuario que realizo la ultima accion
                //obs: $scope.submissions[key].status[$scope.submissions[key].status.length-1].obs // Copiar original --> Por?
                obs: ""
            };
            $scope.submissions[key].status.push(newStatus); // Agrego el estado al objeto local
            var upd = JSON.parse(angular.toJson($scope.submissions[key]));
            Cipressus.db.update(upd,"submissions/"+$rootScope.user.course+"/"+key) // Registrar accion
            .then(function (res) {
                M.toast({
                    html: "Movimiento registrado",
                    classes: 'rounded green',
                    displayLength: 1000
                });
                openSubmission();
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
            M.toast({
                html: "El archivo ya está siendo evaluado",
                classes: 'rounded cyan',
                displayLength: 1500
            });
            openSubmission();
        }
    };

    $scope.viewSubm = function(key){ // Seleccionar entrega para ver detalles
        $scope.submKeyView = key;
        submission_modal.open();
    };

    $scope.evaluated = function(key){ // Seleccion de entrega para marcar como evaluada (para confirmar accion)
        $scope.evaluatingKey = key;

        // Obtener los aspectos evaluables de la actividad entregada para mostrar la lista de inputs
        var evaluatingNode = Cipressus.utils.searchNode($scope.activityTree, $scope.submissions[$scope.evaluatingKey].activityId);
        $scope.leafActivities = Cipressus.utils.getLeafNodes(evaluatingNode);

        confirm_evaluate_modal.open();
    };

    $scope.confirmEvaluate = function(){ // Marcar entrega como evaluada
        var action = parseInt(document.getElementById("evaluation_select").value);
        var obs = document.getElementById("obsTextarea2").value; // Observaciones de quien corrige
        
        // Obtener lista de calificaciones propuestas para la comision
        var scores = {};
        for(var k in $scope.leafActivities){
            var sc = document.getElementById("scoreInput_"+$scope.leafActivities[k].id).value; // Nota propuesta
            if(sc){
                scores[$scope.leafActivities[k].id] = parseInt(sc);
            }
        }

        if(obs == "") obs = "Sin observaciones"; // Forzar valor de resultado
        if(action){ // Si eligio el resultado de la evaluacion
            if(action==3 && Object.getOwnPropertyNames(scores).length == $scope.leafActivities.length || action != 3){ // Debe indicar una calificacion por subactividad
                if($scope.submissions[$scope.evaluatingKey].status[$scope.submissions[$scope.evaluatingKey].status.length-1].action == 1){ // Solo la primera vez
                    
                    $rootScope.loading = true;
                    var newStatus = { // Nuevo estado del envio a registrar
                        timestamp: Date.now(),
                        action: action, // 2 -> revisar, 3 -> aprobado
                        display: action == 2 ? "Revisar" : action == 3 ? "Aprobado" : "?",
                        user: $rootScope.user.uid, // Usuario que realizo la ultima accion
                        obs: obs // Mensaje del evaluador
                    };

                    // Actualizar el estado en database
                    var upd_status = JSON.parse(angular.toJson($scope.submissions[$scope.evaluatingKey].status));
                    upd_status.push(newStatus); // Cargarle el nuevo estado

                    var job = []; // Operaciones de update
                    
                    // Registrar accion en lista de entregas (submissions)
                    job.push(Cipressus.db.update(upd_status,"submissions/"+$rootScope.user.course+"/"+$scope.evaluatingKey+"/status"));
                    
                    for(var k in $scope.submissions[$scope.evaluatingKey].authors){ // Pasarle la nota a cada autor                        
                        
                        for(var j in scores){ // Para cada actividad evaluada
                            var sc = { // Objeto de calificacion
                                evaluator: $rootScope.user.uid,
                                score: scores[j],
                                timestamp: Date.now()
                            };
                            job.push(Cipressus.db.update(sc, "users_private/"+$scope.submissions[$scope.evaluatingKey].authors[k]+"/scores/"+j));
                        }

                        // Fecha de envio para calcular costo en caso de actividad vencida    
                        var sb = { 
                            evaluator: $rootScope.user.uid,
                            submitted: $scope.submissions[$scope.evaluatingKey].created,
                            timestamp: Date.now()
                        };
                        job.push(Cipressus.db.update(sb, "users_private/"+$scope.submissions[$scope.evaluatingKey].authors[k]+"/submits/"+$scope.submissions[$scope.evaluatingKey].activityId));

                        // Notificar autores
                        var notif = { 
                            icon: "info",
                            link: "submissions",
                            title: "Presentación evaluada",
                            text: "La actividad "+$scope.submissions[$scope.evaluatingKey].activityName+" que presentaste ya fue calificada."
                        };
                        Cipressus.utils.sendNotification($scope.submissions[$scope.evaluatingKey].authors[k], notif);
                    }

                    Promise.all(job)               
                    .then(function (res) {
                        $scope.submissions[$scope.evaluatingKey].status.push(newStatus); // Agrego el estado al objeto local
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
                console.log("Evaluadas: "+Object.getOwnPropertyNames(scores).length, "Totales: "+$scope.leafActivities.length);
                M.toast({
                    html: "Complete las calificaciones!",
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

        var deleteDBRef = function(){ // Elimina la referencia a la entrega de la db
            Cipressus.db.set(null, "submissions/"+$rootScope.user.course+"/"+$scope.fileKeyToDelete) 
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
        }

        $rootScope.loading = true;
        Cipressus.storage.delete($scope.submissions[$scope.fileKeyToDelete].filename, "Submissions")
            .then(function (res) {
                // Borrar la referencia de la db
                deleteDBRef();
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "Ocurrió un error al eliminar archivos. Intente más tarde",
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

    Cipressus.db.get('submissions/'+$rootScope.user.course) // Descargar lista de archivos entregados por todos los alumnos
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
                Cipressus.db.get('activities/'+$rootScope.user.course) // Descargar datos de la materia para tener info de vencimientos
                .then(function (activities_data) {
                    $scope.activityTree = activities_data; // Guardo el arbol completo 
                    $scope.activities = Cipressus.utils.getArray(activities_data); // Lista de actividades
                    //console.log($scope.activities);        
                    $rootScope.loading = false;
                    $scope.$apply();
                    M.FormSelect.init(document.querySelectorAll('select'), {}); // Inicializar select
                    document.getElementById("activity_select").addEventListener("change",function(){ // Callback al elegir actividad para entregar informe
                        var sel = document.getElementById("activity_select"); // Se puede usar this?
                        var actIdx = $scope.activities.findIndex(function(x){ return x.id == sel.options[sel.selectedIndex].value}); // Buscar la actividad seleccionada
                        
                        $scope.selectedActivity = null;

                        // Buscar si la actividad que intenta subir ya fue entregada
                        for(var k in $scope.submissions){
                            if($scope.submissions[k].activityId == sel.options[sel.selectedIndex].value && $scope.submissions[k].authors.includes($rootScope.user.uid) ){ // Misma actividad
                                M.toast({
                                    html: "Ya realizó la entrega de esta actividad. Elimine la anterior.",
                                    classes: 'rounded red',
                                    displayLength: 2000
                                });
                                $scope.$apply();
                                return;
                            }
                        }

                        $scope.selectedActivity = { // Objeto con info de la actividad sobre la que se entrega el trabajo
                            id: sel.options[sel.selectedIndex].value, // Identificador de la actividad
                            name: sel.options[sel.selectedIndex].text, // Nombre legible de la actividad
                            deadline: $scope.activities[actIdx].dl.date, // Vencimiento
                            type: $scope.activities[actIdx].dl.submit // Tipo de actividad (informe, simulacion, test)
                        };

                        // Descargar simulaciones guardadas
                        $rootScope.loading = true;
                        $scope.$apply();
                        $scope.simulations = []; // Lista de simulaciones
                        Cipressus.db.query("simulations", "uid", $rootScope.user.uid)
                        .then(function(snapshot){
                            snapshot.forEach(function(sim){
                                var simObj = sim.val();
                                simObj.id = sim.key; // Id en el arbol de simulaciones
                                simObj.index = $scope.simulations.length; // Para ubicarlo en el objeto
                                $scope.simulations.push(simObj);
                            });
                            $rootScope.loading = false;
                            $scope.$apply();
                            M.FormSelect.init(document.querySelectorAll('select'), {}); // Inicializar select
                            document.getElementById("simulation_select").addEventListener("change",function(){ // Callback al elegir actividad para entregar informe
                                var sim_sel = document.getElementById("simulation_select");
                                var simIdx = $scope.simulations.findIndex(function(x){ return x.id == sim_sel.options[sim_sel.selectedIndex].value}); // Buscar la simulacion seleccionada
                                if(simIdx >= 0) // Si se encuentra el indice
                                    $scope.selectedSim = $scope.simulations[simIdx];
                                else
                                    $scope.selectedSim = null;
                            });
                        })
                        .catch(function(err){
                            console.log(err);
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