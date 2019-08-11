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
            credits: {
                enabled: false
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
                credits:{enabled:false},
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
            credits: {
                enabled: false
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

    var updateBarPlot = function () { // Genera los arreglos de calificaciones

        var seriesData = [];
        var drillDownData = [];

        for (var k in $scope.users) { // Para cada usuario
            if(!$scope.users[k].admin && $scope.users[k].scores && $scope.users[k].course == $rootScope.user.course){ // Si tiene notas, no es admin y coincide con el curso
                seriesData.push({ // Evaluar e insertar resultado en array
                    name: k,
                    y: Cipressus.utils.eval($scope.users[k],$scope.activities),
                    color: k==$rootScope.user.uid ? "#FF0000":"#AAAAAA",                    
                    drilldown: k
                });

                var tempData = []; // Arreglo temporal con notas del alumno
                for(var j in $scope.activities.children){ // Evaluar tambien las principales actividades
                    tempData.push([
                        $scope.activities.children[j].id,
                        Cipressus.utils.eval($scope.users[k],$scope.activities.children[j])/$scope.activities.children[j].score*100
                    ]);
                }

                drillDownData.push({ // Poner arreglo completo de notas de las actividades de este alumno
                    name: k==$rootScope.user.uid ? "Yo" : "#"+(seriesData.length+1),
                    id: k,
                    data:tempData
                })
            }
        }

        // Ordenar datos por nota
        seriesData.sort((a,b) => (a.y < b.y) ? 1 : ((b.y < a.y) ? -1 : 0)); 
        // Renombrar datos por sus ordenes excepto mi nota
        for(var k in seriesData)
            seriesData[k].name = seriesData[k].name == $rootScope.user.uid ? "Yo" : "#"+(parseInt(k)+1);

        
        Highcharts.setOptions({
            lang: {
                drillUpText: '<< Volver a {series.name}'
            }
        });

        Highcharts.chart('barplot_container', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Calificaciones del curso'
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: 'Puntaje acumulado'
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f} pts'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f} pts</b>'
            },

            series: [{
                name: "Alumno",                
                data:seriesData
            }],
            drilldown:{
                series: drillDownData
            }
        });
    };

    $scope.drillUp = function () {
        $("#barplot_container").highcharts().drillUp();
    };

    var updateAttendancePlot = function(){
        var categories = []; // Lista de fechas de los eventos

        var first = true; // En la primera pasada por la lista de eventos, genero el arreglo categories

        if($scope.user.attendance){
            var data = []; // Asistencia acumulada por clase
            var evCnt = 0; // Contador de eventos
            var evAtt = 0; // Contador de eventos asistidos
            for(var k in $scope.eventsAll){
                if($scope.eventsAll[k].start < Date.now() && $scope.eventsAll[k].attendance){
                    evCnt++; // Contar evento
                    if($scope.user.attendance[k]) // Si asistio a esta clase
                        evAtt++; 
                    if(evAtt != 0)
                        data.push(evAtt/evCnt*100);
                    else 
                        data.push(0);
                    if(first) // Primera pasada
                        categories.push($rootScope.getTime(3,$scope.eventsAll[k].start)); // Agregar evento a la lista
                }
            }
            first = false;

            Highcharts.chart('attendance_container', {
                chart: {
                    type: 'spline'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Asistencia a clases'
                },
                xAxis: {
                    categories: categories
                },
                series: [{
                    name:'Mi asistencia',
                    data: data
                }]
            });
        }
    };

    // Inicializacion 
    var totalEvents=0, futureEvents=0, attendableEvents=0;

    Cipressus.utils.activityCntr($rootScope.user.uid,"dashboard").catch(function(err){console.log(err)});

    Cipressus.db.get('activities/'+$rootScope.user.course) // Descargar arbol de actividades del curso actual
        .then(function(activities_data){
            $scope.activities = activities_data; // Nodo root del arbol de notas
            Cipressus.db.get('users_private') // Descargar datos de todos los usuarios #TODO: filtrar a los del curso actual
                .then(function(user_data){
                    $scope.users = user_data;
                    $scope.user = user_data[$rootScope.user.uid];
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
                    Cipressus.db.getSorted('events/'+$rootScope.user.course,'start') // Lista de eventos ordenados por fecha de inicio
                    .then(function(events_data){
                        $scope.eventsAll = {};
                        events_data.forEach(function(childSnapshot){
                            $scope.eventsAll[childSnapshot.key] = childSnapshot.val();
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
                        for(var k in $scope.users) // Calcular asistencia para todos
                            if($scope.users[k]){ // Si es alumno inscripto, existe este objeto
                                if($scope.users[k].scores){ // Si tiene alguna calificacion
                                    if($scope.users[k].attendance){ // Si tiene asistencia a algun evento
                                        var userAttendedEvents = Object.getOwnPropertyNames($scope.users[k].attendance).length; // Cantidad de clases asistidas por el usuario
                                        var att = attendableEvents > 0 ? userAttendedEvents/attendableEvents*100 : 0; // Calcular porcentaje de asistencia
                                        $scope.users[k].scores.asistencia = {
                                            score: att, 
                                            evaluator: "Cipressus", // Evaluado por el sistema, no manualmente
                                            timestamp: Date.now()
                                        };  
                                    }else{ // Si no asistio a nada, le dejo la asitencia en 0
                                        $scope.users[k].scores.asistencia = {
                                            score: 0,
                                            evaluator: "Cipressus", // Evaluado por el sistema, no manualmente
                                            timestamp: Date.now()
                                        };    
                                    }
                                }else{ // Si no tiene puntajes, crear al menos la asistencia para el progreso                             
                                    $scope.users[k].scores = {
                                        asistencia: {
                                            score: 0,
                                            evaluator: "Cipressus", // Evaluado por el sistema, no manualmente
                                            timestamp: Date.now()
                                        }
                                    };
                                }            
                            }
                        if($scope.user)
                            if($scope.user.scores)
                                $scope.user.scores.asistencia = $scope.users[$rootScope.user.uid].scores.asistencia; // Copiar para el usuario actual
                        updateProgressPlot(); // Actualizar el grafico de avance de la materia
                        updatePolarPlot($scope.activities.id); // Actualizar nuevamente el grafico de notas ya que tiene asistencia
                        updateBarPlot();
                        updateAttendancePlot();
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