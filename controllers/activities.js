app.controller("activities", ['$scope', '$rootScope', '$location', function ($scope, $rootScope) {
    $rootScope.sidenav.close();

    $rootScope.loading = true;
    Cipressus.db.get('/activities') // Descargar arbol de actividades
        .then(function (data) {
            $scope.activities = data;

            // Obtener arreglo de notas
            var arr = [];
            arr = Cipressus.utils.getArray($scope.activities, arr, '');

            // Graficar sunburst
            
            Highcharts.chart('container', {
                chart: {
                    height: '100%'
                },
                title: {
                    text: 'Proporción de calificaciones'
                },
                subtitle: {
                    text: $scope.activities.course
                },
                series: [{
                    type: "sunburst",
                    data: arr,
                    allowDrillToNode: true,
                    cursor: 'pointer',
                    dataLabels: {
                        format: '{point.name}',
                        filter: {
                            property: 'innerArcLength',
                            operator: '>',
                            value: 16
                        }
                    },
                    levels: [{
                            level: 1,
                            levelIsConstant: false,
                            dataLabels: {
                                filter: {
                                    property: 'outerArcLength',
                                    operator: '>',
                                    value: 64
                                }
                            }
                        }, {
                            level: 2,
                            colorByPoint: true
                        },
                        {
                            level: 3,
                            colorVariation: {
                                key: 'brightness',
                                to: -0.5
                            }
                        }, {
                            level: 4,
                            colorVariation: {
                                key: 'brightness',
                                to: 0.5
                            }
                        }
                    ]

                }],
                tooltip: {
                    headerFormat: "",
                    pointFormat: 'La actividad <b>{point.name}</b> suma <b>{point.value}</b> puntos'
                }
            });


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
        });

}]);