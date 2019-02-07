app.controller("dashboard", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    
    if(!$rootScope.userLogged) $location.path("/login");
    
    $rootScope.loading = true;
    $rootScope.sidenav.close();

    $scope.updateSunburst = function(data){ // Actualiza el grafico de proporciones de notas
        Highcharts.chart('sunburst_container', {
            chart: {height: '100%'},
            title: {
                text: 'Proporción de calificaciones'
            },
            plotOptions:{
                series:{
                    events: {
                        click: function (event) { // Evento de clickeo sobre partes del sunburst
                            $scope.updatePolarPlot(event.point.node.id);
                        }
                    }
                }
            },
            series: [{
                type: "sunburst",data: data, allowDrillToNode: true,cursor: 'pointer',
                dataLabels: {format: '{point.name}',filter: {property: 'innerArcLength',operator: '>',value: 16}},
                levels: [
                    {level: 1,levelIsConstant: false,dataLabels: {filter: {property: 'outerArcLength',operator: '>',value: 64}}},
                    {level: 2,colorIndex: 1},
                    {level: 3,colorByPoint: true}, 
                    {level: 4,colorVariation: {key: 'brightness',to: -0.5}}, 
                    {level: 5,colorVariation: {key: 'brightness',to: 0.5}}
                ]
            }],
            tooltip: {headerFormat: "",pointFormat: 'La actividad <b>{point.name}</b> suma <b>{point.value}</b> puntos'}
        });
    };

    $scope.updatePolarPlot = function(id){ // Actualizar grafico de notas
        if($scope.student){ // Si el alumno no esta habilitado por el docente no se muestra nada
            var data = []; // Datos para mostrar en el grafico polar
            // Buscar nodo de la actividad seleccionada
            $scope.currentNode = Cipressus.utils.searchNode($scope.activities,id); 
            for(k in $scope.currentNode.children){ // Para cada sub actividad
                data.push({ // Agregar nota de esa actividad
                    y: $scope.currentNode.children[k].score,
                    z: Math.round(Cipressus.utils.eval($scope.student,$scope.currentNode.children[k])/$scope.currentNode.children[k].score*100),
                    name: $scope.currentNode.children[k].name
                })
            }
            Highcharts.chart('variable_pie_container', {
                chart: {type: 'variablepie'},
                title: {text: 'Mis calificaciones'},
                tooltip: {
                    headerFormat: '',
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
                        'Nota actividad: <b>{point.z}%</b><br/>'
                },
                series: [{minPointSize: 10,innerSize: '20%',zMin: 0,name: 'Notas',data: data}]
            });
        }
    };

    Cipressus.db.get('/activities') // Descargar arbol de actividades
        .then(function(activities_data){
            $scope.activities = activities_data; // Nodo root del arbol de notas
            Cipressus.db.get('users_private/'+$rootScope.user.uid) // Descargar notas del usuario
                .then(function(user_data){
                    $scope.student = user_data;
                    // Si aun no fue evaluado en nada, dejar arreglos vacios (porque en DB no se guardan)
                    if(typeof($scope.student.scores) == 'undefined')
                        $scope.student.scores = [];
                    if(typeof($scope.student.submits) == 'undefined')
                        $scope.student.submits = [];
                    // Actualizar graficos al nodo root
                    var arr = [];
                    arr = Cipressus.utils.getArray($scope.activities, arr, '');
                    $scope.updateSunburst(arr);
                    $scope.updatePolarPlot($scope.activities.id);
                    $rootScope.loading = false;
                    $rootScope.$apply(); 
                })
                .catch(function(err){
                    console.log(err);
                    M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                    $rootScope.loading = false;
                    $rootScope.$apply(); 
                });        
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
            $rootScope.loading = false;
            $rootScope.$apply(); 
        });
}]);