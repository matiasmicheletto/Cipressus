app.controller("attendance", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    

    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();

    $scope.updateLists = function(){ // En base a la fecha seleccionada se generan las listas de ausentes y presentes
        if($scope.changes){ // Si hubo cambios, preguntar si guardar antes de borrar
            confirmModal.open();
            return;
        } 
        
        $scope.absents = []; // Lista con id de usuarios ausentes al evento actual
        $scope.presents = []; // Lista de presentes
        for(var k in $scope.users){ // Recorrer lista de usuarios
            if(!$scope.users[k].admin){ // A los usuarios admin no se les computa asistencia
                if($scope.users[k].attendance){ // Si el usuario asistio a alguna clase
                    if($scope.users[k].attendance[$scope.selectedEventKey]) // Si tiene el evento actual
                        $scope.presents.push(k); // Marcar alumno como presente
                    else // Si no tiene el evento actual
                        $scope.absents.push(k); // Agregar a lista de ausentes
                }else // Si no asistio a ningun evento, marcar como ausente 
                    $scope.absents.push(k); // Agregar a lista de ausentes
            }
        }

        $scope.$apply();
    };

    $scope.isPresent = function(idx){ // Mover el user key a lista de ausentes
        $scope.changes = true;
        $scope.presents.push($scope.absents[idx]); // Agregar a prsentes
        $scope.absents.splice(idx,1); // Quitar de ausentes
    };

    $scope.isAbsent = function(idx){ // Mover el user key a la lista de presentes
        $scope.changes = true;
        $scope.absents.push($scope.presents[idx]); // Agregar a ausentes
        $scope.presents.splice(idx,1); // Quitar de presentes
    };

    $scope.saveList = function(){ // Guardar la lista de presentes
        var updates = {};
        for(var k in $scope.presents){ // Guardar referencia al evento actual en la entrada del usuario
            var value = { // A insertar para marcar asistencia
                evaluator: $rootScope.user.uid,
                timestamp: Date.now()
            };
            updates["users_private/"+$scope.presents[k]+"/attendance/"+$scope.selectedEventKey] = value;
            // Actualizar objeto local
            if(!$scope.users[$scope.presents[k]].attendance) // Para la primera vez
                $scope.users[$scope.presents[k]].attendance = {}
            $scope.users[$scope.presents[k]].attendance[$scope.selectedEventKey] = value;
        }
        for(var k in $scope.absents){ // Quitar referencia en la entrada del usuario
            updates["users_private/"+$scope.absents[k]+"/attendance/"+$scope.selectedEventKey] = null;
            if(!$scope.users[$scope.absents[k]].attendance) // Para la primera vez
                $scope.users[$scope.absents[k]].attendance = {}
            $scope.users[$scope.absents[k]].attendance[$scope.selectedEventKey] = null;
        }

        // Guardar cambios
        Cipressus.db.update(updates)
        .then(function(snapshot){
            M.toast({html: "Cambios guardados!",classes: 'rounded green darken-3 darken-3',displayLength: 1500});        
            $rootScope.loading = false;
            $scope.changes = false;
            $scope.$apply();
            confirmModal.close();
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al actualizar cambios",classes: 'rounded red',displayLength: 2000});        
        });

    };
    
    //// Inicializacion ////

    Cipressus.utils.activityCntr($rootScope.user.uid,"attendance").catch(function(err){console.log(err)});

    var confirmModal = M.Modal.init(document.getElementById("confirm_modal"), {preventScrolling: false});
    document.getElementById("event_select").addEventListener("change",function(){ // No se puede poner en ng-change
        $scope.selectedEventKey = this.value;
        $scope.updateLists();
    });
    
    Cipressus.db.getSorted("events","start") // Descargar todos los eventos ordenados por fecha
    .then(function(events_data){
        $scope.events = {}; // Lista de eventos que completo dentro del iterator
        // Tengo que buscar el evento que acaba de empezar (para usar en la clase actual por ejemplo)
        var today = Date.now(); // Ahora
        var nextKey = ""; // En esta variable dejo el key del evento que pongo por defecto
        events_data.forEach(function(childSnapshot){ // Lista ordenada de menor a mayor (esto no es asincrono)
            key = childSnapshot.ref_.path.pieces_[1]; // Esto seria el key (buscar metodo que lo devuelva)
            $scope.events[key] = childSnapshot.val(); // Hago push del evento (no se puede mandar todos de una)
            if($scope.events[key].start < today) // Los eventos futuros ya no los guardo
                nextKey = key; // Guardo el key del evento
        });  
        $scope.$apply(); // Hay que actualizar dom antes de inicializar el select
        document.getElementById("event_select").value = nextKey; // Seleccionar el valor defecto del select
        $scope.selectedEventKey = nextKey; // Para actualizar la tabla una vez que tenga los usuarios
        M.FormSelect.init(document.querySelectorAll('select'), {}); // Inicializar select
        Cipressus.db.get("users_private") // Descargar lista de usuarios
        .then(function(users_private_data){
            $scope.users = users_private_data;
            Cipressus.db.get("users_public") // Descargar datos de usuario
            .then(function(users_public_data){
                for(var k in users_public_data) // Los datos de usuario para listar
                    if($scope.users[k]) // Si es usuario esta en lista de habilitados
                        $scope.users[k].data = users_public_data[k]; 
                $scope.updateLists(); // Como ya tengo el selectedEventKey, puedo generar las listas para ese dia
                $rootScope.loading = false;
                $scope.changes = false; // Para habilitar el boton de guardar
                $scope.$apply();    
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});        
            });        
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});        
        });        
    })
    .catch(function(err){
        console.log(err);
        M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});        
    });    

}]);