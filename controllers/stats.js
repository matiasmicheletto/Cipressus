app.controller("stats", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();


    var updateBarPlot = function () { // Genera los arreglos de calificaciones

        var seriesData = [];
        var drillDownData = [];

        for (var k in $scope.users) { // Para cada usuario
            if(!$scope.users[k].admin && $scope.users[k].scores){ // Si tiene notas y no es admin
                seriesData.push({ // Evaluar e insertar resultado en array
                    name: $scope.users[k].secondName,
                    y: Cipressus.utils.eval($scope.users[k],$scope.activities)/$scope.activities.score*100,
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
                    name: $scope.users[k].secondName,
                    id: k,
                    data:tempData
                })
            }
        }

        seriesData.sort((a,b) => (a.y < b.y) ? 1 : ((b.y < a.y) ? -1 : 0)); 
        
        Highcharts.setOptions({
            lang: {
                drillUpText: '<< Volver a {series.name}'
            }
        });

        Highcharts.chart('barplot_container', {
            chart: {
                type: 'bar',
                height: '75%'
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
                        format: '{point.y:.1f}%'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b>'
            },

            series: [{
                name: "Alumno",
                colorByPoint: true,
                data:seriesData
            }],
            drilldown:{
                colorByPoint: true,
                series: drillDownData
            }
        });
    };


    $scope.drillUp = function () {
        $("#barplot_container").highcharts().drillUp();
    };

    var updateAttendancePlot = function(){
        var seriesData = [];
        var categories = []; // Lista de fechas de los eventos

        var first = true; // En la primera pasada por la lista de eventos, genero el arreglo categories
        for (var j in $scope.users) { // Para cada usuario, calcular progreso de asistencia
            if($scope.users[j].attendance){
                var data = []; // Asistencia acumulada por clase
                var evCnt = 0; // Contador de eventos
                var evAtt = 0; // Contador de eventos asistidos
                for(var k in $scope.events){
                    if($scope.events[k].start < Date.now()){
                        if($scope.events[k].attendance) // Si tiene asistencia controlada
                            evCnt++; // Contar evento
                        if($scope.users[j].attendance[k]) // Si asistio a esta clase
                            evAtt++; 
                        if(evAtt != 0)
                            data.push(evAtt/evCnt*100);
                        else 
                            data.push(0);
                        if(first) // Primera pasada
                            categories.push($rootScope.readableTime($scope.events[k].start)); // Agregar evento a la lista
                    }
                }
                first = false;
                seriesData.push({
                    data: data,  
                    name: $scope.users[j].secondName
                })
            }
        }

        Highcharts.chart('attendance_container', {
            chart: {
                type: 'spline',
                height: '90%'
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
            series: seriesData
        });
    };


    Cipressus.db.get('users_public') // Descargar lista de usuarios
        .then(function (users_public_data) {
            $scope.users = users_public_data;
            Cipressus.db.get('users_private') // Descargar lista de usuarios aceptados
                .then(function (users_private_data) {
                    // Mezclar los atributos
                    for (var k in users_private_data)
                        for (var j in users_private_data[k])
                            $scope.users[k][j] = users_private_data[k][j];
                    // Descargar lista de actividades
                    Cipressus.db.get('activities')
                        .then(function (activities_data) {
                            $scope.activities = activities_data;
                            updateBarPlot(); // Cargar los datos al grafico de barras                    
                            $rootScope.loading = false;
                            $scope.$apply();
                        })
                        .catch(function (err) { // activities
                            console.log(err);
                            M.toast({
                                html: "Ocurrió un error al acceder a la base de datos",
                                classes: 'rounded red',
                                displayLength: 2000
                            });
                            $rootScope.loading = false;
                            $scope.$apply();
                        });
                })
                .catch(function (err) { // users_private
                    console.log(err);
                    M.toast({
                        html: "Ocurrió un error al acceder a la base de datos",
                        classes: 'rounded red',
                        displayLength: 2000
                    });
                    $rootScope.loading = false;
                    $scope.$apply();
                });
            Cipressus.db.get('events') // Descargar la lista de clases
            .then(function(events_data){
                $scope.events = events_data;
                updateAttendancePlot();
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
                    M.toast({
                        html: "Ocurrió un error al acceder a la base de datos",
                        classes: 'rounded red',
                        displayLength: 2000
                    });
                    $rootScope.loading = false;
                    $scope.$apply();
            })
        })
        .catch(function (err) { // users_public
            console.log(err);
            M.toast({
                html: "Ocurrió un error al acceder a la base de datos",
                classes: 'rounded red',
                displayLength: 2000
            });
            $rootScope.loading = false;
            $scope.$apply();
        });
}]);