app.controller("activities", ['$scope', '$rootScope', '$location', function ($scope, $rootScope) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();
    $rootScope.loading = true;

    M.Modal.init(document.getElementById("course_modal"), {preventScrolling: false});    

    var updateSunburst = function (data) { // Graficar sunburst
        Highcharts.chart('sunburst_container', {
            chart: {
                height: '100%'
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

        tree.once('afterDrawing', function() {
            container.style.height = '75vh'
        });

        tree.on('select', function (params) {
            var node = Cipressus.utils.searchNode($scope.activities,params.nodes[0]); 
            var arr = Cipressus.utils.getArray(node); // Obtener arreglo de notas            
            updateSunburst(arr);
        });
    };

    Cipressus.utils.activityCntr($rootScope.user.uid, "activities").catch(function (err) {
        console.log(err)
    });

    $scope.changeCourse = function(){
        var c = document.getElementById("courses_select").value;
        if(c)
            if(c!="")
                setCourse(c);
    };

    var setCourse = function(courseKey){        
        $rootScope.user.course = courseKey;
        Cipressus.db.get('activities/' + $rootScope.user.course) // Descargar arbol de actividades
        .then(function (data) {
            $scope.activities = data;

            var arr = Cipressus.utils.getArray($scope.activities); // Obtener arreglo de notas
            var tr = Cipressus.utils.getTree($scope.activities); // Obtener esquema en formato de arbol jerarquico para vis.js

            updateSunburst(arr);
            updateTree(tr);

            Cipressus.db.get("metadata/courses") // Descargar datos de los cursos disponibles
            .then(function(courses){
                $scope.courses = courses;                
                setTimeout(function(){
                    M.FormSelect.init(document.querySelectorAll('select'), {}); // Inicializar select
                },100);
                $rootScope.loading = false;
                $rootScope.$apply();
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
            });
        })
        .catch(function (err) {
            console.log(err);
            M.toast({
                html: "Ocurrió un error al acceder a la base de datos",
                classes: 'rounded red',
                displayLength: 2000
            });
        });

    };

    setCourse($rootScope.user.course); // Inicialmente, mostrar el actual
}]);