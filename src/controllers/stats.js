app.controller("stats", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();

    var scatter_data = {}; // Arreglo de datos para graficos de correlacion

    var updateScoreBarPlot = function () { // Genera los arreglos de calificaciones

        var seriesData = [];
        var drillDownData = [];

        for (var k in $scope.users) { // Para cada usuario
            if (!$scope.users[k].admin && $scope.users[k].scores && !$scope.users[k].excludeStat) { // Si tiene notas y no es admin y no queda excluido
                var sc = (Cipressus.utils.eval($scope.users[k], $scope.activities)).score / $scope.activities.score * 100;
                scatter_data[k] = { // Este dato se emplea luego para el grafico de correlacion de notas vs actividad
                    score: sc,
                    activity: 0,
                    attendance: $scope.users[k].scores.asistencia.score
                };
                seriesData.push({ // Evaluar e insertar resultado en array
                    name: $scope.users[k].secondName,
                    y: sc,
                    drilldown: k
                });

                var tempData = []; // Arreglo temporal con notas del alumno
                for (var j in $scope.activities.children) { // Evaluar tambien las principales actividades
                    tempData.push([
                        $scope.activities.children[j].id,
                        (Cipressus.utils.eval($scope.users[k], $scope.activities.children[j])).score / $scope.activities.children[j].score * 100
                    ]);
                }

                drillDownData.push({ // Poner arreglo completo de notas de las actividades de este alumno
                    name: $scope.users[k].secondName,
                    id: k,
                    data: tempData
                })
            }
        }

        seriesData.sort(function(a, b){return (a.y < b.y) ? 1 : ((b.y < a.y) ? -1 : 0) });

        Highcharts.setOptions({
            lang: {
                drillUpText: '<< Volver a {series.name}'
            }
        });

        Highcharts.chart('score_barplot_container', {
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
                data: seriesData
            }],
            drilldown: {
                colorByPoint: true,
                series: drillDownData
            }
        });
    };


    $scope.drillUp = function () {
        $("#score_barplot_container").highcharts().drillUp();
    };

    var updateAttendancePlot = function () {
        var seriesData = [];
        var categories = []; // Lista de fechas de los eventos

        var first = true; // En la primera pasada por la lista de eventos, genero el arreglo categories
        for (var j in $scope.users) { // Para cada usuario, calcular progreso de asistencia
            if ($scope.users[j].attendance && !$scope.users[j].excludeStat) {
                var data = []; // Asistencia acumulada por clase
                var evCnt = 0; // Contador de eventos
                var evAtt = 0; // Contador de eventos asistidos
                for (var k in $scope.events) {
                    if ($scope.events[k].start < Date.now() && $scope.events[k].attendance) { // Solo eventos pasados y de asistencia obligatoria
                        evCnt++; // Contar evento
                        if ($scope.users[j].attendance[k]) // Si asistio a esta clase
                            evAtt++;
                        if (evAtt != 0)
                            data.push(Math.round(evAtt / evCnt * 10000) / 100); // Redondear a dos digitos
                        else
                            data.push(0);
                        if (first) // Primera pasada
                            categories.push($rootScope.getTime(3,$scope.events[k].start)); // Agregar evento a la lista
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
                height: '70%'
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

    var updateTechPie = function () { // Tecnologias utilizadas mas frecuentemente
        // Calcular uso de navegadores        
        var totalBr = 0; // Cantidad total de datos naveg.
        var totalOs = 0; // Cantidad total de datos so
        var br = { // Contadores de accesos con navegadores
            Firefox: 0,
            Chrome: 0,
            IE: 0,
            Opera: 0,
            Safari: 0,
            Otro: 0
        };
        var os = { // Contadores de accesos con navegadores
            Windows: 0,
            Linux: 0,
            IOS: 0,
            Android: 0,
            Otro: 0
        };
        for (var k in $scope.users)
            if (!$scope.users[k].admin && !$scope.users[k].excludeStat) {
                for (var j in $scope.users[k].activity.browser) {
                    br[j] += $scope.users[k].activity.browser[j];
                    totalBr += $scope.users[k].activity.browser[j];
                }
                for (var j in $scope.users[k].activity.os) {
                    os[j] += $scope.users[k].activity.os[j];
                    totalOs += $scope.users[k].activity.os[j];
                }
            }

        /* // Esta porcion da error cuando se ejecuta por segunda vez (al cambiar de vista y volver)
        Highcharts.setOptions({ // Gradiente de colores
            colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                return {
                    radialGradient: {
                        cx: 0.5,
                        cy: 0.3,
                        r: 0.7
                    },
                    stops: [
                        [0, color],
                        [1, Highcharts.Color(color).brighten(-0.3).get('rgb')]
                    ]
                };
            })
        });
        */

        Highcharts.chart('browser_pie_container', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Uso de navegadores'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
                        connectorColor: 'silver'
                    }
                }
            },
            series: [{
                name: 'Uso',
                data: [{
                        name: 'Chrome',
                        y: br.Chrome / totalBr
                    },
                    {
                        name: 'Firefox',
                        y: br.Firefox / totalBr
                    },
                    {
                        name: 'IE',
                        y: br.IE / totalBr
                    },
                    {
                        name: 'Opera',
                        y: br.Opera / totalBr
                    },
                    {
                        name: 'Safari',
                        y: br.Safari / totalBr
                    },
                    {
                        name: 'Otro',
                        y: br.Otro / totalBr
                    }
                ]
            }]
        });

        Highcharts.chart('so_pie_container', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Uso de S.O.'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
                        connectorColor: 'silver'
                    }
                }
            },
            series: [{
                name: 'Uso',
                data: [{
                        name: 'Windows',
                        y: os.Windows / totalOs
                    },
                    {
                        name: 'Linux',
                        y: os.Linux / totalOs
                    },
                    {
                        name: 'IOS',
                        y: os.IOS / totalOs
                    },
                    {
                        name: 'Android',
                        y: os.Android / totalOs
                    },
                    {
                        name: 'Otro',
                        y: os.Otro / totalOs
                    }
                ]
            }]
        });
    };

    var updateMenuAccessPlot = function () {

        var itemCntr = { // Nombres de las secciones en db
            home: 'Inicio',
            dashboard: 'Dashboard',
            calendar: 'Cronograma',
            sources: 'Material',
            submissions: 'Entregas',
            simulator: 'Simulador',
            hardware: 'Probador',
            profile: 'Perfil'
        };

        // Secciones
        var categoriesData = []; // Nombres de los alumnos
        var seriesData = []; // Datos a graficar
        var first = true; // Primera pasada por lista de usuarios
        for (var j in itemCntr) { // Para cada seccion
            var data = []; // Accesos a la seccion actual por usuario
            for (var k in $scope.users) // Para cada usuario
                if (!$scope.users[k].admin && !$scope.users[k].excludeStat) { // Usuarios sobre los que se realiza estadistica
                    if (first) // En la primera pasada, agregar la lista de nombres
                        categoriesData.push($scope.users[k].secondName); // Agregar alumno a la lista
                    if ($scope.users[k].activity.items[j]) { // Si tiene accesos a esta seccion
                        data.push($scope.users[k].activity.items[j]) // Agregar valor
                    } else { // Sino, el contador es 0
                        data.push(0);
                    }
                    // Registrar cantidad de accesos (solo usuarios con nota)
                    if (j == 'home' && $scope.users[k].scores) // Los accesos a home equivale a la cantidad de logueos
                        scatter_data[k].activity = $scope.users[k].activity.items.home;
                }
            seriesData.push({
                name: itemCntr[j],
                data: data
            });
            first = false;
        }

        Highcharts.chart('items_barplot_container', {
            chart: {
                type: 'bar',
                height: '150%'
            },
            title: {
                text: 'Uso de herramientas'
            },
            xAxis: {
                categories: categoriesData,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Accesos',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' accesos'
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: seriesData
        });
    };

    var updateScatterPlot = function () { // Espacio para variables correlacionadas
        var seriesData1 = [];
        var seriesData2 = [];
        for (var k in scatter_data){
            seriesData1.push([scatter_data[k].score,scatter_data[k].activity]);
            seriesData2.push([scatter_data[k].score,scatter_data[k].attendance]);
        }

        Highcharts.chart('scatterplot_container1', {
            chart: {
                type: 'scatter',
                zoomType: 'xy'
            },
            title: {
                text: 'Calificación vs actividad'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Calificación'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Accesos'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: '{point.x} %, {point.y} accesos'
                    }
                }
            },
            series: [{
                name: 'Alumnos',
                color: 'rgba(223, 83, 83, .5)',
                data: seriesData1
            }]
        });

        Highcharts.chart('scatterplot_container2', {
            chart: {
                type: 'scatter',
                zoomType: 'xy'
            },
            title: {
                text: 'Calificación vs asistencia'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Calificación'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Asistencia'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: '{point.x} %, {point.y} %'
                    }
                }
            },
            series: [{
                name: 'Alumnos',
                color: 'rgba(83, 83, 223, .5)',
                data: seriesData2
            }]
        });
    };

    var updateProfilesPlot = function(){ // Mostrar un grafico de barras para el test de FS con los datos promedios
        var avgScales = [0,0,0,0]; // Valores promedios de las escalas
        var dataCnt = 0; // Cantidad de individuos
        for(var k in $scope.users){ // Calcular promedio de resultados
            if($scope.users[k].test_fs && !$scope.users[k].excludeStat)
                if($scope.users[k].test_fs.answers){
                    var scales = Cipressus.test_FS.eval($scope.users[k].test_fs.answers); // Toma la funcion de la libreria
                    dataCnt++;
                    for(var j = 0; j < 4; j++) // Sumar componentes
                        avgScales[j] += scales[j];
                }
        }
        for(var j = 0; j < 4; j++) // Dividir por la cantidad
            avgScales[j] = Math.round(avgScales[j]/dataCnt*100)/100;

        // Calcular desvio estandar
        var stdScales = [0,0,0,0];
        for(var k in $scope.users){ // Calcular desvio de resultados
            if($scope.users[k].test_fs && !$scope.users[k].excludeStat)
                if($scope.users[k].test_fs.answers){
                    var scales = Cipressus.test_FS.eval($scope.users[k].test_fs.answers); // Toma la funcion de la libreria
                    dataCnt++;
                    for(var j = 0; j < 4; j++) // Sumar componentes de la ecuacion de desvio
                        stdScales[j] += (scales[j]-avgScales[j])*(scales[j]-avgScales[j]); // Suma de diferencias cuadraticas
                }
        }

        for(var j = 0; j < 4; j++) // Dividir por la cantidad
            stdScales[j] = Math.round(Math.sqrt(stdScales[j]/dataCnt)*100)/100; // Formula std (redondeo 2 decimales)

        for (var k = 0; k < 4; k++) {
            var elem = document.getElementById("scale_" + k);
            var width = 2*Math.abs(avgScales[k]) * 50 / 11; //(50% hacia los costados dividido 11 puntaje max)
            elem.style.width = width + '%';
            if (avgScales[k] < 0) {
                elem.style.marginLeft = 50 - width + '%';
                document.getElementById("prof_" + k).innerHTML = Cipressus.test_FS.profileDesc[k][0];
            } else {
                elem.style.marginLeft = "50%";
                document.getElementById("prof_" + k).innerHTML = Cipressus.test_FS.profileDesc[k][1];
            }
            elem.innerHTML = Math.abs(avgScales[k])+" &#177;"+stdScales[k];
        }
    };

    Cipressus.db.get('users_public') // Descargar lista de usuarios
        .then(function (users_public_data) {
            $scope.users = users_public_data;
            Cipressus.db.get('users_private') // Descargar lista de usuarios aceptados
                .then(function (users_private_data) {
                    // Mezclar los atributos
                    // #TODO listar solo usuarios del curso actual
                    for (var k in users_private_data) // Para cada usuario
                        for (var j in users_private_data[k]) // Para cada atributo del usuario actual
                            $scope.users[k][j] = users_private_data[k][j];
                    // Descargar lista de actividades
                    Cipressus.db.get('activities/'+$rootScope.user.course)
                        .then(function (activities_data) {
                            $scope.activities = activities_data;
                            Cipressus.db.get('events/'+$rootScope.user.course) // Descargar la lista de clases
                                .then(function (events_data) {
                                    $scope.events = events_data;
                                    updateScoreBarPlot(); // Cargar los datos al grafico de barras                    
                                    updateAttendancePlot(); // Actualizar grafico de asistencia
                                    updateTechPie(); // Mostrar estadisticas de uso                            
                                    updateMenuAccessPlot(); // Estadisticas de uso de alumnos
                                    updateScatterPlot(); // Grafico de correlacion entre variables
                                    updateProfilesPlot(); // Perfil promedio y desvio
                                    $rootScope.loading = false;
                                    $scope.$apply();
                                })
                                .catch(function (err) {
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