app.controller("users", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    

    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();
    $scope.selectedKey = null;
    
    // Componentes materialize
    M.Modal.init(document.getElementById("view_modal"), {preventScrolling: false});
    var messageModal = M.Modal.init(document.getElementById("message_modal"), {preventScrolling: false});
    var confirmEnrollModal = M.Modal.init(document.getElementById("confirm_enroll_modal"), {preventScrolling: false});
    var scoresModal = M.Modal.init(document.getElementById("scores_modal"), {preventScrolling: false, dismissible: false});

    $scope.readableTime = function(timestamp, withTime){ // Fecha y hora formal
        var mnt;
        if(timestamp != null) // Si se pasafecha valida
            mnt = moment(timestamp);
        else // Si no usar la actual
            mnt = moment(Date.now());
        if(withTime) // Fecha y hora
            return mnt.format("DD/MM/YYYY HH:mm");
        else // Solo fecha
            return mnt.format("DD/MM/YYYY");
    };

    $scope.relativeTime = function(timestamp){ // Tiempo relativo al actual
        return moment(timestamp).fromNow();
    };

    $scope.select = function(key){ // Selecciona un usuario de la lista
        $scope.selectedKey = key; // Recordar limpiar esta variable despues de usar
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
            M.toast({html: "Listo!",classes: 'rounded green',displayLength: 2000});
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
        if($scope.activities[k].dl){
            if($scope.auxiliarySubmits[$scope.activities[k].id])
                document.getElementById($scope.activities[k].id).value = moment($scope.auxiliarySubmits[$scope.activities[k].id].submitted).format("YYYY-MM-DD");
            document.getElementById($scope.activities[k].id).addEventListener("change",function(){
                if(typeof($scope.auxiliarySubmits[this.id])=="undefined") // Si no tenia fecha de entrega, 
                    $scope.auxiliarySubmits[this.id] = {}; // Crear objeto
                // Completar o actualizar los campos restantes
                $scope.auxiliarySubmits[this.id].submitted = moment(this.value).unix()*1000;
                $scope.auxiliarySubmits[this.id].timestamp = Date.now();
                $scope.auxiliarySubmits[this.id].evaluator = $rootScope.user.uid;
                $scope.$apply();
            })
        }
    };



    $scope.saveScores = function(){ // Guardar el formulario de notas
        
        // TODO guardar objetos auxiliary!!!!
        // Y despues borrarlos
        // Verificar si hubo cambios?

        scoresModal.close();
    };

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