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
            Cipressus.db.query("simulations", "uid", $rootScope.user.uid)
            .then(function(snapshot){
                simulations_data = {};
                snapshot.forEach(function(sim){
                    simulations_data[sim.key] = sim.val();
                });

                if(simulations_data){
                    $scope.simulations = simulations_data;
                    //console.log($scope.simulations);
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

    $scope.loadCircuit = function(key, model){ // Cargar circuito
        var data;
        if(key) // Si se pasa clave, cargar desde los guardados, sino, usar data del argumento
            data = JSON.parse($scope.simulations[key].data);
        else
            data = JSON.parse(model);

        simcir.clearDevices(); // Borrar caches de managers

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
          {"type":"4to16BinaryDecoder"},
          //{"type":"Virtual-In"},
          //{"type":"Virtual-Out"},
          {"type":"Test-In"},
          {"type":"Test-Out"},
          {"type":"Audio-Out"},
          {"type":"DSO"},
          {"type":"Transmitter"}
        ];
        simcir.setupSimcir($('#simcir'), data);

        if(key){
            currentSim = {
                key: key,
                name: $scope.simulations[key].name
            };
            $scope.circuitFileName = $scope.simulations[key].name;
            load_modal.close();
        }
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
        //var data = JSON.stringify((({ devices, connectors }) => ({ devices, connectors }))(model)); // Solo guardar dos propiedades
        // Metodo alternativo para sintaxis de bundle-assets 3
        var data = JSON.stringify((function(model){return {devices:model.devices, connectors:model.connectors};})(model));

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
                Cipressus.db.update(sim,"simulations/"+currentSim.key)
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
                sim.uid = $rootScope.user.uid;
                Cipressus.db.push(sim,"simulations")
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


    $scope.analizeCircuit = function(){ // Analisis combinacional del circuito
        // Las funciones declaradas mas abajo se ejecutan desde el final hacia arriba

        // Obtener nombres de las entradas y salidas
        var inputs = simcir.getExternalLabels("input");
        var outputs = simcir.getExternalLabels("output");

        // Si no hay, retornar
        if(inputs.length == 0){
            M.toast({html: "El circuito no tiene entradas de testeo!",classes: 'rounded red',displayLength: 2000});
            return;
        }
        if(outputs.length == 0){
            M.toast({html: "El circuito no tiene salidas de testeo!",classes: 'rounded red',displayLength: 2000});
            return;
        }

        // Iniciar
        $rootScope.loading = true;

        // Cantidad de entradas y salidas (para calcular cantidad de dispositivos) 
        // (Antes de eliminar nodos repetidos)
        var ioDevices = inputs.length + outputs.length;

        // Eliminar nombres repetidos (externalPortManager sigue teniendo duplicados si se carga varias veces)
        inputs = inputs.filter(function(value, index, self){ return self.indexOf(value) === index}); 
        //outputs = outputs.filter((value, index, self) => self.indexOf(value) === index); 

        var model = simcir.controller($('#simcir').find('.simcir-workspace')).data();

        // Objeto para mostrar resultados en modal
        $scope.circuitDetails = {
            model: model,
            deviceCnt: model.devices.length - ioDevices, // Cantidad de componentes sin contar entradas y salidas
            connectorCnt: model.connectors.length,
            truthTable: { // Objeto para genrar la tabla de verdad en la vista
                header:{ // Nombres de las variables de entrada y salida
                    inputs:inputs,
                    outputs:outputs
                },
                rows:[] // Combinaciones de entrada
            },
            expressions: [], // Funciones de salida minimizadas
            canonMinTerm: [], // Funciones de salida canonicas suma de productos
            canonMaxTerm: [] // Funciones de salida canonicas producto de sumas
        };

        var combMax = Math.pow(2,inputs.length); // Cantidad de combinaciones
        var minterms = []; // Miniterminos de cada salida
        var maxterms = []; // Maxiterminos de cada salida
        var primeImplicants = [];
        var minifiedExpresions = [];
        var canonMinExpressions = [];
        var canonMaxExpressions = [];


        var getCanonicalExpressions = function(){ // Obtener las expresiones canonicas a partir de miniterminos y maxiterminos
            
            for(var k in outputs){ // Para cada funcion de salida                
                if(!minterms[k]){ // Si no hay minterms, la funcion es siempre nula                    
                    canonMinExpressions[k] = "0";
                    canonMaxExpressions[k] = "0";
                    continue; // Pasar a la siguiente salida
                }

                if(!maxterms[k]){ // Si no hay maxterms, la salida es siempre 1
                    canonMinExpressions[k] = "1";
                    canonMaxExpressions[k] = "1";
                    continue; // Pasar a la siguiente salida
                }
            
                /////// Minterms
                for(var j in minterms[k]){ // Para cada minitermino
                    for(var t in minterms[k][j]){ // Para cada variable dentro del termino
                        switch(minterms[k][j][t]){
                            case "1":
                                if(canonMinExpressions[k])
                                    canonMinExpressions[k] += inputs[t];
                                else
                                    canonMinExpressions[k] = inputs[t];
                                break;
                            case "0":
                                if(canonMinExpressions[k])
                                    canonMinExpressions[k] += inputs[t]+"'";
                                else
                                    canonMinExpressions[k] = inputs[t]+"'";
                                break;                            
                            default:
                                break;
                        }
                    }
                    canonMinExpressions[k] += " + ";
                }
                canonMinExpressions[k] = canonMinExpressions[k].substring(0,canonMinExpressions[k].length-3);// Remover el ultimo "+"
            
                /////// Maxterms
                for(var j in maxterms[k]){ // Para cada minitermino
                    if(canonMaxExpressions[k])
                        canonMaxExpressions[k] += "(";
                    else
                        canonMaxExpressions[k] = "(";
                    for(var t in maxterms[k][j]){ // Para cada variable dentro del termino
                        switch(maxterms[k][j][t]){
                            case "0":
                                canonMaxExpressions[k] += inputs[t]+"+";                                
                                break;
                            case "1":
                                canonMaxExpressions[k] += inputs[t]+"'+";
                                break;                            
                            default:
                                break;
                        }
                    }
                    canonMaxExpressions[k] = canonMaxExpressions[k].substring(0,canonMaxExpressions[k].length-1);// Remover el ultimo "+"    
                    canonMaxExpressions[k] += ") · ";
                }
                canonMaxExpressions[k] = canonMaxExpressions[k].substring(0,canonMaxExpressions[k].length-3);// Remover el ultimo "·"
            }
            

            // Generar expresiones para mostrar en vista de analisis
            for(var k in canonMinExpressions) 
                $scope.circuitDetails.canonMinTerm[k] = "<b>" + outputs[k] + "</b>= " + canonMinExpressions[k];
            for(var k in canonMaxExpressions) 
                $scope.circuitDetails.canonMaxTerm[k] = "<b>" + outputs[k] + "</b>= " + canonMaxExpressions[k];
            
            // Para terminar, ocultar el preloader y mostrar el modal con resultados
            $rootScope.loading = false;
            results_modal.open();
            $scope.$apply();
        };

        var getBooleanExpressions = function(){ // A partir de miniterminos y maxiterminos, devuelve las expresiones logicas

            for(var k in outputs){
                //if(minterms[k].length == 0){ // Si no hay miniterminos, la funcion es siempre nula
                if(!minterms[k]){              // Si no hay miniterminos, la funcion es siempre nula                    
                    minifiedExpresions[k] = "0";
                    continue; // Pasar a la siguiente salida
                }

                if(minterms[k].length == combMax){ // Si hay tantos miniterminos como combinaciones, la salida es siempre 1
                    minifiedExpresions[k] = "1";
                    continue; // Pasar a la siguiente salida
                }
                
                // Si ninguno de los casos anteriores se dio, obtener implicantes primos con el metodo QMC
                primeImplicants[k] = Cipressus.utils.getPrimeImplicants(minterms[k]);
                for(var j in primeImplicants[k]){ // Para cada implicante                  
                    for(var t in primeImplicants[k][j]){ // Para cada variable del implicante
                        switch(primeImplicants[k][j][t]){
                            case "1":
                                if(minifiedExpresions[k])
                                    minifiedExpresions[k] += inputs[t];
                                else
                                    minifiedExpresions[k] = inputs[t];
                                break;
                            case "0":
                                if(minifiedExpresions[k])
                                    minifiedExpresions[k] += inputs[t]+"'";
                                else
                                    minifiedExpresions[k] = inputs[t]+"'";
                                break;
                            case "-":
                                break;
                            default:
                                break;
                        }
                    }
                    minifiedExpresions[k] += " + ";
                }
                minifiedExpresions[k] = minifiedExpresions[k].substring(0,minifiedExpresions[k].length-3);// Remover el ultimo "+"
            }
            //console.log($scope.circuitDetails);
            for(var k in minifiedExpresions) // Generar expresiones para mostrar en vista de analisis
                $scope.circuitDetails.expressions[k] = "<b>" + outputs[k] + "</b>= " + minifiedExpresions[k];
            
            getCanonicalExpressions();
        };
  
        var evalInput = function(k){ // Evaluar entrada k-esima (en binario) (esta es una funcion recursiva)
            var inputBin = k.toString(2).padStart(inputs.length,"0"); // Convertir numero de combinacion a binario
            $scope.circuitDetails.truthTable.rows[k] = { 
                inputs: inputBin.split(""), // Separar bits en arreglo
                outputs: [] // Completar salidas despues
            }
            for(var j in $scope.circuitDetails.truthTable.rows[k].inputs) // Escribir entrada en el circuito del simulador
                simcir.setInputStatus(inputs[j], $scope.circuitDetails.truthTable.rows[k].inputs[j] == "1");

            // Esperar un poco antes de leer la salida
            setTimeout(function(){
                // Leer cada una de las salidas de la simulacion
                for(var n in outputs){
                    $scope.circuitDetails.truthTable.rows[k].outputs[n] = simcir.getOutputStatus(outputs[n]) == 1 ? "1":"0";
                    if($scope.circuitDetails.truthTable.rows[k].outputs[n] == "1"){ // Si la salida es H (alto), agregar minitermino
                        if(minterms[n])
                            minterms[n].push(inputBin);
                        else
                            minterms[n] = [inputBin];
                    }else{
                        if(maxterms[n])
                            maxterms[n].push(inputBin);
                        else
                            maxterms[n] = [inputBin];
                    }
                }
                k++; // Siguiente combinacion
                if(k < combMax) // Si quedan, pasar a la siguiente
                    evalInput(k);
                else // Sino, pasar a calcular las funciones
                    getBooleanExpressions();
            },50);    
        };
        evalInput(0); // Empezar por la primera
    };

    $scope.selectToDelete = function(key){ // Seleccionar circuito para eliminar
        $scope.selected = $scope.simulations[key];
        $scope.selected.key = key;
        load_modal.close(); // Cerrar el modal de abrir circuito
        setTimeout(function(){delete_modal.open()},500); // Abrir el modal de confirmacion
    };

    $scope.deleteCircuit = function(){ // Eliminar circuito
        $rootScope.loading = true;
        Cipressus.db.set(null,"simulations/"+$scope.selected.key)
        .then(function(){
            delete $scope.simulations[$scope.selected.key];
            $scope.selected = null;
            delete_modal.close();
            $rootScope.loading = false;
            $scope.$apply();
        })
        .catch(function(err){
            console.log(err);
            $rootScope.loading = false;
            $scope.$apply();
        });
    };


    ///// Inicializacion del controller
    $scope.circuitFileName = "";
    var currentSim = {}; // Datos de la simulacion actual (se crean al abrir o guardar nuevo)
    M.Modal.init(document.getElementById("tutorial_modal"), {});
    var load_modal = M.Modal.init(document.getElementById("load_modal"), {preventScrolling: false});
    var save_modal = M.Modal.init(document.getElementById("save_modal"), {preventScrolling: false});
    var delete_modal = M.Modal.init(document.getElementById("delete_modal"), {preventScrolling: false});
    var results_modal = M.Modal.init(document.getElementById("results_modal"), {preventScrolling: false});

    // Inicializar simulador
    // Para abrir simulaciones externas, se pasan por rootScope
    if($rootScope.openSimulation){
        var data = $rootScope.openSimulation;
        $rootScope.openSimulation = null; // Eliminar para que no lo siga abriendo
        $scope.loadCircuit(null,data);
    }else{
        simcir.setupSimcir($('#simcir'), {
            width: document.getElementById("simcir").clientWidth,
            height: document.getElementById("simcir").clientHeight
        });
    }

    window.onresize = function(ev){ // Simulador responsive
        // Dimensiones del card (que es responsive)
        var container = document.getElementById('simcir');
        if(container){ // Al salir del simulador, se borra el contenedor
            var w = container.clientWidth;
            var h = container.clientHeight;
            //console.log(h,w);
            var el = document.getElementsByClassName("simcir-workspace")[0]; // Div contenedor (generado por simcir)
            el.setAttribute("viewBox", "0 0 "+w+" "+h); // Dimensiones del svg
            el.setAttribute("width", w); // Escala
            el.setAttribute("height", h); 
        }
    };

    Cipressus.utils.activityCntr($rootScope.user.uid, "simulator").catch(function (err) {console.log(err)});
}]);