app.controller("dashboard", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    
    if(!$rootScope.userLogged) $location.path("/login");
    
    $rootScope.loading = true;
    $rootScope.sidenav.close();

    var updateSunburst = function(data){ // Actualiza el grafico de proporciones de notas
        Highcharts.chart('sunburst_container', {
            chart: {height: '100%'},
            title: {
                text: 'Proporción de calificaciones'
            },
            plotOptions:{
                series:{
                    events: {
                        click: function (event) { // Evento de clickeo sobre partes del sunburst
                            updatePolarPlot(event.point.node.id);
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

    var updatePolarPlot = function(id){ // Actualizar grafico de notas
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

    var updateProgressPlot = function(){ // Generar grafico polar de progreso de la materia
        
        // TODO: Calcular progreso 
        
        var data1 = [
            {
                name: 'Avance cronograma',
                y: 15,
                color: "#8181F7",
                dataLabels: {
                    enabled: false
                }
            },
            {
                name: 'Restantes',
                y: 5,
                color:"#dddddd",
                dataLabels: {
                    enabled: false
                }
            }
        ];
        var data2 = [
            {
                name: 'Presente',
                y: 9,
                color: "#FF4444",
                dataLabels: {
                    enabled: false
                }
            },
            {
                name: 'Ausente',
                y: 1,
                color:"#dddddd",
                dataLabels: {
                    enabled: false
                }
            }
        ];
        
        Highcharts.chart('progress_pie_container', {
            chart: {
                type: "pie",
                plotBorderWidth: 0
            },
            title: {
                text: 'Participación'
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        style: {fontWeight: 'bold', color: 'white'}
                    },
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '50%']
                }
            },
            series: [
                {name: 'Asistencia',size: '70%',data: data2},
                {name: 'Progreso',innerSize: '70%',data: data1},
            ]
        });        
    };

    $scope.relativeTime = function(timestamp){ // Tiempo relativo al actual
        return moment(timestamp).fromNow();
    };


    // Inicializacion 
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
                    updateSunburst(arr);
                    updatePolarPlot($scope.activities.id);                                        
                    $rootScope.$apply(); 
                    // Descargar lista de eventos para linea del tiempo
                    $scope.events=[];
                    Cipressus.db.getSorted('events','start')
                    .then(function(events_data){
                        events_data.forEach(function(childSnapshot){
                            var ev = childSnapshot.val();
                            if(ev.start > Date.now()){ // Si es un evento futuro, agregar
                                // Asignar lado de linea del tiempo alternados
                                ev.side = $scope.events.length%2 ? "tl-right" : "tl-left";
                                $scope.events.push(ev);
                                // Solo los primeros 5 eventos (puede filtrarse por consulta)
                                if($scope.events.length > 5) 
                                    return;
                            }
                        });
                        updateProgressPlot();
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
                .catch(function(err){ // users_private
                    console.log(err);
                    M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                    $rootScope.loading = false;
                    $rootScope.$apply(); 
                });        
        })
        .catch(function(err){ // activities
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
            $rootScope.loading = false;
            $rootScope.$apply(); 
        });
}]);