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
        if($scope.user){ // Si el alumno no esta habilitado por el docente no se muestra nada
            var data = []; // Datos para mostrar en el grafico polar
            // Buscar nodo de la actividad seleccionada
            $scope.currentNode = Cipressus.utils.searchNode($scope.activities,id); 
            var value = Cipressus.utils.eval($scope.user,$scope.currentNode)/$scope.currentNode.score*100;
            $scope.currentActivityScores = { // Para detallar textualmente
                name: $scope.currentNode.name,
                points: ($scope.currentNode.score*value/100).toFixed(2), 
                score: value.toFixed(2),
                children:[] // Asjuntar los nodos hijos
            };
            for(k in $scope.currentNode.children){ // Para cada sub actividad
                // Calcular nota de las sub actividades
                var subValue = Cipressus.utils.eval($scope.user,$scope.currentNode.children[k])/$scope.currentNode.children[k].score*100;
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
            $scope.$apply();
            Highcharts.chart('variable_pie_container', {
                chart: {type: 'variablepie',height: '100%'},
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
        var progressData = [ // Progreso de la materia
            {
                name: 'Avance programa',
                y: totalEvents-futureEvents,
                color: "#8181F7",
                dataLabels: {
                    enabled: false
                }
            },
            {
                name: 'Restantes',
                y: futureEvents,
                color:"#dddddd",
                dataLabels: {
                    enabled: false
                }
            }
        ];
        var attendanceData = [ // Porcentaje de asistencia
            {
                name: 'Presente',
                y: $scope.user.scores.asistencia.score,
                color: "#FF4444",
                dataLabels: {
                    enabled: false
                }
            },
            {
                name: 'Ausente',
                y: 100-$scope.user.scores.asistencia.score,
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
                text: 'Mi participación'
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {                    
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '50%']
                }
            },
            series: [
                {name: 'Asistencia',size: '70%',data: attendanceData},
                {name: 'Progreso',innerSize: '70%',data: progressData},
            ]
        });        
    };


    // Inicializacion 
    var totalEvents=0, futureEvents=0, attendableEvents=0;

    Cipressus.utils.activityCntr($rootScope.user.uid,"dashboard").catch(function(err){console.log(err)});
    Cipressus.db.get('/activities') // Descargar arbol de actividades
        .then(function(activities_data){
            $scope.activities = activities_data; // Nodo root del arbol de notas
            Cipressus.db.get('users_private/'+$rootScope.user.uid) // Descargar notas del usuario
                .then(function(user_data){
                    $scope.user = user_data;
                    if($scope.user){ // Si ya fue aprobado por admin
                        // Si aun no fue evaluado en nada, dejar arreglos vacios (porque en DB no se guardan)
                        if(typeof($scope.user.scores) == 'undefined')
                            $scope.user.scores = [];
                        if(typeof($scope.user.submits) == 'undefined')
                            $scope.user.submits = [];
                    }
                    // Actualizar graficos al nodo root
                    var arr = [];
                    arr = Cipressus.utils.getArray($scope.activities, arr, '');
                    $scope.$apply(); // Este es para que actualice la vista antes de graficar
                    updateSunburst(arr);                    
                    updatePolarPlot($scope.activities.id);
                    $rootScope.$apply(); 
                    // Descargar lista de eventos para linea del tiempo y para evaluar asistencia del usuario
                    $scope.events=[];                    
                    Cipressus.db.getSorted('events','start') // Lista de eventos ordenados por fecha de inicio
                    .then(function(events_data){
                        events_data.forEach(function(childSnapshot){
                            var ev = childSnapshot.val();
                            totalEvents++; // Contar actividad (se usa para asistencia y avance del programa)
                            if(ev.start > Date.now()){ // Si es un evento futuro
                                futureEvents++; // Contar los que faltan
                                if($scope.events.length < 5){ // Agregar solamente 5
                                    // Asignar lado de linea del tiempo alternados
                                    ev.side = $scope.events.length%2 ? "tl-right" : "tl-left";
                                    $scope.events.push(ev); // Agregar evento al arreglo  
                                }
                            }else{ // Si es evento que ya paso
                                if(ev.attendance) // Y si tiene asistencia habilitada
                                    attendableEvents++; // Contar para calcular porcentaje de asistencia
                            }
                        });
                        if($scope.user){ // Si es alumno inscripto
                            if($scope.user.attendance){ // Calcular asistencia aquí (solo se usa para mostrar pero no se guarda en db)
                                var userAttendedEvents = Object.getOwnPropertyNames($scope.user.attendance).length; // Cantidad de clases asistidas por el usuario
                                var att = attendableEvents > 0 ? userAttendedEvents/attendableEvents*100 : 0;
                                $scope.user.scores.asistencia = {
                                    score: att, // Calcular porcentaje de asistencia
                                    evaluator: "Cipressus", // Evaluado por el sistema, no manualmente
                                    timestamp: Date.now()
                                };                                
                            }else{ // Si no asistió a nada, entonces la asistencia queda en 0
                                $scope.user.scores.asistencia = {
                                    score: 0,
                                    evaluator: "Cipressus", // Evaluado por el sistema, no manualmente
                                    timestamp: Date.now()
                                };
                            }    
                            updateProgressPlot(); // Actualizar el grafico de avance de la materia
                            updatePolarPlot($scope.activities.id); // Actualizar nuevamente el grafico de notas ya que tiene asistencia
                        }
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