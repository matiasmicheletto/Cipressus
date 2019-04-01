app.controller("users", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    

    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();
    $scope.selectedKey = null;

    // Los inputs date no funcionan con ng-change entonces la actualizacion
    // la hago programaticamente. Este es el callback de cambios
    var onInputDateChange = function(){
        $scope.auxiliarySubmits[this.id] = {
            submitted: moment(this.value).unix()*1000,
            timestamp: Date.now(),
            evaluator: $rootScope.user.uid
        };
        $scope.$apply();
    };

    $scope.select = function(key){ // Selecciona un usuario de la lista
        $scope.selectedKey = key; // Recordar limpiar esta variable despues de usar
    };

    $scope.getUserNames = function(userUids){ // Devuelve los apellidos de los usuarios cuyos uid se pasa como arreglo
        if($scope.users){ // Esperar a que se bajen de la db
            var names = [];
            for(var k in userUids)
             names.push($scope.users[userUids[k]].secondName);
            return names.join(); // Apellidos separados por coma
        }
    };

    $scope.sendMessage = function(){ // Enviar mensaje al usuario seleccionado
        console.log($scope.message);
        console.log($scope.selectedKey);
        $scope.selectedKey = null;
        messageModal.close();
    };

    $scope.enrollUser = function(){ // Aprobar usuario como alumno
        $rootScope.loading = true;
        var user_private = { // Objeto a subir
            admin: false,
            enrolled: Date.now()
            // scores y submits se completan a medida que apruebe actividades
        };
        Cipressus.db.update(user_private,"users_private/"+$scope.selectedKey)
        .then(function(snapshot){
            // Copiar atributos para actualizar vista
            $scope.users[$scope.selectedKey].admin = false;
            $scope.users[$scope.selectedKey].enrolled = user_private.enrolled;
            M.toast({html: "Listo!",classes: 'rounded green darken-3',displayLength: 2000});
            confirmEnrollModal.close();
            $scope.selectedKey = null; // Deseleccionar user
            $rootScope.loading = false;
            $scope.$apply(); 
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
            $rootScope.loading = false;
            $scope.$apply(); 
        })
    };

    $scope.startScoresModal = function(key){ // Preparar para ingresar calificaciones al usuario seleccionado
        // Hay que pasar el key porque la funcion select(key) parece ejecutarse despues        
        
        // Generar arreglos auxiliares para no sobreescribir el original
        $scope.auxiliaryScores = {};
        for(var k in $scope.users[key].scores) // Debo copiar notas una a una para no referenciar objetos
            $scope.auxiliaryScores[k] = {
                evaluator: $scope.users[key].scores[k].evaluator,
                score: $scope.users[key].scores[k].score,
                timestamp: $scope.users[key].scores[k].timestamp
            };
        $scope.auxiliarySubmits = {};
        for(var k in $scope.users[key].submits){ // Debo copiar notas una a una para no referenciar objetos
            $scope.auxiliarySubmits[k] = {
                evaluator: $scope.users[key].submits[k].evaluator,
                submitted: $scope.users[key].submits[k].submitted,
                timestamp: $scope.users[key].submits[k].timestamp
            };
        }

        // Inicializo los listeners de inputs date aca porque no pude usar ni ng-model ni ng-change
        for(var k in $scope.activities) 
            if($scope.activities[k].dl){ // Si la actividad tiene vencimiento
                if($scope.auxiliarySubmits[$scope.activities[k].id]) // Si la actividad fue entregada/evaluada
                    document.getElementById($scope.activities[k].id).value = moment($scope.auxiliarySubmits[$scope.activities[k].id].submitted).format("YYYY-MM-DD");
                else // Si no borrarla
                    document.getElementById($scope.activities[k].id).value = '';
                document.getElementById($scope.activities[k].id).removeEventListener("change",onInputDateChange); // Lo quito para no duplicar
                document.getElementById($scope.activities[k].id).addEventListener("change",onInputDateChange);
            }
        scoresModal.open(); // Lo hago aca porque se hace lio con los trigger de materialize
    };

    $scope.getCost = function(key){ // Calcular el costo por perdida de vencimiento de una actividad
        if($scope.activities[key] && $scope.auxiliarySubmits){ // Si ya existen los arreglos, usarlos
            if($scope.auxiliarySubmits[$scope.activities[key].id]){ // Control de coherencia
                if($scope.auxiliarySubmits[$scope.activities[key].id].submitted > $scope.activities[key].dl.date){ // Si paso el vencimiento
                    // Calcular costo
                    var cost = Cipressus.utils.defaultCostFunction($scope.auxiliarySubmits[$scope.activities[key].id].submitted, $scope.activities[key].dl.date, $scope.activities[key].dl.param);
                    if(cost > $scope.activities[key].score) // El costo no puede superar el puntaje maximo
                        return $scope.activities[key].score;
                    else // Si no supera, retornar el valor
                        return cost.toFixed(2);
                }else // Si no paso el vencimiento, el costo es nulo
                    return 0;
            }
        }
    };

    $scope.deleteSubmit = function(key){ // Esta se llama al eliminar una nota oprimiendo en el logo de usuario
        // Para el caso de notas puedo quitar con instrucciones dentro del ng-click pero para este no
        document.getElementById(key).removeEventListener("change",onInputDateChange); // Lo quito para que no dispare al cambiar valor
        document.getElementById(key).value = ''; // Limpiar input date
        $scope.auxiliarySubmits[key] = null; // Borrar timestamp, evaluator y submitted
        document.getElementById(key).addEventListener("change",onInputDateChange); // Vuelvo a habilitar
    }

    $scope.saveScores = function(){ // Guardar el formulario de notas
        $rootScope.loading = true;
        var obj = {}; // Objeto a actualizar en DB
        obj.scores = $scope.auxiliaryScores;
        obj.submits = $scope.auxiliarySubmits;
        Cipressus.db.update(obj,"users_private/"+$scope.selectedKey)
        .then(function(snapshot){            
            $scope.users[$scope.selectedKey].scores = $scope.auxiliaryScores;
            $scope.users[$scope.selectedKey].submits = $scope.auxiliarySubmits;
            scoresModal.close();
            // Borrar los datos temporales
            $scope.selectedKey = null;
            $scope.auxiliaryScores = null;
            $scope.auxiliarySubmits = null;
            M.toast({html: "Calificaciones actualizadas",classes: 'rounded green darken-3',displayLength: 2000});
            $rootScope.loading = false;
            $scope.$apply();
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "No se pudo guardar",classes: 'rounded red',displayLength: 2000});
            $rootScope.loading = false;
            $scope.$apply();
        });
    };


    ///// Inicializacion del controller

    M.Modal.init(document.getElementById("view_modal"), {preventScrolling: false});
    var messageModal = M.Modal.init(document.getElementById("message_modal"), {preventScrolling: false});
    var confirmEnrollModal = M.Modal.init(document.getElementById("confirm_enroll_modal"), {preventScrolling: false});
    var scoresModal = M.Modal.init(document.getElementById("scores_modal"), {preventScrolling: false, dismissible: false});

    Cipressus.utils.activityCntr($rootScope.user.uid,"users").catch(function(err){console.log(err)});

    Cipressus.db.get('users_public') // Descargar lista de usuarios
    .then(function(users_public_data){
        $scope.users = users_public_data;
        Cipressus.db.get('users_private') // Descargar lista de usuarios aceptados
        .then(function(users_private_data){    
            // Mezclar los atributos
            for(var k in users_private_data)
                for(var j in users_private_data[k])
                    $scope.users[k][j] = users_private_data[k][j];            
            // Descargar lista de actividades
            Cipressus.db.get('activities')
            .then(function(activities_data){
                $scope.activities = []; // Convertir el arbol en array (no lo uso como arbol aca)
                $scope.activities = Cipressus.utils.getArray(activities_data, $scope.activities, '');                
                $rootScope.loading = false;
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                $rootScope.loading = false;
                $scope.$apply();
            });
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
            $rootScope.loading = false;
            $scope.$apply();
        });
    })
    .catch(function(err){
        console.log(err);
        M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        $rootScope.loading = false;
        $scope.$apply();
    });

}]);