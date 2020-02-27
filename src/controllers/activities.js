app.controller("activities", ['$scope', '$rootScope', '$location', '$routeParams', function ($scope, $rootScope, $routeParams) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();

    var updateSunburst = function (node) { // Graficar sunburst

        var data = Cipressus.utils.getArray(node); // Obtener el formato que requiere el grafico

        Highcharts.chart('sunburst_container', {
            chart: {height: '90%'},
            title: {text: 'Proporción de calificaciones'},
            subtitle: {text: $scope.activities.course.name},
            credits: {enabled: false},
            plotOptions: {
                series: {
                    events: {
                        click: function (event) { // Evento de clickeo sobre partes del sunburst
                            //console.log(event.point.node.id);
                            var node = Cipressus.utils.searchNode($scope.activities, event.point.node.id); 
                            if(node)
                                $scope.selectActivity(node, false, true);
                        }
                    }
                }
            },
            series: [{
                type: "sunburst",
                id: "Activities",
                data: data,
                allowDrillToNode: true,
                cursor: 'pointer',
                dataLabels: {
                    format: '{point.name}',
                    filter: {property: 'innerArcLength',operator: '>',value: 16}
                },
                levels: [{
                        level: 1,
                        levelIsConstant: false,
                        dataLabels: {
                            filter: {property: 'outerArcLength',operator: '>',value: 64}
                        }
                    },
                    {
                        level: 2,
                        colorIndex: 1
                    },
                    {level: 3,colorByPoint: true}, 
                    {level: 4,colorVariation: {key: 'brightness',to: -0.5}}, 
                    {level: 5,colorVariation: {key: 'brightness',to: 0.5}
                }]

            }],
            tooltip: {
                headerFormat: "",
                pointFormat: 'La actividad <b>{point.name}</b> suma <b>{point.value}</b> puntos'
            }
        });
    };

    var tree = null; // Global

    var updateTree = function () {
        
        if (tree !== null) {
            tree.destroy();
            tree = null;
        }

        var data = Cipressus.utils.getTree($scope.activities); // Obtener esquema en formato de arbol jerarquico para vis.js

        var container = document.getElementById('tree_container');
        var options = {            
            layout: {
                hierarchical: {
                    direction: "UD"
                }
            }
        };

        tree = new vis.Network(container, data, options);

        /*
        tree.once('afterDrawing', function() {
            container.style.height = '75vh'
        });
        */

        tree.on('select', function (params) { // Callback de seleccion de nodos del arbol
            var node = Cipressus.utils.searchNode($scope.activities, params.nodes[0]); 
            if(node)
                $scope.selectActivity(node, true, true);
        });
    };

    $scope.selectActivity = function(node, update_sunburst, apply){ // Selecciona un nodo
        if(node){ // Checkeo de validez
            if($scope.selectedHistory)
                $scope.selectedHistory.push($scope.selectedNode);
            else
                $scope.selectedHistory = [$scope.selectedNode];

            $scope.selectedNode = node;

            if(update_sunburst)
                updateSunburst(node);
            
            if(apply)
                $scope.$apply();
            M.updateTextFields();
        }
    };

    $scope.selectPreviousActivity = function(){ // Callback de boton para volver hacia atras la seleccion
        if($scope.selectedHistory){
            var node = $scope.selectedHistory.pop(); // Devuelve el anterior al actual y lo quita
            // De aca en adelante es lo mismo que $scope.selectActivity pero sin insertar en el historial
            if(node){
                $scope.selectedNode = node;
                updateSunburst(node);
                M.updateTextFields();
            }
        }
    };
    
    var courseID = $routeParams.$$search.id;

    Cipressus.utils.activityCntr($rootScope.user.uid, "activities", courseID).catch(function (err) {
        console.log(err);
    });

    //console.log(courseID);

    $rootScope.loading = true;
    if(courseID){
        Cipressus.db.get('activities/' + courseID) // Descargar arbol de actividades
        .then(function (data) {
            $scope.activities = data;

            updateSunburst($scope.activities);
            updateTree();
            $scope.selectedNode = angular.copy($scope.activities);
            $scope.selectedHistory = [$scope.selectedNode]; // Historial para hacer drillup

            M.updateTextFields();
            $rootScope.loading = false;
            $rootScope.$apply();
        })
        .catch(function (err) {
            console.log(err);
            M.toast({
                html: "Ocurrió un error al acceder a la base de datos",
                classes: 'rounded red',
                displayLength: 2000
            });
        });
    }else{
        $scope.activities = {
            childres:[],
            course:{
                start: Date.now(),
                end: Date.now()+9504000000,
                name: "Nuevo curso"
            },
            id: "final",
            name: "Nota final",
            score: 100
        };
        $scope.selectedNode = angular.copy($scope.activities);
        updateSunburst($scope.activities);
        updateTree();
        $rootScope.loading = false;
    }

}]);

