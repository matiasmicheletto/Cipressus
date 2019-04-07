app.controller("simulator", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();

    $scope.updateFields = function(){ // Funcion auxiliar
        setTimeout(function(){
            M.updateTextFields();
        },200);
    };

    $scope.getSimulations = function () { // Descargar lista de archivos de simulacion del usuario
        if(!$scope.simulations){ // Si no se descargaron los archivos, bajar
            $rootScope.loading = true;
            Cipressus.db.get("users_public/"+$rootScope.user.uid+"/simulations")
            .then(function(simulations_data){
                if(simulations_data){
                    $scope.simulations = simulations_data;
                    load_modal.open();
                }else
                    M.toast({html: "No hay circuitos guardados!",classes: 'rounded green darken-3',displayLength: 2000});
                $rootScope.loading = false;
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al mostrar archivos",classes: 'rounded red',displayLength: 2000});
                $rootScope.loading = false;
                $scope.$apply();
            });
        }else{ // Si ya se habia descargado la info de la db, abrir directamente modal
            load_modal.open();
        }
    };

    $scope.loadCircuit = function(key){ // Cargar circuito
        var data = JSON.parse($scope.simulations[key].data);
        // Poner barra de herramientas
        data.showToolbox = true;
        data.width = document.getElementById("simcir").clientWidth;
        data.height = document.getElementById("simcir").clientHeight
        data.toolbox = [
          {"type":"In"},
          {"type":"Out"},
          {"type":"Joint"},
          {"type":"DC"},
          {"type":"LED"},
          {"type":"PushOff"},
          {"type":"PushOn"},
          {"type":"Toggle"},
          {"type":"BUF"},
          {"type":"NOT"},
          {"type":"AND"},
          {"type":"NAND"},
          {"type":"OR"},
          {"type":"NOR"},
          {"type":"XOR"},
          {"type":"XNOR"},
          {"type":"OSC"},
          {"type":"7seg"},
          {"type":"16seg"},
          {"type":"4bit7seg"},
          {"type":"RotaryEncoder"},
          {"type":"BusIn"},
          {"type":"BusOut"},
          {"type":"RS-FF"},
          {"type":"JK-FF"},
          {"type":"T-FF"},
          {"type":"D-FF"},
          {"type":"8bitCounter"},
          {"type":"HalfAdder"},
          {"type":"FullAdder"},
          {"type":"4bitAdder"},
          {"type":"2to4BinaryDecoder"},
          {"type":"3to8BinaryDecoder"},
          {"type":"4to16BinaryDecoder"}
        ];
        simcir.setupSimcir($('#simcir'), data);
        currentSim = {
            key: key,
            name: $scope.simulations[key].name
        };
        $scope.circuitFileName = $scope.simulations[key].name;
        load_modal.close();
    };

    $scope.saveCircuit = function () {
        $rootScope.loading = true;

        // Verificar si el nombre existe para saber si hay que actualizar o crear nuevo
        currentSim = {};
        if($scope.simulations)
            for(var k in $scope.simulations)
                if($scope.simulations[k].name == $scope.circuitFileName) // Coincidencia
                    currentSim = { // Guardar datos de actualizacion
                        key: k,
                        name: $scope.simulations[k].name
                    };

        // Crear objeto a guardar en db
        var model = simcir.controller($('#simcir').find('.simcir-workspace')).data(); // Objeto con datos de simulacion
        var data = JSON.stringify((({ devices, connectors }) => ({ devices, connectors }))(model)); // Solo guardar dos propiedades

        if(model.devices.length == 0){ // No guardar si no hay componentes
            M.toast({html: "No hay componentes!",classes: 'rounded red',displayLength: 2000});
            $rootScope.loading = false;
        }else{ // Si hay al menos un componente, guardar en db
            var sim = {
                timestamp: Date.now(),
                size: model.devices.length,
                data: data, 
                name: $scope.circuitFileName
            };
    
            if(currentSim.key){ // Si se esta trabajando sobre un modelo existente
                Cipressus.db.update(sim,"users_public/"+$rootScope.user.uid+"/simulations/"+currentSim.key)
                .then(function(res){
                    //console.log(res);   
                    $scope.simulations[currentSim.key] = sim; // Actualizar local
                    save_modal.close();
                    $rootScope.loading = false;
                    $scope.$apply();
                })
                .catch(function(err){
                    console.log(err);
                    M.toast({html: "Ocurrió un error al guardar",classes: 'rounded red',displayLength: 2000});
                    $rootScope.loading = false;
                    $scope.$apply();
                });
            }else{ // Si se creo un nuevo modelo
                Cipressus.db.push(sim,"users_public/"+$rootScope.user.uid+"/simulations")
                .then(function(res){
                    //console.log(res);    
                    currentSim = {
                        key: res.key,
                        name: sim.name
                    };
                    if(!$scope.simulations)
                        $scope.simulations = {};
                    $scope.simulations[res.key] = sim; // Agregar nueva
                    save_modal.close();
                    $rootScope.loading = false;
                    $scope.$apply();
                })
                .catch(function(err){
                    console.log(err);
                    M.toast({html: "Ocurrió un error al guardar",classes: 'rounded red',displayLength: 2000});
                    $rootScope.loading = false;
                    $scope.$apply();
                });
            }
        }
    };

    ///// Inicializacion del controller
    $scope.circuitFileName = "";
    var currentSim = {}; // Datos de la simulacion actual (se crean al abrir o guardar nuevo)
    M.Modal.init(document.getElementById("tutorial_modal"), {});
    var load_modal = M.Modal.init(document.getElementById("load_modal"), {preventScrolling: false});
    var save_modal = M.Modal.init(document.getElementById("save_modal"), {preventScrolling: false});

    // Inicializar simulador
    simcir.setupSimcir($('#simcir'), {
        width: document.getElementById("simcir").clientWidth,
        height: document.getElementById("simcir").clientHeight
    });

    Cipressus.utils.activityCntr($rootScope.user.uid, "simulator").catch(function (err) {console.log(err)});
}]);