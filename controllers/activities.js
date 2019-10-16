app.controller("activities", ['$scope', '$rootScope', '$location', function ($scope, $rootScope) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();
    $rootScope.loading = true;

    var updateSunburst = function (data) { // Graficar sunburst
        Highcharts.chart('sunburst_container', {
            chart: {
                height: '80%'
            },
            title: {
                text: 'Proporción de calificaciones'
            },
            subtitle: {
                text: $scope.activities.course.name
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    events: {
                        click: function (event) { // Evento de clickeo sobre partes del sunburst
                            console.log(event.point.node.id);
                        }
                    }
                }
            },
            series: [{
                type: "sunburst",
                data: data,
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
                    },
                    {
                        level: 2,
                        colorIndex: 1
                    },
                    {
                        level: 3,
                        colorByPoint: true
                    }, {
                        level: 4,
                        colorVariation: {
                            key: 'brightness',
                            to: -0.5
                        }
                    }, {
                        level: 5,
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
    };

    var tree = null; // Global

    var updateTree = function (data) {
        if (tree !== null) {
            tree.destroy();
            tree = null;
        }

        var container = document.getElementById('tree_container');
        var options = {
            layout: {
                hierarchical: {
                    direction: "UD"
                }
            }
        };

        tree = new vis.Network(container, data, options);

        tree.on('select', function (params) {
            console.log(params.nodes);
        });
    };

    var getCourseTree = function(){ // Mover a cipressus
        var randomSeed = 764;
        var nodeCount = 100;
        function seededRandom() {
            var x = Math.sin(randomSeed++) * 10000;
            return x - Math.floor(x);
        }
        var nodes = [];
        var edges = [];
        var connectionCount = [];
        // randomly create some nodes and edges
        for (var i = 0; i < nodeCount; i++) {
            nodes.push({
                id: i,
                label: String(i)
            });
            connectionCount[i] = 0;
            // create edges in a scale-free-network way
            if (i == 1) {
                var from = i;
                var to = 0;
                edges.push({
                    from: from,
                    to: to
                });
                connectionCount[from]++;
                connectionCount[to]++;
            } else if (i > 1) {
                var conn = edges.length * 2;
                var rand = Math.floor(seededRandom() * conn);
                var cum = 0;
                var j = 0;
                while (j < connectionCount.length && cum < rand) {
                    cum += connectionCount[j];
                    j++;
                }

                var from = i;
                var to = j;
                edges.push({
                    from: from,
                    to: to
                });
                connectionCount[from]++;
                connectionCount[to]++;
            }
        }
        return {
            nodes: nodes,
            edges: edges
        };
    };

    Cipressus.utils.activityCntr($rootScope.user.uid, "activities").catch(function (err) {
        console.log(err)
    });

    Cipressus.db.get('activities/' + $rootScope.user.course) // Descargar arbol de actividades
        .then(function (data) {
            $scope.activities = data;

            var arr = Cipressus.utils.getArray($scope.activities); // Obtener arreglo de notas
            var tr = getCourseTree(); // Obtener esquema en formato de arbol jerarquico para vis.js

            updateSunburst(arr);
            updateTree(tr);

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