app.controller("users", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();
    $scope.selectedKey = null;
    $scope.selectedIndex = null;
    $scope.showAll = true;
    var attendableEvents=0; // Contador de eventos para calcular asistencia

    $scope.orderTag = 'name';
    $scope.reverseOrder = false;

    $scope.changeOrder = function(tag) { // Acmbiar el sentido de ordenamiento de la tabla
        if($scope.orderTag === tag) {
            $scope.reverseOrder = !$scope.reverseOrder;
        } else {
            $scope.orderTag = tag;
            $scope.reverseOrder = false;
        }
    };

    // Los inputs date no funcionan con ng-change entonces la actualizacion
    // la hago programaticamente. Este es el callback de cambios
    var onInputDateChange = function () {
        $scope.auxiliarySubmits[this.id] = {
            submitted: moment(this.value).unix() * 1000,
            timestamp: Date.now(),
            evaluator: $rootScope.user.uid
        };
        $scope.$apply();
    };

    $scope.viewUser = function (key) { // Selecciona un usuario de la lista para ver detalles
        // Tambien se abre el modal con detalles desde la vista
        $scope.selectedKey = key; // Recordar limpiar esta variable despues de usar
        $scope.selectedIndex = $scope.getUserIndex[key];
        evalAttendance();
        updatePolarPlot();
    };

    $scope.selectUser = function(key) { // Seleccionar usuario para aprobar inscripcion a un curso
        $scope.selectedKey = key;
        $scope.selectedIndex = $scope.getUserIndex[key];
        confirmEnrollModal.open();
    };

    var evalAttendance = function(){ // Calcular asistencia del alumno seleccionado
        if($scope.users[$scope.selectedIndex].scores){
            if($scope.users[$scope.selectedIndex].attendance){ // Calcular asistencia aquí (solo se usa para mostrar pero no se guarda en db)
                var userAttendedEvents = Object.getOwnPropertyNames($scope.users[$scope.selectedIndex].attendance).length; // Cantidad de clases asistidas por el usuario
                var att = attendableEvents > 0 ? userAttendedEvents/attendableEvents*100 : 0;
                $scope.users[$scope.selectedIndex].scores.asistencia = {
                    score: parseInt(att.toFixed(2)), // Calcular porcentaje de asistencia
                    evaluator: "Cipressus", // Evaluado por el sistema, no manualmente
                    timestamp: Date.now()
                };                                
            }else{ // Si no asistió a nada, entonces la asistencia queda en 0
                $scope.users[$scope.selectedIndex].scores.asistencia = {
                    score: 0,
                    evaluator: "Cipressus", // Evaluado por el sistema, no manualmente
                    timestamp: Date.now()
                };
            }   
        }
    };

    var updatePolarPlot = function(){ // Actualizar grafico de notas del alumno seleccionado
        var data = []; // Datos para mostrar en el grafico polar
        // Buscar nodo de la actividad seleccionada
        $scope.currentNode = Cipressus.utils.searchNode($scope.activitiesTree,"final");
        var sc = Cipressus.utils.eval($scope.users[$scope.selectedIndex],$scope.currentNode);
        var value = sc.score/$scope.currentNode.score*100;        
        $scope.currentActivityScores = { // Para detallar textualmente
            name: $scope.currentNode.name,
            points: ($scope.currentNode.score*value/100).toFixed(2), 
            score: value.toFixed(2),
            children:[] // Asjuntar los nodos hijos
        };
        for(k in $scope.currentNode.children){ // Para cada sub actividad
            // Calcular nota de las sub actividades
            var subsc = Cipressus.utils.eval($scope.users[$scope.selectedIndex],$scope.currentNode.children[k]);
            var subValue = subsc.score/$scope.currentNode.children[k].score*100;
            // Poner las notas en un arreglo para mostrar en detalles (leyenda) del grafico
            $scope.currentActivityScores.children.push({
                name: $scope.currentNode.children[k].name, // Nombre de la actividad
                points: ($scope.currentNode.children[k].score*subValue/100).toFixed(2), // Puntos obtenidos por la actividad
                score: subValue.toFixed(2) // Nota en porcentaje
            });
            data.push({ // Agregar nota de esa actividad a los datos para el chart
                y: $scope.currentNode.children[k].score,
                z: parseInt(subValue.toFixed(2)),
                name: $scope.currentNode.children[k].name
            })
        }
        Highcharts.chart('variable_pie_container', {
            chart: {type: 'variablepie',height: '100%'},
            title: {text: 'Calificaciones'},
            tooltip: {
                headerFormat: '',
                pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
                    'Nota actividad: <b>{point.z}%</b><br/>'
            },
            series: [{minPointSize: 10,innerSize: '20%',zMin: 0,name: 'Notas',data: data}]
        });
    };

    $scope.enrollUser = function () { // Aprobar usuario como alumno
        var user_private = { // Objeto a subir
            admin: false,
            course: $rootScope.user.course, // El ID del curso del admin que esta dando de alta
            enrolled: Date.now()
            // scores y submits se completan a medida que apruebe actividades
        };
        if($scope.selectedKey){ // Habria que agregar un mejor control de la key que se esta escribiendo
            $rootScope.loading = true;
            Cipressus.db.update(user_private, "users_private/" + $scope.selectedKey)
                .then(function (snapshot) {
                    // Copiar atributos para actualizar vista
                    $scope.users[$scope.selectedIndex].admin = false;
                    $scope.users[$scope.selectedIndex].enrolled = user_private.enrolled;
                    M.toast({
                        html: "Listo!",
                        classes: 'rounded green darken-3',
                        displayLength: 2000
                    });
                    confirmEnrollModal.close();
                    
                    // Notificar al usuario sobre su aceptacion al curso
                    var notif = { 
                        icon: "info",
                        link: "home",
                        title: "Inscripción aceptada",
                        text: "Has sido incorporado al curso: "+$scope.activitiesTree.course.name
                    };
                    Cipressus.utils.sendNotification($scope.selectedKey, notif);

                    $scope.selectedKey = null; // Deseleccionar user
                    $scope.selectedIndex = null;
                    $rootScope.loading = false;
                    $scope.$apply();
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({
                        html: "Ocurrió un error al acceder a la base de datos",
                        classes: 'rounded red',
                        displayLength: 2000
                    });
                    $rootScope.loading = false;
                    $scope.$apply();
                })
        }
    };

    $scope.evalUser = function (key) { // Preparar para ingresar calificaciones al usuario seleccionado
        $scope.selectedKey = key;
        $scope.selectedIndex = $scope.getUserIndex[key];

        evalAttendance(); // Calcular asistencia automáticamente

        // Generar arreglos auxiliares para no sobreescribir el original
        $scope.auxiliaryScores = {};
        for (var k in $scope.users[$scope.selectedIndex].scores) // Debo copiar notas una a una para no referenciar objetos
            $scope.auxiliaryScores[k] = {
                evaluator: $scope.users[$scope.selectedIndex].scores[k].evaluator,
                score: $scope.users[$scope.selectedIndex].scores[k].score,
                timestamp: $scope.users[$scope.selectedIndex].scores[k].timestamp
            };
        $scope.auxiliarySubmits = {};
        for (var k in $scope.users[$scope.selectedIndex].submits) { // Debo copiar notas una a una para no referenciar objetos
            $scope.auxiliarySubmits[k] = {
                evaluator: $scope.users[$scope.selectedIndex].submits[k].evaluator,
                submitted: $scope.users[$scope.selectedIndex].submits[k].submitted,
                timestamp: $scope.users[$scope.selectedIndex].submits[k].timestamp
            };
        }

        // Inicializo los listeners de inputs date aca porque no pude usar ni ng-model ni ng-change
        for (var k in $scope.activities)
            if ($scope.activities[k].dl) { // Si la actividad tiene vencimiento
                if ($scope.auxiliarySubmits[$scope.activities[k].id]) // Si la actividad fue entregada/evaluada
                    document.getElementById($scope.activities[k].id).value = moment($scope.auxiliarySubmits[$scope.activities[k].id].submitted).format("YYYY-MM-DD");
                else // Si no borrarla
                    document.getElementById($scope.activities[k].id).value = '';
                document.getElementById($scope.activities[k].id).removeEventListener("change", onInputDateChange); // Lo quito para no duplicar
                document.getElementById($scope.activities[k].id).addEventListener("change", onInputDateChange);
            }
        scoresModal.open(); // Lo hago aca porque se hace lio con los trigger de materialize
    };

    $scope.getCost = function (key) { // Calcular el costo por perdida de vencimiento de una actividad
        if ($scope.activities[key] && $scope.auxiliarySubmits) { // Si ya existen los arreglos, usarlos
            if ($scope.auxiliarySubmits[$scope.activities[key].id]) { // Control de coherencia
                if ($scope.auxiliarySubmits[$scope.activities[key].id].submitted > $scope.activities[key].dl.date) { // Si paso el vencimiento
                    // Calcular costo
                    var cost = Cipressus.utils.defaultCostFunction($scope.auxiliarySubmits[$scope.activities[key].id].submitted, $scope.activities[key].dl.date, $scope.activities[key].dl.param);
                    if (cost > $scope.activities[key].score) // El costo no puede superar el puntaje maximo
                        return $scope.activities[key].score;
                    else // Si no supera, retornar el valor
                        return cost.toFixed(2);
                } else // Si no paso el vencimiento, el costo es nulo
                    return 0;
            }
        }
    };

    $scope.deleteSubmit = function (key) { // Esta se llama al eliminar una nota oprimiendo en el logo de usuario
        // Para el caso de notas puedo quitar con instrucciones dentro del ng-click pero para este no
        document.getElementById(key).removeEventListener("change", onInputDateChange); // Lo quito para que no dispare al cambiar valor
        document.getElementById(key).value = ''; // Limpiar input date
        $scope.auxiliarySubmits[key] = null; // Borrar timestamp, evaluator y submitted
        document.getElementById(key).addEventListener("change", onInputDateChange); // Vuelvo a habilitar
    };

    $scope.exportExcel = function(){ // Guardar excel de la lista completa de usuarios del curso actual con sus calificaciones
        
        var ws_data = []; // Datos de la planilla
        
        // Encabezado
        var header = ['UID', 'Nombre y apellido', 'Email', 'Carrera', 'LU', 'Comp com.', ' ']; 
        for(var j in $scope.activities)
            header.push($scope.activities[j].name+" ("+($scope.activities[j].score||$scope.activities[j].value)+")");
        ws_data.push(header);
        
        // Filas
        for(var k in $scope.users){ // Para cada usuario
            if($scope.users[k].course == $rootScope.user.course && !$scope.users[k].admin){
                var row = [
                    $scope.users[k].key,
                    $scope.users[k].secondName+", "+$scope.users[k].name,
                    $scope.users[k].email,
                    $scope.users[k].degree,
                    $scope.users[k].lu, 
                    $scope.users[k].partners ? $scope.users[k].partners.map(function(el){return $scope.users[$scope.getUserIndex[el]].secondName}) : "",
                    " " // Espaciador
                ];
                // Agregar calificacion de actividades
                for(var j in $scope.activities){
                    var node = Cipressus.utils.searchNode($scope.activitiesTree, $scope.activities[j].id);
                    var sc = Cipressus.utils.eval($scope.users[k], node);
                    row.push(sc.score.toFixed(2)+" ("+(sc.score/($scope.activities[j].score||$scope.activities[j].value)*100).toFixed(2)+"%)");
                }
                ws_data.push(row);
            }
        }

        var ws = XLSX.utils.aoa_to_sheet(ws_data);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
        var wopts = { bookType:'xlsx', bookSST:false, type:'array' };
        var wbout = XLSX.write(wb, wopts);
        saveAs(new Blob([wbout],{type:"application/octet-stream"}), 'UsuariosCipressus_'+moment().format("DD_MM_YYYY")+'.xlsx');
    };

    $scope.saveScores = function () { // Guardar el formulario de notas
        $rootScope.loading = true;
        var obj = {}; // Objeto a actualizar en DB
        obj.scores = $scope.auxiliaryScores;
        obj.submits = $scope.auxiliarySubmits;
        Cipressus.db.update(obj, "users_private/" + $scope.selectedKey)
            .then(function (snapshot) {

                // Notificar al usuario
                var notif = { 
                    icon: "info",
                    link: "dashboard",
                    title: "Cambios en calificaciones",
                    text: "Tus calificaciones fueron actualizadas"
                };
                Cipressus.utils.sendNotification($scope.selectedKey, notif);

                $scope.users[$scope.selectedIndex].scores = $scope.auxiliaryScores;
                $scope.users[$scope.selectedIndex].submits = $scope.auxiliarySubmits;
                scoresModal.close();
                // Borrar los datos temporales
                $scope.selectedIndex = null;
                $scope.auxiliaryScores = null;
                $scope.auxiliarySubmits = null;
                M.toast({
                    html: "Calificaciones actualizadas",
                    classes: 'rounded green darken-3',
                    displayLength: 2000
                });
                $rootScope.loading = false;
                $scope.$apply();
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "No se pudo guardar",
                    classes: 'rounded red',
                    displayLength: 2000
                });
                $rootScope.loading = false;
                $scope.$apply();
            });
    };

    ///// Inicializacion del controller

    M.Modal.init(document.getElementById("view_modal"), {
        preventScrolling: false
    });
    var messageModal = M.Modal.init(document.getElementById("message_modal"), {
        preventScrolling: false
    });
    var confirmEnrollModal = M.Modal.init(document.getElementById("confirm_enroll_modal"), {
        preventScrolling: false
    });
    var scoresModal = M.Modal.init(document.getElementById("scores_modal"), {
        preventScrolling: false,
        dismissible: false
    });

    Cipressus.utils.activityCntr($rootScope.user.uid, "users").catch(function (err) {
        console.log(err)
    });

    $scope.users = [];
    Cipressus.db.get('users_public') // Descargar lista de usuarios
        .then(function (users_public_data) {
            // Convertir objeto a arreglo y copiar claves
            $scope.getUserIndex = {}; // Arreglo para mapear uid a indice de arreglo
            for(var k in users_public_data){
                $scope.users.push(users_public_data[k]);
                $scope.users[$scope.users.length-1].key = k;
                $scope.getUserIndex[k] = $scope.users.length-1; // Mapear indice
            }
            Cipressus.db.get('users_private') // Descargar lista de usuarios aceptados
                .then(function (users_private_data) {
                    // Mezclar los atributos
                    //console.log($scope.users);
                    for (var k in users_private_data)
                        for (var j in users_private_data[k]){ // Dos niveles de entrada
                            $scope.users[$scope.getUserIndex[k]][j] = users_private_data[k][j];
                        }
                    // Descargar lista de actividades
                    Cipressus.db.get('activities/'+$rootScope.user.course)
                        .then(function (activities_data) {
                            $scope.activitiesTree = activities_data;
                            $scope.activities = Cipressus.utils.getArray(activities_data);
                            Cipressus.db.getSorted('events/'+$rootScope.user.course,'start') // Lista de eventos ordenados por fecha de inicio
                            .then(function(events_data){
                                events_data.forEach(function(childSnapshot){
                                    var ev = childSnapshot.val();                                    
                                    if(ev.start <= Date.now() && ev.attendance) // Si es un evento pasado y con asistencia obligatoria
                                        attendableEvents++; // Contar para calcular porcentaje de asistencia 
                                });                                
                                $rootScope.loading = false;
                                $rootScope.$apply(); 
                            })
                            .catch(function(err){ // events
                                console.log(err);
                                M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                                $rootScope.loading = false;
                                $rootScope.$apply(); 
                            });
                        })
                        .catch(function (err) {
                            console.log(err);
                            M.toast({
                                html: "Ocurrió un error al acceder a la base de datos",
                                classes: 'rounded red',
                                displayLength: 2000
                            });
                            $rootScope.loading = false;
                            $scope.$apply();
                        });
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({
                        html: "Ocurrió un error al acceder a la base de datos",
                        classes: 'rounded red',
                        displayLength: 2000
                    });
                    $rootScope.loading = false;
                    $scope.$apply();
                });
        })
        .catch(function (err) {
            console.log(err);
            M.toast({
                html: "Ocurrió un error al acceder a la base de datos",
                classes: 'rounded red',
                displayLength: 2000
            });
            $rootScope.loading = false;
            $scope.$apply();
        });

}]);